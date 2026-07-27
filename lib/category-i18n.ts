import type { Category } from "@/lib/types/category";
import {
  getCategoryTranslation,
  type Locale,
} from "@/lib/i18n/translations";

type CategoryText = Pick<
  Category,
  "slug" | "name" | "description" | "nameSq" | "descriptionSq"
>;

/** Manuel SQ veya translations.ts içindeki sabit çeviri. */
export function resolveCategoryManualSq(category: CategoryText): {
  nameSq: string;
  descriptionSq: string;
} {
  const staticSq = getCategoryTranslation("sq", category.slug);
  const hasStaticName =
    staticSq.name && staticSq.name !== category.slug;

  return {
    nameSq:
      category.nameSq?.trim() ||
      (hasStaticName ? staticSq.name : "") ||
      "",
    descriptionSq:
      category.descriptionSq?.trim() ||
      staticSq.description?.trim() ||
      "",
  };
}

export function getCategoryDisplayName(
  category: CategoryText,
  locale: Locale
): string {
  if (locale === "sq") {
    const { nameSq } = resolveCategoryManualSq(category);
    if (nameSq) return nameSq;
  }
  return category.name;
}

export function getCategoryDisplayDescription(
  category: CategoryText,
  locale: Locale
): string {
  if (locale === "sq") {
    const { descriptionSq } = resolveCategoryManualSq(category);
    if (descriptionSq) return descriptionSq;
  }
  return category.description || "";
}
