"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPriceFromEur } from "@/lib/currency";
import type { Order, OrderStatus } from "@/lib/types/order";
import { Eye, PackageCheck, ShoppingBag } from "lucide-react";

const statusLabel: Record<OrderStatus, string> = {
  new: "Yeni",
  seen: "Görüldü",
  completed: "Tamamlandı",
};

const statusClass: Record<OrderStatus, string> = {
  new: "bg-red-50 text-red-700 ring-red-100",
  seen: "bg-amber-50 text-amber-700 ring-amber-100",
  completed: "bg-green-50 text-green-700 ring-green-100",
};

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((res) => res.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  if (loading) {
    return <p className="text-sm text-slate-500">Siparişler yükleniyor…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "Tümü"],
            ["new", "Yeni"],
            ["seen", "Görüldü"],
            ["completed", "Tamamlandı"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              filter === key
                ? "bg-brand text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {label}
            {key !== "all" && (
              <span className="ml-1.5 opacity-80">
                ({orders.filter((o) => o.status === key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">Henüz sipariş yok.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Sipariş</th>
                <th className="px-4 py-3 font-medium">Müşteri</th>
                <th className="px-4 py-3 font-medium">Tutar</th>
                <th className="px-4 py-3 font-medium">Durum</th>
                <th className="px-4 py-3 font-medium">Tarih</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((order) => (
                <tr
                  key={order.id}
                  className={order.status === "new" ? "bg-red-50/40" : ""}
                >
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    {order.id}
                    <p className="text-xs font-normal text-slate-400">
                      {order.items.length} kalem
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">
                      {order.customerName}
                    </p>
                    <p className="text-xs text-slate-500">{order.customerPhone}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    {formatPriceFromEur(order.totalEur)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${statusClass[order.status]}`}
                    >
                      {statusLabel[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(order.createdAt).toLocaleString("tr-TR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      {order.status === "new" ? (
                        <Eye className="h-3.5 w-3.5" />
                      ) : (
                        <PackageCheck className="h-3.5 w-3.5" />
                      )}
                      Detay
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
