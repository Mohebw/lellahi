"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Table, THead, TBody, Th, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";

type Category = {
  id: string;
  name: string;
  icon: string | null;
  isActive: boolean;
  order: number;
  _count: { products: number };
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [saving, setSaving] = useState(false);
  const { show } = useToast();

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/categories");
    setCategories(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setName("");
    setIcon("");
    setModalOpen(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setName(cat.name);
    setIcon(cat.icon || "");
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editing ? `/api/admin/categories/${editing.id}` : "/api/admin/categories";
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, icon, isActive: true, order: 0 })
      });
      const data = await res.json();
      if (!res.ok) {
        show(data.error || "خطا در ذخیره‌سازی", "error");
        return;
      }
      show(editing ? "دسته‌بندی ویرایش شد" : "دسته‌بندی ایجاد شد", "success");
      setModalOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(cat: Category) {
    if (!confirm(`دسته‌بندی «${cat.name}» حذف شود؟`)) return;
    const res = await fetch(`/api/admin/categories/${cat.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      show(data.error || "خطا در حذف", "error");
      return;
    }
    show("دسته‌بندی حذف شد", "success");
    load();
  }

  async function toggleActive(cat: Category) {
    await fetch(`/api/admin/categories/${cat.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !cat.isActive })
    });
    load();
  }

  return (
    <AdminShell>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">دسته‌بندی‌ها</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          دسته‌بندی جدید
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-white/40">در حال بارگذاری...</p>
      ) : categories.length === 0 ? (
        <EmptyState title="دسته‌بندی‌ای ثبت نشده" action={{ label: "افزودن دسته‌بندی", onClick: openCreate }} />
      ) : (
        <Table>
          <THead>
            <Th>آیکون</Th>
            <Th>نام</Th>
            <Th>تعداد محصول</Th>
            <Th>وضعیت</Th>
            <Th>عملیات</Th>
          </THead>
          <TBody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <Td className="text-xl">{cat.icon || "📱"}</Td>
                <Td>{cat.name}</Td>
                <Td>{cat._count.products}</Td>
                <Td>
                  <button onClick={() => toggleActive(cat)}>
                    <Badge tone={cat.isActive ? "green" : "gray"}>
                      {cat.isActive ? "فعال" : "غیرفعال"}
                    </Badge>
                  </button>
                </Td>
                <Td>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(cat)} className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(cat)} className="rounded-lg p-1.5 text-white/50 hover:bg-red-500/10 hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
          </TBody>
        </Table>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "ویرایش دسته‌بندی" : "دسته‌بندی جدید"}>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input label="نام دسته‌بندی" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="آیکون (اموجی، اختیاری)" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="📱" />
          <Button type="submit" loading={saving} className="w-full">
            ذخیره
          </Button>
        </form>
      </Modal>
    </AdminShell>
  );
}
