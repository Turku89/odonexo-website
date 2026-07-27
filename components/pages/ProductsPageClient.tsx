"use client";

import Link from "next/link";
import type { Product } from "@/lib/types/product";
import type { CategoryWithCount } from "@/lib/types/category";
import ProductGrid from "@/components/modules/ProductGrid";
import { useLanguage } from "@/lib/i18n/language-context";

interface ProductsPageClientProps {
  filtered: Product[];
  allProducts: Product[];
  categories: CategoryWithCount[];
  query: string;
  categoryFilter: string;
}

export default function ProductsPageClient({
  filtered,
  allProducts,
  categories,
  query,
  categoryFilter,
}: ProductsPageClientProps) {
  const { t, getCategoryName } = useLanguage();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="section-title">{t.products.allTitle}</h1>
        <p className="section-subtitle">
          {filtered.length} {t.products.listing}
          {query && ` — "${query}" ${t.products.searchFor}`}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 flex-shrink-0">
          <div className="card p-5 sticky top-32">
            <h2 className="font-semibold text-slate-800 mb-4">
              {t.products.filterCategories}
            </h2>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/products"
                  className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                    !categoryFilter
                      ? "bg-brand text-white"
                      : "text-slate-600 hover:bg-brand-muted hover:text-brand"
                  }`}
                >
                  {t.products.all} ({allProducts.length})
                </Link>
              </li>
              {categories.map((cat) => {
                const count = allProducts.filter(
                  (p) => p.categorySlug === cat.slug
                ).length;
                return (
                  <li key={cat.id}>
                    <Link
                      href={`/products?category=${cat.slug}`}
                      className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                        categoryFilter === cat.slug
                          ? "bg-brand text-white"
                          : "text-slate-600 hover:bg-brand-muted hover:text-brand"
                      }`}
                    >
                      {getCategoryName(cat.slug, cat.name)} ({count})
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        <div className="flex-1">
          <ProductGrid products={filtered} />
        </div>
      </div>
    </div>
  );
}
