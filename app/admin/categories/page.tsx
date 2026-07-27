import AdminShell from "@/components/admin/AdminShell";
import CategoryList from "@/components/admin/CategoryList";
import { getAllCategoriesAdmin } from "@/lib/categories";

export default async function AdminCategoriesPage() {
  const categories = await getAllCategoriesAdmin();

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Kategori Yönetimi</h1>
        <p className="mt-1 text-sm text-slate-500">
          {categories.length} kategori — ekleme, düzenleme ve görünürlük yönetimi
        </p>
      </div>
      <CategoryList categories={categories} />
    </AdminShell>
  );
}
