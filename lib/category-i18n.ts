import type { Category } from "@/lib/types/category";
import {
  getCategoryTranslation,
  type Locale,
} from "@/lib/i18n/translations";

type CategoryText = Pick<
  Category,
  | "slug"
  | "name"
  | "description"
  | "nameSq"
  | "descriptionSq"
  | "nameEn"
  | "descriptionEn"
>;

/** Manuel alan veya translations.ts içindeki sabit çeviri. */
export function resolveCategoryManual(category: CategoryText): {
  nameSq: string;
  descriptionSq: string;
  nameEn: string;
  descriptionEn: string;
} {
  const staticSq = getCategoryTranslation("sq", category.slug);
  const staticEn = getCategoryTranslation("en", category.slug);
  const hasStaticSqName = staticSq.name && staticSq.name !== category.slug;
  const hasStaticEnName = staticEn.name && staticEn.name !== category.slug;

  return {
    nameSq:
      category.nameSq?.trim() ||
      (hasStaticSqName ? staticSq.name : "") ||
      "",
    descriptionSq:
      category.descriptionSq?.trim() ||
      staticSq.description?.trim() ||
      "",
    nameEn:
      category.nameEn?.trim() ||
      (hasStaticEnName ? staticEn.name : "") ||
      "",
    descriptionEn:
      category.descriptionEn?.trim() ||
      staticEn.description?.trim() ||
      "",
  };
}

/** @deprecated Use resolveCategoryManual */
export function resolveCategoryManualSq(category: CategoryText) {
  const resolved = resolveCategoryManual(category);
  return {
    nameSq: resolved.nameSq,
    descriptionSq: resolved.descriptionSq,
  };
}

export function getCategoryDisplayName(
  category: CategoryText,
  locale: Locale
): string {
  const manual = resolveCategoryManual(category);
  if (locale === "sq" && manual.nameSq) return manual.nameSq;
  if (locale === "en" && manual.nameEn) return manual.nameEn;
  return category.name;
}

export function getCategoryDisplayDescription(
  category: CategoryText,
  locale: Locale
): string {
  const manual = resolveCategoryManual(category);
  if (locale === "sq" && manual.descriptionSq) return manual.descriptionSq;
  if (locale === "en" && manual.descriptionEn) return manual.descriptionEn;
  return category.description || "";
}
