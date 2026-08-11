"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, SlidersHorizontal, Search, Save } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Table, THead, TBody, Th, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";

type UsedModel = {
  id: string;
  brand: string;
  name: string;
  basePrice: number;
  isActive: boolean;
};

type DirtyEntry = { basePrice: number; isActive: boolean };

export default function AdminUsedPhonesPage() {
  const [models, setModels] = useState<UsedModel[]>([]);
  const [dirty, setDirty] = useState<Record<string, DirtyEntry>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [savingAll, setSavingAll] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [saving, setSaving] = useState(false);
  const { show } = useToast();

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/used-phone-models");
    setModels(await res.json());
    setDirty({});
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () => models.filter((m) => `${m.brand} ${m.name}`.toLowerCase().includes(search.toLowerCase())),
    [models, search]
  );

  function updateLocal(id: string, patch: Partial<DirtyEntry>) {
    const model = models.find((m) => m.id === id);
    if (!model) return;
    setDirty((d) => ({
      ...d,
      [id]: {
        basePrice: patch.basePrice ?? d[id]?.basePrice ?? model.basePrice,
        isActive: patch.isActive ?? d[id]?.isActive ?? model.isActive
      }
    }));
  }

  async function handleSaveAll() {
    const ids = Object.keys(dirty);
    if (ids.length === 0) return;
    setSavingAll(true);
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/used-phone-models/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dirty[id])
          })
        )
      );
      show(`${ids.length} مدل به‌روزرسانی شد`, "success");
      load();
    } finally {
      setSavingAll(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/used-phone-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, name, basePrice: Number(basePrice), isActive: true })
      });
      const data = await res.json();
      if (!res.ok) {
        show(data.error || "خطا در ذخیره‌سازی", "error");
        return;
      }
      show("مدل ایجاد شد", "success");
      setModalOpen(false);
      setBrand("");
      setName("");
      setBasePrice("");
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(m: UsedModel) {
    if (!confirm(`مدل «${m.brand} ${m.name}» حذف شود؟`)) return;
    const res = await fetch(`/api/admin/used-phone-models/${m.id}`, { method: "DELETE" });
    if (!res.ok) {
      show("خطا در حذف", "error");
      return;
    }
    show("مدل حذف شد", "success");
    load();
  }

  const dirtyCount = Object.keys(dirty).length;

  return (
    <AdminShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">قیمت‌گذاری گوشی دست‌دوم</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/used-phones/factors">
            <Button variant="secondary">
              <SlidersHorizontal className="h-4 w-4" />
              تنظیم درصدها
            </Button>
          </Link>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            مدل سفارشی جدید
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجوی مدل (مثلاً iPhone 13)..." className="pr-10" />
        </div>
        {dirtyCount > 0 && (
          <Button onClick={handleSaveAll} loading={savingAll} size="sm">
            <Save className="h-4 w-4" />
            ذخیره {dirtyCount} تغییر
          </Button>
        )}
        <span className="text-xs text-white/40">
          {filtered.length} از {models.length} مدل — قیمت ۰ یعنی هنوز تنظیم نشده و برای مشتری نمایش داده نمی‌شود
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-white/40">در حال بارگذاری...</p>
      ) : filtered.length === 0 ? (
        <EmptyState title="مدلی یافت نشد" />
      ) : (
        <Table>
          <THead>
            <Th>برند</Th>
            <Th>مدل</Th>
            <Th>قیمت پایه (تومان)</Th>
            <Th>فعال برای مشتری</Th>
            <Th>حذف</Th>
          </THead>
          <TBody>
            {filtered.map((m) => {
              const local = dirty[m.id];
              return (
                <tr key={m.id}>
                  <Td className="text-white">{m.brand}</Td>
                  <Td>{m.name}</Td>
                  <Td>
                    <input
                      type="number"
                      value={local?.basePrice ?? m.basePrice}
                      onChange={(e) => updateLocal(m.id, { basePrice: Number(e.target.value) })}
                      className="w-32 rounded-lg border border-line bg-white/5 px-2 py-1.5 text-left font-mono text-sm text-white focus:border-mustard-400/50 focus:outline-none"
                      dir="ltr"
                    />
                  </Td>
                  <Td>
                    <input
                      type="checkbox"
                      checked={local?.isActive ?? m.isActive}
                      onChange={(e) => updateLocal(m.id, { isActive: e.target.checked })}
                      className="h-5 w-5 accent-mustard-400"
                    />
                  </Td>
                  <Td>
                    <button onClick={() => handleDelete(m)} className="rounded-lg p-1.5 text-white/50 hover:bg-red-500/10 hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </Td>
                </tr>
              );
            })}
          </TBody>
        </Table>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="مدل سفارشی جدید">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input label="برند" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="سامسونگ" required />
          <Input label="نام مدل" value={name} onChange={(e) => setName(e.target.value)} placeholder="Galaxy S24 Ultra 256GB" required />
          <Input
            label="قیمت پایه (تومان، برای گوشی سالم و کامل)"
            type="number"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            required
          />
          <Button type="submit" loading={saving} className="w-full">
            ذخیره
          </Button>
        </form>
      </Modal>
    </AdminShell>
  );
}
