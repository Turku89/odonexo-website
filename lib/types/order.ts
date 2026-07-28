export type OrderStatus = "new" | "seen" | "approved";

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
  items: { productId: string; quantity: number }[];
}
