import { notFound } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import ProductForm from "@/components/admin/ProductForm";
import { getProductById } from "@/lib/products-store";
import { readAllCategories } from "@/lib/categories-store";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductById(id),
    readAllCategories(),
  ]);
  if (!product) notFound();

  return (
    <AdminShell>
      <ProductForm mode="edit" product={product} categories={categories} />
    </AdminShell>
  );
}
