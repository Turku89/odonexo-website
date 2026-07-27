"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CategoryWithCount } from "@/lib/types/category";
import { useLanguage } from "@/lib/i18n/language-context";
import CategoryVisual from "@/components/modules/CategoryVisual";
import { CategoryLocalizedFields } from "@/components/modules/CategoryLocalizedText";

interface CategoriesPageClientProps {
  categories: CategoryWithCount[];
}

export default function CategoriesPageClient({
  categories,
}: CategoriesPageClientProps) {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-10 text-center">
        <h1 className="section-title">{t.categories.pageTitle}</h1>
        <p className="section-subtitle">{t.categories.pageSubtitle}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="card group relative overflow-hidden p-8 hover:border-brand/30"
          >
            <CategoryVisual
              icon={category.icon}
              image={category.image}
              name={category.name}
              size="lg"
            />
            <CategoryLocalizedFields
              category={category}
              nameAs="h2"
              nameClassName="mt-4 text-xl font-bold text-slate-800 group-hover:text-brand transition-colors"
              descriptionAs="p"
              descriptionClassName="mt-2 text-neutral"
            />
            <div className="mt-6 flex items-center justify-between">
              <span className="text-sm text-neutral-light">
                {category.productCount} {t.categories.products}
              </span>
              <ArrowRight className="h-5 w-5 text-brand transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
