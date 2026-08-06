"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft } from "lucide-react";
import type { SiteSettings } from "@/lib/types/site-settings";
import { toPublicSiteSettings } from "@/lib/types/site-settings";
import { useUpdateSiteSettings } from "@/lib/site-settings-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { Send } from "lucide-react";

interface ContactSettingsFormProps {
  settings: SiteSettings;
}

export default function ContactSettingsForm({
  settings,
}: ContactSettingsFormProps) {
  const router = useRouter();
  const { t } = useLanguage();
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
    tiktok: settings.tiktok ?? "",
    freeShippingMinEur: settings.freeShippingMinEur ?? 50,
    shippingCostEur: settings.shippingCostEur ?? 5,
    onlinePaymentEnabled: settings.onlinePaymentEnabled ?? false,
    paymentProvider: settings.paymentProvider ?? "none",
    showVisa: settings.showVisa ?? true,
    showMastercard: settings.showMastercard ?? true,
    showTroy: settings.showTroy ?? true,
    posApiBaseUrl: settings.posApiBaseUrl ?? "",
    posMerchantId: settings.posMerchantId ?? "",
    posApiKey: "",
    telegramBotToken: "",
    telegramChatId: settings.telegramChatId ?? "",
    smtpHost: settings.smtpHost ?? "",
    smtpPort: String(settings.smtpPort || 587),
    smtpUser: settings.smtpUser ?? "",
    smtpPass: "",
    smtpFrom: settings.smtpFrom || settings.email || "",
  });

  const hasBotToken = Boolean(settings.telegramBotToken);
  const hasSmtpPass = Boolean(settings.smtpPass);
  const hasPosApiKey = Boolean(settings.posApiKey);

  const update = (key: string, value: string | boolean) => {
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
      // Footer/context için public ayarları doğrula
      try {
        const publicRes = await fetch("/api/site-settings", {
          cache: "no-store",
        });
        if (publicRes.ok) {
          const pub = await publicRes.json();
          updateSiteSettings(pub);
        }
      } catch {
        /* client update yeterli */
      }
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || t.admin.saveFailed);
    }
    setSaving(false);
  };

  const handleTestTelegram = async () => {
    setTestingTelegram(true);
    setTelegramTestMsg("");
    setError("");

    try {
      const testRes = await fetch("/api/admin/settings/test-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramBotToken: form.telegramBotToken,
          telegramChatId: form.telegramChatId,
        }),
      });
      const data = await testRes.json();

      if (testRes.ok) {
        setTelegramTestMsg(t.admin.telegramTestOk);
      } else {
        setError(data.error || t.admin.telegramTestFail);
      }
    } catch {
      setError(t.admin.telegramTestNetwork);
    } finally {
      setTestingTelegram(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.admin.back}
      </button>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t.admin.settingsTitle}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.admin.settingsSubtitle}</p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}
      {success && (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {t.admin.settingsSaved}
        </p>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <h2 className="font-semibold text-slate-800">{t.admin.shippingSection}</h2>
        <p className="text-sm text-slate-500">{t.admin.currencyHint}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">{t.admin.freeShippingMin}</label>
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
            <label className="mb-1 block text-sm font-medium">{t.admin.shippingCost}</label>
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
        <div>
          <h2 className="font-semibold text-slate-800">{t.admin.paymentSection}</h2>
          <p className="mt-1 text-sm text-slate-500">{t.admin.paymentSectionHint}</p>
        </div>

        <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
          <input
            type="checkbox"
            checked={form.onlinePaymentEnabled}
            onChange={(e) => {
              const enabled = e.target.checked;
              setForm((prev) => ({
                ...prev,
                onlinePaymentEnabled: enabled,
                paymentProvider: enabled
                  ? prev.paymentProvider === "none"
                    ? "pos"
                    : prev.paymentProvider
                  : prev.paymentProvider,
              }));
              setSuccess(false);
            }}
            className="mt-0.5 rounded border-slate-300 text-brand focus:ring-brand"
          />
          <span>
            <span className="block font-medium text-slate-800">
              {t.admin.paymentEnabled}
            </span>
            <span className="mt-0.5 block text-xs text-slate-500">
              {t.admin.paymentEnabledHelp}
            </span>
          </span>
        </label>

        {form.onlinePaymentEnabled ? (
          <div className="space-y-5 border-t border-slate-100 pt-5">
            <div>
              <label className="mb-1 block text-sm font-medium">
                {t.admin.paymentProvider}
              </label>
              <select
                value={form.paymentProvider}
                onChange={(e) => update("paymentProvider", e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              >
                <option value="none">{t.admin.paymentProviderNone}</option>
                <option value="manual">{t.admin.paymentProviderManual}</option>
                <option value="pos">{t.admin.paymentProviderPos}</option>
              </select>
            </div>

            {form.paymentProvider === "pos" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium">
                    {t.admin.paymentApiUrl}
                  </label>
                  <input
                    value={form.posApiBaseUrl}
                    onChange={(e) => update("posApiBaseUrl", e.target.value)}
                    placeholder="https://api.pos-provider.com/v1"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    {t.admin.paymentMerchantId}
                  </label>
                  <input
                    value={form.posMerchantId}
                    onChange={(e) => update("posMerchantId", e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    {t.admin.paymentApiKey}
                  </label>
                  <input
                    type="password"
                    value={form.posApiKey}
                    onChange={(e) => update("posApiKey", e.target.value)}
                    placeholder={
                      hasPosApiKey
                        ? t.admin.paymentApiKeyKeep
                        : "API key"
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </div>
              </div>
            ) : null}

            <div>
              <p className="mb-2 text-sm font-medium">{t.admin.paymentBrands}</p>
              <div className="flex flex-wrap gap-4">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.showVisa}
                    onChange={(e) => update("showVisa", e.target.checked)}
                    className="rounded border-slate-300 text-brand focus:ring-brand"
                  />
                  {t.admin.paymentBrandVisa}
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.showMastercard}
                    onChange={(e) => update("showMastercard", e.target.checked)}
                    className="rounded border-slate-300 text-brand focus:ring-brand"
                  />
                  {t.admin.paymentBrandMastercard}
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.showTroy}
                    onChange={(e) => update("showTroy", e.target.checked)}
                    className="rounded border-slate-300 text-brand focus:ring-brand"
                  />
                  {t.admin.paymentBrandTroy}
                </label>
              </div>
            </div>

            <p className="rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-800">
              {t.admin.paymentPosNote}
            </p>
          </div>
        ) : null}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <h2 className="font-semibold text-slate-800">{t.admin.telegramSection}</h2>
        <p className="text-sm text-slate-500">{t.admin.telegramHint}</p>
        {telegramTestMsg && (
          <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            {telegramTestMsg}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium">{t.admin.botToken}</label>
            <input
              type="password"
              value={form.telegramBotToken}
              onChange={(e) => update("telegramBotToken", e.target.value)}
              placeholder={
                hasBotToken
                  ? t.admin.tokenPlaceholderChange
                  : "123456:ABC-DEF..."
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium">{t.admin.chatId}</label>
            <input
              value={form.telegramChatId}
              onChange={(e) => update("telegramChatId", e.target.value)}
              placeholder="-1001234567890 veya 123456789"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
            <p className="mt-1 text-xs text-slate-400">{t.admin.chatIdHint}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleTestTelegram}
          disabled={testingTelegram}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {testingTelegram ? t.admin.testingTelegram : t.admin.testTelegram}
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <h2 className="font-semibold text-slate-800">{t.admin.smtpSection}</h2>
        <p className="text-sm text-slate-500">{t.admin.smtpHint}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">{t.admin.smtpHost}</label>
            <input
              value={form.smtpHost}
              onChange={(e) => update("smtpHost", e.target.value)}
              placeholder="smtp.gmail.com"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t.admin.smtpPort}</label>
            <input
              value={form.smtpPort}
              onChange={(e) => update("smtpPort", e.target.value)}
              placeholder="587"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t.admin.smtpUser}</label>
            <input
              value={form.smtpUser}
              onChange={(e) => update("smtpUser", e.target.value)}
              placeholder="info@odonexo.com"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t.admin.smtpPass}</label>
            <input
              type="password"
              value={form.smtpPass}
              onChange={(e) => update("smtpPass", e.target.value)}
              placeholder={
                hasSmtpPass
                  ? t.admin.smtpPassPlaceholderChange
                  : t.admin.smtpPassPlaceholder
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium">
              {t.admin.smtpFrom}
            </label>
            <input
              type="email"
              value={form.smtpFrom}
              onChange={(e) => update("smtpFrom", e.target.value)}
              placeholder="info@odonexo.com"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <h2 className="font-semibold text-slate-800">{t.admin.phoneSection}</h2>
        <p className="text-sm text-slate-500">{t.admin.phoneHint}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">{t.admin.phoneLabel}</label>
            <input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+355 69 500 0000"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t.admin.whatsappLabel}</label>
            <input
              value={form.whatsapp}
              onChange={(e) => update("whatsapp", e.target.value)}
              placeholder="355695000000"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
            <p className="mt-1 text-xs text-slate-400">{t.admin.whatsappHint}</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t.admin.telegramLabel}</label>
            <input
              value={form.telegram}
              onChange={(e) => update("telegram", e.target.value)}
              placeholder="odonexo, @odonexo veya https://t.me/odonexo"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t.admin.emailLabel}</label>
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
        <h2 className="font-semibold text-slate-800">{t.admin.addressSection}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">{t.admin.addressLabel}</label>
            <textarea
              rows={4}
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 resize-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t.admin.hoursLabel}</label>
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
        <h2 className="font-semibold text-slate-800">{t.admin.socialSection}</h2>
        <p className="text-sm text-slate-500">{t.admin.socialHint}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">{t.admin.facebookLabel}</label>
            <input
              value={form.facebook}
              onChange={(e) => update("facebook", e.target.value)}
              placeholder="https://facebook.com/odonexo"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t.admin.instagramLabel}</label>
            <input
              value={form.instagram}
              onChange={(e) => update("instagram", e.target.value)}
              placeholder="https://instagram.com/odonexo"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t.admin.linkedinLabel}</label>
            <input
              value={form.linkedin}
              onChange={(e) => update("linkedin", e.target.value)}
              placeholder="https://linkedin.com/company/odonexo"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t.admin.tiktokLabel}</label>
            <input
              value={form.tiktok}
              onChange={(e) => update("tiktok", e.target.value)}
              placeholder="@odonexo veya https://www.tiktok.com/@odonexo"
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
        {saving ? t.admin.saving : t.admin.save}
      </button>
    </form>
  );
}
