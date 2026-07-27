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
  telegramBotToken: string;
  telegramChatId: string;
  updatedAt?: string;
}

export type SiteSettingsInput = Omit<SiteSettings, "updatedAt">;

export type PublicSiteSettings = Omit<
  SiteSettings,
  "telegramBotToken" | "telegramChatId"
>;

export function toPublicSiteSettings(
  settings: SiteSettings
): PublicSiteSettings {
  const { telegramBotToken: _t, telegramChatId: _c, ...publicSettings } =
    settings;
  return publicSettings;
}
