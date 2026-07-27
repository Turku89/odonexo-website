/** Ondalık giriş: "1,5" ve "1.5" kabul edilir */

export function sanitizeDecimalInput(value: string): string | null {
  const normalized = value.replace(",", ".");
  if (normalized === "" || /^\d*\.?\d*$/.test(normalized)) {
    return normalized;
  }
  return null;
}

export function parseDecimal(value: string | number | undefined | null): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
  if (value == null || value === "") return NaN;
  const n = Number(String(value).trim().replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}
