import AdminShell from "@/components/admin/AdminShell";
import ProductList from "@/components/admin/ProductList";
import { readAllProducts } from "@/lib/products-store";
import {
  parseAdminProductFilter,
} from "@/lib/admin-product-filters";

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
        <h1 className="text-2xl font-bold text-slate-900">Ürün Yönetimi</h1>
        <p className="mt-1 text-sm text-slate-500">
          {products.length} ürün — fiyat, stok, görsel ve yayın durumunu yönetin
        </p>
      </div>
      <ProductList products={products} filter={filter} />
    </AdminShell>
  );
}
