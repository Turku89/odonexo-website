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
import {
  isOrdersBlobEnabled,
  readOrdersFromBlob,
  writeOrdersToBlob,
} from "@/lib/orders-blob";

function ordersPath(dir: string) {
  return path.join(dir, "orders.json");
}

/** Aynı süreç (instance) içinde boş /tmp okumalarına karşı yedek. */
const globalStore = globalThis as typeof globalThis & {
  __odonexoOrdersCache?: Order[];
};

function normalizeOrder(order: Order): Order {
  return {
    ...order,
    status: normalizeOrderStatus(order.status),
    items: (order.items || []).map((item) => buildLineItem(item)),
  };
}

function mergeOrderLists(...lists: (Order[] | null | undefined)[]): Order[] {
  const map = new Map<string, Order>();

  for (const list of lists) {
    if (!list) continue;
    for (const raw of list) {
      const order = normalizeOrder(raw);
      const existing = map.get(order.id);
      if (!existing) {
        map.set(order.id, order);
        continue;
      }
      const existingTime = new Date(
        existing.updatedAt || existing.createdAt
      ).getTime();
      const nextTime = new Date(order.updatedAt || order.createdAt).getTime();
      if (nextTime >= existingTime) {
        map.set(order.id, order);
      }
    }
  }

  return Array.from(map.values());
}

async function readOrdersFrom(file: string): Promise<Order[] | null> {
  try {
    const raw = await fs.readFile(file, "utf-8");
    const parsed = JSON.parse(raw) as Order[];
    if (!Array.isArray(parsed)) return null;
    return parsed.map(normalizeOrder);
  } catch {
    return null;
  }
}

async function readAllOrdersRaw(): Promise<Order[]> {
  const fromBlob = isOrdersBlobEnabled()
    ? await readOrdersFromBlob()
    : null;
  const fromWritable = await readOrdersFrom(ordersPath(getWritableDataDir()));
  const fromRepo = await readOrdersFrom(ordersPath(getReadableDataDir()));
  const fromMemory = globalStore.__odonexoOrdersCache || null;

  // Blob varsa onu birincil kaynak say; yine de birleştir (eksik güncelleme olmasın)
  const merged = mergeOrderLists(fromRepo, fromWritable, fromMemory, fromBlob);
  globalStore.__odonexoOrdersCache = merged;
  return merged;
}

async function writeOrders(orders: Order[]): Promise<void> {
  const normalized = orders.map(normalizeOrder);
  globalStore.__odonexoOrdersCache = normalized;

  // Önce Blob (Vercel'de kalıcı)
  if (isOrdersBlobEnabled()) {
    const ok = await writeOrdersToBlob(normalized);
    if (!ok) {
      console.error("Blob yazılamadı — yerel /tmp yedeğine devam");
    }
  }

  const dir = getWritableDataDir();
  const file = ordersPath(dir);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(file, JSON.stringify(normalized, null, 2), "utf-8");

  if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
    try {
      const repoDir = getReadableDataDir();
      await fs.mkdir(repoDir, { recursive: true });
      await fs.writeFile(
        ordersPath(repoDir),
        JSON.stringify(normalized, null, 2),
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
  // Yazmadan hemen önce tekrar oku (başka instance/blob güncellemesi)
  const orders = await readAllOrdersRaw();
  const withStatus: Order = {
    ...order,
    status: normalizeOrderStatus(order.status),
    updatedAt: order.updatedAt || new Date().toISOString(),
  };

  const withoutDup = orders.filter((o) => o.id !== withStatus.id);
  withoutDup.unshift(withStatus);

  try {
    await writeOrders(withoutDup);
  } catch (err) {
    console.error("Sipariş dosyaya yazılamadı:", err);
    // Bellekte tut — en azından bu instance görsün
    globalStore.__odonexoOrdersCache = withoutDup;
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
    globalStore.__odonexoOrdersCache = orders;
  }

  return orders[index];
}
