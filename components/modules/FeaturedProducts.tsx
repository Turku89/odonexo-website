import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/types/product";
import ProductGrid from "./ProductGrid";

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  return (
    <section className="bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="section-title">Öne Çıkan Ürünler</h2>
            <p className="section-subtitle">
              En çok tercih edilen laboratuvar malzemeleri
            </p>
          </div>
          <Link
            href="/products"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-dark transition-colors"
          >
            Tümünü Gör
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10">
          <ProductGrid products={products} columns={4} />
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link href="/products" className="btn-secondary">
            Tüm Ürünleri Gör
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
