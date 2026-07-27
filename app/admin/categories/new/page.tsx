import AdminShell from "@/components/admin/AdminShell";
import CategoryForm from "@/components/admin/CategoryForm";

export default function AdminNewCategoryPage() {
  return (
    <AdminShell>
      <CategoryForm mode="create" />
    </AdminShell>
  );
}
