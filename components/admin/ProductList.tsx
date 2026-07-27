"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Eye, EyeOff, Loader2, X } from "lucide-react";
import type { Product } from "@/lib/types/product";
import { useFormatPrice } from "@/lib/site-settings-context";
import { calcDiscountPercent } from "@/lib/product-helpers";
import {
  type AdminProductFilter,
  ADMIN_PRODUCT_FILTER_LABELS,
  filterAdminProducts,
} from "@/lib/admin-product-filters";

interface ProductListProps {
  products: Product[];
  filter?: AdminProductFilter;
}

export default function ProductList({
  products: initial,
  filter = "all",
}: ProductListProps) {
  const router = useRouter();
  const formatPrice = useFormatPrice();
  const [products, setProducts] = useState(initial);
  const filteredProducts = filterAdminProducts(products, filter);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const setPublished = async (product: Product, published: boolean) => {
    setToggling(product.id);
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published }),
    });
    if (res.ok) {
      const updated = await res.json();
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? updated : p))
      );
      router.refresh();
    }
    setToggling(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" ürününü silmek istediğinize emin misiniz?`)) return;
    setDeleting(id);
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      router.refresh();
    }
    setDeleting(null);
  };

  return (
    <div className="space-y-4">
      {filter !== "all" && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand/20 bg-brand-muted/40 px-4 py-3">
          <p className="text-sm font-medium text-slate-700">
            Filtre:{" "}
            <span className="text-brand">{ADMIN_PRODUCT_FILTER_LABELS[filter]}</span>
            <span className="ml-2 text-slate-500">({filteredProducts.length} ürün)</span>
          </p>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <X className="h-3.5 w-3.5" />
            Filtreyi temizle
          </Link>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3">Ürün</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Fiyat</th>
              <th className="px-4 py-3">Stok</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.map((product) => (
              <tr
                key={product.id}
                className={`hover:bg-slate-50/50 ${
                  !product.published ? "bg-slate-50/80" : ""
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {product.image && (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain p-1"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 line-clamp-1">
                        {product.name}
                      </p>
                      {product.badge && (
                        <span className="text-xs text-brand">{product.badge}</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500">{product.sku}</td>
                <td className="px-4 py-3">
                  <span className="font-semibold text-slate-900">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="ml-2 text-xs text-slate-400 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                      <span className="ml-1 text-xs font-medium text-red-500">
                        -%
                        {product.discountPercent ??
                          calcDiscountPercent(product.originalPrice, product.price)}
                      </span>
                    </>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      product.inStock ? "text-green-600" : "text-red-500"
                    }
                  >
                    {product.inStock
                      ? product.stockQuantity ?? "Var"
                      : "Yok"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-2">
                    <span
                      className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        product.published
                          ? "bg-green-50 text-green-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {product.published ? (
                        <>
                          <Eye className="h-3 w-3" />
                          Müşteriye açık
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3" />
                          Sadece panelde
                        </>
                      )}
                    </span>
                    {product.published ? (
                      <button
                        type="button"
                        onClick={() => setPublished(product, false)}
                        disabled={toggling === product.id}
                        className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      >
                        {toggling === product.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5" />
                        )}
                        Gizle
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPublished(product, true)}
                        disabled={toggling === product.id}
                        className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
                      >
                        {toggling === product.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                        Yayınla
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="rounded-lg p-2 text-slate-500 hover:bg-brand-muted hover:text-brand"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      disabled={deleting === product.id}
                      className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredProducts.length === 0 && (
        <p className="py-12 text-center text-slate-500">
          {filter === "all"
            ? "Henüz ürün yok."
            : "Bu filtreye uygun ürün bulunamadı."}
        </p>
      )}
      </div>
    </div>
  );
}
