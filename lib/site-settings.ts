import { readSiteSettings } from "@/lib/site-settings-store";
import type { SiteSettings } from "@/lib/types/site-settings";

export type { SiteSettings };

export async function getSiteSettings(): Promise<SiteSettings> {
  return readSiteSettings();
}
