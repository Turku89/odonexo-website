import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  updateProduct,
  deleteProduct,
  getProductById,
  type ProductUpdateInput,
} from "@/lib/products-store";
import { parseDecimal } from "@/lib/parse-decimal";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) {
    return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function PUT(request: Request, { params }: RouteParams) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const badgeProvided = body.badge !== undefined;
  const isSale = body.badge === "sale";
  const isNotSale = badgeProvided && body.badge !== "sale";
  const images: string[] | undefined = Array.isArray(body.images)
    ? body.images.filter(Boolean)
    : undefined;

  const patch: ProductUpdateInput = {
    name: body.name,
    nameSq: body.nameSq,
    nameEn: body.nameEn,
    slug: body.slug,
    description: body.description,
    descriptionSq: body.descriptionSq,
    descriptionEn: body.descriptionEn,
    price:
      body.price !== undefined
        ? (() => {
            const n = parseDecimal(body.price);
            return Number.isFinite(n) ? n : undefined;
          })()
        : undefined,
    originalPrice: isSale
      ? body.originalPrice !== undefined && body.originalPrice !== ""
        ? (() => {
            const n = parseDecimal(body.originalPrice);
            return Number.isFinite(n) ? n : undefined;
          })()
        : undefined
      : isNotSale
        ? null
        : undefined,
    discountPercent: isSale
      ? body.discountPercent !== undefined && body.discountPercent !== ""
        ? Number(body.discountPercent)
        : undefined
      : isNotSale
        ? null
        : undefined,
    categorySlug: body.categorySlug,
    images,
    image: images?.[0] ?? body.image,
    badge: body.badge || undefined,
    inStock: body.inStock,
    stockQuantity:
      body.stockQuantity !== undefined ? Number(body.stockQuantity) : undefined,
    published: body.published,
    sku: body.sku,
  };

  const updated = await updateProduct(id, patch);

  if (!updated) {
    return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath(`/products/${updated.slug}`);
  revalidatePath("/categories");

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await deleteProduct(id);
  if (!deleted) {
    return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
