import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { readSiteSettings, updateSiteSettings } from "@/lib/site-settings-store";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const settings = await readSiteSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const body = await request.json();
  const current = await readSiteSettings();

  const updated = await updateSiteSettings({
    phone: body.phone ?? "",
    whatsapp: body.whatsapp ?? "",
    telegram: body.telegram ?? "",
    email: body.email ?? "",
    address: body.address ?? "",
    hours: body.hours ?? "",
    facebook: body.facebook ?? "",
    instagram: body.instagram ?? "",
    linkedin: body.linkedin ?? "",
    freeShippingMinEur: Number(body.freeShippingMinEur) || 50,
    shippingCostEur: Number(body.shippingCostEur) || 5,
    telegramBotToken: body.telegramBotToken?.trim()
      ? body.telegramBotToken.trim()
      : current.telegramBotToken,
    telegramChatId: body.telegramChatId ?? "",
  });

  revalidatePath("/", "layout");

  return NextResponse.json(updated);
}
