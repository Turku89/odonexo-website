export type ProductBadge = "new" | "sale" | "bestseller";

export interface Product {
  id: string;
  name: string;
  nameSq?: string;
  nameEn?: string;
  slug: string;
  description: string;
  descriptionSq?: string;
  descriptionEn?: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  categorySlug: string;
  image: string;
  images?: string[];
  badge?: ProductBadge;
  inStock: boolean;
  stockQuantity?: number;
  published: boolean;
  sku: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;
