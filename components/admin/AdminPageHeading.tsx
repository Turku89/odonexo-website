"use client";

import { useLanguage } from "@/lib/i18n/language-context";

export function AdminPageHeading({
  titleKey,
  count,
  subtitleKey,
}: {
  titleKey:
    | "productsTitle"
    | "categoriesTitle"
    | "ordersTitle"
    | "settingsTitle";
  count?: number;
  subtitleKey?: "productsSubtitle" | "categoriesSubtitle";
}) {
  const { t } = useLanguage();
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">{t.admin[titleKey]}</h1>
      {subtitleKey != null && count != null ? (
        <p className="mt-1 text-sm text-slate-500">
          {count} {t.admin[subtitleKey]}
        </p>
      ) : null}
    </div>
  );
}
