import type { SiteSettings } from "@/lib/types/site-settings";
import type { Order } from "@/lib/types/order";

/**
 * İleride gerçek POS API bağlandığında burası doldurulur.
 * Şimdilik yapılandırma yoksa sipariş kaydı paymentMethod: "pos" ile devam eder;
 * tahsilat admin / sahada tamamlanır.
 */
export type PosChargeResult =
  | { ok: true; redirectUrl?: string; providerRef?: string }
  | { ok: false; reason: "not_configured" | "not_implemented" | "error"; message?: string };

export function isPosApiConfigured(settings: SiteSettings): boolean {
  return Boolean(
    settings.posApiBaseUrl?.trim() &&
      settings.posMerchantId?.trim() &&
      settings.posApiKey?.trim()
  );
}

/**
 * Online POS tahsilatı başlatır.
 * API anahtarları ve sağlayıcı bağlanınca implement edilecek.
 */
export async function initiatePosPayment(
  _order: Order,
  settings: SiteSettings
): Promise<PosChargeResult> {
  if (!isPosApiConfigured(settings)) {
    return { ok: false, reason: "not_configured" };
  }

  // TODO: POS sağlayıcı HTTP çağrısı (iyzico / NestPay / vs.)
  return {
    ok: false,
    reason: "not_implemented",
    message: "POS API bağlı değil. Sipariş kaydedildi; ödeme sonra tamamlanacak.",
  };
}
