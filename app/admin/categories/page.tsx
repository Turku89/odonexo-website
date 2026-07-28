import AdminShell from "@/components/admin/AdminShell";
import CategoryList from "@/components/admin/CategoryList";
import { AdminPageHeading } from "@/components/admin/AdminPageHeading";
import { getAllCategoriesAdmin } from "@/lib/categories";

export default async function AdminCategoriesPage() {
  const categories = await getAllCategoriesAdmin();

  return (
    <AdminShell>
      <div className="mb-6">
        <AdminPageHeading
          titleKey="categoriesTitle"
          count={categories.length}
          subtitleKey="categoriesSubtitle"
        />
      </div>
      <CategoryList categories={categories} />
    </AdminShell>
  );
}
