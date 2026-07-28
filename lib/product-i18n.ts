import type { Product } from "@/lib/types/product";
import type { Locale } from "@/lib/i18n/translations";

type ProductNames = Pick<Product, "name" | "nameSq" | "nameEn">;
type ProductTexts = Pick<
  Product,
  "name" | "nameSq" | "nameEn" | "description" | "descriptionSq" | "descriptionEn"
>;

export function getProductName(
  product: ProductNames,
  locale: Locale
): string {
  if (locale === "sq" && product.nameSq?.trim()) {
    return product.nameSq.trim();
  }
  if (locale === "en" && product.nameEn?.trim()) {
    return product.nameEn.trim();
  }
  return product.name;
}

/**
 * Açıklama metnindeki kaynak ürün adını hedef dildeki adla değiştirir.
 */
export function applyNameToDescription(
  description: string,
  product: ProductNames,
  locale: Locale
): string {
  if (!description) return description;

  const nameTr = product.name?.trim();
  const nameSq = product.nameSq?.trim();
  const nameEn = product.nameEn?.trim();

  if (locale === "sq" && nameSq) {
    let result = description;
    if (nameTr && nameTr !== nameSq) {
      result = result.split(nameTr).join(nameSq);
    }
    if (nameEn && nameEn !== nameSq) {
      result = result.split(nameEn).join(nameSq);
    }
    return result;
  }

  if (locale === "en" && nameEn) {
    let result = description;
    if (nameSq && nameSq !== nameEn) {
      result = result.split(nameSq).join(nameEn);
    }
    if (nameTr && nameTr !== nameEn) {
      result = result.split(nameTr).join(nameEn);
    }
    return result;
  }

  return description;
}

export function getProductDescription(
  product: ProductTexts,
  locale: Locale
): string {
  let description = product.description || "";
  if (locale === "sq" && product.descriptionSq?.trim()) {
    description = product.descriptionSq.trim();
  } else if (locale === "en" && product.descriptionEn?.trim()) {
    description = product.descriptionEn.trim();
  }
  return applyNameToDescription(description, product, locale);
}
