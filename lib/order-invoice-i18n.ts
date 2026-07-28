import type { Locale } from "@/lib/i18n/translations";

export type OrderLocale = Locale;

type InvoiceLabels = {
  title: string;
  subject: string;
  status: string;
  statusNew: string;
  statusSeen: string;
  statusApproved: string;
  statusCancelled: string;
  customerInfo: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  orderNote: string;
  lineItems: string;
  product: string;
  sku: string;
  qty: string;
  unit: string;
  amount: string;
  outOfStock: string;
  subtotal: string;
  shipping: string;
  free: string;
  grandTotal: string;
  footerNote: string;
  dateLocale: string;
};

const LABELS: Record<OrderLocale, InvoiceLabels> = {
  tr: {
    title: "SİPARİŞ FİŞİ",
    subject: "Sipariş fişi",
    status: "DURUM",
    statusNew: "Yeni",
    statusSeen: "İncelendi",
    statusApproved: "Onaylandı",
    statusCancelled: "İptal",
    customerInfo: "MÜŞTERİ",
    fullName: "Ad Soyad",
    phone: "Telefon",
    email: "E-posta",
    address: "Adres",
    orderNote: "Not",
    lineItems: "KALEMLER",
    product: "ÜRÜN",
    sku: "SKU",
    qty: "AD",
    unit: "BİRİM",
    amount: "TUTAR",
    outOfStock: "STOKTA YOK",
    subtotal: "Ara toplam",
    shipping: "Kargo",
    free: "Ücretsiz",
    grandTotal: "TOPLAM",
    footerNote: "odonexo.com",
    dateLocale: "tr-TR",
  },
  sq: {
    title: "FATURA E POROSISË",
    subject: "Fatura e porosisë",
    status: "STATUSI",
    statusNew: "E re",
    statusSeen: "E parë",
    statusApproved: "E aprovuar",
    statusCancelled: "Anuluar",
    customerInfo: "KLIENTI",
    fullName: "Emri",
    phone: "Telefoni",
    email: "Email",
    address: "Adresa",
    orderNote: "Shënim",
    lineItems: "ARTIKUJT",
    product: "PRODUKTI",
    sku: "SKU",
    qty: "SASI",
    unit: "ÇMIMI",
    amount: "SHUMA",
    outOfStock: "JASHTË STOKU",
    subtotal: "Nëntotali",
    shipping: "Transporti",
    free: "Falas",
    grandTotal: "TOTALI",
    footerNote: "odonexo.com",
    dateLocale: "sq-AL",
  },
  en: {
    title: "ORDER INVOICE",
    subject: "Order invoice",
    status: "STATUS",
    statusNew: "New",
    statusSeen: "Seen",
    statusApproved: "Approved",
    statusCancelled: "Cancelled",
    customerInfo: "CUSTOMER",
    fullName: "Name",
    phone: "Phone",
    email: "Email",
    address: "Address",
    orderNote: "Note",
    lineItems: "ITEMS",
    product: "PRODUCT",
    sku: "SKU",
    qty: "QTY",
    unit: "UNIT",
    amount: "AMOUNT",
    outOfStock: "OUT OF STOCK",
    subtotal: "Subtotal",
    shipping: "Shipping",
    free: "Free",
    grandTotal: "TOTAL",
    footerNote: "odonexo.com",
    dateLocale: "en-GB",
  },
};

export function normalizeOrderLocale(value?: string | null): OrderLocale {
  if (value === "en" || value === "sq" || value === "tr") return value;
  return "sq";
}

export function getInvoiceLabels(locale?: string | null): InvoiceLabels {
  return LABELS[normalizeOrderLocale(locale)];
}
