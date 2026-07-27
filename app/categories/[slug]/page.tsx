import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/categories";
import { getProductsByCategory } from "@/lib/products";
import CategoryDetailClient from "@/components/pages/CategoryDetailClient";

interface CategoryDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: CategoryDetailPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Kategori Bulunamadı" };
  return {
    title: category.name,
    description: category.description,
  };
}

export default async function CategoryDetailPage({
  params,
}: CategoryDetailPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const categoryProducts = await getProductsByCategory(slug);

  return (
    <CategoryDetailClient category={category} products={categoryProducts} />
  );
}
