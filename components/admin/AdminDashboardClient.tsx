"use client";

import Link from "next/link";
import { Package, Eye, AlertTriangle, Tag, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

type Stats = {
  newOrders: number;
  totalOrders: number;
  totalProducts: number;
  published: number;
  outOfStock: number;
  onSale: number;
  stockValueLabel: string;
};

export default function AdminDashboardClient({ stats }: { stats: Stats }) {
  const { t } = useLanguage();

  const cards = [
    {
      label: t.admin.statNewOrders,
      value: stats.newOrders,
      icon: ShoppingBag,
      color: "bg-red-50 text-red-600",
      href: "/admin/orders",
    },
    {
      label: t.admin.statTotalOrders,
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: "bg-indigo-50 text-indigo-600",
      href: "/admin/orders",
    },
    {
      label: t.admin.statTotalProducts,
      value: stats.totalProducts,
      icon: Package,
      color: "bg-blue-50 text-brand",
      href: "/admin/products",
    },
    {
      label: t.admin.statPublished,
      value: stats.published,
      icon: Eye,
      color: "bg-green-50 text-green-600",
      href: "/admin/products?filter=published",
    },
    {
      label: t.admin.statOutOfStock,
      value: stats.outOfStock,
      icon: AlertTriangle,
      color: "bg-red-50 text-red-500",
      href: "/admin/products?filter=out-of-stock",
    },
    {
      label: t.admin.statOnSale,
      value: stats.onSale,
      icon: Tag,
      color: "bg-amber-50 text-amber-600",
      href: "/admin/products?filter=on-sale",
    },
  ];

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">
        {t.admin.dashboardTitle}
      </h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, color, href }) => (
          <Link
            key={href + label}
            href={href}
            className="rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-brand/30 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
            <div className={`inline-flex rounded-lg p-2.5 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-xs font-medium text-brand">{t.admin.viewList}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-slate-800">{t.admin.quickActions}</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/orders"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            {t.admin.incomingOrders}
            {stats.newOrders > 0
              ? ` (${stats.newOrders} ${t.admin.newCount})`
              : ""}
          </Link>
          <Link
            href="/admin/products/new"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {t.admin.addProduct}
          </Link>
          <Link
            href="/admin/products"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {t.admin.manageProducts}
          </Link>
          <Link
            href="/admin/categories"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {t.admin.manageCategories}
          </Link>
          <Link
            href="/admin/settings"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {t.admin.siteSettings}
          </Link>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          {t.admin.stockValue} <strong>{stats.stockValueLabel}</strong>
        </p>
      </div>
    </>
  );
}
