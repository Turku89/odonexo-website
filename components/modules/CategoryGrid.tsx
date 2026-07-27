"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CategoryWithCount } from "@/lib/types/category";
import { useLanguage } from "@/lib/i18n/language-context";
import CategoryVisual from "@/components/modules/CategoryVisual";
import { CategoryLocalizedFields } from "@/components/modules/CategoryLocalizedText";

interface CategoryGridProps {
  categories: CategoryWithCount[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  const { t } = useLanguage();

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center">
          <h2 className="section-title">{t.categories.title}</h2>
          <p className="section-subtitle">{t.categories.subtitle}</p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="card group p-6 hover:border-brand/30"
            >
              <div className="flex items-start gap-4">
                <CategoryVisual
                  icon={category.icon}
                  image={category.image}
                  name={category.name}
                  size="md"
                  className="transition-colors group-hover:bg-brand/10"
                />
                <div className="flex-1">
                  <CategoryLocalizedFields
                    category={category}
                    nameAs="h3"
                    nameClassName="font-semibold text-slate-800 group-hover:text-brand transition-colors"
                    descriptionAs="p"
                    descriptionClassName="mt-1 text-sm text-neutral line-clamp-2"
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-neutral-light">
                      {category.productCount} {t.categories.products}
                    </span>
                    <ArrowRight className="h-4 w-4 text-brand opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
