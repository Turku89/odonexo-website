export function formatPriceFromEur(amountEur: number): string {
  try {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amountEur);
  } catch {
    return `${amountEur.toFixed(2)} €`;
  }
}

/** @deprecated Use formatPriceFromEur */
export const formatPriceFromTry = formatPriceFromEur;
