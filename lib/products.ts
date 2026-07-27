import {
  readPublishedProducts,
  readAllProducts,
  getProductBySlug as storeGetBySlug,
} from "@/lib/products-store";
import type { Product } from "@/lib/types/product";

export type { Product, ProductBadge } from "@/lib/types/product";

export async function getProducts(): Promise<Product[]> {
  return readPublishedProducts();
}

export async function getAllProductsAdmin(): Promise<Product[]> {
  return readAllProducts();
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return storeGetBySlug(slug);
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const products = await readPublishedProducts();
  return products.filter((p) => p.categorySlug === categorySlug);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await readPublishedProducts();
  return products.filter(
    (p) =>
      p.badge === "bestseller" ||
      p.badge === "new" ||
      p.badge === "sale"
  );
}

export async function getPromoProducts(): Promise<Product[]> {
  const products = await readPublishedProducts();
  return products.filter(
    (p) =>
      p.slug === "dental-zirconia-disc" ||
      p.slug === "dental-cutting-titanium-gr5"
  );
}

export { formatPrice } from "@/lib/format-price";
