"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export default function CTABanner() {
  const { t } = useLanguage();

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card p-8 md:p-10 border-brand/20">
            <span className="text-sm font-semibold text-brand uppercase tracking-wider">
              {t.cta.equipmentLabel}
            </span>
            <h3 className="mt-3 text-2xl font-bold text-slate-800">
              {t.cta.equipmentTitle}
            </h3>
            <p className="mt-3 text-neutral">{t.cta.equipmentDesc}</p>
            <Link
              href="/categories/laboratuvar-ekipmanlari"
              className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-dark"
            >
              {t.cta.explore}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="card p-8 md:p-10 bg-brand text-white border-brand">
            <span className="text-sm font-semibold text-blue-200 uppercase tracking-wider">
              {t.cta.bulkLabel}
            </span>
            <h3 className="mt-3 text-2xl font-bold">{t.cta.bulkTitle}</h3>
            <p className="mt-3 text-blue-100">{t.cta.bulkDesc}</p>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-white hover:text-blue-100"
            >
              {t.cta.requestQuote}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
