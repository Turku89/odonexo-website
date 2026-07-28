import type { Order, OrderItem, OrderStatus } from "@/lib/types/order";

export function normalizeOrderStatus(status?: string): OrderStatus {
  if (status === "approved" || status === "completed") return "approved";
  if (status === "seen") return "seen";
  return "new";
}

export function recalculateOrderTotals(
  items: OrderItem[],
  freeShippingMinEur: number,
  shippingCostEur: number
): Pick<Order, "subtotalEur" | "shippingEur" | "totalEur"> {
  const active = items.filter((i) => !i.unavailable && i.quantity > 0);
  const subtotalEur = active.reduce((sum, i) => sum + i.lineTotalEur, 0);
  const shippingEur =
    subtotalEur <= 0
      ? 0
      : subtotalEur >= freeShippingMinEur
        ? 0
        : shippingCostEur;

  return {
    subtotalEur,
    shippingEur,
    totalEur: subtotalEur + shippingEur,
  };
}

export function buildLineItem(
  item: Omit<OrderItem, "lineTotalEur"> & { lineTotalEur?: number }
): OrderItem {
  const quantity = Math.max(0, Math.floor(Number(item.quantity) || 0));
  const unavailable = Boolean(item.unavailable) || quantity === 0;
  const unitPriceEur = Number(item.unitPriceEur) || 0;
  return {
    productId: item.productId,
    name: item.name,
    sku: item.sku,
    quantity: unavailable && quantity === 0 ? 0 : quantity,
    unitPriceEur,
    lineTotalEur: unavailable ? 0 : unitPriceEur * quantity,
    note: item.note?.trim() || undefined,
    unavailable,
  };
}
