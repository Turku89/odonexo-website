import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  updateCategory,
  deleteCategory,
  getCategoryById,
  type CategoryUpdateInput,
} from "@/lib/categories-store";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const { id } = await params;
  const category = await getCategoryById(id);
  if (!category) {
    return NextResponse.json({ error: "Kategori bulunamadı" }, { status: 404 });
  }
  return NextResponse.json(category);
}

export async function PUT(request: Request, { params }: RouteParams) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const patch: CategoryUpdateInput = {
    name: body.name,
    nameSq: body.nameSq,
    nameEn: body.nameEn,
    slug: body.slug,
    description: body.description,
    descriptionSq: body.descriptionSq,
    descriptionEn: body.descriptionEn,
    icon: body.icon,
    image: body.image,
    published: body.published,
  };

  const updated = await updateCategory(id, patch);
  if (!updated) {
    return NextResponse.json({ error: "Kategori bulunamadı" }, { status: 404 });
  }

  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath(`/categories/${updated.slug}`);
  revalidatePath("/products");

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await deleteCategory(id);
  if (!deleted) {
    return NextResponse.json({ error: "Kategori bulunamadı" }, { status: 404 });
  }

  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/products");

  return NextResponse.json({ success: true });
}
