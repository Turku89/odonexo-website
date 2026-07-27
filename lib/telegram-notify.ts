import type { Order } from "@/lib/types/order";
import type { SiteSettings } from "@/lib/types/site-settings";
import { buildOrderPdf } from "@/lib/order-pdf";

export async function sendTelegramOrderNotification(
  order: Order,
  settings: SiteSettings
): Promise<boolean> {
  const token = settings.telegramBotToken?.trim();
  const chatId = settings.telegramChatId?.trim();

  if (!token || !chatId) {
    return false;
  }

  const pdf = await buildOrderPdf(order);
  const filename = `${order.id}.pdf`;

  const form = new FormData();
  form.append("chat_id", chatId);
  form.append(
    "caption",
    `🛒 Yeni sipariş: ${order.id}\n👤 ${order.customerName}\n📞 ${order.customerPhone}`
  );
  form.append(
    "document",
    new File([new Uint8Array(pdf)], filename, { type: "application/pdf" })
  );

  const res = await fetch(
    `https://api.telegram.org/bot${token}/sendDocument`,
    {
      method: "POST",
      body: form,
    }
  );

  return res.ok;
}

export async function sendTelegramTestMessage(
  settings: SiteSettings
): Promise<{ ok: boolean; error?: string }> {
  const token = settings.telegramBotToken?.trim();
  const chatId = settings.telegramChatId?.trim();

  if (!token || !chatId) {
    return { ok: false, error: "Bot token ve chat ID gerekli" };
  }

  const res = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: "✅ odonexo.com sipariş bildirimi bağlantısı başarılı! Siparişler PDF olarak gelecektir.",
        parse_mode: "HTML",
      }),
    }
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return {
      ok: false,
      error: (data as { description?: string }).description || "Telegram hatası",
    };
  }

  return { ok: true };
}
