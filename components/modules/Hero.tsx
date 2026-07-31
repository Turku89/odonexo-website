"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Shield, Truck, Award } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { useSiteSettings } from "@/lib/site-settings-context";

interface HeroStats {
  productCount: number;
  categoryCount: number;
}

interface HeroProps {
  stats: HeroStats;
}

export default function Hero({ stats }: HeroProps) {
  const { t } = useLanguage();
  const settings = useSiteSettings();

  const statCards = [
    { title: String(stats.productCount), sub: t.hero.statProducts },
    { title: String(stats.categoryCount), sub: t.hero.statCategories },
    { title: "24h", sub: t.hero.statDelivery },
    { title: "%100", sub: t.hero.statSatisfaction },
  ];

  const features = [
    { icon: Truck, label: t.hero.fastShipping },
    {
      icon: Shield,
      label: settings.onlinePaymentEnabled
        ? t.hero.securePayment
        : t.hero.easyOrder,
    },
    { icon: Award, label: t.hero.originalProduct },
  ];

  return (
    <section className="relative overflow-hidden bg-[#1a408f]">
      {/* Logo mavisi ile uyumlu arka plan */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,_#2560c8_0%,_#1a408f_50%,_#142d6e_100%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-14 md:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-100 backdrop-blur-sm">
              {t.hero.badge}
            </div>

            <h1 className="mt-5 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-[3.25rem] lg:leading-[1.15]">
              {t.hero.title1}{" "}
              <span className="bg-gradient-to-r from-cyan-200 to-blue-100 bg-clip-text text-transparent">
                {t.hero.title2}
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-blue-100/90">
              {t.hero.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-900 shadow-lg transition-all hover:bg-blue-50"
              >
                {t.hero.ctaProducts}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/categories"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                {t.hero.ctaCategories}
              </Link>
            </div>

            <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
              {features.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-sm text-blue-100">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                    <Icon className="h-4 w-4 text-cyan-300" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-center lg:col-span-5 lg:justify-end">
            <Image
              src="/logo-mavi.png"
              alt="odonexo.com"
              width={480}
              height={220}
              className="h-auto w-full max-w-[280px] object-contain sm:max-w-[320px] lg:max-w-[380px]"
              priority
            />
          </div>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {statCards.map((stat) => (
            <div
              key={stat.sub}
              className="rounded-xl border border-white/15 bg-white/10 px-4 py-6 text-center backdrop-blur-md md:px-6 md:py-8"
            >
              {stat.title ? (
                <>
                  <p className="text-2xl font-bold text-white md:text-3xl">
                    {stat.title}
                  </p>
                  <p className="mt-1 text-xs font-medium text-blue-200 md:text-sm">
                    {stat.sub}
                  </p>
                </>
              ) : (
                <p className="text-sm font-semibold text-white md:text-base">
                  {stat.sub}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="relative -mb-px text-white">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="block w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 40C240 80 480 0 720 40C960 80 1200 0 1440 40V80H0V40Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
}
