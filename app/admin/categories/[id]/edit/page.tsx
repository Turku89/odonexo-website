import { notFound } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import CategoryForm from "@/components/admin/CategoryForm";
import { getCategoryById } from "@/lib/categories-store";

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditCategoryPage({
  params,
}: EditCategoryPageProps) {
  const { id } = await params;
  const category = await getCategoryById(id);
  if (!category) notFound();

  return (
    <AdminShell>
      <CategoryForm mode="edit" category={category} />
    </AdminShell>
  );
}
