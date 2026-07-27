import type { Category } from "@/lib/types/category";

const now = new Date().toISOString();

function seed(
  c: Omit<Category, "published" | "createdAt" | "updatedAt"> & {
    published?: boolean;
  }
): Category {
  return {
    ...c,
    published: c.published ?? true,
    createdAt: now,
    updatedAt: now,
  };
}

export const seedCategories: Category[] = [
  seed({
    id: "1",
    name: "Seramik & Porselen",
    slug: "seramik-porselen",
    description: "Diş seramikleri, porselen tozları ve glaze malzemeleri",
    icon: "🦷",
  }),
  seed({
    id: "2",
    name: "Alçı & Modelaj",
    slug: "alci-modelaj",
    description: "Alçı türleri, modelaj mumları ve articulator malzemeleri",
    icon: "🏗️",
  }),
  seed({
    id: "3",
    name: "Akrilik & Protez",
    slug: "akrilik-protez",
    description: "Akrilik reçineler, diş setleri ve protez malzemeleri",
    icon: "🔬",
  }),
  seed({
    id: "4",
    name: "Freze & El Aletleri",
    slug: "freze-el-aletleri",
    description: "CAD/CAM frezeler, el aletleri ve rotary sistemler",
    icon: "⚙️",
  }),
  seed({
    id: "5",
    name: "Laboratuvar Ekipmanları",
    slug: "laboratuvar-ekipmanlari",
    description: "Fırınlar, vakum pompaları ve polisaj üniteleri",
    icon: "🔧",
  }),
  seed({
    id: "6",
    name: "Sarf Malzemeler",
    slug: "sarf-malzemeler",
    description: "Eldivenler, maskeler, dezenfektanlar ve tek kullanımlık ürünler",
    icon: "📦",
  }),
];
