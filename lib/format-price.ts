import { formatPriceFromEur } from "@/lib/currency";

/** @deprecated Use formatPriceFromEur */
export function formatPrice(price: number): string {
  return formatPriceFromEur(price);
}

export { formatPriceFromEur, formatPriceFromTry } from "@/lib/currency";
