import { promises as fs } from "fs";
import path from "path";
import type { Order } from "@/lib/types/order";
import { getReadableDataDir, getWritableDataDir } from "@/lib/data-paths";

function ordersPath(dir: string) {
  return path.join(dir, "orders.json");
}

async function readOrdersFrom(file: string): Promise<Order[] | null> {
  try {
    const raw = await fs.readFile(file, "utf-8");
    return JSON.parse(raw) as Order[];
  } catch {
    return null;
  }
}

async function ensureOrdersFile(): Promise<Order[]> {
  const writable = ordersPath(getWritableDataDir());
  const fromWritable = await readOrdersFrom(writable);
  if (fromWritable) return fromWritable;

  const fromRepo = await readOrdersFrom(ordersPath(getReadableDataDir()));
  if (fromRepo) return fromRepo;

  return [];
}

export async function saveOrder(order: Order): Promise<Order> {
  const orders = await ensureOrdersFile();
  orders.unshift(order);

  const dir = getWritableDataDir();
  const file = ordersPath(dir);

  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(file, JSON.stringify(orders, null, 2), "utf-8");
  } catch (err) {
    console.error("Sipariş dosyaya yazılamadı:", err);
    /* Telegram bildirimi yine de gidebilir */
  }

  return order;
}
