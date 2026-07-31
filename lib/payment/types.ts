import type { SiteSettings } from "@/lib/types/site-settings";

/** Müşterinin checkout’ta seçebileceği yöntemler. */
export type PaymentMethod = "cash" | "pos";

export type PaymentStatus = "pending" | "paid" | "failed" | "not_required";

/** POS checkout’ta seçenek olarak sunulur mu? */
export function isPosCheckoutAvailable(settings: SiteSettings | {
  onlinePaymentEnabled?: boolean;
  paymentProvider?: string;
}): boolean {
  return Boolean(
    settings.onlinePaymentEnabled && settings.paymentProvider === "pos"
  );
}

export function normalizePaymentMethod(
  value: unknown,
  posAvailable: boolean
): PaymentMethod {
  if (value === "pos" && posAvailable) return "pos";
  return "cash";
}
