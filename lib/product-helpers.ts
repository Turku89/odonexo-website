import type { Product } from "@/lib/types/product";

export function calcSalePrice(listPrice: number, discountPercent: number): number {
  if (listPrice <= 0 || discountPercent <= 0) return listPrice;
  return Math.round(listPrice * (1 - discountPercent / 100));
}

export function calcDiscountPercent(originalPrice: number, salePrice: number): number {
  if (originalPrice <= 0 || salePrice >= originalPrice) return 0;
  return Math.round((1 - salePrice / originalPrice) * 100);
}

export function getProductImages(
  product: Pick<Product, "image" | "images">
): string[] {
  if (product.images?.length) return product.images.filter(Boolean);
  if (product.image) return [product.image];
  return [];
}

export function normalizeProduct(product: Product): Product {
  const images = getProductImages(product);
  const image = images[0] || product.image || "";

  let discountPercent = product.discountPercent;
  if (
    product.badge === "sale" &&
    product.originalPrice &&
    product.price &&
    product.originalPrice > product.price &&
    discountPercent === undefined
  ) {
    discountPercent = calcDiscountPercent(product.originalPrice, product.price);
  }

  return {
    ...product,
    images,
    image,
    discountPercent,
  };
}
