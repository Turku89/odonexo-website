import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/products";
import { getCategoryBySlug } from "@/lib/categories";
import ProductDetailClient from "@/components/pages/ProductDetailClient";

/** Ürün açıklamaları admin’den güncellenir; her istekte güncel JSON okunsun. */
export const dynamic = "force-dynamic";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Ürün Bulunamadı" };
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [allProducts, category] = await Promise.all([
    getProducts(),
    getCategoryBySlug(product.categorySlug),
  ]);
  const related = allProducts
    .filter(
      (p) => p.categorySlug === product.categorySlug && p.id !== product.id
    )
    .slice(0, 4);

  return (
    <ProductDetailClient
      product={product}
      categorySlug={product.categorySlug}
      categoryName={category?.name}
      related={related}
    />
  );
}
