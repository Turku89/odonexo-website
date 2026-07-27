"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Check, Truck, ShieldCheck } from "lucide-react";
import type { Product } from "@/lib/data/products";
import { useFormatPrice } from "@/lib/site-settings-context";
import { calcDiscountPercent, getProductImages } from "@/lib/product-helpers";
import AddToCartButton from "@/components/modules/AddToCartButton";
import ProductImageViewer from "@/components/modules/ProductImageViewer";
import { useLanguage } from "@/lib/i18n/language-context";
import { useLocalizedProductText } from "@/lib/use-localized-product-text";

interface ProductDetailClientProps {
  product: Product;
  categorySlug: string;
  categoryName?: string;
  related: Product[];
}

function productImageClass(image: string) {
  return image.startsWith("/") ? "object-contain p-3" : "object-cover";
}

function RelatedProductName({ product }: { product: Product }) {
  const { name } = useLocalizedProductText(product);
  return <>{name}</>;
}

export default function ProductDetailClient({
  product,
  categorySlug,
  categoryName,
  related,
}: ProductDetailClientProps) {
  const { t, getCategoryName } = useLanguage();
  const formatPrice = useFormatPrice();
  const images = getProductImages(product);
  const { name: displayName, description: displayDescription, translating } =
    useLocalizedProductText(product);
  const discountPercent =
    product.discountPercent ??
    (product.originalPrice && product.originalPrice > product.price
      ? calcDiscountPercent(product.originalPrice, product.price)
      : 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 overflow-x-hidden">
      <Link
        href="/products"
        className="inline-flex items-center gap-1 text-sm text-brand hover:text-brand-dark mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.products.back}
      </Link>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-start">
        <div className="min-w-0 w-full">
          <ProductImageViewer
            images={images}
            alt={displayName}
            priority
          />
        </div>

        <div className="min-w-0 w-full">
          <Link
            href={`/categories/${categorySlug}`}
            className="text-sm font-medium text-neutral hover:text-brand"
          >
            {getCategoryName(categorySlug, categoryName)}
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-800 sm:text-3xl break-words">
            {displayName}
          </h1>
          <p className="mt-1 text-sm text-neutral-light">
            {t.products.sku}: {product.sku}
          </p>

          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-bold text-brand">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-lg text-neutral-light line-through">
                  {formatPrice(product.originalPrice)}
                </span>
                {discountPercent > 0 && (
                  <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-sm font-bold text-white">
                    %{discountPercent} {t.products.badgeSale.toLowerCase()}
                  </span>
                )}
              </>
            )}
          </div>

          <p
            className={`mt-6 text-neutral leading-relaxed break-words whitespace-pre-line transition-opacity ${
              translating ? "opacity-60" : "opacity-100"
            }`}
          >
            {displayDescription}
          </p>

          <div className="mt-6 flex items-center gap-2">
            {product.inStock ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                <Check className="h-4 w-4" />
                {t.products.inStock}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700">
                {t.products.outOfStock}
              </span>
            )}
          </div>

          <div className="mt-8">
            <AddToCartButton product={product} />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg border border-neutral-border p-4">
              <Truck className="h-5 w-5 flex-shrink-0 text-brand" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800">
                  {t.products.fastShipping}
                </p>
                <p className="text-xs text-neutral">
                  {t.products.fastShippingDesc}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-neutral-border p-4">
              <ShieldCheck className="h-5 w-5 flex-shrink-0 text-brand" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800">
                  {t.products.originalProduct}
                </p>
                <p className="text-xs text-neutral">
                  {t.products.originalProductDesc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            {t.products.related}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="card overflow-hidden group"
              >
                <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-blue-50">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    className={`${productImageClass(p.image)} group-hover:scale-105 transition-transform`}
                    sizes="25vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-800 text-sm line-clamp-2">
                    <RelatedProductName product={p} />
                  </h3>
                  <p className="mt-1 font-bold text-brand">
                    {formatPrice(p.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
