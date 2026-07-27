import { NextResponse } from "next/server";

type Lang = "tr" | "sq";

async function translateViaGoogle(
  text: string,
  from: Lang,
  to: Lang
): Promise<string | null> {
  const url =
    `https://translate.googleapis.com/translate_a/single` +
    `?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  if (!Array.isArray(data?.[0])) return null;

  const translated = data[0]
    .map((chunk: unknown) => (Array.isArray(chunk) ? chunk[0] : ""))
    .join("");

  return typeof translated === "string" && translated.trim()
    ? translated
    : null;
}

async function translateViaMyMemory(
  text: string,
  from: Lang,
  to: Lang
): Promise<string | null> {
  const url =
    `https://api.mymemory.translated.net/get` +
    `?q=${encodeURIComponent(text.slice(0, 450))}` +
    `&langpair=${from}|${to}`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  const translated = data?.responseData?.translatedText;
  return typeof translated === "string" && translated.trim() ? translated : null;
}

export async function POST(request: Request) {
  let body: { text?: string; from?: Lang; to?: Lang };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const text = body.text?.trim() || "";
  const from = body.from === "sq" ? "sq" : "tr";
  const to = body.to === "sq" ? "sq" : "tr";

  if (!text) {
    return NextResponse.json({ translated: "" });
  }

  if (from === to) {
    return NextResponse.json({ translated: text });
  }

  try {
    const google = await translateViaGoogle(text, from, to);
    if (google) {
      return NextResponse.json({ translated: google });
    }
  } catch {
    /* fallback */
  }

  try {
    const memory = await translateViaMyMemory(text, from, to);
    if (memory) {
      return NextResponse.json({ translated: memory });
    }
  } catch {
    /* ignore */
  }

  return NextResponse.json({ translated: text });
}
