import { promises as fs } from "fs";
import path from "path";
import type { Category, CategoryInput } from "@/lib/types/category";
import { seedCategories } from "@/lib/data/categories-seed";

const DATA_DIR = path.join(process.cwd(), "data");
const CATEGORIES_FILE = path.join(DATA_DIR, "categories.json");

async function ensureDataFile(): Promise<Category[]> {
  try {
    await fs.access(CATEGORIES_FILE);
    const raw = await fs.readFile(CATEGORIES_FILE, "utf-8");
    return JSON.parse(raw) as Category[];
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(
      CATEGORIES_FILE,
      JSON.stringify(seedCategories, null, 2),
      "utf-8"
    );
    return seedCategories;
  }
}

async function writeCategories(categories: Category[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    CATEGORIES_FILE,
    JSON.stringify(categories, null, 2),
    "utf-8"
  );
}

export async function readAllCategories(): Promise<Category[]> {
  return ensureDataFile();
}

export async function readPublishedCategories(): Promise<Category[]> {
  const categories = await ensureDataFile();
  return categories.filter((c) => c.published);
}

export async function getCategoryById(id: string): Promise<Category | undefined> {
  const categories = await ensureDataFile();
  return categories.find((c) => c.id === id);
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const categories = await readPublishedCategories();
  return categories.find((c) => c.slug === slug);
}

export async function getCategoryBySlugAdmin(
  slug: string
): Promise<Category | undefined> {
  const categories = await ensureDataFile();
  return categories.find((c) => c.slug === slug);
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const categories = await ensureDataFile();
  const now = new Date().toISOString();
  const category: Category = {
    ...input,
    id: String(Date.now()),
    createdAt: now,
    updatedAt: now,
  };
  categories.unshift(category);
  await writeCategories(categories);
  return category;
}

export type CategoryUpdateInput = Partial<CategoryInput> & {
  published?: boolean | null;
};

export async function updateCategory(
  id: string,
  input: CategoryUpdateInput
): Promise<Category | null> {
  const categories = await ensureDataFile();
  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) return null;

  const patch = Object.fromEntries(
    Object.entries(input).filter(
      ([, value]) => value !== undefined && value !== null
    )
  ) as Partial<CategoryInput>;

  const updated: Category = {
    ...categories[index],
    ...patch,
    id,
    updatedAt: new Date().toISOString(),
  };

  if (input.published === null) {
    updated.published = false;
  }

  categories[index] = updated;
  await writeCategories(categories);
  return updated;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const categories = await ensureDataFile();
  const filtered = categories.filter((c) => c.id !== id);
  if (filtered.length === categories.length) return false;
  await writeCategories(filtered);
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
