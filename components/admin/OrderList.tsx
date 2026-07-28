"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { formatPriceFromEur } from "@/lib/currency";
import type { Order, OrderStatus } from "@/lib/types/order";
import {
  Eye,
  PackageCheck,
  RefreshCw,
  Search,
  ShoppingBag,
} from "lucide-react";

const statusLabel: Record<OrderStatus, string> = {
  new: "Yeni",
  seen: "Görüldü",
  approved: "Onaylandı",
};

const statusClass: Record<OrderStatus, string> = {
  new: "bg-red-50 text-red-700 ring-red-100",
  seen: "bg-amber-50 text-amber-700 ring-amber-100",
  approved: "bg-green-50 text-green-700 ring-green-100",
};

type StatusFilter = "all" | OrderStatus;
type DateFilter = "all" | "today" | "week" | "month";

const POLL_MS = 8_000;

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function daysAgo(n: number) {
  return Date.now() - n * 24 * 60 * 60 * 1000;
}

export default function OrderList() {
  const pathname = usePathname();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [query, setQuery] = useState("");

  const loadOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    if (!silent) setError("");

    try {
      const res = await fetch(`/api/admin/orders?t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      });
      if (!res.ok) {
        if (!silent) setError("Siparişler yüklenemedi");
        return;
      }
      const data = await res.json();
      if (!Array.isArray(data)) {
        if (!silent) setError("Siparişler yüklenemedi");
        return;
      }

      setOrders((prev) => {
        // Sessiz yenilemede boş liste gelirse (soğuk instance) mevcut listeyi silme
        if (silent && data.length === 0 && prev.length > 0) {
          return prev;
        }

        // ID bazlı birleştir — daha yeni kayıt kazansın
        if (silent && prev.length > 0) {
          const map = new Map<string, Order>();
          for (const o of prev) map.set(o.id, o);
          for (const o of data as Order[]) {
            const existing = map.get(o.id);
            if (!existing) {
              map.set(o.id, o);
              continue;
            }
            const a = new Date(existing.updatedAt || existing.createdAt).getTime();
            const b = new Date(o.updatedAt || o.createdAt).getTime();
            if (b >= a) map.set(o.id, o);
          }
          return Array.from(map.values()).sort(
            (x, y) =>
              new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime()
          );
        }

        return data as Order[];
      });
    } catch {
      if (!silent) setError("Siparişler yüklenemedi (ağ hatası)");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!pathname.startsWith("/admin/orders")) return;
    void loadOrders();
  }, [pathname, loadOrders]);

  useEffect(() => {
    if (pathname !== "/admin/orders") return;

    const onFocus = () => void loadOrders(true);
    const onVisible = () => {
      if (document.visibilityState === "visible") void loadOrders(true);
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("odonexo-orders-changed", onFocus);
    const timer = window.setInterval(() => void loadOrders(true), POLL_MS);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("odonexo-orders-changed", onFocus);
      window.clearInterval(timer);
    };
  }, [pathname, loadOrders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const todayStart = startOfToday();

    return orders.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) return false;

      const created = new Date(order.createdAt).getTime();
      if (dateFilter === "today" && created < todayStart) return false;
      if (dateFilter === "week" && created < daysAgo(7)) return false;
      if (dateFilter === "month" && created < daysAgo(30)) return false;

      if (!q) return true;

      const haystack = [
        order.id,
        order.customerName,
        order.customerPhone,
        order.customerEmail,
        order.customerAddress,
        order.notes,
        order.adminNote,
        ...order.items.map((i) => `${i.name} ${i.sku}`),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [orders, statusFilter, dateFilter, query]);

  const statusCounts = useMemo(() => {
    return {
      all: orders.length,
      new: orders.filter((o) => o.status === "new").length,
      seen: orders.filter((o) => o.status === "seen").length,
      approved: orders.filter((o) => o.status === "approved").length,
    };
  }, [orders]);

  if (loading) {
    return <p className="text-sm text-slate-500">Siparişler yükleniyor…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ara: sipariş no, müşteri, telefon, e-posta, ürün…"
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <button
          type="button"
          onClick={() => void loadOrders(false)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Yenile
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "Tümü"],
            ["new", "Yeni"],
            ["seen", "Görüldü"],
            ["approved", "Onaylandı"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setStatusFilter(key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              statusFilter === key
                ? "bg-brand text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {label}
            <span className="ml-1.5 opacity-80">({statusCounts[key]})</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "Tüm tarihler"],
            ["today", "Bugün"],
            ["week", "Son 7 gün"],
            ["month", "Son 30 gün"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setDateFilter(key)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              dateFilter === key
                ? "bg-slate-800 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <p className="text-xs text-slate-400">
        {filtered.length} / {orders.length} sipariş gösteriliyor
        {refreshing ? " · güncelleniyor…" : ""}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">
            {orders.length === 0
              ? "Henüz sipariş yok."
              : "Filtrelere uyan sipariş bulunamadı."}
          </p>
          {(query || statusFilter !== "all" || dateFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setStatusFilter("all");
                setDateFilter("all");
              }}
              className="mt-3 text-sm font-medium text-brand hover:underline"
            >
              Filtreleri temizle
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto overflow-hidden rounded-xl border border-slate-200 bg-white">
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
                    <p className="text-xs text-slate-500">
                      {order.customerPhone}
                    </p>
                    {order.customerEmail ? (
                      <p className="text-xs text-slate-400">
                        {order.customerEmail}
                      </p>
                    ) : null}
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
