import nodemailer from "nodemailer";
import type { Order } from "@/lib/types/order";
import type { SiteSettings } from "@/lib/types/site-settings";
import { buildOrderPdf } from "@/lib/order-pdf";
import { formatPriceFromEur } from "@/lib/currency";
import { getInvoiceLabels, normalizeOrderLocale } from "@/lib/order-invoice-i18n";

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

const EMAIL_COPY = {
  tr: {
    greeting: (name: string) => `Sayın ${name},`,
    approved: "odonexo.com siparişiniz onaylandı.",
    orderNo: "Sipariş No",
    products: "Ürünler",
    outOfStock: "STOKTA YOK / İPTAL",
    note: "Notumuz",
    pdfAttached: "Sipariş fişiniz PDF olarak ekte yer almaktadır.",
    thanks: "Teşekkür ederiz,",
    subject: (id: string) => `Siparişiniz onaylandı — ${id}`,
  },
  sq: {
    greeting: (name: string) => `I/e nderuar ${name},`,
    approved: "Porosia juaj në odonexo.com u aprovua.",
    orderNo: "Nr. i porosisë",
    products: "Produktet",
    outOfStock: "JASHTË STOKU / ANULUAR",
    note: "Shënimi ynë",
    pdfAttached: "Fatura e porosisë është bashkëngjitur si PDF.",
    thanks: "Faleminderit,",
    subject: (id: string) => `Porosia u aprovua — ${id}`,
  },
  en: {
    greeting: (name: string) => `Dear ${name},`,
    approved: "Your odonexo.com order has been approved.",
    orderNo: "Order No",
    products: "Products",
    outOfStock: "OUT OF STOCK / CANCELLED",
    note: "Our note",
    pdfAttached: "Your order invoice is attached as a PDF.",
    thanks: "Thank you,",
    subject: (id: string) => `Your order has been approved — ${id}`,
  },
} as const;

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
    const locale = normalizeOrderLocale(order.locale);
    const L = getInvoiceLabels(locale);
    const copy = EMAIL_COPY[locale];
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
          return `• ${item.name} — ${copy.outOfStock}${item.note ? ` (${item.note})` : ""}`;
        }
        return `• ${item.name} x${item.quantity} — ${formatPriceFromEur(item.lineTotalEur)}${item.note ? ` (${item.note})` : ""}`;
      })
      .join("\n");

    const text = [
      copy.greeting(order.customerName),
      "",
      copy.approved,
      `${copy.orderNo}: ${order.id}`,
      "",
      `${copy.products}:`,
      itemLines,
      "",
      `${L.subtotal}: ${formatPriceFromEur(order.subtotalEur)}`,
      `${L.shipping}: ${order.shippingEur === 0 ? L.free : formatPriceFromEur(order.shippingEur)}`,
      `${L.grandTotal}: ${formatPriceFromEur(order.totalEur)}`,
      "",
      order.adminNote ? `${copy.note}: ${order.adminNote}` : "",
      "",
      copy.pdfAttached,
      "",
      copy.thanks,
      "odonexo.com",
      "Quality Solutions For Stress-Free Dentistry",
    ]
      .filter((l) => l !== "")
      .join("\n");

    await transporter.sendMail({
      from: smtp.from,
      to,
      subject: copy.subject(order.id),
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
