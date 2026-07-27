import { promises as fs } from "fs";
import path from "path";
import type { Order } from "@/lib/types/order";

const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

async function ensureOrdersFile(): Promise<Order[]> {
  try {
    await fs.access(ORDERS_FILE);
    const raw = await fs.readFile(ORDERS_FILE, "utf-8");
    return JSON.parse(raw) as Order[];
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(ORDERS_FILE, "[]", "utf-8");
    return [];
  }
}

export async function saveOrder(order: Order): Promise<Order> {
  const orders = await ensureOrdersFile();
  orders.unshift(order);
  await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
  return order;
}
