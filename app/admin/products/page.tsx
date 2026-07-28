import AdminShell from "@/components/admin/AdminShell";
import ProductList from "@/components/admin/ProductList";
import { AdminPageHeading } from "@/components/admin/AdminPageHeading";
import { readAllProducts } from "@/lib/products-store";
import { parseAdminProductFilter } from "@/lib/admin-product-filters";

interface AdminProductsPageProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const params = await searchParams;
  const filter = parseAdminProductFilter(params.filter);
  const products = await readAllProducts();

  return (
    <AdminShell>
      <div className="mb-6">
        <AdminPageHeading
          titleKey="productsTitle"
          count={products.length}
          subtitleKey="productsSubtitle"
        />
      </div>
      <ProductList products={products} filter={filter} />
    </AdminShell>
  );
}
