"use client";

import Image from "next/image";
import { Award, Users, Globe, Heart } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export default function AboutPageContent() {
  const { t } = useLanguage();

  const values = [
    { icon: Award, title: t.about.quality, description: t.about.qualityDesc },
    { icon: Users, title: t.about.expertise, description: t.about.expertiseDesc },
    { icon: Globe, title: t.about.accessibility, description: t.about.accessibilityDesc },
    { icon: Heart, title: t.about.trust, description: t.about.trustDesc },
  ];

  return (
    <>
      <section className="bg-brand py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-4xl font-bold text-white md:text-5xl">
            {t.about.title}
          </h1>
          <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">
            {t.about.subtitle}
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="section-title">{t.about.whoTitle}</h2>
              <div className="mt-6 space-y-4 text-neutral leading-relaxed">
                <p>{t.about.whoP1}</p>
                <p>{t.about.whoP2}</p>
                <p>{t.about.whoP3}</p>
                <p>{t.about.whoP4}</p>
              </div>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface">
              <Image
                src="/products/zirconia-disc.png"
                alt="Dental laboratory"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <h2 className="section-title">{t.about.valuesTitle}</h2>
            <p className="section-subtitle">{t.about.valuesSubtitle}</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ icon: Icon, title, description }) => (
              <div key={title} className="card p-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-muted">
                  <Icon className="h-6 w-6 text-brand" />
                </div>
                <h3 className="mt-4 font-bold text-slate-800">{title}</h3>
                <p className="mt-2 text-sm text-neutral">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
