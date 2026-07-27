import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";
import type { Order } from "@/lib/types/order";
import { formatPriceFromEur } from "@/lib/currency";

function resolveFont(file: string): string | null {
  const candidates = [
    path.join(process.cwd(), "assets", "fonts", file),
    path.join("C:", "Windows", "Fonts", file === "arial-bold.ttf" ? "arialbd.ttf" : "arial.ttf"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

export async function buildOrderPdf(order: Order): Promise<Buffer> {
  const regularFont = resolveFont("arial.ttf");
  const boldFont = resolveFont("arial-bold.ttf") || regularFont;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    if (regularFont) doc.font(regularFont);
    if (boldFont) doc.font(boldFont);

    const fmt = (n: number) => formatPriceFromEur(n);
    const date = new Date(order.createdAt).toLocaleString("tr-TR");

    doc.fontSize(18).text("odonexo.com — Sipariş Fişi", { align: "left" });
    doc.moveDown(0.5);
    if (regularFont) doc.font(regularFont);
    doc.fontSize(11).fillColor("#334155");
    doc.text(`Sipariş No: ${order.id}`);
    doc.text(`Tarih: ${date}`);
    doc.moveDown();

    if (boldFont) doc.font(boldFont);
    doc.fontSize(13).fillColor("#0f172a").text("Müşteri Bilgileri");
    if (regularFont) doc.font(regularFont);
    doc.fontSize(11).fillColor("#334155");
    doc.text(`Ad Soyad: ${order.customerName}`);
    doc.text(`Telefon: ${order.customerPhone}`);
    doc.text(`E-posta: ${order.customerEmail || "-"}`);
    doc.text(`Adres: ${order.customerAddress}`);
    if (order.notes) doc.text(`Not: ${order.notes}`);
    doc.moveDown();

    if (boldFont) doc.font(boldFont);
    doc.fontSize(13).fillColor("#0f172a").text("Ürünler");
    doc.moveDown(0.3);

    order.items.forEach((item, i) => {
      if (regularFont) doc.font(regularFont);
      doc.fontSize(11).fillColor("#0f172a");
      doc.text(`${i + 1}. ${item.name}`);
      doc.fontSize(10).fillColor("#64748b");
      doc.text(
        `   SKU: ${item.sku}  |  Adet: ${item.quantity}  |  Birim: ${fmt(item.unitPriceEur)}  |  Satır: ${fmt(item.lineTotalEur)}`
      );
      doc.moveDown(0.4);
    });

    doc.moveDown(0.5);
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor("#e2e8f0")
      .stroke();
    doc.moveDown();

    if (regularFont) doc.font(regularFont);
    doc.fontSize(11).fillColor("#334155");
    doc.text(`Ara Toplam: ${fmt(order.subtotalEur)}`);
    doc.text(
      `Kargo: ${order.shippingEur === 0 ? "Ücretsiz" : fmt(order.shippingEur)}`
    );
    if (boldFont) doc.font(boldFont);
    doc.fontSize(14).fillColor("#0f172a");
    doc.text(`Toplam: ${fmt(order.totalEur)}`);

    doc.moveDown(2);
    if (regularFont) doc.font(regularFont);
    doc.fontSize(9).fillColor("#94a3b8");
    doc.text("Bu belge odonexo.com sipariş sistemi tarafından otomatik oluşturulmuştur.");

    doc.end();
  });
}
