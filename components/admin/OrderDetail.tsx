"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Save, XCircle } from "lucide-react";
import { formatPriceFromEur } from "@/lib/currency";
import type { Order, OrderItem, OrderStatus } from "@/lib/types/order";
import { useLanguage } from "@/lib/i18n/language-context";

type EditItem = OrderItem;

export default function OrderDetail({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<EditItem[]>([]);
  const [adminNote, setAdminNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const statusLabel: Record<OrderStatus, string> = {
    new: t.admin.orderStatusNew,
    seen: t.admin.orderStatusSeen,
    approved: t.admin.orderStatusApproved,
    cancelled: t.admin.orderStatusCancelled,
  };

  const dateLocale =
    locale === "en" ? "en-GB" : locale === "sq" ? "sq-AL" : "tr-TR";

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/admin/orders/${orderId}`);
        if (!res.ok) {
          setError(t.admin.orderNotFound);
          return;
        }
        const data = (await res.json()) as Order;
        if (cancelled) return;
        setOrder(data);
        setItems(data.items);
        setAdminNote(data.adminNote || "");

        if (data.status === "new") {
          const patch = await fetch(`/api/admin/orders/${orderId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "seen" }),
          });
          if (patch.ok) {
            const updated = await patch.json();
            if (!cancelled) {
              setOrder(updated);
              setItems(updated.items);
            }
          }
        }
      } catch {
        setError(t.admin.orderLoadFail);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [orderId, t.admin.orderNotFound, t.admin.orderLoadFail]);

  const previewTotals = useMemo(() => {
    const subtotal = items
      .filter((i) => !i.unavailable && i.quantity > 0)
      .reduce((sum, i) => sum + i.unitPriceEur * i.quantity, 0);
    return subtotal;
  }, [items]);

  const updateItem = (index: number, patch: Partial<EditItem>) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const next = { ...item, ...patch };
        const quantity = Math.max(0, Math.floor(Number(next.quantity) || 0));
        const unavailable = Boolean(next.unavailable) || quantity === 0;
        return {
          ...next,
          quantity,
          unavailable,
          lineTotalEur: unavailable ? 0 : next.unitPriceEur * quantity,
        };
      })
    );
    setMessage("");
  };

  const isDefaultOutOfStockNote = (note?: string) =>
    note === t.admin.orderOutOfStock ||
    note === "Stokta yok" ||
    note === "Jashtë stoku" ||
    note === "Out of stock";

  const saveEdits = async () => {
    if (!order) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, adminNote }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t.admin.saveFailed);
        return;
      }
      setOrder(data);
      setItems(data.items);
      setAdminNote(data.adminNote || "");
      setMessage(t.admin.orderEditsSaved);
      window.dispatchEvent(new Event("odonexo-orders-changed"));
      router.refresh();
    } catch {
      setError(t.admin.orderSaveError);
    } finally {
      setSaving(false);
    }
  };

  const approveOrder = async () => {
    if (!order) return;
    if (!order.customerEmail?.trim()) {
      setError(t.admin.orderNoEmail);
      return;
    }

    setApproving(true);
    setError("");
    setMessage("");

    try {
      const saveRes = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, adminNote }),
      });
      if (!saveRes.ok) {
        const data = await saveRes.json();
        setError(data.error || t.admin.orderEditsSaveFail);
        return;
      }
      const saved = await saveRes.json();
      setOrder(saved);
      setItems(saved.items);

      const res = await fetch(`/api/admin/orders/${order.id}/approve`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t.admin.orderApproveEmailFail);
        return;
      }
      setOrder(data.order);
      setMessage(t.admin.orderApprovedMsg);
      window.dispatchEvent(new Event("odonexo-orders-changed"));
      router.refresh();
    } catch {
      setError(t.admin.orderApproveFail);
    } finally {
      setApproving(false);
    }
  };

  const cancelOrder = async () => {
    if (!order) return;
    setCancelling(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled", items, adminNote }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t.admin.orderCancelFail);
        return;
      }
      setOrder(data);
      setItems(data.items);
      setMessage(t.admin.orderCancelledMsg);
      window.dispatchEvent(new Event("odonexo-orders-changed"));
      router.refresh();
    } catch {
      setError(t.admin.orderCancelFailGeneric);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500">{t.admin.loading}</p>;
  }

  if (error && !order) {
    return (
      <div>
        <p className="text-sm text-red-600">{error}</p>
        <Link href="/admin/orders" className="mt-4 inline-block text-brand">
          {t.admin.orderBackListShort}
        </Link>
      </div>
    );
  }

  if (!order) return null;

  const locked = order.status === "approved" || order.status === "cancelled";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.admin.orderBackToList}
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{order.id}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {new Date(order.createdAt).toLocaleString(dateLocale)} ·{" "}
            <span className="font-medium text-slate-700">
              {statusLabel[order.status]}
            </span>
            {order.emailSentAt ? (
              <span className="text-green-600">
                {" "}
                · {t.admin.orderEmailSent} (
                {new Date(order.emailSentAt).toLocaleString(dateLocale)})
              </span>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!locked && (
            <>
              <button
                type="button"
                disabled={saving}
                onClick={saveEdits}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? t.admin.saving : t.admin.orderSaveEdits}
              </button>
              <button
                type="button"
                disabled={approving || cancelling}
                onClick={approveOrder}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                {approving ? t.admin.orderApproving : t.admin.orderApprove}
              </button>
              <button
                type="button"
                disabled={cancelling || approving}
                onClick={cancelOrder}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                {cancelling ? t.admin.orderCancelling : t.admin.orderCancel}
              </button>
            </>
          )}
        </div>
      </div>

      {message && (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-800">{t.admin.orderCustomer}</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-slate-400">{t.admin.orderFullName}</dt>
              <dd className="font-medium text-slate-800">{order.customerName}</dd>
            </div>
            <div>
              <dt className="text-slate-400">{t.admin.phoneLabel}</dt>
              <dd className="font-medium text-slate-800">
                <a href={`tel:${order.customerPhone}`} className="text-brand">
                  {order.customerPhone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-slate-400">{t.admin.emailLabel}</dt>
              <dd className="font-medium text-slate-800">
                {order.customerEmail || (
                  <span className="text-red-500">{t.admin.orderNoEmailNeeded}</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400">{t.admin.addressLabel}</dt>
              <dd className="whitespace-pre-line font-medium text-slate-800">
                {order.customerAddress}
              </dd>
            </div>
            {order.notes ? (
              <div>
                <dt className="text-slate-400">{t.admin.orderCustomerNote}</dt>
                <dd className="font-medium text-slate-800">{order.notes}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-800">{t.admin.orderSummary}</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">{t.admin.orderSubtotalRecorded}</dt>
              <dd>{formatPriceFromEur(order.subtotalEur)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">{t.admin.orderShipping}</dt>
              <dd>
                {order.shippingEur === 0
                  ? t.admin.orderFree
                  : formatPriceFromEur(order.shippingEur)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-bold text-brand">
              <dt>{t.admin.orderTotal}</dt>
              <dd>{formatPriceFromEur(order.totalEur)}</dd>
            </div>
            {!locked && previewTotals !== order.subtotalEur && (
              <p className="text-xs text-amber-600">
                {t.admin.orderPreviewSubtotal}{" "}
                {formatPriceFromEur(previewTotals)} {t.admin.orderPreviewSubtotalHint}
              </p>
            )}
          </dl>

          <label className="mt-4 block text-sm">
            <span className="mb-1 block font-medium text-slate-700">
              {t.admin.orderAdminNote}
            </span>
            <textarea
              rows={3}
              disabled={locked}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50"
              placeholder={t.admin.orderAdminNotePlaceholder}
            />
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h2 className="font-semibold text-slate-800">{t.admin.orderItemsEdit}</h2>
          <p className="text-xs text-slate-500">{t.admin.orderItemsEditHint}</p>
        </div>
        <div className="divide-y divide-slate-100">
          {items.map((item, index) => (
            <div
              key={`${item.productId}-${item.sku}-${index}`}
              className={`grid gap-3 p-4 md:grid-cols-12 md:items-center ${
                item.unavailable ? "bg-red-50/50" : ""
              }`}
            >
              <div className="md:col-span-4">
                <p className="font-medium text-slate-800">{item.name}</p>
                <p className="text-xs text-slate-500">{item.sku}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-slate-500">{t.admin.orderQty}</label>
                <input
                  type="number"
                  min={0}
                  disabled={locked || item.unavailable}
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(index, { quantity: Number(e.target.value) })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm disabled:bg-slate-50"
                />
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-slate-500">{t.admin.orderUnit}</p>
                <p className="mt-1 text-sm font-medium">
                  {formatPriceFromEur(item.unitPriceEur)}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-slate-500">{t.admin.orderLine}</p>
                <p className="mt-1 text-sm font-semibold">
                  {formatPriceFromEur(item.lineTotalEur)}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    disabled={locked}
                    checked={Boolean(item.unavailable)}
                    onChange={(e) =>
                      updateItem(index, {
                        unavailable: e.target.checked,
                        quantity: e.target.checked ? 0 : Math.max(1, item.quantity),
                        note: e.target.checked
                          ? item.note || t.admin.orderOutOfStock
                          : isDefaultOutOfStockNote(item.note)
                            ? ""
                            : item.note,
                      })
                    }
                  />
                  {t.admin.orderOutOfStock}
                </label>
              </div>
              <div className="md:col-span-12">
                <input
                  disabled={locked}
                  value={item.note || ""}
                  onChange={(e) => updateItem(index, { note: e.target.value })}
                  placeholder={t.admin.orderItemNotePlaceholder}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
