"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  Phone,
  LogOut,
  ExternalLink,
  Plus,
  ShoppingBag,
} from "lucide-react";
import OrderNotifications from "@/components/admin/OrderNotifications";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n/language-context";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();

  const nav = [
    { href: "/admin", label: t.admin.navPanel, icon: LayoutDashboard },
    { href: "/admin/orders", label: t.admin.navOrders, icon: ShoppingBag },
    { href: "/admin/products", label: t.admin.navProducts, icon: Package },
    { href: "/admin/categories", label: t.admin.navCategories, icon: FolderOpen },
    { href: "/admin/settings", label: t.admin.navSettings, icon: Phone },
  ];

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-shrink-0 flex-col bg-slate-900 text-white md:flex">
        <div className="border-b border-white/10 px-6 py-5">
          <p className="text-lg font-bold">odonexo</p>
          <p className="text-xs text-slate-400">{t.admin.panel}</p>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {nav.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-brand text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-1 border-t border-white/10 p-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <ExternalLink className="h-4 w-4" />
            {t.admin.viewSite}
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            {t.admin.logout}
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="border-b border-slate-200 bg-white px-4 py-4 md:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="md:hidden">
              <p className="font-bold text-slate-900">odonexo Admin</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <LanguageSwitcher />
              <OrderNotifications />
              {pathname.startsWith("/admin/categories") ? (
                <Link
                  href="/admin/categories/new"
                  className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.admin.newCategory}</span>
                </Link>
              ) : pathname.startsWith("/admin/orders") ? null : (
                <Link
                  href="/admin/products/new"
                  className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.admin.newProduct}</span>
                </Link>
              )}
            </div>
          </div>
          <nav className="mt-3 flex gap-1 overflow-x-auto md:hidden">
            {nav.map(({ href, label, icon: Icon }) => {
              const active =
                href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium ${
                    active
                      ? "bg-brand text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
