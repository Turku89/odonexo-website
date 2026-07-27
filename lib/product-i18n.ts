import type { Product } from "@/lib/types/product";
import type { Locale } from "@/lib/i18n/translations";

export function getProductName(
  product: Pick<Product, "name" | "nameSq">,
  locale: Locale
): string {
  if (locale === "sq" && product.nameSq?.trim()) {
    return product.nameSq.trim();
  }
  return product.name;
}

/**
 * Opsiyonel Arnavutça isim varsa, açıklama metnindeki Türkçe ürün adını
 * Arnavutça isimle değiştirir (başlık satırı vb. tutarlı olsun).
 */
export function applyNameToDescription(
  description: string,
  product: Pick<Product, "name" | "nameSq">,
  locale: Locale
): string {
  if (locale !== "sq") return description;
  const nameTr = product.name?.trim();
  const nameSq = product.nameSq?.trim();
  if (!nameTr || !nameSq || !description) return description;
  if (nameTr === nameSq) return description;
  return description.split(nameTr).join(nameSq);
}

export function getProductDescription(
  product: Pick<
    Product,
    "name" | "nameSq" | "description" | "descriptionSq"
  >,
  locale: Locale
): string {
  let description = product.description || "";
  if (locale === "sq" && product.descriptionSq?.trim()) {
    description = product.descriptionSq.trim();
  }
  return applyNameToDescription(description, product, locale);
}
