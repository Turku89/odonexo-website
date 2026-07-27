import { promises as fs } from "fs";
import path from "path";
import type { SiteSettings, SiteSettingsInput } from "@/lib/types/site-settings";
import { defaultSiteSettings } from "@/lib/data/site-settings-seed";

const DATA_DIR = path.join(process.cwd(), "data");
const SETTINGS_FILE = path.join(DATA_DIR, "site-settings.json");

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

  const merged: SiteSettings = {
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
    telegramBotToken:
      process.env.TELEGRAM_BOT_TOKEN?.trim() ||
      raw.telegramBotToken ||
      "",
    telegramChatId:
      process.env.TELEGRAM_CHAT_ID?.trim() ||
      raw.telegramChatId ||
      "",
    updatedAt: raw.updatedAt,
  };

  return merged;
}

async function ensureDataFile(): Promise<SiteSettings> {
  try {
    await fs.access(SETTINGS_FILE);
    const raw = await fs.readFile(SETTINGS_FILE, "utf-8");
    return normalizeSettings(JSON.parse(raw) as LegacySiteSettings);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(
      SETTINGS_FILE,
      JSON.stringify(defaultSiteSettings, null, 2),
      "utf-8"
    );
    return defaultSiteSettings;
  }
}

export async function readSiteSettings(): Promise<SiteSettings> {
  return ensureDataFile();
}

export async function updateSiteSettings(
  input: SiteSettingsInput
): Promise<SiteSettings> {
  const current = await ensureDataFile();
  const updated: SiteSettings = {
    ...current,
    ...input,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(updated, null, 2), "utf-8");
  return updated;
}
