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
    tiktok: body.tiktok ?? "",
    freeShippingMinEur: Number(body.freeShippingMinEur) || 50,
    shippingCostEur: Number(body.shippingCostEur) || 5,
    onlinePaymentEnabled: Boolean(body.onlinePaymentEnabled),
    paymentProvider:
      body.paymentProvider === "manual" || body.paymentProvider === "pos"
        ? body.paymentProvider
        : "none",
    showVisa: body.showVisa !== false,
    showMastercard: body.showMastercard !== false,
    showTroy: body.showTroy !== false,
    posApiBaseUrl: body.posApiBaseUrl ?? "",
    posMerchantId: body.posMerchantId ?? "",
    posApiKey: body.posApiKey?.trim()
      ? body.posApiKey.trim()
      : current.posApiKey,
    telegramBotToken: body.telegramBotToken?.trim()
      ? body.telegramBotToken.trim()
      : current.telegramBotToken,
    telegramChatId: body.telegramChatId?.trim()
      ? body.telegramChatId.trim()
      : current.telegramChatId,
    smtpHost: body.smtpHost ?? "",
    smtpPort: Number(body.smtpPort) || 587,
    smtpUser: body.smtpUser ?? "",
    smtpPass: body.smtpPass?.trim() ? body.smtpPass.trim() : current.smtpPass,
    smtpFrom: body.smtpFrom ?? body.email ?? "",
  }).catch((err: unknown) => {
    const message =
      err instanceof Error ? err.message : "Ayarlar kaydedilemedi";
    return NextResponse.json({ error: message }, { status: 500 });
  });

  if (updated instanceof NextResponse) {
    return updated;
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");

  return NextResponse.json(updated);
}
