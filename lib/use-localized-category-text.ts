"use client";

import { useAutoTranslate } from "@/lib/use-auto-translate";
import { resolveCategoryManualSq } from "@/lib/category-i18n";
import type { Category } from "@/lib/types/category";

type CategoryTextFields = Pick<
  Category,
  "slug" | "name" | "description" | "nameSq" | "descriptionSq"
>;

/**
 * Kategori adı ve açıklaması: manuel/sabit SQ varsa onu kullanır,
 * yoksa dil Arnavutça seçilince otomatik çevirir.
 */
export function useLocalizedCategoryText(category: CategoryTextFields) {
  const manual = resolveCategoryManualSq(category);

  const { text: name, translating: translatingName } = useAutoTranslate(
    category.name,
    manual.nameSq
  );
  const { text: description, translating: translatingDescription } =
    useAutoTranslate(category.description || "", manual.descriptionSq);

  return {
    name,
    description,
    translating: translatingName || translatingDescription,
  };
}
