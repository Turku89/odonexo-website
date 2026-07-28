import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  readAllCategories,
  createCategory,
  slugify,
} from "@/lib/categories-store";
import type { CategoryInput } from "@/lib/types/category";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const categories = await readAllCategories();
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const body = await request.json();
  const input: CategoryInput = {
    name: body.name,
    nameSq: body.nameSq ?? "",
    nameEn: body.nameEn ?? "",
    slug: body.slug || slugify(body.nameSq || body.name),
    description: body.description || "",
    descriptionSq: body.descriptionSq ?? "",
    descriptionEn: body.descriptionEn ?? "",
    icon: body.icon || "📦",
    image: body.image || "",
    published: body.published !== false,
  };

  const category = await createCategory(input);

  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/products");

  return NextResponse.json(category, { status: 201 });
}
