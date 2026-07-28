import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { readSiteSettings } from "@/lib/site-settings-store";
import { sendTelegramTestMessage } from "@/lib/telegram-notify";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  let body: { telegramBotToken?: string; telegramChatId?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const settings = await readSiteSettings();
  const result = await sendTelegramTestMessage(settings, {
    token: body.telegramBotToken,
    chatId: body.telegramChatId,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
