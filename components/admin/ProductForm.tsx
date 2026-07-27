"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Upload, Save, ArrowLeft, X, Star, Link2, RefreshCw, Languages } from "lucide-react";
import type { Product } from "@/lib/types/product";
import type { Category } from "@/lib/types/category";
import {
  calcDiscountPercent,
  calcSalePrice,
  getProductImages,
} from "@/lib/product-helpers";
import { applyNameToDescription } from "@/lib/product-i18n";
import { useFormatPrice } from "@/lib/site-settings-context";
import { nextSku } from "@/lib/sku";
import { parseDecimal, sanitizeDecimalInput } from "@/lib/parse-decimal";
import { translateText } from "@/lib/translate";

interface ProductFormProps {
  product?: Product;
  mode: "create" | "edit";
  categories: Category[];
  existingSkus?: string[];
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function initialDiscountPercent(product?: Product): string {
  if (product?.discountPercent) return String(product.discountPercent);
  if (product?.originalPrice && product.price && product.originalPrice > product.price) {
    return String(calcDiscountPercent(product.originalPrice, product.price));
  }
  return "";
}

export default function ProductForm({
  product,
  mode,
  categories,
  existingSkus = [],
}: ProductFormProps) {
  const router = useRouter();
  const formatPrice = useFormatPrice();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [translatingSq, setTranslatingSq] = useState(false);
  const [error, setError] = useState("");
  const isSale = product?.badge === "sale";

  const defaultCategory = product?.categorySlug || categories[0]?.slug || "";
  const initialSku = product?.sku || "";

  const [skuManual, setSkuManual] = useState(mode === "edit");

  const [form, setForm] = useState({
    name: product?.name || "",
    nameSq: product?.nameSq || "",
    slug: product?.slug || "",
    sku: initialSku,
    description: product?.description || "",
    descriptionSq: product?.descriptionSq || "",
    price: isSale
      ? (product?.originalPrice ?? product?.price ?? "").toString()
      : product?.price?.toString() || "",
    discountPercent: initialDiscountPercent(product),
    categorySlug: defaultCategory,
    images: getProductImages(product || { image: "", images: [] }),
    imageUrl: "",
    badge: product?.badge || "",
    inStock: product?.inStock ?? true,
    stockQuantity: product?.stockQuantity?.toString() || "",
    published: product?.published ?? true,
  });

  const regenerateSku = (name: string) => {
    if (!name.trim()) return;
    const sku = nextSku(name, existingSkus);
    setForm((prev) => ({ ...prev, sku }));
    setSkuManual(false);
  };

  /** Opsiyonel Arnavutça isim girilince açıklamayı da çevirir (boşsa veya güncelle istenirse). */
  const syncDescriptionSqFromTurkish = async (
    nameSq: string,
    force = false
  ) => {
    const trimmedNameSq = nameSq.trim();
    const trDesc = form.description.trim();
    if (!trimmedNameSq || !trDesc) return;
    if (!force && form.descriptionSq.trim()) return;

    setTranslatingSq(true);
    try {
      const translated = await translateText(trDesc, "tr", "sq");
      const withName = applyNameToDescription(
        translated,
        { name: form.name, nameSq: trimmedNameSq },
        "sq"
      );
      setForm((prev) => ({ ...prev, descriptionSq: withName }));
    } finally {
      setTranslatingSq(false);
    }
  };

  const salePreview = useMemo(() => {
    if (form.badge !== "sale") return null;
    const listPrice = parseDecimal(form.price);
    const discount = Number(form.discountPercent);
    if (!Number.isFinite(listPrice) || listPrice <= 0) return null;
    if (!discount || discount <= 0 || discount >= 100) {
      return { listPrice, salePrice: listPrice, discount: 0 };
    }
    return {
      listPrice,
      salePrice: calcSalePrice(listPrice, discount),
      discount,
    };
  }, [form.badge, form.price, form.discountPercent]);

  const update = (key: string, value: string | boolean | string[]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "name" && mode === "create") {
        next.slug = slugify(value as string);
      }
      if (key === "badge") {
        if (value === "sale" && prev.badge !== "sale") {
          next.discountPercent = prev.discountPercent || "";
        } else if (value !== "sale" && prev.badge === "sale") {
          const listPrice = parseDecimal(prev.price);
          const discount = Number(prev.discountPercent);
          next.price =
            discount > 0 && discount < 100 && Number.isFinite(listPrice)
              ? String(calcSalePrice(listPrice, discount))
              : prev.price;
          next.discountPercent = "";
        }
      }
      return next;
    });
  };

  const uploadFile = async (
    file: File
  ): Promise<{ url: string | null; unauthorized?: boolean }> => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (res.status === 401) {
      return { url: null, unauthorized: true };
    }
    if (!res.ok) {
      try {
        const data = await res.json();
        setError(data.error || "Görsel yüklenemedi");
      } catch {
        setError("Görsel yüklenemedi");
      }
      return { url: null };
    }
    const { url } = await res.json();
    return { url };
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    setError("");
    const uploaded: string[] = [];
    let unauthorized = false;

    for (const file of Array.from(files)) {
      const result = await uploadFile(file);
      if (result.unauthorized) {
        unauthorized = true;
        break;
      }
      if (result.url) uploaded.push(result.url);
    }

    if (unauthorized) {
      setError("Oturum süresi doldu. Tekrar giriş yapın.");
      router.push("/admin/login");
    } else if (uploaded.length) {
      setForm((prev) => ({ ...prev, images: [...prev.images, ...uploaded] }));
    } else {
      setError((prev) => prev || "Görsel yüklenemedi");
    }
    setUploading(false);
    e.target.value = "";
  };

  const addImageUrl = () => {
    const url = form.imageUrl.trim();
    if (!url) return;
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, url],
      imageUrl: "",
    }));
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const setPrimaryImage = (index: number) => {
    setForm((prev) => {
      const next = [...prev.images];
      const [item] = next.splice(index, 1);
      next.unshift(item);
      return { ...prev, images: next };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const isSaleBadge = form.badge === "sale";
    const listPrice = parseDecimal(form.price);
    const discount = Number(form.discountPercent) || 0;

    if (!Number.isFinite(listPrice) || listPrice < 0) {
      setError("Geçerli bir fiyat girin (ör. 1.5 veya 1,5).");
      setSaving(false);
      return;
    }

    let price = listPrice;
    let originalPrice: number | undefined;
    let discountPercent: number | undefined;

    if (isSaleBadge) {
      if (discount <= 0 || discount >= 100) {
        setError("İndirim rozeti için geçerli bir indirim yüzdesi girin (1–99).");
        setSaving(false);
        return;
      }
      originalPrice = listPrice;
      price = calcSalePrice(listPrice, discount);
      discountPercent = discount;
      if (price >= originalPrice) {
        setError("İndirimli fiyat liste fiyatından düşük olmalıdır.");
        setSaving(false);
        return;
      }
    }

    let descriptionSq = form.descriptionSq;
    if (form.nameSq.trim() && !descriptionSq.trim() && form.description.trim()) {
      try {
        const translated = await translateText(form.description, "tr", "sq");
        descriptionSq = applyNameToDescription(
          translated,
          { name: form.name, nameSq: form.nameSq.trim() },
          "sq"
        );
      } catch {
        /* kaydetmeye devam */
      }
    }

    const payload = {
      name: form.name,
      nameSq: form.nameSq,
      slug: form.slug,
      sku: form.sku,
      description: form.description,
      descriptionSq,
      price,
      originalPrice: isSaleBadge ? originalPrice : undefined,
      discountPercent: isSaleBadge ? discountPercent : undefined,
      categorySlug: form.categorySlug,
      images: form.images,
      image: form.images[0] || "",
      badge: form.badge || undefined,
      inStock: form.inStock,
      stockQuantity: form.stockQuantity ? Number(form.stockQuantity) : undefined,
      published: form.published,
    };

    const url =
      mode === "create"
        ? "/api/admin/products"
        : `/api/admin/products/${product!.id}`;
    const method = mode === "create" ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Kayıt başarısız");
    }
    setSaving(false);
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

      <h1 className="text-2xl font-bold text-slate-900">
        {mode === "create" ? "Yeni Ürün Ekle" : "Ürünü Düzenle"}
      </h1>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <h2 className="font-semibold text-slate-800">Temel Bilgiler</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium">Ürün Adı (Türkçe) *</label>
            <input
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              onBlur={(e) => {
                if (mode === "create" && !skuManual && e.target.value.trim()) {
                  regenerateSku(e.target.value);
                }
              }}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
            <p className="mt-1.5 text-xs text-slate-400">
              Adı yazıp alandan çıktığınızda SKU otomatik oluşur.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium">Ürün Adı (Arnavutça)</label>
            <input
              value={form.nameSq}
              onChange={(e) => update("nameSq", e.target.value)}
              onBlur={() => {
                void syncDescriptionSqFromTurkish(form.nameSq);
              }}
              placeholder="Opsiyonel — girilirse dil Arnavutça iken ad ve açıklama değişir"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
            <p className="mt-1.5 text-xs text-slate-400">
              Bu alan doldurulunca Arnavutça açıklama boşsa Türkçe açıklamadan otomatik çevrilir.
            </p>
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
            <label className="mb-1 block text-sm font-medium">SKU *</label>
            <div className="flex gap-2">
              <input
                required
                value={form.sku}
                onChange={(e) => {
                  setSkuManual(true);
                  update("sku", e.target.value);
                }}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
              {mode === "create" && (
                <button
                  type="button"
                  onClick={() => regenerateSku(form.name)}
                  disabled={!form.name.trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  title="SKU yeniden oluştur"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              SKU ürün adından üretilir (ör. &quot;Scan Spreyi&quot; → SCAN-SPR-001,
              &quot;Scan Aleti&quot; → SCAN-ALE-001). Dilerseniz değiştirebilirsiniz.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium">Açıklama (Türkçe)</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 resize-none"
            />
          </div>
          <div className="sm:col-span-2">
            <div className="mb-1 flex items-center justify-between gap-2">
              <label className="block text-sm font-medium">Açıklama (Arnavutça)</label>
              <button
                type="button"
                disabled={
                  translatingSq ||
                  !form.nameSq.trim() ||
                  !form.description.trim()
                }
                onClick={() =>
                  void syncDescriptionSqFromTurkish(form.nameSq, true)
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                <Languages className="h-3.5 w-3.5" />
                {translatingSq ? "Çevriliyor…" : "Türkçeden çevir"}
              </button>
            </div>
            <textarea
              rows={4}
              value={form.descriptionSq}
              onChange={(e) => update("descriptionSq", e.target.value)}
              placeholder="Opsiyonel — dil Arnavutça iken bu açıklama gösterilir"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 resize-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Kategori *</label>
            <select
              value={form.categorySlug}
              onChange={(e) => update("categorySlug", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Rozet</label>
            <select
              value={form.badge}
              onChange={(e) => update("badge", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              <option value="">Yok</option>
              <option value="new">Yeni</option>
              <option value="sale">İndirim</option>
              <option value="bestseller">Çok Satan</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <h2 className="font-semibold text-slate-800">Fiyat & Stok</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">
              {form.badge === "sale" ? "Liste Fiyatı (€) *" : "Fiyat (€) *"}
            </label>
            <input
              required
              type="text"
              inputMode="decimal"
              value={form.price}
              onChange={(e) => {
                const next = sanitizeDecimalInput(e.target.value);
                if (next !== null) update("price", next);
              }}
              placeholder="Örn: 1.5 veya 1,5"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
            <p className="mt-1 text-xs text-slate-400">
              Ondalık için nokta veya virgül kullanabilirsiniz (1.5 / 1,5)
            </p>
          </div>

          {form.badge === "sale" && (
            <div>
              <label className="mb-1 block text-sm font-medium">İndirim (%)</label>
              <input
                type="number"
                min="1"
                max="99"
                value={form.discountPercent}
                onChange={(e) => update("discountPercent", e.target.value)}
                placeholder="Örn: 10"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
          )}

          {form.badge === "sale" && salePreview && salePreview.discount > 0 && (
            <div className="sm:col-span-2 rounded-lg border border-red-100 bg-red-50/50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-600">
                İndirim Önizlemesi
              </p>
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-lg text-slate-400 line-through">
                  {formatPrice(salePreview.listPrice)}
                </span>
                <span className="text-2xl font-bold text-brand">
                  {formatPrice(salePreview.salePrice)}
                </span>
                <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-bold text-white">
                  %{salePreview.discount} indirim
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Eski fiyat: {formatPrice(salePreview.listPrice)} → Yeni fiyat:{" "}
                {formatPrice(salePreview.salePrice)}
              </p>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium">Stok Adedi</label>
            <input
              type="number"
              min="0"
              value={form.stockQuantity}
              onChange={(e) => update("stockQuantity", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div className="flex flex-col justify-end gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.inStock}
                onChange={(e) => update("inStock", e.target.checked)}
                className="rounded border-slate-300 text-brand focus:ring-brand"
              />
              Stokta var
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => update("published", e.target.checked)}
                className="rounded border-slate-300 text-brand focus:ring-brand"
              />
              Sitede yayınla (görünür)
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <h2 className="font-semibold text-slate-800">Ürün Görselleri</h2>
        <p className="text-sm text-slate-500">
          Birden fazla görsel ekleyebilirsiniz. İlk görsel ana görsel olarak kullanılır.
        </p>

        {form.images.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {form.images.map((img, index) => (
              <div
                key={`${img}-${index}`}
                className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
              >
                <Image
                  src={img}
                  alt={`Görsel ${index + 1}`}
                  fill
                  className="object-contain p-2"
                />
                {index === 0 && (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-white">
                    <Star className="h-3 w-3" />
                    Ana
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  {index !== 0 && (
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(index)}
                      className="flex-1 rounded bg-white/90 px-2 py-1 text-[10px] font-medium text-slate-800 hover:bg-white"
                    >
                      Ana yap
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="rounded bg-red-500/90 p-1 text-white hover:bg-red-600"
                    aria-label="Görseli kaldır"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium hover:bg-slate-100">
            <Upload className="h-4 w-4" />
            {uploading ? "Yükleniyor..." : "Görsel Yükle"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleUpload}
            />
          </label>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={form.imageUrl}
              onChange={(e) => update("imageUrl", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addImageUrl();
                }
              }}
              placeholder="/products/... veya https://..."
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <button
            type="button"
            onClick={addImageUrl}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            URL Ekle
          </button>
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
