"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useFormatPrice, useSiteSettings } from "@/lib/site-settings-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { LocalizedProductName } from "@/components/LocalizedProductName";
import { useLocalizedProductText } from "@/lib/use-localized-product-text";

function CartItemRow({
  product,
  quantity,
  onUpdate,
  onRemove,
}: {
  product: import("@/lib/types/product").Product;
  quantity: number;
  onUpdate: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) {
  const { t } = useLanguage();
  const formatPrice = useFormatPrice();
  const { name } = useLocalizedProductText(product);

  return (
    <div className="card flex gap-4 p-4">
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-surface">
        <Image
          src={product.image}
          alt={name}
          fill
          className="object-cover"
          sizes="96px"
        />
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex justify-between gap-4">
          <div>
            <Link
              href={`/products/${product.slug}`}
              className="font-semibold text-slate-800 hover:text-brand"
            >
              <LocalizedProductName product={product} />
            </Link>
            <p className="text-sm text-neutral-light">{product.sku}</p>
          </div>
          <button
            onClick={() => onRemove(product.id)}
            className="text-neutral-light hover:text-red-500 transition-colors"
            aria-label={t.cart.remove}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center rounded-lg border border-neutral-border">
            <button
              onClick={() => onUpdate(product.id, quantity - 1)}
              className="px-3 py-1.5 text-brand hover:bg-brand-muted"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
            <button
              onClick={() => onUpdate(product.id, quantity + 1)}
              className="px-3 py-1.5 text-brand hover:bg-brand-muted"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="font-bold text-brand">
            {formatPrice(product.price * quantity)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice, totalItems, clearCart } =
    useCart();
  const { t } = useLanguage();
  const formatPrice = useFormatPrice();
  const settings = useSiteSettings();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-neutral-light" />
        <h1 className="mt-6 text-2xl font-bold text-slate-800">
          {t.cart.emptyTitle}
        </h1>
        <p className="mt-2 text-neutral">{t.cart.emptyDesc}</p>
        <Link href="/products" className="btn-primary mt-8">
          {t.cart.startShopping}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const shipping =
    totalPrice >= settings.freeShippingMinEur ? 0 : settings.shippingCostEur;
  const grandTotal = totalPrice + shipping;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="section-title mb-8">
        {t.cart.title} ({totalItems} {t.cart.items})
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => (
            <CartItemRow
              key={product.id}
              product={product}
              quantity={quantity}
              onUpdate={updateQuantity}
              onRemove={removeItem}
            />
          ))}
          <button
            onClick={clearCart}
            className="text-sm text-neutral hover:text-red-500"
          >
            {t.cart.clear}
          </button>
        </div>

        <div className="card h-fit p-6">
          <h2 className="font-semibold text-slate-800">{t.cart.summary}</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral">{t.cart.subtotal}</span>
              <span className="font-medium">{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral">{t.cart.shipping}</span>
              <span className="font-medium">
                {shipping === 0 ? t.cart.free : formatPrice(shipping)}
              </span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-neutral-light">{t.cart.freeShippingNote}</p>
            )}
            <div className="flex justify-between border-t border-neutral-border pt-3 text-base">
              <span className="font-semibold">{t.cart.total}</span>
              <span className="font-bold text-brand">
                {formatPrice(grandTotal)}
              </span>
            </div>
          </div>
          <Link href="/checkout" className="btn-primary mt-6 w-full justify-center">
            {t.cart.checkout}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/products"
            className="mt-3 block text-center text-sm font-medium text-brand hover:text-brand-dark"
          >
            {t.cart.continue}
          </Link>
        </div>
      </div>
    </div>
  );
}
