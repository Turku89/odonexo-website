import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { readSiteSettings } from "@/lib/site-settings-store";
import { sendTelegramTestMessage } from "@/lib/telegram-notify";

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const settings = await readSiteSettings();
  const result = await sendTelegramTestMessage(settings);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
