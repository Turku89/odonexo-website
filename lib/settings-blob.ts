import { list, put } from "@vercel/blob";
import type { SiteSettings } from "@/lib/types/site-settings";

const BLOB_PATH = "odonexo/site-settings.json";

function blobToken(): string | undefined {
  return process.env.BLOB_READ_WRITE_TOKEN?.trim() || undefined;
}

export function isSettingsBlobEnabled(): boolean {
  return Boolean(blobToken());
}

export async function readSettingsFromBlob(): Promise<SiteSettings | null> {
  const token = blobToken();
  if (!token) return null;

  try {
    const { blobs } = await list({
      prefix: BLOB_PATH,
      limit: 10,
      token,
    });
    const exact =
      blobs.find((b) => b.pathname === BLOB_PATH) ||
      blobs.find((b) => b.pathname.endsWith("site-settings.json"));
    if (!exact?.url) return null;

    const res = await fetch(exact.url, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-cache",
      },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as SiteSettings;
    return data && typeof data === "object" ? data : null;
  } catch (err) {
    console.error("Blob ayar okuma hatası:", err);
    return null;
  }
}

export async function writeSettingsToBlob(
  settings: SiteSettings
): Promise<boolean> {
  const token = blobToken();
  if (!token) return false;

  try {
    await put(BLOB_PATH, JSON.stringify(settings, null, 2), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      token,
      cacheControlMaxAge: 0,
    });
    return true;
  } catch (err) {
    console.error("Blob ayar yazma hatası:", err);
    return false;
  }
}
