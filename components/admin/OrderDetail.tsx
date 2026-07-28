"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { formatPriceFromEur } from "@/lib/currency";
import type { Order, OrderStatus } from "@/lib/types/order";

const statusLabel: Record<OrderStatus, string> = {
  new: "Yeni",
  seen: "Görüldü",
  completed: "Tamamlandı",
};

export default function OrderDetail({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/admin/orders/${orderId}`);
        if (!res.ok) {
          setError("Sipariş bulunamadı");
          return;
        }
        const data = (await res.json()) as Order;
        if (cancelled) return;
        setOrder(data);

        if (data.status === "new") {
          const patch = await fetch(`/api/admin/orders/${orderId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "seen" }),
          });
          if (patch.ok) {
            const updated = await patch.json();
            if (!cancelled) setOrder(updated);
            sessionStorage.setItem(
              "odonexo-orders-last-seen-count",
              String(
                Math.max(
                  0,
                  Number(
                    sessionStorage.getItem("odonexo-orders-last-seen-count") ||
                      "1"
                  ) - 1
                )
              )
            );
          }
        }
      } catch {
        setError("Sipariş yüklenemedi");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const setStatus = async (status: OrderStatus) => {
    if (!order) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrder(await res.json());
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Yükleniyor…</p>;
  }

  if (error || !order) {
    return (
      <div>
        <p className="text-sm text-red-600">{error || "Sipariş yok"}</p>
        <Link href="/admin/orders" className="mt-4 inline-block text-brand">
          ← Listeye dön
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" />
        Siparişlere dön
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{order.id}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {new Date(order.createdAt).toLocaleString("tr-TR")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["seen", "completed", "new"] as OrderStatus[]).map((status) => (
            <button
              key={status}
              type="button"
              disabled={saving || order.status === status}
              onClick={() => setStatus(status)}
              className={`rounded-lg px-3 py-2 text-sm font-medium disabled:opacity-50 ${
                order.status === status
                  ? "bg-brand text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {statusLabel[status]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-800">Müşteri</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-slate-400">Ad Soyad</dt>
              <dd className="font-medium text-slate-800">{order.customerName}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Telefon</dt>
              <dd className="font-medium text-slate-800">
                <a href={`tel:${order.customerPhone}`} className="text-brand">
                  {order.customerPhone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-slate-400">E-posta</dt>
              <dd className="font-medium text-slate-800">
                {order.customerEmail || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400">Adres</dt>
              <dd className="font-medium text-slate-800 whitespace-pre-line">
                {order.customerAddress}
              </dd>
            </div>
            {order.notes ? (
              <div>
                <dt className="text-slate-400">Not</dt>
                <dd className="font-medium text-slate-800">{order.notes}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-800">Özet</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Ara toplam</dt>
              <dd>{formatPriceFromEur(order.subtotalEur)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Kargo</dt>
              <dd>
                {order.shippingEur === 0
                  ? "Ücretsiz"
                  : formatPriceFromEur(order.shippingEur)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-bold text-brand">
              <dt>Toplam</dt>
              <dd>{formatPriceFromEur(order.totalEur)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Ürün</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Adet</th>
              <th className="px-4 py-3">Birim</th>
              <th className="px-4 py-3">Tutar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <tr key={`${item.productId}-${item.sku}`}>
                <td className="px-4 py-3 font-medium text-slate-800">
                  {item.name}
                </td>
                <td className="px-4 py-3 text-slate-500">{item.sku}</td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3">
                  {formatPriceFromEur(item.unitPriceEur)}
                </td>
                <td className="px-4 py-3 font-semibold">
                  {formatPriceFromEur(item.lineTotalEur)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
