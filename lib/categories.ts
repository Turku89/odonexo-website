import {
  readPublishedCategories,
  readAllCategories,
  getCategoryBySlug as storeGetBySlug,
} from "@/lib/categories-store";
import { readPublishedProducts } from "@/lib/products-store";
import type { Category, CategoryWithCount } from "@/lib/types/category";

export type { Category, CategoryWithCount } from "@/lib/types/category";

async function withProductCounts(
  categories: Category[]
): Promise<CategoryWithCount[]> {
  const products = await readPublishedProducts();
  return categories.map((category) => ({
    ...category,
    productCount: products.filter((p) => p.categorySlug === category.slug)
      .length,
  }));
}

export async function getCategories(): Promise<CategoryWithCount[]> {
  return withProductCounts(await readPublishedCategories());
}

export async function getAllCategoriesAdmin(): Promise<CategoryWithCount[]> {
  const [categories, products] = await Promise.all([
    readAllCategories(),
    readPublishedProducts(),
  ]);
  return categories.map((category) => ({
    ...category,
    productCount: products.filter((p) => p.categorySlug === category.slug)
      .length,
  }));
}

export async function getCategoryBySlug(
  slug: string
): Promise<CategoryWithCount | undefined> {
  const category = await storeGetBySlug(slug);
  if (!category) return undefined;
  const [withCount] = await withProductCounts([category]);
  return withCount;
}
