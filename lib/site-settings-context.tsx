"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { PublicSiteSettings } from "@/lib/types/site-settings";
import { defaultSiteSettings } from "@/lib/data/site-settings-seed";
import { toPublicSiteSettings } from "@/lib/types/site-settings";
import { formatPriceFromEur } from "@/lib/currency";

interface SiteSettingsContextValue {
  settings: PublicSiteSettings;
  updateSettings: (next: PublicSiteSettings) => void;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue>({
  settings: toPublicSiteSettings(defaultSiteSettings),
  updateSettings: () => {},
});

export function SiteSettingsProvider({
  settings: initialSettings,
  children,
}: {
  settings: PublicSiteSettings;
  children: ReactNode;
}) {
  const [settings, setSettings] = useState(initialSettings);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  const updateSettings = useCallback((next: PublicSiteSettings) => {
    setSettings(next);
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext).settings;
}

export function useUpdateSiteSettings() {
  return useContext(SiteSettingsContext).updateSettings;
}

export function useFormatPrice() {
  return useCallback((amountEur: number) => formatPriceFromEur(amountEur), []);
}
