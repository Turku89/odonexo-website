"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ShoppingCart, Search, Menu, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useLanguage } from "@/lib/i18n/language-context";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";

export default function Header() {
  const { totalItems } = useCart();
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/products", label: t.nav.products },
    { href: "/categories", label: t.nav.categories },
    { href: "/about", label: t.nav.about },
    { href: "/contact", label: t.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-border shadow-soft">
      <div className="bg-brand text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-sm">
          <p className="hidden sm:block text-blue-100">{t.header.tagline}</p>
          <div className="ml-auto">
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-20 md:h-24 items-center justify-between gap-4">
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo-mavi.png"
              alt="odonexo.com - Quality Supplies for Better Smiles"
              width={320}
              height={90}
              className="h-14 md:h-16 w-auto object-contain object-left"
              priority
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-700 transition-colors hover:text-brand relative after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-brand after:transition-all hover:after:w-full"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="btn-ghost p-2.5"
              aria-label={t.header.search}
            >
              <Search className="h-5 w-5" />
            </button>

            <Link href="/cart" className="btn-ghost relative p-2.5">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="btn-ghost p-2.5 lg:hidden"
              aria-label={t.header.menu}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-neutral-border pb-4">
            <form action="/products" method="get" className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-light" />
              <input
                type="search"
                name="q"
                placeholder={t.header.searchPlaceholder}
                className="w-full rounded-lg border border-neutral-border bg-white py-3 pl-12 pr-4 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                autoFocus
              />
            </form>
          </div>
        )}
      </div>

      {mobileOpen && (
        <nav className="border-t border-neutral-border bg-white lg:hidden">
          <div className="mx-auto max-w-7xl px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-brand-muted hover:text-brand"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
