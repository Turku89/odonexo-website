"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/types/product";
import { useLanguage } from "@/lib/i18n/language-context";
import ProductGrid from "./ProductGrid";

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  const { t } = useLanguage();

  return (
    <section className="bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="section-title">{t.products.featuredTitle}</h2>
            <p className="section-subtitle">{t.products.featuredSubtitle}</p>
          </div>
          <Link
            href="/products"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-dark transition-colors"
          >
            {t.products.viewAll}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10">
          <ProductGrid products={products} columns={4} />
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link href="/products" className="btn-secondary">
            {t.products.viewAllBtn}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
