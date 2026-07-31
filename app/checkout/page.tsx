"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useFormatPrice, useSiteSettings } from "@/lib/site-settings-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { LocalizedProductName } from "@/components/LocalizedProductName";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const formatPrice = useFormatPrice();
  const settings = useSiteSettings();
  const { t, locale } = useLanguage();

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerAddress: "",
    notes: "",
    paymentMethod: "cash" as "cash" | "pos",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);

  const posAvailable =
    Boolean(settings.onlinePaymentEnabled) &&
    settings.paymentProvider === "pos";

  const shipping =
    totalPrice >= settings.freeShippingMinEur ? 0 : settings.shippingCostEur;
  const grandTotal = totalPrice + shipping;

  if (items.length === 0 && !orderId) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-800">{t.checkout.title}</h1>
        <p className="mt-2 text-neutral">{t.cart.emptyDesc}</p>
        <Link href="/products" className="btn-primary mt-8">
          {t.cart.startShopping}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  if (orderId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <h1 className="mt-6 text-2xl font-bold text-slate-800">
          {t.checkout.successTitle}
        </h1>
        <p className="mt-2 text-neutral">
          {t.checkout.successDesc}{" "}
          <span className="font-semibold text-brand">{orderId}</span>
        </p>
        <p className="mt-2 text-sm text-neutral-light">{t.checkout.successThanks}</p>
        <Link href="/products" className="btn-primary mt-8">
          {t.checkout.backToShop}
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          paymentMethod: posAvailable ? form.paymentMethod : "cash",
          locale,
          items: items.map(({ product, quantity }) => ({
            productId: product.id,
            quantity,
          })),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setOrderId(data.orderId);
        clearCart();
        router.refresh();
      } else {
        setError(data.error || t.checkout.error);
      }
    } catch {
      setError(t.checkout.error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Link
        href="/cart"
        className="inline-flex items-center gap-1 text-sm text-brand hover:text-brand-dark mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.checkout.back}
      </Link>

      <h1 className="section-title mb-8">{t.checkout.title}</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-slate-800">{t.checkout.customerInfo}</h2>

            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium">
                  {t.checkout.name} *
                </label>
                <input
                  required
                  value={form.customerName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, customerName: e.target.value }))
                  }
                  className="w-full rounded-lg border border-neutral-border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  {t.checkout.phone} *
                </label>
                <input
                  required
                  value={form.customerPhone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, customerPhone: e.target.value }))
                  }
                  className="w-full rounded-lg border border-neutral-border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  {t.checkout.email}
                </label>
                <input
                  type="email"
                  value={form.customerEmail}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, customerEmail: e.target.value }))
                  }
                  className="w-full rounded-lg border border-neutral-border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium">
                  {t.checkout.address} *
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.customerAddress}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, customerAddress: e.target.value }))
                  }
                  className="w-full rounded-lg border border-neutral-border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 resize-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium">
                  {t.checkout.notes}
                </label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  className="w-full rounded-lg border border-neutral-border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-slate-800">{t.checkout.paymentTitle}</h2>
            <div className="space-y-3">
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-neutral-border p-3 has-[:checked]:border-brand has-[:checked]:bg-brand-muted/40">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={form.paymentMethod === "cash"}
                  onChange={() =>
                    setForm((p) => ({ ...p, paymentMethod: "cash" }))
                  }
                  className="mt-1 border-slate-300 text-brand focus:ring-brand"
                />
                <span>
                  <span className="block text-sm font-medium text-slate-800">
                    {t.checkout.paymentCash}
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral">
                    {t.checkout.paymentCashHint}
                  </span>
                </span>
              </label>

              {posAvailable ? (
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-neutral-border p-3 has-[:checked]:border-brand has-[:checked]:bg-brand-muted/40">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="pos"
                    checked={form.paymentMethod === "pos"}
                    onChange={() =>
                      setForm((p) => ({ ...p, paymentMethod: "pos" }))
                    }
                    className="mt-1 border-slate-300 text-brand focus:ring-brand"
                  />
                  <span>
                    <span className="block text-sm font-medium text-slate-800">
                      {t.checkout.paymentPos}
                    </span>
                    <span className="mt-0.5 block text-xs text-neutral">
                      {t.checkout.paymentPosHint}
                    </span>
                  </span>
                </label>
              ) : null}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full sm:w-auto"
          >
            {submitting ? t.checkout.placing : t.checkout.placeOrder}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-32">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              {t.cart.summary}
            </h2>
            <ul className="mb-4 space-y-2 text-sm">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="flex justify-between gap-2">
                  <span className="text-neutral line-clamp-1">
                    <LocalizedProductName product={product} /> × {quantity}
                  </span>
                  <span className="font-medium whitespace-nowrap">
                    {formatPrice(product.price * quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="space-y-3 text-sm border-t border-neutral-border pt-3">
              <div className="flex justify-between">
                <span className="text-neutral">{t.cart.subtotal}</span>
                <span className="font-medium">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral">{t.cart.shipping}</span>
                <span className="font-medium">
                  {shipping === 0 ? (
                    <span className="text-green-600">{t.cart.free}</span>
                  ) : (
                    formatPrice(shipping)
                  )}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-border">
                <span className="font-bold text-slate-800">{t.cart.total}</span>
                <span className="text-xl font-bold text-brand">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
