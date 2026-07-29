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
import { useLanguage } from "@/lib/i18n/language-context";

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
    .replace(/ë/g, "e")
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
  const { t } = useLanguage();
  const formatPrice = useFormatPrice();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [translatingEn, setTranslatingEn] = useState(false);
  const [translatingTr, setTranslatingTr] = useState(false);
  const [error, setError] = useState("");
  const isSale = product?.badge === "sale";

  const defaultCategory = product?.categorySlug || categories[0]?.slug || "";
  const initialSku = product?.sku || "";

  const [skuManual, setSkuManual] = useState(mode === "edit");

  const [form, setForm] = useState({
    nameSq: product?.nameSq || "",
    nameEn: product?.nameEn || "",
    name: product?.name || "",
    slug: product?.slug || "",
    sku: initialSku,
    descriptionSq: product?.descriptionSq || "",
    descriptionEn: product?.descriptionEn || "",
    description: product?.description || "",
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

  /** Arnavutça kaynaktan İngilizce öneri üretir; admin düzenleyebilir. */
  const suggestEnglishFromAlbanian = async (force = false) => {
    const nameSq = form.nameSq.trim();
    const descSq = form.descriptionSq.trim();
    if (!nameSq && !descSq) return;

    setTranslatingEn(true);
    try {
      const next: Partial<typeof form> = {};

      if (nameSq && (force || !form.nameEn.trim())) {
        next.nameEn = await translateText(nameSq, "sq", "en");
      }

      if (descSq && (force || !form.descriptionEn.trim())) {
        const translated = await translateText(descSq, "sq", "en");
        const nameEn = (next.nameEn || form.nameEn).trim() || nameSq;
        next.descriptionEn = applyNameToDescription(
          translated,
          { name: form.name, nameSq, nameEn },
          "en"
        );
      }

      if (Object.keys(next).length) {
        setForm((prev) => ({ ...prev, ...next }));
      }
    } finally {
      setTranslatingEn(false);
    }
  };

  /** İsteğe bağlı TR alanlarını Arnavutçadan doldurur. */
  const suggestTurkishFromAlbanian = async (force = false) => {
    const nameSq = form.nameSq.trim();
    const descSq = form.descriptionSq.trim();
    if (!nameSq && !descSq) return;

    setTranslatingTr(true);
    try {
      const next: Partial<typeof form> = {};

      if (nameSq && (force || !form.name.trim())) {
        next.name = await translateText(nameSq, "sq", "tr");
      }

      if (descSq && (force || !form.description.trim())) {
        const translated = await translateText(descSq, "sq", "tr");
        const nameTr = (next.name || form.name).trim() || nameSq;
        next.description = applyNameToDescription(
          translated,
          { name: nameTr, nameSq, nameEn: form.nameEn },
          "tr"
        );
      }

      if (Object.keys(next).length) {
        setForm((prev) => ({ ...prev, ...next }));
      }
    } finally {
      setTranslatingTr(false);
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
      if (key === "nameSq" && mode === "create") {
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
        setError(data.error || t.admin.uploadFailed);
      } catch {
        setError(t.admin.uploadFailed);
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
      setError(t.admin.sessionExpired);
      router.push("/admin/login");
    } else if (uploaded.length) {
      setForm((prev) => ({ ...prev, images: [...prev.images, ...uploaded] }));
    } else {
      setError((prev) => prev || t.admin.uploadFailed);
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

    const nameSq = form.nameSq.trim();
    if (!nameSq) {
      setError(t.admin.nameSqRequired);
      setSaving(false);
      return;
    }

    const isSaleBadge = form.badge === "sale";
    const listPrice = parseDecimal(form.price);
    const discount = Number(form.discountPercent) || 0;

    if (!Number.isFinite(listPrice) || listPrice < 0) {
      setError(t.admin.invalidPrice);
      setSaving(false);
      return;
    }

    let price = listPrice;
    let originalPrice: number | undefined;
    let discountPercent: number | undefined;

    if (isSaleBadge) {
      if (discount <= 0 || discount >= 100) {
        setError(t.admin.invalidDiscount);
        setSaving(false);
        return;
      }
      originalPrice = listPrice;
      price = calcSalePrice(listPrice, discount);
      discountPercent = discount;
      if (price >= originalPrice) {
        setError(t.admin.salePriceMustBeLower);
        setSaving(false);
        return;
      }
    }

    let nameEn = form.nameEn.trim();
    let descriptionEn = form.descriptionEn.trim();
    let name = form.name.trim();
    let description = form.description.trim();
    const descriptionSq = form.descriptionSq.trim();

    // İngilizce boşsa Arnavutçadan öner (kaydetmeden önce; admin sonra düzeltebilir)
    try {
      if (!nameEn && nameSq) {
        nameEn = await translateText(nameSq, "sq", "en");
      }
      if (!descriptionEn && descriptionSq) {
        const translated = await translateText(descriptionSq, "sq", "en");
        descriptionEn = applyNameToDescription(
          translated,
          { name, nameSq, nameEn },
          "en"
        );
      }
      if (!name) {
        name = nameEn || nameSq;
      }
      if (!description && descriptionSq) {
        description = await translateText(descriptionSq, "sq", "tr");
      }
    } catch {
      if (!name) name = nameSq;
    }

    const payload = {
      name,
      nameSq,
      nameEn,
      slug: form.slug || slugify(nameSq),
      sku: form.sku,
      description,
      descriptionSq,
      descriptionEn,
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
      setError(data.error || t.admin.saveFailed);
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
        {t.admin.back}
      </button>

      <h1 className="text-2xl font-bold text-slate-900">
        {mode === "create" ? t.admin.createProduct : t.admin.editProduct}
      </h1>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-6 space-y-5">
        <div>
          <h2 className="font-semibold text-slate-800">{t.admin.sourceSq} *</h2>
          <p className="mt-1 text-xs text-slate-500">
            {t.admin.sourceSq}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium">{t.admin.nameSqLabel}</label>
            <input
              required
              value={form.nameSq}
              onChange={(e) => update("nameSq", e.target.value)}
              onBlur={(e) => {
                if (mode === "create" && !skuManual && e.target.value.trim()) {
                  regenerateSku(e.target.value);
                }
              }}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
            <p className="mt-1.5 text-xs text-slate-400">
              {t.admin.skuAutoHint}
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium">{t.admin.descSqLabel}</label>
            <textarea
              rows={4}
              value={form.descriptionSq}
              onChange={(e) => update("descriptionSq", e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 resize-none"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-sky-200 bg-sky-50/40 p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-800">{t.admin.english}</h2>
            <p className="mt-1 text-xs text-slate-500">{t.admin.suggestFromSq}</p>
          </div>
          <button
            type="button"
            disabled={
              translatingEn ||
              (!form.nameSq.trim() && !form.descriptionSq.trim())
            }
            onClick={() => void suggestEnglishFromAlbanian(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-sky-300 bg-white px-3 py-1.5 text-xs font-medium text-sky-800 hover:bg-sky-50 disabled:opacity-40"
          >
            <Languages className="h-3.5 w-3.5" />
            {translatingEn ? t.admin.translating : t.admin.suggestFromSq}
          </button>
        </div>

        <div className="grid gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">{t.admin.nameEnLabel}</label>
            <input
              value={form.nameEn}
              onChange={(e) => update("nameEn", e.target.value)}
              placeholder={t.admin.suggestPlaceholder}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t.admin.descEnLabel}</label>
            <textarea
              rows={4}
              value={form.descriptionEn}
              onChange={(e) => update("descriptionEn", e.target.value)}
              placeholder={t.admin.reviewSuggestPlaceholder}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 resize-none"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-800">{t.admin.turkishOptional}</h2>
            <p className="mt-1 text-xs text-slate-500">{t.admin.turkishOptional}</p>
          </div>
          <button
            type="button"
            disabled={
              translatingTr ||
              (!form.nameSq.trim() && !form.descriptionSq.trim())
            }
            onClick={() => void suggestTurkishFromAlbanian(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            <Languages className="h-3.5 w-3.5" />
            {translatingTr ? t.admin.translating : t.admin.suggestFromSq}
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium">{t.admin.nameTrLabel}</label>
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium">{t.admin.descTrLabel}</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 resize-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t.admin.slugLabel}</label>
            <input
              value={form.slug}
              onChange={(e) => update("slug", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t.admin.skuLabel}</label>
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
                  onClick={() => regenerateSku(form.nameSq || form.name)}
                  disabled={!form.nameSq.trim() && !form.name.trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  title={t.admin.skuRegenerate}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t.admin.categoryLabel}</label>
            <select
              value={form.categorySlug}
              onChange={(e) => update("categorySlug", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.nameSq || c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t.admin.badgeLabel}</label>
            <select
              value={form.badge}
              onChange={(e) => update("badge", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              <option value="">{t.admin.badgeNone}</option>
              <option value="new">{t.admin.badgeNew}</option>
              <option value="sale">{t.admin.badgeSale}</option>
              <option value="bestseller">{t.admin.badgeBestseller}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <h2 className="font-semibold text-slate-800">{t.admin.priceStock}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">
              {form.badge === "sale" ? t.admin.listPrice : t.admin.priceLabel}
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
          </div>

          {form.badge === "sale" && (
            <div>
              <label className="mb-1 block text-sm font-medium">{t.admin.discountPct}</label>
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
                {t.admin.salePreview}
              </p>
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-lg text-slate-400 line-through">
                  {formatPrice(salePreview.listPrice)}
                </span>
                <span className="text-2xl font-bold text-brand">
                  {formatPrice(salePreview.salePrice)}
                </span>
                <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-bold text-white">
                  %{salePreview.discount} {t.admin.saleDiscountBadge}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium">{t.admin.stockQty}</label>
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
              {t.admin.inStockLabel}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => update("published", e.target.checked)}
                className="rounded border-slate-300 text-brand focus:ring-brand"
              />
              {t.admin.publishSite}
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <h2 className="font-semibold text-slate-800">{t.admin.imagesSection}</h2>
        <p className="text-sm text-slate-500">{t.admin.imagesHint}</p>

        {form.images.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {form.images.map((img, index) => (
              <div
                key={`${img}-${index}`}
                className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
              >
                <Image
                  src={img}
                  alt={`${t.admin.imageAlt} ${index + 1}`}
                  fill
                  className="object-contain p-2"
                />
                {index === 0 && (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-white">
                    <Star className="h-3 w-3" />
                    {t.admin.primary}
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  {index !== 0 && (
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(index)}
                      className="flex-1 rounded bg-white/90 px-2 py-1 text-[10px] font-medium text-slate-800 hover:bg-white"
                    >
                      {t.admin.setPrimary}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="rounded bg-red-500/90 p-1 text-white hover:bg-red-600"
                    aria-label={t.admin.removeImage}
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
            {uploading ? t.admin.uploading : t.admin.uploadImage}
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
            {t.admin.addUrl}
          </button>
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
