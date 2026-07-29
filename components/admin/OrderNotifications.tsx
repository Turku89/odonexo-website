"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

const POLL_MS = 10_000;
const STORAGE_KEY = "odonexo-orders-last-seen-count";

export default function OrderNotifications() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const [newCount, setNewCount] = useState(0);
  const [latestId, setLatestId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; orderId: string | null } | null>(
    null
  );
  const knownCount = useRef<number | null>(null);
  const audioCtx = useRef<AudioContext | null>(null);
  const tRef = useRef(t);
  tRef.current = t;

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/admin/orders?count=new");
        if (!res.ok) return;
        const data = await res.json();
        const count = Number(data.count) || 0;
        const id = typeof data.latestId === "string" ? data.latestId : null;
        if (cancelled) return;

        if (knownCount.current === null) {
          const stored = Number(sessionStorage.getItem(STORAGE_KEY) || "0");
          knownCount.current = stored;
        }

        if (count > (knownCount.current ?? 0)) {
          const diff = count - (knownCount.current ?? 0);
          const admin = tRef.current.admin;
          setToast({
            message:
              diff === 1
                ? admin.notifToastOne
                : `${diff} ${admin.notifToastMany}`,
            orderId: id,
          });
          playChime();
          if (
            typeof window !== "undefined" &&
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification(admin.notifBrowserTitle, {
              body:
                diff === 1
                  ? admin.notifBrowserOne
                  : `${diff} ${admin.notifBrowserMany}`,
              icon: "/logo-header.jpg",
            });
          }
        }

        knownCount.current = count;
        sessionStorage.setItem(STORAGE_KEY, String(count));
        setNewCount(count);
        setLatestId(id);
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
    const timer = window.setTimeout(() => setToast(null), 10000);
    return () => window.clearTimeout(timer);
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

  const openOrders = (orderId?: string | null) => {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      void Notification.requestPermission();
    }
    const href = orderId
      ? `/admin/orders/${orderId}`
      : latestId
        ? `/admin/orders/${latestId}`
        : "/admin/orders";
    router.push(href);
    setToast(null);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => openOrders(latestId)}
        className="relative inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        title={t.admin.notifTitle}
      >
        <Bell className="h-4 w-4" />
        <span className="hidden sm:inline">{t.admin.notifOrders}</span>
        {newCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {newCount > 99 ? "99+" : newCount}
          </span>
        )}
      </button>

      {toast && (
        <button
          type="button"
          onClick={() => openOrders(toast.orderId)}
          className="fixed bottom-6 right-6 z-[200] max-w-sm cursor-pointer rounded-xl border border-brand/20 bg-white p-4 text-left shadow-xl hover:border-brand/40"
        >
          <p className="text-sm font-semibold text-slate-900">{toast.message}</p>
          <p className="mt-2 text-sm font-medium text-brand">
            {t.admin.notifClickOpen}
          </p>
        </button>
      )}
    </>
  );
}
