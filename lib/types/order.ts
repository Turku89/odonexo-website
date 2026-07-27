export interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  unitPriceEur: number;
  lineTotalEur: number;
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
  createdAt: string;
}

export interface CheckoutInput {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  notes?: string;
  items: { productId: string; quantity: number }[];
}
