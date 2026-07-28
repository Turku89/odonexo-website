import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";
import type { Order } from "@/lib/types/order";
import { formatPriceFromEur } from "@/lib/currency";
import { getInvoiceLabels, normalizeOrderLocale } from "@/lib/order-invoice-i18n";

const BRAND = "#1a408f";
const BRAND_LIGHT = "#2563eb";
const SLATE = "#334155";
const MUTED = "#64748b";
const LINE = "#e2e8f0";
const MARGIN = 32;

function resolveFont(file: string): string | null {
  const candidates = [
    path.join(process.cwd(), "assets", "fonts", file),
    path.join(
      "C:",
      "Windows",
      "Fonts",
      file === "arial-bold.ttf" ? "arialbd.ttf" : "arial.ttf"
    ),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function resolveLogo(): string | null {
  const candidates = [
    path.join(process.cwd(), "public", "logo-header.jpg"),
    path.join(process.cwd(), "public", "logo-mavi.png"),
    path.join(process.cwd(), "public", "logo-beyaz.JPG"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

/** Kompakt tek sayfa sipariş faturası (kalem sayısı çoksa gerekirse 2. sayfa). */
export async function buildOrderPdf(order: Order): Promise<Buffer> {
  const regularFont = resolveFont("arial.ttf");
  const boldFont = resolveFont("arial-bold.ttf") || regularFont;
  const logoPath = resolveLogo();
  const locale = normalizeOrderLocale(order.locale);
  const L = getInvoiceLabels(locale);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: MARGIN,
      size: "A4",
      autoFirstPage: true,
      bufferPages: true,
      info: {
        Title: `${L.title} ${order.id}`,
        Author: "odonexo.com",
        Subject: L.subject,
      },
    });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const useRegular = () => {
      if (regularFont) doc.font(regularFont);
    };
    const useBold = () => {
      if (boldFont) doc.font(boldFont);
    };

    const fmt = (n: number) => formatPriceFromEur(n);
    const date = new Date(order.createdAt).toLocaleString(L.dateLocale, {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const contentWidth = pageWidth - MARGIN * 2;
    const footerReserve = 42;

    const ensureSpace = (needed: number) => {
      if (doc.y + needed > pageHeight - footerReserve) {
        doc.addPage();
        doc.rect(0, 0, pageWidth, 5).fill(BRAND);
        doc.y = MARGIN + 8;
      }
    };

    /* Üst şerit */
    doc.rect(0, 0, pageWidth, 5).fill(BRAND);

    /* Logo + başlık (kompakt) */
    let y = 14;
    if (logoPath) {
      try {
        doc.image(logoPath, MARGIN, y, { fit: [110, 32] });
      } catch {
        /* ignore */
      }
    }

    useBold();
    doc
      .fillColor(BRAND)
      .fontSize(12)
      .text(L.title, MARGIN + 120, y + 2, {
        width: contentWidth - 120,
        align: "right",
      });
    useRegular();
    doc
      .fillColor(MUTED)
      .fontSize(7)
      .text("odonexo.com", MARGIN + 120, y + 18, {
        width: contentWidth - 120,
        align: "right",
      });

    y = 52;
    doc
      .moveTo(MARGIN, y)
      .lineTo(pageWidth - MARGIN, y)
      .strokeColor(LINE)
      .lineWidth(0.8)
      .stroke();

    /* Sipariş no + tarih + durum */
    y += 10;
    useBold();
    doc.fillColor(BRAND).fontSize(13).text(order.id, MARGIN, y);
    useRegular();
    doc.fillColor(MUTED).fontSize(8).text(date, MARGIN, y + 16);

    const statusLabel =
      order.status === "approved"
        ? L.statusApproved
        : order.status === "seen"
          ? L.statusSeen
          : L.statusNew;

    doc.roundedRect(pageWidth - MARGIN - 88, y, 88, 28, 4).fill("#eff6ff");
    useBold();
    doc
      .fillColor(BRAND_LIGHT)
      .fontSize(7)
      .text(L.status, pageWidth - MARGIN - 88, y + 5, {
        width: 88,
        align: "center",
      });
    useRegular();
    doc
      .fillColor(BRAND)
      .fontSize(9)
      .text(statusLabel, pageWidth - MARGIN - 88, y + 15, {
        width: 88,
        align: "center",
      });

    y += 40;

    /* Müşteri — tek satırlık kompakt blok */
    const addressPreview =
      order.customerAddress.length > 70
        ? `${order.customerAddress.slice(0, 67)}…`
        : order.customerAddress;
    const customerBlockH = order.notes ? 78 : 58;

    ensureSpace(customerBlockH + 20);
    y = doc.y;
    doc.roundedRect(MARGIN, y, contentWidth, customerBlockH, 5).fill("#f8fafc");
    doc.roundedRect(MARGIN, y, 3, customerBlockH, 1).fill(BRAND);

    useBold();
    doc
      .fillColor(BRAND)
      .fontSize(8)
      .text(L.customerInfo, MARGIN + 10, y + 6);

    useRegular();
    const colW = contentWidth / 2 - 18;
    const leftX = MARGIN + 10;
    const rightX = MARGIN + contentWidth / 2 + 4;

    const field = (x: number, fy: number, label: string, value: string, w: number) => {
      useBold();
      doc.fillColor(MUTED).fontSize(6.5).text(label.toUpperCase(), x, fy, { width: w });
      useRegular();
      doc.fillColor(SLATE).fontSize(8).text(value || "—", x, fy + 9, {
        width: w,
        height: 12,
        ellipsis: true,
      });
    };

    field(leftX, y + 18, L.fullName, order.customerName, colW);
    field(rightX, y + 18, L.phone, order.customerPhone, colW);
    field(leftX, y + 38, L.email, order.customerEmail || "—", colW);
    field(rightX, y + 38, L.address, addressPreview, colW);

    if (order.notes) {
      useBold();
      doc.fillColor(MUTED).fontSize(6.5).text(L.orderNote.toUpperCase(), leftX, y + 56);
      useRegular();
      doc
        .fillColor(SLATE)
        .fontSize(7.5)
        .text(order.notes, leftX, y + 65, {
          width: contentWidth - 20,
          height: 10,
          ellipsis: true,
        });
    }

    y += customerBlockH + 10;
    doc.y = y;

    /* Tablo başlığı */
    ensureSpace(40);
    y = doc.y;
    useBold();
    doc.fillColor(BRAND).fontSize(8).text(L.lineItems, MARGIN, y);
    y += 12;

    const col = {
      no: MARGIN,
      name: MARGIN + 18,
      sku: MARGIN + 250,
      qty: MARGIN + 340,
      unit: MARGIN + 380,
      total: MARGIN + 445,
    };

    doc.rect(MARGIN, y, contentWidth, 16).fill(BRAND);
    useBold();
    doc.fillColor("#ffffff").fontSize(7);
    doc.text("#", col.no + 4, y + 4);
    doc.text(L.product, col.name, y + 4, { width: 220 });
    doc.text(L.sku, col.sku, y + 4, { width: 80 });
    doc.text(L.qty, col.qty, y + 4, { width: 32, align: "right" });
    doc.text(L.unit, col.unit, y + 4, { width: 55, align: "right" });
    doc.text(L.amount, col.total, y + 4, {
      width: pageWidth - MARGIN - col.total,
      align: "right",
    });
    y += 16;

    order.items.forEach((item, i) => {
      const hasExtra = Boolean(item.note || item.unavailable);
      const rowH = hasExtra ? 26 : 16;
      ensureSpace(rowH + 4);
      y = Math.max(y, doc.y);

      if (i % 2 === 0) {
        doc.rect(MARGIN, y, contentWidth, rowH).fill("#f8fafc");
      }

      const nameText = item.unavailable
        ? `${item.name} (${L.outOfStock})`
        : item.name;

      useRegular();
      doc.fillColor(MUTED).fontSize(7.5).text(String(i + 1), col.no + 4, y + 4);
      doc
        .fillColor(item.unavailable ? "#b91c1c" : SLATE)
        .fontSize(7.5)
        .text(nameText, col.name, y + 4, {
          width: 225,
          height: 10,
          ellipsis: true,
        });
      doc.fillColor(MUTED).fontSize(7).text(item.sku, col.sku, y + 4, {
        width: 85,
        height: 10,
        ellipsis: true,
      });
      doc
        .fillColor(SLATE)
        .fontSize(7.5)
        .text(String(item.quantity), col.qty, y + 4, {
          width: 32,
          align: "right",
        });
      doc.text(fmt(item.unitPriceEur), col.unit, y + 4, {
        width: 55,
        align: "right",
      });
      useBold();
      doc
        .fillColor(SLATE)
        .fontSize(7.5)
        .text(fmt(item.lineTotalEur), col.total, y + 4, {
          width: pageWidth - MARGIN - col.total,
          align: "right",
        });

      if (item.note) {
        useRegular();
        doc
          .fillColor("#b45309")
          .fontSize(6.5)
          .text(item.note, col.name, y + 14, {
            width: 300,
            height: 9,
            ellipsis: true,
          });
      }

      y += rowH;
      doc.y = y;
    });

    ensureSpace(70);
    y = Math.max(y, doc.y) + 6;
    doc
      .moveTo(MARGIN, y)
      .lineTo(pageWidth - MARGIN, y)
      .strokeColor(LINE)
      .stroke();
    y += 8;

    /* Toplamlar */
    const totalsWidth = 170;
    const totalsX = pageWidth - MARGIN - totalsWidth;

    const drawTotalRow = (
      label: string,
      value: string,
      opts?: { bold?: boolean; accent?: boolean }
    ) => {
      if (opts?.bold) useBold();
      else useRegular();
      doc
        .fillColor(opts?.accent ? BRAND : MUTED)
        .fontSize(opts?.bold ? 10 : 8)
        .text(label, totalsX, y, { width: 90 });
      doc
        .fillColor(opts?.accent ? BRAND : SLATE)
        .text(value, totalsX + 90, y, { width: 80, align: "right" });
      y += opts?.bold ? 16 : 13;
    };

    drawTotalRow(L.subtotal, fmt(order.subtotalEur));
    drawTotalRow(
      L.shipping,
      order.shippingEur === 0 ? L.free : fmt(order.shippingEur)
    );

    doc
      .moveTo(totalsX, y)
      .lineTo(pageWidth - MARGIN, y)
      .strokeColor(LINE)
      .stroke();
    y += 6;

    doc.roundedRect(totalsX - 6, y - 2, totalsWidth + 6, 22, 4).fill("#eff6ff");
    drawTotalRow(L.grandTotal, fmt(order.totalEur), {
      bold: true,
      accent: true,
    });

    /* Footer — her sayfanın altına */
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(range.start + i);
      const fy = pageHeight - 28;
      doc
        .moveTo(MARGIN, fy)
        .lineTo(pageWidth - MARGIN, fy)
        .strokeColor(LINE)
        .stroke();
      useRegular();
      doc
        .fillColor(MUTED)
        .fontSize(7)
        .text(L.footerNote, MARGIN, fy + 8, {
          width: contentWidth,
          align: "center",
        });
    }

    doc.end();
  });
}
