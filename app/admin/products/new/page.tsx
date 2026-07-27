import AdminShell from "@/components/admin/AdminShell";
import ProductForm from "@/components/admin/ProductForm";
import { readAllCategories } from "@/lib/categories-store";
import { readAllProducts } from "@/lib/products-store";

export default async function NewProductPage() {
  const [categories, products] = await Promise.all([
    readAllCategories(),
    readAllProducts(),
  ]);

  return (
    <AdminShell>
      <ProductForm
        mode="create"
        categories={categories}
        existingSkus={products.map((p) => p.sku)}
      />
    </AdminShell>
  );
}
