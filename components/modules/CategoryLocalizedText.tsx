"use client";

import type { Category } from "@/lib/types/category";
import { useLocalizedCategoryText } from "@/lib/use-localized-category-text";

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

/** Tek hook ile ad + açıklama — çift API çağrısını önler. */
export function CategoryLocalizedFields({
  category,
  nameClassName,
  descriptionClassName,
  nameAs: NameTag = "span",
  descriptionAs: DescTag = "span",
}: {
  category: CategoryTextFields;
  nameClassName?: string;
  descriptionClassName?: string;
  nameAs?: "span" | "h2" | "h3";
  descriptionAs?: "span" | "p";
}) {
  const { name, description, translating } = useLocalizedCategoryText(category);
  const fade = translating ? "opacity-60" : "";

  return (
    <>
      <NameTag className={`${nameClassName || ""} ${fade}`}>{name}</NameTag>
      <DescTag
        className={`${descriptionClassName || ""} ${fade} whitespace-pre-line`}
      >
        {description}
      </DescTag>
    </>
  );
}
