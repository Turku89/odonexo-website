/** Stok/ürün takip kodu (Stock Keeping Unit) — ürün adına göre */

function normalizeForSku(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Örn: "Scan Spreyi" → SCAN-SPR, "Scan Aleti" → SCAN-ALE */
export function nameSkuPrefix(name: string): string {
  const words = normalizeForSku(name)
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z0-9]/gi, ""))
    .filter((w) => w.length > 0);

  if (!words.length) return "PRD";

  const first = words[0].slice(0, 4).toUpperCase();

  if (words.length === 1) {
    return first.padEnd(3, "X");
  }

  const second = words[1].slice(0, 3).toUpperCase();
  return `${first}-${second}`;
}

export function nextSku(productName: string, existingSkus: string[]): string {
  const trimmed = productName.trim();
  if (!trimmed) return "";

  const prefix = nameSkuPrefix(trimmed);
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`^${escaped}-(\\d+)$`, "i");
  let max = 0;

  for (const sku of existingSkus) {
    const match = sku.trim().match(re);
    if (match) {
      max = Math.max(max, Number(match[1]));
    }
  }

  return `${prefix}-${String(max + 1).padStart(3, "0")}`;
}
