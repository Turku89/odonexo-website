"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Upload, X, Languages } from "lucide-react";
import type { Category } from "@/lib/types/category";
import { translateText } from "@/lib/translate";

interface CategoryFormProps {
  category?: Category;
  mode: "create" | "edit";
}

const ICON_OPTIONS = ["🦷", "🏗️", "🔬", "⚙️", "🔧", "📦", "💊", "🧪", "🛠️", "✨"];

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/ë/g, "e")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function CategoryForm({ category, mode }: CategoryFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [translatingEn, setTranslatingEn] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nameSq: category?.nameSq || "",
    nameEn: category?.nameEn || "",
    name: category?.name || "",
    slug: category?.slug || "",
    descriptionSq: category?.descriptionSq || "",
    descriptionEn: category?.descriptionEn || "",
    description: category?.description || "",
    icon: category?.icon || "📦",
    image: category?.image || "",
    published: category?.published ?? true,
  });

  const update = (key: string, value: string | boolean) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "nameSq" && mode === "create") {
        next.slug = slugify(value as string);
      }
      return next;
    });
  };

  const suggestEnglishFromAlbanian = async () => {
    const nameSq = form.nameSq.trim();
    const descSq = form.descriptionSq.trim();
    if (!nameSq && !descSq) return;

    setTranslatingEn(true);
    try {
      const next: Partial<typeof form> = {};
      if (nameSq) next.nameEn = await translateText(nameSq, "sq", "en");
      if (descSq) next.descriptionEn = await translateText(descSq, "sq", "en");
      setForm((prev) => ({ ...prev, ...next }));
    } finally {
      setTranslatingEn(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });

    if (res.status === 401) {
      setError("Oturum süresi doldu. Tekrar giriş yapın.");
      router.push("/admin/login");
    } else if (res.ok) {
      const { url } = await res.json();
      setForm((prev) => ({ ...prev, image: url }));
    } else {
      try {
        const data = await res.json();
        setError(data.error || "Görsel yüklenemedi");
      } catch {
        setError("Görsel yüklenemedi");
      }
    }

    setUploading(false);
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const nameSq = form.nameSq.trim();
    if (!nameSq) {
      setError("Arnavutça kategori adı zorunludur (kaynak dil).");
      setSaving(false);
      return;
    }

    let nameEn = form.nameEn.trim();
    let descriptionEn = form.descriptionEn.trim();
    let name = form.name.trim();
    let description = form.description.trim();
    const descriptionSq = form.descriptionSq.trim();

    try {
      if (!nameEn && nameSq) nameEn = await translateText(nameSq, "sq", "en");
      if (!descriptionEn && descriptionSq) {
        descriptionEn = await translateText(descriptionSq, "sq", "en");
      }
      if (!name) name = nameEn || nameSq;
      if (!description && descriptionSq) {
        description = await translateText(descriptionSq, "sq", "tr");
      }
    } catch {
      if (!name) name = nameSq;
    }

    const payload = {
      ...form,
      name,
      nameSq,
      nameEn,
      description,
      descriptionSq,
      descriptionEn,
      slug: form.slug || slugify(nameSq),
    };

    const url =
      mode === "create"
        ? "/api/admin/categories"
        : `/api/admin/categories/${category!.id}`;
    const method = mode === "create" ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/admin/categories");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Kayıt başarısız");
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" />
        Geri
      </button>

      <h1 className="text-2xl font-bold text-slate-900">
        {mode === "create" ? "Yeni Kategori Ekle" : "Kategoriyi Düzenle"}
      </h1>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-6 space-y-5">
        <div>
          <h2 className="font-semibold text-slate-800">Arnavutça (kaynak) *</h2>
          <p className="mt-1 text-xs text-slate-500">
            Önce Arnavutça girin; İngilizce öneri buradan üretilir.
          </p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Kategori Adı (Arnavutça) *</label>
          <input
            required
            value={form.nameSq}
            onChange={(e) => update("nameSq", e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Açıklama (Arnavutça)</label>
          <textarea
            rows={3}
            value={form.descriptionSq}
            onChange={(e) => update("descriptionSq", e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 resize-none"
          />
        </div>
      </div>

      <div className="rounded-xl border border-sky-200 bg-sky-50/40 p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-800">İngilizce</h2>
            <p className="mt-1 text-xs text-slate-500">
              Öneriyi kontrol edip düzeltin.
            </p>
          </div>
          <button
            type="button"
            disabled={
              translatingEn ||
              (!form.nameSq.trim() && !form.descriptionSq.trim())
            }
            onClick={() => void suggestEnglishFromAlbanian()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-sky-300 bg-white px-3 py-1.5 text-xs font-medium text-sky-800 hover:bg-sky-50 disabled:opacity-40"
          >
            <Languages className="h-3.5 w-3.5" />
            {translatingEn ? "Çevriliyor…" : "Arnavutçadan öner"}
          </button>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Kategori Adı (İngilizce)</label>
          <input
            value={form.nameEn}
            onChange={(e) => update("nameEn", e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Açıklama (İngilizce)</label>
          <textarea
            rows={3}
            value={form.descriptionEn}
            onChange={(e) => update("descriptionEn", e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 resize-none"
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <h2 className="font-semibold text-slate-800">Türkçe / diğer</h2>
        <div>
          <label className="mb-1 block text-sm font-medium">Kategori Adı (Türkçe)</label>
          <input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Slug</label>
          <input
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Açıklama (Türkçe)</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 resize-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Kategori Görseli</label>
          {form.image ? (
            <div className="relative mb-3 h-40 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <Image
                src={form.image}
                alt={form.nameSq || form.name || "Kategori"}
                fill
                className="object-cover"
                sizes="600px"
              />
              <button
                type="button"
                onClick={() => update("image", "")}
                className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-slate-600 shadow hover:bg-white hover:text-red-500"
                aria-label="Görseli kaldır"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : null}
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Upload className="h-4 w-4" />
            {uploading ? "Yükleniyor..." : form.image ? "Görseli Değiştir" : "Resim Yükle"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={handleUpload}
            />
          </label>
          <p className="mt-1.5 text-xs text-slate-400">
            JPG, PNG veya WebP. Görsel yoksa aşağıdaki ikon kullanılır.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">İkon (görsel yoksa)</label>
          <div className="flex flex-wrap gap-2">
            {ICON_OPTIONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => update("icon", icon)}
                className={`flex h-11 w-11 items-center justify-center rounded-lg border text-xl transition-colors ${
                  form.icon === icon
                    ? "border-brand bg-brand-muted"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => update("published", e.target.checked)}
            className="rounded border-slate-300 text-brand focus:ring-brand"
          />
          Sitede yayınla (müşteriler görsün)
        </label>
      </div>

      <button
        type="submit"
        disabled={saving || uploading}
        className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {saving ? "Kaydediliyor..." : "Kaydet"}
      </button>
    </form>
  );
}
