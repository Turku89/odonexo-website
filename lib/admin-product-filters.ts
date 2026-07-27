import type { Product } from "@/lib/types/product";

export type AdminProductFilter =
  | "all"
  | "published"
  | "hidden"
  | "out-of-stock"
  | "on-sale";

export const ADMIN_PRODUCT_FILTER_LABELS: Record<AdminProductFilter, string> = {
  all: "Tüm Ürünler",
  published: "Yayında Olan Ürünler",
  hidden: "Gizli Ürünler",
  "out-of-stock": "Stokta Olmayan Ürünler",
  "on-sale": "İndirimli Ürünler",
};

export function isOnSale(
  product: Pick<Product, "originalPrice" | "price">
): boolean {
  return Boolean(
    product.originalPrice && product.originalPrice > product.price
  );
}

export function filterAdminProducts(
  products: Product[],
  filter: AdminProductFilter
): Product[] {
  switch (filter) {
    case "published":
      return products.filter((p) => p.published);
    case "hidden":
      return products.filter((p) => !p.published);
    case "out-of-stock":
      return products.filter((p) => !p.inStock);
    case "on-sale":
      return products.filter(isOnSale);
    default:
      return products;
  }
}

export function parseAdminProductFilter(
  value?: string
): AdminProductFilter {
  if (
    value === "published" ||
    value === "hidden" ||
    value === "out-of-stock" ||
    value === "on-sale"
  ) {
    return value;
  }
  return "all";
}
