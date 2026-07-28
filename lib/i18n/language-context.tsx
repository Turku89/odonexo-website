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

type ProductNameFields = Pick<Product, "name" | "nameSq" | "nameEn">;
type ProductTextFields = Pick<
  Product,
  "name" | "nameSq" | "nameEn" | "description" | "descriptionSq" | "descriptionEn"
>;

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationKeys;
  getCategoryName: (slug: string, fallback?: string) => string;
  getCategoryDescription: (slug: string, fallback?: string) => string;
  getProductName: (product: ProductNameFields) => string;
  getProductDescription: (product: ProductTextFields) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const LOCALE_STORAGE_KEY = "odonexo-locale";
const VALID_LOCALES: Locale[] = ["tr", "sq", "en"];

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("sq");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
      if (stored && VALID_LOCALES.includes(stored)) setLocaleState(stored);
    } catch {
      /* ignore */
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
      document.documentElement.lang = locale;
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
    (product: ProductNameFields) => resolveProductName(product, locale),
    [locale]
  );

  const getProductDescription = useCallback(
    (product: ProductTextFields) =>
      resolveProductDescription(product, locale),
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
