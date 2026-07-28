import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";
import type { Order } from "@/lib/types/order";
import { formatPriceFromEur } from "@/lib/currency";

const BRAND = "#1a408f";
const BRAND_LIGHT = "#2563eb";
const SLATE = "#334155";
const MUTED = "#64748b";
const LINE = "#e2e8f0";
const PAGE_MARGIN = 48;

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

export async function buildOrderPdf(order: Order): Promise<Buffer> {
  const regularFont = resolveFont("arial.ttf");
  const boldFont = resolveFont("arial-bold.ttf") || regularFont;
  const logoPath = resolveLogo();

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: PAGE_MARGIN,
      size: "A4",
      info: {
        Title: `Sipariş ${order.id}`,
        Author: "odonexo.com",
        Subject: "Sipariş fişi",
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
    const date = new Date(order.createdAt).toLocaleString("tr-TR", {
      dateStyle: "long",
      timeStyle: "short",
    });
    const pageWidth = doc.page.width;
    const contentWidth = pageWidth - PAGE_MARGIN * 2;

    /* —— Üst marka şeridi —— */
    doc.rect(0, 0, pageWidth, 8).fill(BRAND);

    /* —— Logo + başlık —— */
    let headerBottom = 36;
    if (logoPath) {
      try {
        doc.image(logoPath, PAGE_MARGIN, 28, {
          fit: [160, 52],
        });
      } catch {
        /* logo yoksa metin kullan */
      }
    }

    useBold();
    doc
      .fillColor(BRAND)
      .fontSize(11)
      .text("SİPARİŞ FİŞİ", PAGE_MARGIN + 180, 32, {
        width: contentWidth - 180,
        align: "right",
      });
    useRegular();
    doc
      .fillColor(MUTED)
      .fontSize(9)
      .text("Quality Solutions For Stress-Free Dentistry", PAGE_MARGIN + 180, 48, {
        width: contentWidth - 180,
        align: "right",
      });

    headerBottom = 92;
    doc
      .moveTo(PAGE_MARGIN, headerBottom)
      .lineTo(pageWidth - PAGE_MARGIN, headerBottom)
      .strokeColor(LINE)
      .lineWidth(1)
      .stroke();

    /* —— Sipariş meta —— */
    let y = headerBottom + 18;
    useBold();
    doc.fillColor(BRAND).fontSize(16).text(order.id, PAGE_MARGIN, y);
    useRegular();
    doc
      .fillColor(MUTED)
      .fontSize(10)
      .text(date, PAGE_MARGIN, y + 22);

    doc
      .roundedRect(pageWidth - PAGE_MARGIN - 110, y, 110, 36, 6)
      .fill("#eff6ff");
    useBold();
    doc
      .fillColor(BRAND_LIGHT)
      .fontSize(10)
      .text("DURUM", pageWidth - PAGE_MARGIN - 110, y + 8, {
        width: 110,
        align: "center",
      });
    useRegular();
    doc
      .fillColor(BRAND)
      .fontSize(11)
      .text(
        order.status === "approved"
          ? "Onaylandı"
          : order.status === "seen"
            ? "İncelendi"
            : "Yeni sipariş",
        pageWidth - PAGE_MARGIN - 110,
        y + 20,
        {
          width: 110,
          align: "center",
        }
      );

    y += 58;

    /* —— Müşteri kutusu —— */
    const boxTop = y;
    doc.roundedRect(PAGE_MARGIN, boxTop, contentWidth, 108, 8).fill("#f8fafc");
    doc
      .roundedRect(PAGE_MARGIN, boxTop, 4, 108, 2)
      .fill(BRAND);

    useBold();
    doc
      .fillColor(BRAND)
      .fontSize(11)
      .text("MÜŞTERİ BİLGİLERİ", PAGE_MARGIN + 16, boxTop + 12);

    useRegular();
    const leftX = PAGE_MARGIN + 16;
    const rightX = PAGE_MARGIN + contentWidth / 2 + 8;
    let rowY = boxTop + 34;

    const labelValue = (
      lx: number,
      ly: number,
      label: string,
      value: string,
      width: number
    ) => {
      useBold();
      doc.fillColor(MUTED).fontSize(8).text(label.toUpperCase(), lx, ly, {
        width,
      });
      useRegular();
      doc.fillColor(SLATE).fontSize(10).text(value || "—", lx, ly + 12, {
        width,
      });
    };

    labelValue(leftX, rowY, "Ad Soyad", order.customerName, contentWidth / 2 - 28);
    labelValue(rightX, rowY, "Telefon", order.customerPhone, contentWidth / 2 - 28);
    rowY += 36;
    labelValue(
      leftX,
      rowY,
      "E-posta",
      order.customerEmail || "—",
      contentWidth / 2 - 28
    );
    labelValue(rightX, rowY, "Adres", order.customerAddress, contentWidth / 2 - 28);

    y = boxTop + 120;

    if (order.notes) {
      useBold();
      doc.fillColor(MUTED).fontSize(8).text("SİPARİŞ NOTU", PAGE_MARGIN, y);
      useRegular();
      doc.fillColor(SLATE).fontSize(10).text(order.notes, PAGE_MARGIN, y + 12, {
        width: contentWidth,
      });
      y = doc.y + 16;
    } else {
      y += 8;
    }

    /* —— Ürün tablosu —— */
    useBold();
    doc.fillColor(BRAND).fontSize(11).text("SİPARİŞ KALEMLERİ", PAGE_MARGIN, y);
    y += 18;

    const col = {
      no: PAGE_MARGIN,
      name: PAGE_MARGIN + 28,
      sku: PAGE_MARGIN + 250,
      qty: PAGE_MARGIN + 340,
      unit: PAGE_MARGIN + 390,
      total: PAGE_MARGIN + 460,
    };

    doc.rect(PAGE_MARGIN, y, contentWidth, 24).fill(BRAND);
    useBold();
    doc.fillColor("#ffffff").fontSize(8);
    doc.text("#", col.no + 6, y + 8);
    doc.text("ÜRÜN", col.name, y + 8);
    doc.text("SKU", col.sku, y + 8);
    doc.text("ADET", col.qty, y + 8, { width: 40, align: "right" });
    doc.text("BİRİM", col.unit, y + 8, { width: 60, align: "right" });
    doc.text("TUTAR", col.total, y + 8, {
      width: pageWidth - PAGE_MARGIN - col.total,
      align: "right",
    });
    y += 24;

    order.items.forEach((item, i) => {
      const rowH = item.note || item.unavailable ? 40 : 28;
      if (i % 2 === 0) {
        doc.rect(PAGE_MARGIN, y, contentWidth, rowH).fill("#f8fafc");
      }

      useRegular();
      doc.fillColor(MUTED).fontSize(9).text(String(i + 1), col.no + 6, y + 9);
      doc
        .fillColor(item.unavailable ? "#b91c1c" : SLATE)
        .fontSize(9)
        .text(
          item.unavailable ? `${item.name} (STOKTA YOK)` : item.name,
          col.name,
          y + 9,
          { width: 210, ellipsis: true }
        );
      doc.fillColor(MUTED).fontSize(8).text(item.sku, col.sku, y + 10, {
        width: 80,
        ellipsis: true,
      });
      doc
        .fillColor(SLATE)
        .fontSize(9)
        .text(String(item.quantity), col.qty, y + 9, {
          width: 40,
          align: "right",
        });
      doc.text(fmt(item.unitPriceEur), col.unit, y + 9, {
        width: 60,
        align: "right",
      });
      useBold();
      doc.fillColor(SLATE).fontSize(9).text(fmt(item.lineTotalEur), col.total, y + 9, {
        width: pageWidth - PAGE_MARGIN - col.total,
        align: "right",
      });

      if (item.note) {
        useRegular();
        doc
          .fillColor("#b45309")
          .fontSize(7)
          .text(item.note, col.name, y + 22, { width: 300 });
      }

      y += rowH;

      if (y > doc.page.height - 160) {
        doc.addPage();
        doc.rect(0, 0, pageWidth, 8).fill(BRAND);
        y = PAGE_MARGIN + 10;
      }
    });

    doc
      .moveTo(PAGE_MARGIN, y)
      .lineTo(pageWidth - PAGE_MARGIN, y)
      .strokeColor(LINE)
      .stroke();
    y += 16;

    /* —— Toplamlar —— */
    const totalsWidth = 200;
    const totalsX = pageWidth - PAGE_MARGIN - totalsWidth;

    const drawTotalRow = (
      label: string,
      value: string,
      opts?: { bold?: boolean; large?: boolean; accent?: boolean }
    ) => {
      if (opts?.bold) useBold();
      else useRegular();
      doc
        .fillColor(opts?.accent ? BRAND : MUTED)
        .fontSize(opts?.large ? 12 : 10)
        .text(label, totalsX, y, { width: 100 });
      doc
        .fillColor(opts?.accent ? BRAND : SLATE)
        .text(value, totalsX + 100, y, { width: 100, align: "right" });
      y += opts?.large ? 22 : 18;
    };

    drawTotalRow("Ara toplam", fmt(order.subtotalEur));
    drawTotalRow(
      "Kargo",
      order.shippingEur === 0 ? "Ücretsiz" : fmt(order.shippingEur)
    );

    doc
      .moveTo(totalsX, y)
      .lineTo(pageWidth - PAGE_MARGIN, y)
      .strokeColor(LINE)
      .stroke();
    y += 10;

    doc.roundedRect(totalsX - 8, y - 4, totalsWidth + 8, 32, 6).fill("#eff6ff");
    drawTotalRow("GENEL TOPLAM", fmt(order.totalEur), {
      bold: true,
      large: true,
      accent: true,
    });

    /* —— Alt bilgi —— */
    const footerY = doc.page.height - 56;
    doc
      .moveTo(PAGE_MARGIN, footerY)
      .lineTo(pageWidth - PAGE_MARGIN, footerY)
      .strokeColor(LINE)
      .stroke();

    useRegular();
    doc
      .fillColor(MUTED)
      .fontSize(8)
      .text(
        "odonexo.com  ·  Quality Solutions For Stress-Free Dentistry",
        PAGE_MARGIN,
        footerY + 12,
        { width: contentWidth, align: "center" }
      );
    doc
      .fillColor("#94a3b8")
      .fontSize(7)
      .text(
        "Bu belge otomatik oluşturulmuştur. Sipariş onayı için müşteriyle iletişime geçiniz.",
        PAGE_MARGIN,
        footerY + 26,
        { width: contentWidth, align: "center" }
      );

    doc.end();
  });
}
