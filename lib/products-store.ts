import { promises as fs } from "fs";
import path from "path";
import type { Product, ProductInput } from "@/lib/types/product";
import { seedProducts } from "@/lib/data/products-seed";
import { normalizeProduct } from "@/lib/product-helpers";

const DATA_DIR = path.join(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");

async function ensureDataFile(): Promise<Product[]> {
  try {
    await fs.access(PRODUCTS_FILE);
    const raw = await fs.readFile(PRODUCTS_FILE, "utf-8");
    return (JSON.parse(raw) as Product[]).map(normalizeProduct);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(PRODUCTS_FILE, JSON.stringify(seedProducts, null, 2), "utf-8");
    return seedProducts.map(normalizeProduct);
  }
}

async function writeProducts(products: Product[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf-8");
}

export async function readAllProducts(): Promise<Product[]> {
  return ensureDataFile();
}

export async function readPublishedProducts(): Promise<Product[]> {
  const products = await ensureDataFile();
  return products.filter((p) => p.published);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const products = await ensureDataFile();
  return products.find((p) => p.id === id);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await readPublishedProducts();
  return products.find((p) => p.slug === slug);
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const products = await ensureDataFile();
  const now = new Date().toISOString();
  const product = normalizeProduct({
    ...input,
    id: String(Date.now()),
    createdAt: now,
    updatedAt: now,
  });
  products.unshift(product);
  await writeProducts(products);
  return product;
}

export type ProductUpdateInput = Omit<
  Partial<ProductInput>,
  "originalPrice" | "discountPercent" | "images"
> & {
  originalPrice?: number | null;
  discountPercent?: number | null;
  images?: string[] | null;
};

export async function updateProduct(
  id: string,
  input: ProductUpdateInput
): Promise<Product | null> {
  const products = await ensureDataFile();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const patch = Object.fromEntries(
    Object.entries(input).filter(
      ([, value]) => value !== undefined && value !== null
    )
  ) as Partial<ProductInput>;

  const updated = normalizeProduct({
    ...products[index],
    ...patch,
    id,
    updatedAt: new Date().toISOString(),
  });

  for (const key of ["originalPrice", "discountPercent", "images"] as const) {
    if (input[key] === null) {
      delete updated[key];
    }
  }
  products[index] = updated;
  await writeProducts(products);
  return updated;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const products = await ensureDataFile();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) return false;
  await writeProducts(filtered);
  return true;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
