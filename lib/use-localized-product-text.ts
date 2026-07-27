"use client";

import { useAutoTranslate } from "@/lib/use-auto-translate";
import { applyNameToDescription } from "@/lib/product-i18n";
import type { Product } from "@/lib/types/product";
import { useLanguage } from "@/lib/i18n/language-context";

type ProductTextFields = Pick<
  Product,
  "name" | "nameSq" | "description" | "descriptionSq"
>;

/**
 * Ürün adı/açıklama: manuel SQ varsa onu kullanır,
 * yoksa dil Arnavutça seçilince otomatik çevirir.
 */
export function useLocalizedProductText(product: ProductTextFields) {
  const { locale } = useLanguage();

  const { text: name, translating: translatingName } = useAutoTranslate(
    product.name,
    product.nameSq
  );

  const { text: rawDescription, translating: translatingDescription } =
    useAutoTranslate(product.description || "", product.descriptionSq);

  const description =
    locale === "sq"
      ? applyNameToDescription(
          rawDescription,
          {
            name: product.name,
            nameSq: product.nameSq?.trim() || name,
          },
          "sq"
        )
      : rawDescription;

  return {
    name,
    description,
    translating: translatingName || translatingDescription,
  };
}
