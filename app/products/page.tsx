import { getProducts } from "@/lib/products";
import { getCategories } from "@/lib/categories";
import ProductsPageClient from "@/components/pages/ProductsPageClient";

interface ProductsPageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

export const metadata = {
  title: "Ürünler",
  description: "Diş laboratuvar malzemeleri ürün kataloğu",
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const query = params.q?.toLowerCase() ?? "";
  const categoryFilter = params.category ?? "";
  const [allProducts, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  let filtered = allProducts;

  if (categoryFilter) {
    filtered = filtered.filter((p) => p.categorySlug === categoryFilter);
  }

  if (query) {
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query)
    );
  }

  return (
    <ProductsPageClient
      filtered={filtered}
      allProducts={allProducts}
      categories={categories}
      query={params.q ?? ""}
      categoryFilter={categoryFilter}
    />
  );
}
