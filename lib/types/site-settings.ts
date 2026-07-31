/** İleride gerçek POS bağlanınca genişletilir. */
export type PaymentProvider = "none" | "manual" | "pos";

export interface SiteSettings {
  phone: string;
  whatsapp: string;
  telegram: string;
  email: string;
  address: string;
  hours: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  freeShippingMinEur: number;
  shippingCostEur: number;
  /** POS seçeneğini checkout’ta müşteriye göster. */
  onlinePaymentEnabled: boolean;
  paymentProvider: PaymentProvider;
  showVisa: boolean;
  showMastercard: boolean;
  showTroy: boolean;
  /** İleride POS API (gizli alanlar public’e gitmez). */
  posApiBaseUrl: string;
  posMerchantId: string;
  posApiKey: string;
  telegramBotToken: string;
  telegramChatId: string;
  /** Sipariş onayı e-postası için SMTP */
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  updatedAt?: string;
}

export type SiteSettingsInput = Omit<SiteSettings, "updatedAt">;

export type PublicSiteSettings = Omit<
  SiteSettings,
  | "telegramBotToken"
  | "telegramChatId"
  | "smtpHost"
  | "smtpPort"
  | "smtpUser"
  | "smtpPass"
  | "smtpFrom"
  | "posApiKey"
>;

export function toPublicSiteSettings(
  settings: SiteSettings
): PublicSiteSettings {
  const {
    telegramBotToken: _t,
    telegramChatId: _c,
    smtpHost: _h,
    smtpPort: _p,
    smtpUser: _u,
    smtpPass: _pw,
    smtpFrom: _f,
    posApiKey: _posKey,
    ...publicSettings
  } = settings;
  return publicSettings;
}
