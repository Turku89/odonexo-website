import type { Order } from "@/lib/types/order";
import type { SiteSettings } from "@/lib/types/site-settings";
import { buildOrderPdf } from "@/lib/order-pdf";

const TELEGRAM_TIMEOUT_MS = 12_000;

function resolveTelegramCredentials(settings: SiteSettings): {
  token: string;
  chatId: string;
} {
  return {
    token:
      process.env.TELEGRAM_BOT_TOKEN?.trim() ||
      settings.telegramBotToken?.trim() ||
      "",
    chatId:
      process.env.TELEGRAM_CHAT_ID?.trim() ||
      settings.telegramChatId?.trim() ||
      "",
  };
}

async function telegramFetch(
  url: string,
  init: RequestInit
): Promise<Response> {
  return fetch(url, {
    ...init,
    signal: AbortSignal.timeout(TELEGRAM_TIMEOUT_MS),
  });
}

function formatOrderText(order: Order): string {
  const lines = [
    `🛒 Yeni sipariş: ${order.id}`,
    `👤 ${order.customerName}`,
    `📞 ${order.customerPhone}`,
    order.customerEmail ? `✉️ ${order.customerEmail}` : "",
    `📍 ${order.customerAddress}`,
    order.notes ? `📝 ${order.notes}` : "",
    "",
    "Ürünler:",
    ...order.items.map(
      (item) =>
        `• ${item.name} x${item.quantity} — ${item.lineTotalEur.toFixed(2)} €`
    ),
    "",
    `Ara toplam: ${order.subtotalEur.toFixed(2)} €`,
    `Kargo: ${order.shippingEur.toFixed(2)} €`,
    `Toplam: ${order.totalEur.toFixed(2)} €`,
  ];
  return lines.filter((l) => l !== "").join("\n");
}

async function sendTelegramText(
  token: string,
  chatId: string,
  text: string
): Promise<{ ok: boolean; error?: string }> {
  const res = await telegramFetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    }
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return {
      ok: false,
      error:
        (data as { description?: string }).description ||
        `Telegram HTTP ${res.status}`,
    };
  }

  return { ok: true };
}

export async function sendTelegramOrderNotification(
  order: Order,
  settings: SiteSettings
): Promise<boolean> {
  const { token, chatId } = resolveTelegramCredentials(settings);
  if (!token || !chatId) return false;

  try {
    const pdf = await buildOrderPdf(order);
    const form = new FormData();
    form.append("chat_id", chatId);
    form.append(
      "caption",
      `🛒 Yeni sipariş: ${order.id}\n👤 ${order.customerName}\n📞 ${order.customerPhone}`
    );
    form.append(
      "document",
      new Blob([new Uint8Array(pdf)], { type: "application/pdf" }),
      `${order.id}.pdf`
    );

    const res = await telegramFetch(
      `https://api.telegram.org/bot${token}/sendDocument`,
      { method: "POST", body: form }
    );

    if (res.ok) return true;
  } catch {
    /* PDF veya gönderim başarısız → metin fallback */
  }

  try {
    const textResult = await sendTelegramText(
      token,
      chatId,
      formatOrderText(order)
    );
    return textResult.ok;
  } catch {
    return false;
  }
}

export async function sendTelegramTestMessage(
  settings: SiteSettings,
  overrides?: { token?: string; chatId?: string }
): Promise<{ ok: boolean; error?: string }> {
  const resolved = resolveTelegramCredentials(settings);
  const token = overrides?.token?.trim() || resolved.token;
  const chatId = overrides?.chatId?.trim() || resolved.chatId;

  if (!token || !chatId) {
    return {
      ok: false,
      error:
        "Bot token ve chat ID gerekli. Vercel Environment Variables veya admin ayarlarına ekleyin.",
    };
  }

  try {
    return await sendTelegramText(
      token,
      chatId,
      "✅ odonexo.com sipariş bildirimi bağlantısı başarılı! Siparişler PDF veya metin olarak gelecektir."
    );
  } catch (err) {
    const message =
      err instanceof Error && err.name === "TimeoutError"
        ? "Telegram yanıt vermedi (zaman aşımı)."
        : err instanceof Error
          ? err.message
          : "Telegram bağlantı hatası";
    return { ok: false, error: message };
  }
}
