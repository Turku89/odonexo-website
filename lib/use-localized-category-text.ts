"use client";

import { useAutoTranslate } from "@/lib/use-auto-translate";
import { resolveCategoryManual } from "@/lib/category-i18n";
import type { Category } from "@/lib/types/category";

type CategoryTextFields = Pick<
  Category,
  | "slug"
  | "name"
  | "description"
  | "nameSq"
  | "descriptionSq"
  | "nameEn"
  | "descriptionEn"
>;

/**
 * Kategori adı/açıklama: manuel çeviri varsa onu kullanır,
 * yoksa seçili dile otomatik çevirir (EN için önce SQ kaynak).
 */
export function useLocalizedCategoryText(category: CategoryTextFields) {
  const manual = resolveCategoryManual(category);

  const { text: name, translating: translatingName } = useAutoTranslate({
    tr: category.name,
    sq: manual.nameSq,
    en: manual.nameEn,
  });
  const { text: description, translating: translatingDescription } =
    useAutoTranslate({
      tr: category.description || "",
      sq: manual.descriptionSq,
      en: manual.descriptionEn,
    });

  return {
    name,
    description,
    translating: translatingName || translatingDescription,
  };
}
