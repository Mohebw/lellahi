"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, SlidersHorizontal } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Table, THead, TBody, Th, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { formatToman } from "@/lib/utils";

type UsedModel = {
  id: string;
  brand: string;
  name: string;
  basePrice: number;
  isActive: boolean;
};

export default function AdminUsedPhonesPage() {
  const [models, setModels] = useState<UsedModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UsedModel | null>(null);
  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [saving, setSaving] = useState(false);
  const { show } = useToast();

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/used-phone-models");
    setModels(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setBrand("");
    setName("");
    setBasePrice("");
    setModalOpen(true);
  }

  function openEdit(m: UsedModel) {
    setEditing(m);
    setBrand(m.brand);
    setName(m.name);
    setBasePrice(String(m.basePrice));
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editing ? `/api/admin/used-phone-models/${editing.id}` : "/api/admin/used-phone-models";
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, name, basePrice: Number(basePrice), isActive: true })
      });
      const data = await res.json();
      if (!res.ok) {
        show(data.error || "خطا در ذخیره‌سازی", "error");
        return;
      }
      show(editing ? "مدل ویرایش شد" : "مدل ایجاد شد", "success");
      setModalOpen(false);
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

  async function toggleActive(m: UsedModel) {
    await fetch(`/api/admin/used-phone-models/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !m.isActive })
    });
    load();
  }

  return (
    <AdminShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">قیمت‌گذاری گوشی دست‌دوم</h1>
        <div className="flex gap-2">
          <Link href="/admin/used-phones/factors">
            <Button variant="secondary">
              <SlidersHorizontal className="h-4 w-4" />
              تنظیم درصدها
            </Button>
          </Link>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            مدل جدید
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-white/40">در حال بارگذاری...</p>
      ) : models.length === 0 ? (
        <EmptyState title="مدلی ثبت نشده" action={{ label: "افزودن مدل", onClick: openCreate }} />
      ) : (
        <Table>
          <THead>
            <Th>برند</Th>
            <Th>مدل</Th>
            <Th>قیمت پایه (نو/سالم)</Th>
            <Th>وضعیت</Th>
            <Th>عملیات</Th>
          </THead>
          <TBody>
            {models.map((m) => (
              <tr key={m.id}>
                <Td className="text-white">{m.brand}</Td>
                <Td>{m.name}</Td>
                <Td className="font-mono">{formatToman(m.basePrice)}</Td>
                <Td>
                  <button onClick={() => toggleActive(m)}>
                    <Badge tone={m.isActive ? "green" : "gray"}>{m.isActive ? "فعال" : "غیرفعال"}</Badge>
                  </button>
                </Td>
                <Td>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(m)} className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(m)} className="rounded-lg p-1.5 text-white/50 hover:bg-red-500/10 hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
          </TBody>
        </Table>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "ویرایش مدل" : "مدل جدید"}>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input label="برند" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="اپل" required />
          <Input label="نام مدل" value={name} onChange={(e) => setName(e.target.value)} placeholder="iPhone 14 Pro 256GB" required />
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
