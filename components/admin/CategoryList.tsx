"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import type { CategoryWithCount } from "@/lib/types/category";
import CategoryVisual from "@/components/modules/CategoryVisual";

interface CategoryListProps {
  categories: CategoryWithCount[];
}

export default function CategoryList({ categories: initial }: CategoryListProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initial);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const setPublished = async (category: CategoryWithCount, published: boolean) => {
    setToggling(category.id);
    const res = await fetch(`/api/admin/categories/${category.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published }),
    });
    if (res.ok) {
      const updated = await res.json();
      setCategories((prev) =>
        prev.map((c) => (c.id === category.id ? { ...c, ...updated } : c))
      );
      router.refresh();
    }
    setToggling(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" kategorisini silmek istediğinize emin misiniz?`)) return;
    setDeleting(id);
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      router.refresh();
    }
    setDeleting(null);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Ürün</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((category) => (
              <tr
                key={category.id}
                className={`hover:bg-slate-50/50 ${
                  !category.published ? "bg-slate-50/80" : ""
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <CategoryVisual
                      icon={category.icon}
                      image={category.image}
                      name={category.name}
                      size="sm"
                      className="rounded-lg"
                    />
                    <div>
                      <p className="font-medium text-slate-900">{category.name}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500">{category.slug}</td>
                <td className="px-4 py-3 text-slate-600">{category.productCount}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-2">
                    <span
                      className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        category.published
                          ? "bg-green-50 text-green-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {category.published ? (
                        <>
                          <Eye className="h-3 w-3" />
                          Müşteriye açık
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3" />
                          Sadece panelde
                        </>
                      )}
                    </span>
                    {category.published ? (
                      <button
                        type="button"
                        onClick={() => setPublished(category, false)}
                        disabled={toggling === category.id}
                        className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      >
                        {toggling === category.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5" />
                        )}
                        Gizle
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPublished(category, true)}
                        disabled={toggling === category.id}
                        className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
                      >
                        {toggling === category.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                        Yayınla
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/categories/${category.id}/edit`}
                      className="rounded-lg p-2 text-slate-500 hover:bg-brand-muted hover:text-brand"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(category.id, category.name)}
                      disabled={deleting === category.id}
                      className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {categories.length === 0 && (
        <p className="py-12 text-center text-slate-500">Henüz kategori yok.</p>
      )}
    </div>
  );
}
