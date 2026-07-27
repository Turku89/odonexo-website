"use client";

import Link from "next/link";
import type { Product } from "@/lib/data/products";
import type { Category } from "@/lib/types/category";
import ProductGrid from "@/components/modules/ProductGrid";
import CategoryVisual from "@/components/modules/CategoryVisual";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { useLocalizedCategoryText } from "@/lib/use-localized-category-text";

interface CategoryDetailClientProps {
  category: Pick<
    Category,
    "slug" | "name" | "description" | "nameSq" | "descriptionSq" | "icon" | "image"
  >;
  products: Product[];
}

export default function CategoryDetailClient({
  category,
  products,
}: CategoryDetailClientProps) {
  const { t } = useLanguage();
  const { name, description, translating } = useLocalizedCategoryText(category);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Link
        href="/categories"
        className="inline-flex items-center gap-1 text-sm text-brand hover:text-brand-dark mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.categories.back}
      </Link>

      <div className="mb-10 flex items-center gap-4">
        <CategoryVisual
          icon={category.icon}
          image={category.image}
          name={category.name}
          size="lg"
          className="rounded-2xl"
        />
        <div>
          <h1
            className={`section-title ${translating ? "opacity-60" : ""}`}
          >
            {name}
          </h1>
          <p
            className={`section-subtitle whitespace-pre-line ${
              translating ? "opacity-60" : ""
            }`}
          >
            {description}
          </p>
        </div>
      </div>

      <ProductGrid products={products} />
    </div>
  );
}
