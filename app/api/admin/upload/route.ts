import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
  }

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  const extOk = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext);
  const typeOk = !file.type || allowed.includes(file.type);

  if (!typeOk && !extOk) {
    return NextResponse.json(
      { error: "Sadece JPG, PNG, WebP veya GIF yüklenebilir" },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${
    extOk ? ext : "jpg"
  }`;
  const uploadDir = path.join(process.cwd(), "public", "products", "uploads");

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);

  return NextResponse.json({ url: `/products/uploads/${filename}` });
}
