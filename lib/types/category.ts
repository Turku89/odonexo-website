export interface Category {
  id: string;
  name: string;
  /** Opsiyonel Arnavutça ad — boşsa dil seçiminde otomatik çevrilir */
  nameSq?: string;
  slug: string;
  description: string;
  /** Opsiyonel Arnavutça açıklama — boşsa dil seçiminde otomatik çevrilir */
  descriptionSq?: string;
  icon: string;
  image?: string;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type CategoryInput = Omit<Category, "id" | "createdAt" | "updatedAt">;

export interface CategoryWithCount extends Category {
  productCount: number;
}
