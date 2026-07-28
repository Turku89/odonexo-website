export interface Category {
  id: string;
  name: string;
  /** Arnavutça ad — kaynak dil */
  nameSq?: string;
  /** İngilizce ad */
  nameEn?: string;
  slug: string;
  description: string;
  descriptionSq?: string;
  descriptionEn?: string;
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
