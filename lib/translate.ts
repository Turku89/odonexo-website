type Lang = "tr" | "sq";

const memoryCache = new Map<string, string>();

function cacheKey(text: string, from: Lang, to: Lang) {
  return `${from}|${to}|${text}`;
}

/** Metni sunucu API üzerinden çevirir; başarısız olursa orijinali döner. */
export async function translateText(
  text: string,
  from: Lang,
  to: Lang
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed || from === to) return text;

  const key = cacheKey(trimmed, from, to);
  const cached = memoryCache.get(key);
  if (cached) return cached;

  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: trimmed, from, to }),
    });

    if (res.ok) {
      const data = await res.json();
      const translated =
        typeof data.translated === "string" ? data.translated : trimmed;
      memoryCache.set(key, translated);
      return translated;
    }
  } catch {
    /* ignore */
  }

  return text;
}
