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
/** Okunabilir kenar boşluğu */
const MARGIN = 50;
const FOOTER_H = 40;
const TOTALS_H = 72;

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

/**
 * Sipariş faturası: ürünler sığdığı sürece tek sayfa.
 * odonexo.com her sayfanın en altında.
 */
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
    const contentBottom = pageHeight - FOOTER_H - 8;

    let y = MARGIN;

    const startNewPage = () => {
      doc.addPage();
      doc.rect(0, 0, pageWidth, 6).fill(BRAND);
      y = MARGIN + 4;
    };

    /* Üst şerit */
    doc.rect(0, 0, pageWidth, 6).fill(BRAND);

    /* Logo + başlık */
    if (logoPath) {
      try {
        doc.image(logoPath, MARGIN, y, { fit: [130, 40] });
      } catch {
        /* ignore */
      }
    }

    useBold();
    doc
      .fillColor(BRAND)
      .fontSize(14)
      .text(L.title, MARGIN + 140, y + 4, {
        width: contentWidth - 140,
        align: "right",
        lineBreak: false,
      });
    useRegular();
    doc
      .fillColor(MUTED)
      .fontSize(9)
      .text(date, MARGIN + 140, y + 24, {
        width: contentWidth - 140,
        align: "right",
        lineBreak: false,
      });

    y += 52;
    doc
      .moveTo(MARGIN, y)
      .lineTo(pageWidth - MARGIN, y)
      .strokeColor(LINE)
      .lineWidth(1)
      .stroke();
    y += 14;

    /* Sipariş no + durum */
    useBold();
    doc
      .fillColor(BRAND)
      .fontSize(15)
      .text(order.id, MARGIN, y, { lineBreak: false });

    const statusLabel =
      order.status === "approved"
        ? L.statusApproved
        : order.status === "seen"
          ? L.statusSeen
          : order.status === "cancelled"
            ? L.statusCancelled
            : L.statusNew;

    const badgeW = 100;
    doc
      .roundedRect(pageWidth - MARGIN - badgeW, y - 2, badgeW, 32, 6)
      .fill("#eff6ff");
    useBold();
    doc
      .fillColor(BRAND_LIGHT)
      .fontSize(8)
      .text(L.status, pageWidth - MARGIN - badgeW, y + 2, {
        width: badgeW,
        align: "center",
        lineBreak: false,
      });
    useRegular();
    doc
      .fillColor(BRAND)
      .fontSize(10)
      .text(statusLabel, pageWidth - MARGIN - badgeW, y + 14, {
        width: badgeW,
        align: "center",
        lineBreak: false,
      });

    y += 42;

    /* Müşteri kutusu */
    const notesLine = order.notes?.trim() || "";
    const customerH = notesLine ? 96 : 78;
    doc.roundedRect(MARGIN, y, contentWidth, customerH, 8).fill("#f8fafc");
    doc.roundedRect(MARGIN, y, 4, customerH, 2).fill(BRAND);

    useBold();
    doc
      .fillColor(BRAND)
      .fontSize(10)
      .text(L.customerInfo, MARGIN + 14, y + 10, { lineBreak: false });

    const colW = contentWidth / 2 - 24;
    const leftX = MARGIN + 14;
    const rightX = MARGIN + contentWidth / 2 + 6;

    const field = (
      x: number,
      fy: number,
      label: string,
      value: string,
      w: number
    ) => {
      useBold();
      doc
        .fillColor(MUTED)
        .fontSize(8)
        .text(label.toUpperCase(), x, fy, { width: w, lineBreak: false });
      useRegular();
      doc.fillColor(SLATE).fontSize(10).text(value || "—", x, fy + 12, {
        width: w,
        height: 14,
        ellipsis: true,
        lineBreak: false,
      });
    };

    field(leftX, y + 28, L.fullName, order.customerName, colW);
    field(rightX, y + 28, L.phone, order.customerPhone, colW);
    field(leftX, y + 52, L.email, order.customerEmail || "—", colW);
    field(rightX, y + 52, L.address, order.customerAddress, colW);

    if (notesLine) {
      field(leftX, y + 76, L.orderNote, notesLine, contentWidth - 28);
    }

    y += customerH + 16;

    /* Tablo */
    useBold();
    doc
      .fillColor(BRAND)
      .fontSize(10)
      .text(L.lineItems, MARGIN, y, { lineBreak: false });
    y += 16;

    const col = {
      no: MARGIN,
      name: MARGIN + 22,
      sku: MARGIN + 268,
      qty: MARGIN + 355,
      unit: MARGIN + 395,
      total: MARGIN + 460,
    };

    const drawTableHeader = () => {
      doc.rect(MARGIN, y, contentWidth, 20).fill(BRAND);
      useBold();
      doc.fillColor("#ffffff").fontSize(8);
      doc.text("#", col.no + 6, y + 6, { lineBreak: false });
      doc.text(L.product, col.name, y + 6, { width: 230, lineBreak: false });
      doc.text(L.sku, col.sku, y + 6, { width: 80, lineBreak: false });
      doc.text(L.qty, col.qty, y + 6, {
        width: 32,
        align: "right",
        lineBreak: false,
      });
      doc.text(L.unit, col.unit, y + 6, {
        width: 55,
        align: "right",
        lineBreak: false,
      });
      doc.text(L.amount, col.total, y + 6, {
        width: pageWidth - MARGIN - col.total,
        align: "right",
        lineBreak: false,
      });
      y += 20;
    };

    drawTableHeader();

    order.items.forEach((item, i) => {
      const hasExtra = Boolean(item.note);
      const rowH = hasExtra ? 30 : 20;

      // Ürünler sığmazsa yeni sayfa — aksi halde 2. sayfa yok
      if (y + rowH > contentBottom - TOTALS_H) {
        startNewPage();
        drawTableHeader();
      }

      if (i % 2 === 0) {
        doc.rect(MARGIN, y, contentWidth, rowH).fill("#f8fafc");
      }

      const nameText = item.unavailable
        ? `${item.name} (${L.outOfStock})`
        : item.name;

      useRegular();
      doc
        .fillColor(MUTED)
        .fontSize(9)
        .text(String(i + 1), col.no + 6, y + 5, { lineBreak: false });
      doc
        .fillColor(item.unavailable ? "#b91c1c" : SLATE)
        .fontSize(9)
        .text(nameText, col.name, y + 5, {
          width: 238,
          height: 12,
          ellipsis: true,
          lineBreak: false,
        });
      doc.fillColor(MUTED).fontSize(8).text(item.sku, col.sku, y + 6, {
        width: 80,
        height: 12,
        ellipsis: true,
        lineBreak: false,
      });
      doc
        .fillColor(SLATE)
        .fontSize(9)
        .text(String(item.quantity), col.qty, y + 5, {
          width: 32,
          align: "right",
          lineBreak: false,
        });
      doc.text(fmt(item.unitPriceEur), col.unit, y + 5, {
        width: 55,
        align: "right",
        lineBreak: false,
      });
      useBold();
      doc
        .fillColor(SLATE)
        .fontSize(9)
        .text(fmt(item.lineTotalEur), col.total, y + 5, {
          width: pageWidth - MARGIN - col.total,
          align: "right",
          lineBreak: false,
        });

      if (item.note) {
        useRegular();
        doc
          .fillColor("#b45309")
          .fontSize(8)
          .text(item.note, col.name, y + 17, {
            width: 320,
            height: 10,
            ellipsis: true,
            lineBreak: false,
          });
      }

      y += rowH;
    });

    // Toplamlar — sığmazsa yeni sayfa (yalnızca ürünler çoksa)
    if (y + TOTALS_H > contentBottom) {
      startNewPage();
    }

    y += 10;
    doc
      .moveTo(MARGIN, y)
      .lineTo(pageWidth - MARGIN, y)
      .strokeColor(LINE)
      .stroke();
    y += 12;

    const totalsWidth = 200;
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
        .fontSize(opts?.bold ? 12 : 10)
        .text(label, totalsX, y, { width: 100, lineBreak: false });
      doc
        .fillColor(opts?.accent ? BRAND : SLATE)
        .text(value, totalsX + 100, y, {
          width: 100,
          align: "right",
          lineBreak: false,
        });
      y += opts?.bold ? 20 : 16;
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
    y += 8;

    doc
      .roundedRect(totalsX - 8, y - 4, totalsWidth + 8, 28, 6)
      .fill("#eff6ff");
    drawTotalRow(L.grandTotal, fmt(order.totalEur), {
      bold: true,
      accent: true,
    });

    /* Footer: her sayfanın en altında odonexo.com */
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(range.start + i);
      const fy = pageHeight - 32;
      doc
        .moveTo(MARGIN, fy)
        .lineTo(pageWidth - MARGIN, fy)
        .strokeColor(LINE)
        .stroke();
      useRegular();
      doc
        .fillColor(MUTED)
        .fontSize(9)
        .text("odonexo.com", MARGIN, fy + 10, {
          width: contentWidth,
          align: "center",
          lineBreak: false,
        });
    }

    doc.end();
  });
}
