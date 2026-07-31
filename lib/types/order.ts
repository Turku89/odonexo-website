export type OrderStatus = "new" | "seen" | "approved" | "cancelled";

export type OrderLocale = "tr" | "sq" | "en";

export type OrderPaymentMethod = "cash" | "pos";

export type OrderPaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "not_required";

export interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  unitPriceEur: number;
  lineTotalEur: number;
  /** Admin düzeltme notu (eksik stok vb.) */
  note?: string;
  /** Ürün tamamen karşılanamıyor */
  unavailable?: boolean;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  notes: string;
  items: OrderItem[];
  subtotalEur: number;
  shippingEur: number;
  totalEur: number;
  currency: "EUR";
  status: OrderStatus;
  /** Sipariş verildiği andaki site dili */
  locale?: OrderLocale;
  /** Nakit veya POS */
  paymentMethod?: OrderPaymentMethod;
  paymentStatus?: OrderPaymentStatus;
  /** İleride POS sağlayıcı referansı */
  paymentProviderRef?: string;
  adminNote?: string;
  emailSentAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CheckoutInput {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  notes?: string;
  locale?: OrderLocale;
  paymentMethod?: OrderPaymentMethod;
  items: { productId: string; quantity: number }[];
}
