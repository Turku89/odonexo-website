"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft } from "lucide-react";
import type { SiteSettings } from "@/lib/types/site-settings";
import { toPublicSiteSettings } from "@/lib/types/site-settings";
import { useUpdateSiteSettings } from "@/lib/site-settings-context";
import { Send } from "lucide-react";

interface ContactSettingsFormProps {
  settings: SiteSettings;
}

export default function ContactSettingsForm({
  settings,
}: ContactSettingsFormProps) {
  const router = useRouter();
  const updateSiteSettings = useUpdateSiteSettings();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [testingTelegram, setTestingTelegram] = useState(false);
  const [telegramTestMsg, setTelegramTestMsg] = useState("");

  const [form, setForm] = useState({
    phone: settings.phone,
    whatsapp: settings.whatsapp,
    telegram: settings.telegram,
    email: settings.email,
    address: settings.address,
    hours: settings.hours,
    facebook: settings.facebook ?? "",
    instagram: settings.instagram ?? "",
    linkedin: settings.linkedin ?? "",
    freeShippingMinEur: settings.freeShippingMinEur ?? 50,
    shippingCostEur: settings.shippingCostEur ?? 5,
    telegramBotToken: "",
    telegramChatId: settings.telegramChatId ?? "",
  });

  const hasBotToken = Boolean(settings.telegramBotToken);

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const updated = (await res.json()) as SiteSettings;
      updateSiteSettings(toPublicSiteSettings(updated));
      setSuccess(true);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Kayıt başarısız");
    }
    setSaving(false);
  };

  const handleTestTelegram = async () => {
    setTestingTelegram(true);
    setTelegramTestMsg("");
    setError("");

    const saveRes = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!saveRes.ok) {
      const data = await saveRes.json();
      setError(data.error || "Ayarlar kaydedilemedi");
      setTestingTelegram(false);
      return;
    }

    const testRes = await fetch("/api/admin/settings/test-telegram", {
      method: "POST",
    });
    const data = await testRes.json();

    if (testRes.ok) {
      setTelegramTestMsg("Test mesajı gönderildi!");
    } else {
      setError(data.error || "Telegram testi başarısız");
    }
    setTestingTelegram(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" />
        Geri
      </button>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Site Ayarları</h1>
        <p className="mt-1 text-sm text-slate-500">
          İletişim bilgileri, para birimi ve sosyal medya linklerini yönetin
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}
      {success && (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          Site ayarları kaydedildi.
        </p>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <h2 className="font-semibold text-slate-800">Kargo (Euro)</h2>
        <p className="text-sm text-slate-500">
          Tüm ürün fiyatları Euro (€) cinsinden kaydedilir ve gösterilir.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Ücretsiz kargo eşiği (€)</label>
            <input
              type="text"
              inputMode="decimal"
              value={form.freeShippingMinEur}
              onChange={(e) => {
                const v = e.target.value.replace(",", ".");
                if (v === "" || /^\d*\.?\d*$/.test(v)) {
                  update("freeShippingMinEur", v);
                }
              }}
              placeholder="Örn: 50 veya 49.9"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Kargo ücreti (€)</label>
            <input
              type="text"
              inputMode="decimal"
              value={form.shippingCostEur}
              onChange={(e) => {
                const v = e.target.value.replace(",", ".");
                if (v === "" || /^\d*\.?\d*$/.test(v)) {
                  update("shippingCostEur", v);
                }
              }}
              placeholder="Örn: 5 veya 4.5"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <h2 className="font-semibold text-slate-800">Telegram Sipariş Bildirimi</h2>
        <p className="text-sm text-slate-500">
          Yeni sipariş geldiğinde Telegram botunuz üzerinden detaylı bildirim
          alırsınız. Bot oluşturmak için{" "}
          <a
            href="https://t.me/BotFather"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand hover:underline"
          >
            @BotFather
          </a>{" "}
          kullanın.
        </p>
        {telegramTestMsg && (
          <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            {telegramTestMsg}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium">Bot Token</label>
            <input
              type="password"
              value={form.telegramBotToken}
              onChange={(e) => update("telegramBotToken", e.target.value)}
              placeholder={hasBotToken ? "•••••••• (değiştirmek için yeni token)" : "123456:ABC-DEF..."}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium">Chat ID</label>
            <input
              value={form.telegramChatId}
              onChange={(e) => update("telegramChatId", e.target.value)}
              placeholder="-1001234567890 veya 123456789"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
            <p className="mt-1 text-xs text-slate-400">
              Grup veya kanal için @userinfobot ile chat ID öğrenebilirsiniz
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleTestTelegram}
          disabled={testingTelegram}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {testingTelegram ? "Gönderiliyor..." : "Test Mesajı Gönder"}
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <h2 className="font-semibold text-slate-800">Telefon & Mesajlaşma</h2>
        <p className="text-sm text-slate-500">
          Tek bir değer girin; tüm dillerde aynı bilgiler gösterilir.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Telefon</label>
            <input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+355 69 500 0000"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">WhatsApp numarası</label>
            <input
              value={form.whatsapp}
              onChange={(e) => update("whatsapp", e.target.value)}
              placeholder="355695000000"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
            <p className="mt-1 text-xs text-slate-400">Ülke kodu ile, boşluksuz</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Telegram</label>
            <input
              value={form.telegram}
              onChange={(e) => update("telegram", e.target.value)}
              placeholder="odonexo, @odonexo veya https://t.me/odonexo"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">E-posta</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="info@odonexo.com"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <h2 className="font-semibold text-slate-800">Adres & Çalışma Saatleri</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Adres</label>
            <textarea
              rows={4}
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 resize-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Çalışma saatleri</label>
            <textarea
              rows={4}
              value={form.hours}
              onChange={(e) => update("hours", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 resize-none"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <h2 className="font-semibold text-slate-800">Sosyal Medya</h2>
        <p className="text-sm text-slate-500">
          Footer&apos;daki ikonlar için profil linklerini girin. Boş bırakırsanız ikon görünmez.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Facebook</label>
            <input
              value={form.facebook}
              onChange={(e) => update("facebook", e.target.value)}
              placeholder="https://facebook.com/odonexo"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Instagram</label>
            <input
              value={form.instagram}
              onChange={(e) => update("instagram", e.target.value)}
              placeholder="https://instagram.com/odonexo"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium">LinkedIn</label>
            <input
              value={form.linkedin}
              onChange={(e) => update("linkedin", e.target.value)}
              placeholder="https://linkedin.com/company/odonexo"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {saving ? "Kaydediliyor..." : "Kaydet"}
      </button>
    </form>
  );
}
