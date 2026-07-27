"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/types/product";
import { useLanguage } from "@/lib/i18n/language-context";

interface PromoBannerProps {
  products: Product[];
}

export default function PromoBanner({ products }: PromoBannerProps) {
  const { t } = useLanguage();

  if (products.length === 0) return null;

  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-10">
          <span className="inline-block rounded-full bg-brand-muted px-4 py-1 text-xs font-semibold uppercase tracking-wider text-brand">
            {t.promo.badge}
          </span>
          <h2 className="section-title mt-3">{t.promo.title}</h2>
          <p className="section-subtitle">{t.promo.subtitle}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group card overflow-hidden hover:border-brand/40"
            >
              <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-100 to-blue-50 p-6">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {product.badge && (
                  <span className="absolute left-4 top-4 rounded-full bg-brand px-3 py-1 text-xs font-bold text-white uppercase">
                    {product.badge === "new" ? t.products.badgeNew : t.products.badgeBestseller}
                  </span>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-brand transition-colors">
                  {product.name}
                </h3>
                <p className="mt-2 text-sm text-neutral line-clamp-2">
                  {product.slug === "dental-zirconia-disc"
                    ? t.promo.zirconDesc
                    : t.promo.titaniumDesc}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                  {t.promo.viewProduct}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
