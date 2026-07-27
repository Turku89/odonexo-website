"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Eye } from "lucide-react";
import type { Product } from "@/lib/data/products";
import { useFormatPrice } from "@/lib/site-settings-context";
import { useCart } from "@/lib/cart-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { useState } from "react";
import { calcDiscountPercent } from "@/lib/product-helpers";
import { useLocalizedProductText } from "@/lib/use-localized-product-text";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { t } = useLanguage();
  const formatPrice = useFormatPrice();
  const [added, setAdded] = useState(false);
  const { name: displayName } = useLocalizedProductText(product);

  const badgeLabels: Record<string, string> = {
    new: t.products.badgeNew,
    sale: t.products.badgeSale,
    bestseller: t.products.badgeBestseller,
  };

  const badgeColors: Record<string, string> = {
    new: "bg-brand text-white",
    sale: "bg-red-500 text-white",
    bestseller: "bg-amber-500 text-white",
  };

  const discountPercent =
    product.discountPercent ??
    (product.originalPrice && product.originalPrice > product.price
      ? calcDiscountPercent(product.originalPrice, product.price)
      : 0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product.inStock) return;
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Link href={`/products/${product.slug}`} className="card group overflow-hidden flex flex-col">
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
        <Image
          src={product.image}
          alt={displayName}
          fill
          className={`${product.image.startsWith("/") ? "object-contain p-4" : "object-cover"} transition-transform duration-300 group-hover:scale-105`}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {product.badge && (
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${badgeColors[product.badge]}`}
          >
            {product.badge === "sale" && discountPercent > 0
              ? `-${discountPercent}%`
              : badgeLabels[product.badge]}
          </span>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-slate-800">
              {t.products.outOfStock}
            </span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 flex translate-y-full gap-2 p-3 transition-transform group-hover:translate-y-0">
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-xs font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {added ? t.products.added : t.products.addToCart}
          </button>
          <span className="flex items-center justify-center rounded-lg bg-white/90 px-3 py-2.5">
            <Eye className="h-3.5 w-3.5 text-brand" />
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs text-neutral-light uppercase tracking-wide">
          {product.sku}
        </p>
        <h3 className="mt-1 font-semibold text-slate-800 line-clamp-2 group-hover:text-brand transition-colors">
          {displayName}
        </h3>
        <div className="mt-auto pt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-brand">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-neutral-light line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
