"use client";

import { useLanguage } from "@/lib/i18n/language-context";
import { locales, type Locale } from "@/lib/i18n/translations";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex items-center gap-1 rounded-lg border border-neutral-border bg-surface p-0.5">
      <Globe className="hidden sm:block h-3.5 w-3.5 text-neutral ml-1.5" />
      {locales.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLocale(lang.code as Locale)}
          className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
            locale === lang.code
              ? "bg-brand text-white shadow-sm"
              : "text-neutral-dark hover:text-brand hover:bg-brand-muted"
          }`}
          aria-label={lang.label}
          aria-current={locale === lang.code ? "true" : undefined}
        >
          <span>{lang.flag}</span>
          <span className="hidden md:inline">{lang.code.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}
