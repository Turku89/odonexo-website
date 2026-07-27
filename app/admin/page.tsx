import AdminShell from "@/components/admin/AdminShell";
import { readAllProducts } from "@/lib/products-store";
import { formatPriceFromEur } from "@/lib/currency";
import { isOnSale } from "@/lib/admin-product-filters";
import { Package, Eye, AlertTriangle, Tag } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const products = await readAllProducts();

  const published = products.filter((p) => p.published).length;
  const outOfStock = products.filter((p) => !p.inStock).length;
  const onSale = products.filter(isOnSale).length;
  const totalValue = products.reduce((sum, p) => sum + p.price * (p.stockQuantity || 0), 0);

  const stats = [
    {
      label: "Toplam Ürün",
      value: products.length,
      icon: Package,
      color: "bg-blue-50 text-brand",
      href: "/admin/products",
    },
    {
      label: "Yayında",
      value: published,
      icon: Eye,
      color: "bg-green-50 text-green-600",
      href: "/admin/products?filter=published",
    },
    {
      label: "Stokta Yok",
      value: outOfStock,
      icon: AlertTriangle,
      color: "bg-red-50 text-red-500",
      href: "/admin/products?filter=out-of-stock",
    },
    {
      label: "İndirimli",
      value: onSale,
      icon: Tag,
      color: "bg-amber-50 text-amber-600",
      href: "/admin/products?filter=on-sale",
    },
  ];

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Panel Özeti</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-brand/30 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
            <div className={`inline-flex rounded-lg p-2.5 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-xs font-medium text-brand">Listeyi gör →</p>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Hızlı İşlemler</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/products/new"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            + Yeni Ürün Ekle
          </Link>
          <Link
            href="/admin/products"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Tüm Ürünleri Yönet
          </Link>
          <Link
            href="/admin/categories/new"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            + Yeni Kategori
          </Link>
          <Link
            href="/admin/categories"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Kategorileri Yönet
          </Link>
          <Link
            href="/admin/settings"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Site Ayarları
          </Link>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Tahmini stok değeri:{" "}
          <strong>{formatPriceFromEur(totalValue)}</strong>
        </p>
      </div>
    </AdminShell>
  );
}
