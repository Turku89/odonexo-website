"use client";

import type { Product } from "@/lib/types/product";
import { useLocalizedProductText } from "@/lib/use-localized-product-text";

/** Sepet/checkout gibi yerlerde ürün adını locale’e göre gösterir. */
export function LocalizedProductName({
  product,
  className,
}: {
  product: Pick<
    Product,
    "name" | "nameSq" | "nameEn" | "description" | "descriptionSq" | "descriptionEn"
  >;
  className?: string;
}) {
  const { name } = useLocalizedProductText(product);
  return <span className={className}>{name}</span>;
}

export function useLocalizedProductName(
  product: Pick<
    Product,
    "name" | "nameSq" | "nameEn" | "description" | "descriptionSq" | "descriptionEn"
  >
) {
  return useLocalizedProductText(product).name;
}
