import { promises as fs } from "fs";
import path from "path";
import type {
  PaymentProvider,
  SiteSettings,
  SiteSettingsInput,
} from "@/lib/types/site-settings";
import { defaultSiteSettings } from "@/lib/data/site-settings-seed";
import { getReadableDataDir, getWritableDataDir } from "@/lib/data-paths";

const PAYMENT_PROVIDERS: PaymentProvider[] = ["none", "manual", "pos"];

function normalizePaymentProvider(value: unknown): PaymentProvider {
  return PAYMENT_PROVIDERS.includes(value as PaymentProvider)
    ? (value as PaymentProvider)
    : defaultSiteSettings.paymentProvider;
}

const SETTINGS_FILE_NAME = "site-settings.json";

type LegacySiteSettings = Partial<SiteSettings> & {
  phoneDisplay?: string;
  addressTr?: string;
  addressSq?: string;
  hoursTr?: string;
  hoursSq?: string;
  currency?: string;
  allPerEur?: number;
  tryPerEur?: number;
  allPerTry?: number;
};

function settingsPath(dir: string) {
  return path.join(dir, SETTINGS_FILE_NAME);
}

function normalizeSettings(raw: LegacySiteSettings): SiteSettings {
  const address =
    raw.address?.trim() ||
    raw.addressTr?.trim() ||
    raw.addressSq?.trim() ||
    defaultSiteSettings.address;

  const hours =
    raw.hours?.trim() ||
    raw.hoursTr?.trim() ||
    raw.hoursSq?.trim() ||
    defaultSiteSettings.hours;

  const phone =
    raw.phone?.trim() ||
    raw.phoneDisplay?.trim() ||
    defaultSiteSettings.phone;

  return {
    ...defaultSiteSettings,
    phone,
    whatsapp: raw.whatsapp ?? defaultSiteSettings.whatsapp,
    telegram: raw.telegram ?? defaultSiteSettings.telegram,
    email: raw.email ?? defaultSiteSettings.email,
    address,
    hours,
    facebook: raw.facebook ?? "",
    instagram: raw.instagram ?? "",
    linkedin: raw.linkedin ?? "",
    freeShippingMinEur:
      raw.freeShippingMinEur && raw.freeShippingMinEur > 0
        ? raw.freeShippingMinEur
        : defaultSiteSettings.freeShippingMinEur,
    shippingCostEur:
      raw.shippingCostEur != null && raw.shippingCostEur >= 0
        ? raw.shippingCostEur
        : defaultSiteSettings.shippingCostEur,
    onlinePaymentEnabled: Boolean(
      raw.onlinePaymentEnabled ?? defaultSiteSettings.onlinePaymentEnabled
    ),
    paymentProvider: normalizePaymentProvider(raw.paymentProvider),
    showVisa: raw.showVisa ?? defaultSiteSettings.showVisa,
    showMastercard: raw.showMastercard ?? defaultSiteSettings.showMastercard,
    showTroy: raw.showTroy ?? defaultSiteSettings.showTroy,
    posApiBaseUrl: raw.posApiBaseUrl ?? "",
    posMerchantId: raw.posMerchantId ?? "",
    posApiKey:
      process.env.POS_API_KEY?.trim() || raw.posApiKey || "",
    telegramBotToken:
      process.env.TELEGRAM_BOT_TOKEN?.trim() ||
      raw.telegramBotToken ||
      "",
    telegramChatId:
      process.env.TELEGRAM_CHAT_ID?.trim() ||
      raw.telegramChatId ||
      "",
    smtpHost: process.env.SMTP_HOST?.trim() || raw.smtpHost || "",
    smtpPort: Number(process.env.SMTP_PORT || raw.smtpPort || 587) || 587,
    smtpUser: process.env.SMTP_USER?.trim() || raw.smtpUser || "",
    smtpPass: process.env.SMTP_PASS?.trim() || raw.smtpPass || "",
    smtpFrom:
      process.env.SMTP_FROM?.trim() ||
      raw.smtpFrom ||
      raw.email ||
      "",
    updatedAt: raw.updatedAt,
  };
}

async function readRawSettings(): Promise<LegacySiteSettings> {
  const candidates = [
    settingsPath(getWritableDataDir()),
    settingsPath(getReadableDataDir()),
  ];

  for (const file of candidates) {
    try {
      const raw = await fs.readFile(file, "utf-8");
      return JSON.parse(raw) as LegacySiteSettings;
    } catch {
      /* next */
    }
  }

  return defaultSiteSettings;
}

export async function readSiteSettings(): Promise<SiteSettings> {
  return normalizeSettings(await readRawSettings());
}

export async function updateSiteSettings(
  input: SiteSettingsInput
): Promise<SiteSettings> {
  const currentRaw = await readRawSettings();
  const current = normalizeSettings(currentRaw);

  const updated: SiteSettings = {
    ...current,
    ...input,
    updatedAt: new Date().toISOString(),
  };

  const toPersist: SiteSettings = {
    ...updated,
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN?.trim()
      ? currentRaw.telegramBotToken || ""
      : updated.telegramBotToken,
    telegramChatId: process.env.TELEGRAM_CHAT_ID?.trim()
      ? currentRaw.telegramChatId || ""
      : updated.telegramChatId,
    smtpHost: process.env.SMTP_HOST?.trim()
      ? currentRaw.smtpHost || ""
      : updated.smtpHost,
    smtpUser: process.env.SMTP_USER?.trim()
      ? currentRaw.smtpUser || ""
      : updated.smtpUser,
    smtpPass: process.env.SMTP_PASS?.trim()
      ? currentRaw.smtpPass || ""
      : updated.smtpPass,
    posApiKey: process.env.POS_API_KEY?.trim()
      ? currentRaw.posApiKey || ""
      : updated.posApiKey,
  };

  const dir = getWritableDataDir();
  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(
      settingsPath(dir),
      JSON.stringify(toPersist, null, 2),
      "utf-8"
    );
  } catch (err) {
    console.error("Ayarlar dosyaya yazılamadı:", err);
  }

  return normalizeSettings(toPersist);
}
