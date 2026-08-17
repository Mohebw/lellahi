"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, UploadCloud, Loader2, GripVertical } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";

type BannerItem = {
  id: string;
  image: string;
  title: string | null;
  link: string | null;
  order: number;
  isActive: boolean;
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BannerItem | null>(null);
  const [image, setImage] = useState("");
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { show } = useToast();

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/banners");
    setBanners(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setImage("");
    setTitle("");
    setLink("");
    setModalOpen(true);
  }

  function openEdit(b: BannerItem) {
    setEditing(b);
    setImage(b.image);
    setTitle(b.title || "");
    setLink(b.link || "");
    setModalOpen(true);
  }

  async function handleImageUpload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      let data: { url?: string; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        data = { error: "پاسخ نامعتبر از سرور" };
      }
      if (res.ok && data.url) {
        setImage(data.url);
      } else {
        show(data.error || "خطا در آپلود تصویر", "error");
      }
    } catch {
      show("خطای شبکه هنگام آپلود", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!image) {
      show("ابتدا تصویر را آپلود کنید", "error");
      return;
    }
    setSaving(true);
    try {
      const url = editing ? `/api/admin/banners/${editing.id}` : "/api/admin/banners";
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, title, link, isActive: true, order: editing?.order ?? banners.length })
      });
      const data = await res.json();
      if (!res.ok) {
        show(data.error || "خطا در ذخیره‌سازی", "error");
        return;
      }
      show(editing ? "بنر ویرایش شد" : "بنر ایجاد شد", "success");
      setModalOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(b: BannerItem) {
    if (!confirm("این بنر حذف شود؟")) return;
    const res = await fetch(`/api/admin/banners/${b.id}`, { method: "DELETE" });
    if (!res.ok) {
      show("خطا در حذف", "error");
      return;
    }
    show("بنر حذف شد", "success");
    load();
  }

  async function toggleActive(b: BannerItem) {
    await fetch(`/api/admin/banners/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !b.isActive })
    });
    load();
  }

  async function moveOrder(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= banners.length) return;
    const a = banners[index];
    const b = banners[target];
    await Promise.all([
      fetch(`/api/admin/banners/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: b.order })
      }),
      fetch(`/api/admin/banners/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: a.order })
      })
    ]);
    load();
  }

  return (
    <AdminShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">بنرهای اسلایدر صفحه اصلی</h1>
          <p className="mt-1 text-xs text-white/40">بنرها به‌صورت خودکار می‌چرخند. اندازه‌ی پیشنهادی: عریض و کوتاه (مثلاً ۱۶۰۰×۵۰۰ پیکسل)</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          بنر جدید
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-white/40">در حال بارگذاری...</p>
      ) : banners.length === 0 ? (
        <EmptyState title="بنری ثبت نشده" action={{ label: "افزودن بنر", onClick: openCreate }} />
      ) : (
        <div className="flex flex-col gap-3">
          {banners.map((b, i) => (
            <div key={b.id} className="glass-panel flex items-center gap-4 p-4">
              <div className="flex flex-col gap-1 text-white/30">
                <button onClick={() => moveOrder(i, -1)} disabled={i === 0} className="disabled:opacity-20">
                  <GripVertical className="h-4 w-4 rotate-90" />
                </button>
              </div>
              <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-white/5">
                <Image src={b.image} alt={b.title || ""} fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{b.title || "(بدون عنوان)"}</p>
                <p className="truncate text-xs text-white/40" dir="ltr">{b.link || "بدون لینک"}</p>
              </div>
              <button onClick={() => toggleActive(b)}>
                <Badge tone={b.isActive ? "green" : "gray"}>{b.isActive ? "فعال" : "غیرفعال"}</Badge>
              </button>
              <div className="flex gap-2">
                <button onClick={() => openEdit(b)} className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(b)} className="rounded-lg p-1.5 text-white/50 hover:bg-red-500/10 hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "ویرایش بنر" : "بنر جدید"}>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <p className="mb-1.5 text-sm text-white/70">تصویر بنر</p>
            {image ? (
              <div className="relative h-32 w-full overflow-hidden rounded-xl bg-white/5">
                <Image src={image} alt="" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => setImage("")}
                  className="absolute top-2 left-2 rounded-full bg-ink-950/70 px-2 py-1 text-xs text-white hover:bg-red-500/70"
                >
                  حذف
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-line py-8 text-white/40 transition-colors hover:border-mustard-400/40 hover:text-white/60">
                {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
                <span className="text-xs">آپلود تصویر بنر</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => handleImageUpload(e.target.files)}
                />
              </label>
            )}
          </div>
          <Input label="عنوان (اختیاری)" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثلاً: جشنواره تخفیف آیفون" />
          <Input
            label="لینک مقصد (اختیاری)"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="/products?category=apple"
          />
          <Button type="submit" loading={saving} className="w-full">
            ذخیره
          </Button>
        </form>
      </Modal>
    </AdminShell>
  );
}
