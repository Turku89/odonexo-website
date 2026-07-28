import { promises as fs } from "fs";
import path from "path";
import type { Order, OrderItem, OrderStatus } from "@/lib/types/order";
import { getReadableDataDir, getWritableDataDir } from "@/lib/data-paths";
import {
  buildLineItem,
  normalizeOrderStatus,
  recalculateOrderTotals,
} from "@/lib/order-helpers";
import { readSiteSettings } from "@/lib/site-settings-store";

function ordersPath(dir: string) {
  return path.join(dir, "orders.json");
}

function normalizeOrder(order: Order): Order {
  return {
    ...order,
    status: normalizeOrderStatus(order.status),
    items: (order.items || []).map((item) => buildLineItem(item)),
  };
}

async function readOrdersFrom(file: string): Promise<Order[] | null> {
  try {
    const raw = await fs.readFile(file, "utf-8");
    const parsed = JSON.parse(raw) as Order[];
    return parsed.map(normalizeOrder);
  } catch {
    return null;
  }
}

async function readAllOrdersRaw(): Promise<Order[]> {
  const writable = ordersPath(getWritableDataDir());
  const fromWritable = await readOrdersFrom(writable);
  if (fromWritable) return fromWritable;

  const fromRepo = await readOrdersFrom(ordersPath(getReadableDataDir()));
  if (fromRepo) return fromRepo;

  return [];
}

async function writeOrders(orders: Order[]): Promise<void> {
  const dir = getWritableDataDir();
  const file = ordersPath(dir);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(file, JSON.stringify(orders, null, 2), "utf-8");

  if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
    try {
      const repoDir = getReadableDataDir();
      await fs.mkdir(repoDir, { recursive: true });
      await fs.writeFile(
        ordersPath(repoDir),
        JSON.stringify(orders, null, 2),
        "utf-8"
      );
    } catch {
      /* ignore */
    }
  }
}

export async function readAllOrders(): Promise<Order[]> {
  const orders = await readAllOrdersRaw();
  return orders.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getOrderById(id: string): Promise<Order | null> {
  const orders = await readAllOrdersRaw();
  return orders.find((o) => o.id === id) || null;
}

export async function countNewOrders(): Promise<number> {
  const orders = await readAllOrdersRaw();
  return orders.filter((o) => o.status === "new").length;
}

export async function getLatestNewOrderId(): Promise<string | null> {
  const orders = await readAllOrders();
  return orders.find((o) => o.status === "new")?.id || null;
}

export async function saveOrder(order: Order): Promise<Order> {
  const orders = await readAllOrdersRaw();
  const withStatus: Order = {
    ...order,
    status: normalizeOrderStatus(order.status),
  };
  orders.unshift(withStatus);

  try {
    await writeOrders(orders);
  } catch (err) {
    console.error("Sipariş dosyaya yazılamadı:", err);
  }

  return withStatus;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order | null> {
  return updateOrder(id, { status });
}

export async function updateOrder(
  id: string,
  patch: {
    status?: OrderStatus;
    items?: OrderItem[];
    adminNote?: string;
    emailSentAt?: string;
    shippingEur?: number;
  }
): Promise<Order | null> {
  const orders = await readAllOrdersRaw();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return null;

  const current = orders[index];
  const settings = await readSiteSettings();

  let items = current.items;
  if (patch.items) {
    items = patch.items.map((item) => buildLineItem(item));
  }

  const totals = recalculateOrderTotals(
    items,
    settings.freeShippingMinEur,
    settings.shippingCostEur
  );

  orders[index] = {
    ...current,
    items,
    ...totals,
    status: patch.status
      ? normalizeOrderStatus(patch.status)
      : current.status,
    adminNote:
      patch.adminNote !== undefined ? patch.adminNote : current.adminNote,
    emailSentAt:
      patch.emailSentAt !== undefined ? patch.emailSentAt : current.emailSentAt,
    updatedAt: new Date().toISOString(),
  };

  try {
    await writeOrders(orders);
  } catch (err) {
    console.error("Sipariş güncellenemedi:", err);
  }

  return orders[index];
}
