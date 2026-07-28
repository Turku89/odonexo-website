"use client";

import { useAutoTranslate } from "@/lib/use-auto-translate";
import { applyNameToDescription } from "@/lib/product-i18n";
import type { Product } from "@/lib/types/product";
import { useLanguage } from "@/lib/i18n/language-context";

type ProductTextFields = Pick<
  Product,
  "name" | "nameSq" | "nameEn" | "description" | "descriptionSq" | "descriptionEn"
>;

/**
 * Ürün adı/açıklama: manuel çeviri varsa onu kullanır,
 * yoksa seçili dile (EN için önce SQ kaynak) otomatik çevirir.
 */
export function useLocalizedProductText(product: ProductTextFields) {
  const { locale } = useLanguage();

  const { text: name, translating: translatingName } = useAutoTranslate({
    tr: product.name,
    sq: product.nameSq,
    en: product.nameEn,
  });

  const { text: rawDescription, translating: translatingDescription } =
    useAutoTranslate({
      tr: product.description || "",
      sq: product.descriptionSq,
      en: product.descriptionEn,
    });

  const localizedName =
    locale === "sq"
      ? product.nameSq?.trim() || name
      : locale === "en"
        ? product.nameEn?.trim() || name
        : product.name;

  const description = applyNameToDescription(
    rawDescription,
    {
      name: product.name,
      nameSq: product.nameSq?.trim() || (locale === "sq" ? name : product.nameSq),
      nameEn: product.nameEn?.trim() || (locale === "en" ? name : product.nameEn),
    },
    locale
  );

  return {
    name: localizedName || name,
    description,
    translating: translatingName || translatingDescription,
  };
}
