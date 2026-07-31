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
  /** Online kart/POS ödemesi (varsayılan kapalı). */
  onlinePaymentEnabled: boolean;
  paymentProvider: PaymentProvider;
  showVisa: boolean;
  showMastercard: boolean;
  showTroy: boolean;
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
    ...publicSettings
  } = settings;
  return publicSettings;
}
