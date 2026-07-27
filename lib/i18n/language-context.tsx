"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  translations,
  type Locale,
  type TranslationKeys,
  getCategoryTranslation,
} from "./translations";
import {
  getProductName as resolveProductName,
  getProductDescription as resolveProductDescription,
} from "@/lib/product-i18n";
import type { Product } from "@/lib/types/product";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationKeys;
  getCategoryName: (slug: string, fallback?: string) => string;
  getCategoryDescription: (slug: string, fallback?: string) => string;
  getProductName: (product: Pick<Product, "name" | "nameSq">) => string;
  getProductDescription: (
    product: Pick<
      Product,
      "name" | "nameSq" | "description" | "descriptionSq"
    >
  ) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const LOCALE_STORAGE_KEY = "odonexo-locale";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("tr");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
      if (stored === "tr" || stored === "sq") setLocaleState(stored);
    } catch {
      /* ignore */
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
      document.documentElement.lang = locale === "sq" ? "sq" : "tr";
    }
  }, [locale, isHydrated]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
  }, []);

  const t: TranslationKeys = translations[locale];

  const getCategoryName = useCallback(
    (slug: string, fallback?: string) => {
      const translated = getCategoryTranslation(locale, slug);
      return translated.name !== slug ? translated.name : fallback || translated.name;
    },
    [locale]
  );

  const getCategoryDescription = useCallback(
    (slug: string, fallback?: string) => {
      const translated = getCategoryTranslation(locale, slug);
      return translated.description || fallback || "";
    },
    [locale]
  );

  const getProductName = useCallback(
    (product: Pick<Product, "name" | "nameSq">) =>
      resolveProductName(product, locale),
    [locale]
  );

  const getProductDescription = useCallback(
    (
      product: Pick<
        Product,
        "name" | "nameSq" | "description" | "descriptionSq"
      >
    ) => resolveProductDescription(product, locale),
    [locale]
  );

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        t,
        getCategoryName,
        getCategoryDescription,
        getProductName,
        getProductDescription,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
