import CategoriesPageClient from "@/components/pages/CategoriesPageClient";
import { getCategories } from "@/lib/categories";

export const metadata = {
  title: "Kategoriler",
  description: "Diş laboratuvar malzemeleri kategorileri",
};

export default async function CategoriesPage() {
  const categories = await getCategories();
  return <CategoriesPageClient categories={categories} />;
}
