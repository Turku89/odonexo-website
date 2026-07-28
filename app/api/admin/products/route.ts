import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  readAllProducts,
  createProduct,
  slugify,
} from "@/lib/products-store";
import type { ProductInput } from "@/lib/types/product";
import { parseDecimal } from "@/lib/parse-decimal";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const products = await readAllProducts();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const body = await request.json();
  const images: string[] = Array.isArray(body.images)
    ? body.images.filter(Boolean)
    : body.image
      ? [body.image]
      : [];
  const input: ProductInput = {
    name: body.name,
    nameSq: body.nameSq ?? "",
    nameEn: body.nameEn ?? "",
    slug: body.slug || slugify(body.nameSq || body.name),
    description: body.description || "",
    descriptionSq: body.descriptionSq ?? "",
    descriptionEn: body.descriptionEn ?? "",
    price: (() => {
      const n = parseDecimal(body.price);
      return Number.isFinite(n) ? n : 0;
    })(),
    originalPrice: body.originalPrice
      ? (() => {
          const n = parseDecimal(body.originalPrice);
          return Number.isFinite(n) ? n : undefined;
        })()
      : undefined,
    discountPercent:
      body.discountPercent !== undefined && body.discountPercent !== ""
        ? Number(body.discountPercent)
        : undefined,
    categorySlug: body.categorySlug,
    image: images[0] || body.image || "/products/placeholder.png",
    images,
    badge: body.badge || undefined,
    inStock: Boolean(body.inStock),
    stockQuantity: body.stockQuantity !== undefined ? Number(body.stockQuantity) : undefined,
    published: body.published !== false,
    sku: body.sku?.trim() || `ODN-${Date.now().toString().slice(-6)}`,
  };

  const product = await createProduct(input);
  return NextResponse.json(product, { status: 201 });
}
