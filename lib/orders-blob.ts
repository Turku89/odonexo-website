import { list, put } from "@vercel/blob";
import type { Order } from "@/lib/types/order";

const BLOB_PATH = "odonexo/orders.json";

function blobToken(): string | undefined {
  return process.env.BLOB_READ_WRITE_TOKEN?.trim() || undefined;
}

export function isOrdersBlobEnabled(): boolean {
  return Boolean(blobToken());
}

/** Vercel Blob'dan siparişleri oku (kalıcı, tüm instance'lar ortak). */
export async function readOrdersFromBlob(): Promise<Order[] | null> {
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
      blobs.find((b) => b.pathname.endsWith("orders.json"));
    if (!exact?.url) return null;

    const res = await fetch(exact.url, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-cache",
      },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as Order[];
    return Array.isArray(data) ? data : null;
  } catch (err) {
    console.error("Blob sipariş okuma hatası:", err);
    return null;
  }
}

/** Sipariş listesini Blob'a yaz (overwrite). Private — müşteri verisi. */
export async function writeOrdersToBlob(orders: Order[]): Promise<boolean> {
  const token = blobToken();
  if (!token) return false;

  try {
    await put(BLOB_PATH, JSON.stringify(orders, null, 2), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      token,
      cacheControlMaxAge: 0,
    });
    return true;
  } catch (err) {
    console.error("Blob sipariş yazma hatası:", err);
    return false;
  }
}
