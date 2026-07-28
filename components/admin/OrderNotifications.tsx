"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";

const POLL_MS = 12_000;
const STORAGE_KEY = "odonexo-orders-last-seen-count";

export default function OrderNotifications() {
  const pathname = usePathname();
  const [newCount, setNewCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const knownCount = useRef<number | null>(null);
  const audioCtx = useRef<AudioContext | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/admin/orders?count=new");
        if (!res.ok) return;
        const data = await res.json();
        const count = Number(data.count) || 0;
        if (cancelled) return;

        if (knownCount.current === null) {
          const stored = Number(sessionStorage.getItem(STORAGE_KEY) || "0");
          knownCount.current = stored;
        }

        if (count > (knownCount.current ?? 0)) {
          const diff = count - (knownCount.current ?? 0);
          setToast(
            diff === 1
              ? "Yeni bir sipariş geldi!"
              : `${diff} yeni sipariş geldi!`
          );
          playChime();
          if (
            typeof window !== "undefined" &&
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification("odonexo — Yeni sipariş", {
              body:
                diff === 1
                  ? "Admin panelinde yeni sipariş var."
                  : `${diff} yeni sipariş bekliyor.`,
              icon: "/logo-header.jpg",
            });
          }
        }

        knownCount.current = count;
        sessionStorage.setItem(STORAGE_KEY, String(count));
        setNewCount(count);
      } catch {
        /* ignore */
      }
    }

    poll();
    const id = window.setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [pathname]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const playChime = () => {
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtx.current) audioCtx.current = new Ctx();
      const ctx = audioCtx.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.value = 0.04;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch {
      /* ignore */
    }
  };

  const requestPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }
  };

  return (
    <>
      <Link
        href="/admin/orders"
        onClick={requestPermission}
        className="relative inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        title="Gelen siparişler"
      >
        <Bell className="h-4 w-4" />
        <span className="hidden sm:inline">Siparişler</span>
        {newCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {newCount > 99 ? "99+" : newCount}
          </span>
        )}
      </Link>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[200] max-w-sm animate-in rounded-xl border border-brand/20 bg-white p-4 shadow-xl">
          <p className="text-sm font-semibold text-slate-900">{toast}</p>
          <Link
            href="/admin/orders"
            className="mt-2 inline-block text-sm font-medium text-brand hover:underline"
          >
            Siparişleri gör →
          </Link>
        </div>
      )}
    </>
  );
}
