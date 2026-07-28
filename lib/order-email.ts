import nodemailer from "nodemailer";
import type { Order } from "@/lib/types/order";
import type { SiteSettings } from "@/lib/types/site-settings";
import { buildOrderPdf } from "@/lib/order-pdf";
import { formatPriceFromEur } from "@/lib/currency";

function resolveSmtp(settings: SiteSettings) {
  return {
    host: process.env.SMTP_HOST?.trim() || settings.smtpHost?.trim() || "",
    port: Number(process.env.SMTP_PORT || settings.smtpPort || 587) || 587,
    user: process.env.SMTP_USER?.trim() || settings.smtpUser?.trim() || "",
    pass: process.env.SMTP_PASS?.trim() || settings.smtpPass?.trim() || "",
    from:
      process.env.SMTP_FROM?.trim() ||
      settings.smtpFrom?.trim() ||
      settings.email?.trim() ||
      "",
  };
}

export async function sendOrderApprovalEmail(
  order: Order,
  settings: SiteSettings
): Promise<{ ok: boolean; error?: string }> {
  const to = order.customerEmail?.trim();
  if (!to) {
    return { ok: false, error: "Müşteri e-posta adresi yok" };
  }

  const smtp = resolveSmtp(settings);
  if (!smtp.host || !smtp.user || !smtp.pass || !smtp.from) {
    return {
      ok: false,
      error:
        "SMTP ayarları eksik. Admin → Ayarlar bölümünden veya Vercel env (SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM) ekleyin.",
    };
  }

  try {
    const pdf = await buildOrderPdf(order);
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      auth: { user: smtp.user, pass: smtp.pass },
    });

    const itemLines = order.items
      .map((item) => {
        if (item.unavailable || item.quantity <= 0) {
          return `• ${item.name} — STOKTA YOK / İPTAL${item.note ? ` (${item.note})` : ""}`;
        }
        return `• ${item.name} x${item.quantity} — ${formatPriceFromEur(item.lineTotalEur)}${item.note ? ` (${item.note})` : ""}`;
      })
      .join("\n");

    const text = [
      `Sayın ${order.customerName},`,
      "",
      `odonexo.com siparişiniz onaylandı.`,
      `Sipariş No: ${order.id}`,
      "",
      "Ürünler:",
      itemLines,
      "",
      `Ara toplam: ${formatPriceFromEur(order.subtotalEur)}`,
      `Kargo: ${order.shippingEur === 0 ? "Ücretsiz" : formatPriceFromEur(order.shippingEur)}`,
      `Toplam: ${formatPriceFromEur(order.totalEur)}`,
      "",
      order.adminNote ? `Notumuz: ${order.adminNote}` : "",
      "",
      "Sipariş fişiniz PDF olarak ekte yer almaktadır.",
      "",
      "Teşekkür ederiz,",
      "odonexo.com",
      "Quality Solutions For Stress-Free Dentistry",
    ]
      .filter((l) => l !== "")
      .join("\n");

    await transporter.sendMail({
      from: smtp.from,
      to,
      subject: `Siparişiniz onaylandı — ${order.id}`,
      text,
      attachments: [
        {
          filename: `${order.id}.pdf`,
          content: pdf,
          contentType: "application/pdf",
        },
      ],
    });

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "E-posta gönderilemedi",
    };
  }
}
