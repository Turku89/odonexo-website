import { promises as fs } from "fs";
import path from "path";
import type {
  PaymentProvider,
  SiteSettings,
  SiteSettingsInput,
} from "@/lib/types/site-settings";
import { defaultSiteSettings } from "@/lib/data/site-settings-seed";
import { getReadableDataDir, getWritableDataDir } from "@/lib/data-paths";
import {
  isSettingsBlobEnabled,
  readSettingsFromBlob,
  writeSettingsToBlob,
} from "@/lib/settings-blob";

const PAYMENT_PROVIDERS: PaymentProvider[] = ["none", "manual", "pos"];
const SETTINGS_FILE_NAME = "site-settings.json";

/** Aynı instance içinde taze okuma. */
let settingsMemoryCache: SiteSettings | null = null;

function normalizePaymentProvider(value: unknown): PaymentProvider {
  return PAYMENT_PROVIDERS.includes(value as PaymentProvider)
    ? (value as PaymentProvider)
    : defaultSiteSettings.paymentProvider;
}

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
    facebook: String(raw.facebook ?? "").trim(),
    instagram: String(raw.instagram ?? "").trim(),
    linkedin: String(raw.linkedin ?? "").trim(),
    tiktok: String(raw.tiktok ?? "").trim(),
    freeShippingMinEur:
      raw.freeShippingMinEur && Number(raw.freeShippingMinEur) > 0
        ? Number(raw.freeShippingMinEur)
        : defaultSiteSettings.freeShippingMinEur,
    shippingCostEur:
      raw.shippingCostEur != null && Number(raw.shippingCostEur) >= 0
        ? Number(raw.shippingCostEur)
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
    posApiKey: process.env.POS_API_KEY?.trim() || raw.posApiKey || "",
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

async function readRawFromFs(): Promise<LegacySiteSettings | null> {
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

  return null;
}

async function writeRawToFs(settings: SiteSettings): Promise<boolean> {
  const dir = getWritableDataDir();
  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(
      settingsPath(dir),
      JSON.stringify(settings, null, 2),
      "utf-8"
    );
    return true;
  } catch (err) {
    console.error("Ayarlar dosyaya yazılamadı:", err);
    return false;
  }
}

export async function readSiteSettings(): Promise<SiteSettings> {
  if (isSettingsBlobEnabled()) {
    const fromBlob = await readSettingsFromBlob();
    if (fromBlob) {
      const normalized = normalizeSettings(fromBlob);
      settingsMemoryCache = normalized;
      return normalized;
    }
  }

  if (settingsMemoryCache) {
    return settingsMemoryCache;
  }

  const fromFs = await readRawFromFs();
  if (fromFs) {
    const normalized = normalizeSettings(fromFs);
    settingsMemoryCache = normalized;
    return normalized;
  }

  const defaults = normalizeSettings(defaultSiteSettings);
  settingsMemoryCache = defaults;
  return defaults;
}

export async function updateSiteSettings(
  input: SiteSettingsInput
): Promise<SiteSettings> {
  const currentRaw =
    (isSettingsBlobEnabled() ? await readSettingsFromBlob() : null) ||
    (await readRawFromFs()) ||
    defaultSiteSettings;
  const current = normalizeSettings(currentRaw);

  const updated: SiteSettings = {
    ...current,
    ...input,
    facebook: String(input.facebook ?? "").trim(),
    instagram: String(input.instagram ?? "").trim(),
    linkedin: String(input.linkedin ?? "").trim(),
    tiktok: String(input.tiktok ?? "").trim(),
    updatedAt: new Date().toISOString(),
  };

  const toPersist: SiteSettings = {
    ...updated,
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN?.trim()
      ? (currentRaw as LegacySiteSettings).telegramBotToken || ""
      : updated.telegramBotToken,
    telegramChatId: process.env.TELEGRAM_CHAT_ID?.trim()
      ? (currentRaw as LegacySiteSettings).telegramChatId || ""
      : updated.telegramChatId,
    smtpHost: process.env.SMTP_HOST?.trim()
      ? (currentRaw as LegacySiteSettings).smtpHost || ""
      : updated.smtpHost,
    smtpUser: process.env.SMTP_USER?.trim()
      ? (currentRaw as LegacySiteSettings).smtpUser || ""
      : updated.smtpUser,
    smtpPass: process.env.SMTP_PASS?.trim()
      ? (currentRaw as LegacySiteSettings).smtpPass || ""
      : updated.smtpPass,
    posApiKey: process.env.POS_API_KEY?.trim()
      ? (currentRaw as LegacySiteSettings).posApiKey || ""
      : updated.posApiKey,
  };

  const normalized = normalizeSettings(toPersist);

  let persisted = false;
  if (isSettingsBlobEnabled()) {
    persisted = (await writeSettingsToBlob(normalized)) || persisted;
  }
  persisted = (await writeRawToFs(normalized)) || persisted;

  if (!persisted) {
    throw new Error(
      "Ayarlar kaydedilemedi. Yerel disk veya BLOB_READ_WRITE_TOKEN kontrol edin."
    );
  }

  settingsMemoryCache = normalized;
  return normalized;
}
