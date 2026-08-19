"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, UploadCloud, Loader2, X, GripVertical } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";

type Tile = {
  id: string;
  images: string[];
  title: string | null;
  link: string | null;
  borderColor: string;
  order: number;
  isActive: boolean;
};

const COLOR_PRESETS = [
  { label: "زرد خردلی", value: "#FCCF04" },
  { label: "آبی", value: "#3B82F6" },
  { label: "قرمز", value: "#EF4444" },
  { label: "سبز", value: "#22C55E" },
  { label: "بنفش", value: "#A855F7" }
];

export default function AdminPromoTilesPage() {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Tile | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [borderColor, setBorderColor] = useState("#FCCF04");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { show } = useToast();

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/promo-tiles");
    setTiles(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setImages([]);
    setTitle("");
    setLink("");
    setBorderColor("#FCCF04");
    setModalOpen(true);
  }

  function openEdit(t: Tile) {
    setEditing(t);
    setImages(t.images);
    setTitle(t.title || "");
    setLink(t.link || "");
    setBorderColor(t.borderColor);
    setModalOpen(true);
  }

  async function handleImageUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
        let data: { url?: string; error?: string } = {};
        try {
          data = await res.json();
        } catch {
          data = { error: "پاسخ نامعتبر از سرور" };
        }
        if (res.ok && data.url) uploaded.push(data.url);
        else show(data.error || "خطا در آپلود تصویر", "error");
      }
      setImages((prev) => [...prev, ...uploaded]);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (images.length === 0) {
      show("حداقل یک تصویر آپلود کنید", "error");
      return;
    }
    setSaving(true);
    try {
      const url = editing ? `/api/admin/promo-tiles/${editing.id}` : "/api/admin/promo-tiles";
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images, title, link, borderColor, isActive: true, order: editing?.order ?? tiles.length })
      });
      const data = await res.json();
      if (!res.ok) {
        show(data.error || "خطا در ذخیره‌سازی", "error");
        return;
      }
      show(editing ? "باکس ویرایش شد" : "باکس ایجاد شد", "success");
      setModalOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(t: Tile) {
    if (!confirm("این باکس حذف شود؟")) return;
    await fetch(`/api/admin/promo-tiles/${t.id}`, { method: "DELETE" });
    show("باکس حذف شد", "success");
    load();
  }

  async function toggleActive(t: Tile) {
    await fetch(`/api/admin/promo-tiles/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !t.isActive })
    });
    load();
  }

  return (
    <AdminShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">باکس‌های تبلیغاتی متحرک</h1>
          <p className="mt-1 text-xs text-white/40">هر باکس می‌تواند چند تصویر داشته باشد که به‌صورت خودکار می‌چرخند</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          باکس جدید
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-white/40">در حال بارگذاری...</p>
      ) : tiles.length === 0 ? (
        <EmptyState title="باکسی ثبت نشده" action={{ label: "افزودن باکس", onClick: openCreate }} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((t) => (
            <div key={t.id} className="glass-panel p-4">
              <div
                className="relative mb-3 aspect-video overflow-hidden rounded-xl border-2"
                style={{ borderColor: t.borderColor }}
              >
                {t.images[0] && <Image src={t.images[0]} alt="" fill className="object-cover" />}
                {t.images.length > 1 && (
                  <span className="absolute top-2 left-2 rounded-full bg-ink-950/70 px-2 py-0.5 text-xs text-white">
                    {t.images.length} تصویر
                  </span>
                )}
              </div>
              <div className="mb-2 flex items-center justify-between">
                <p className="truncate text-sm font-medium text-white">{t.title || "(بدون عنوان)"}</p>
                <button onClick={() => toggleActive(t)}>
                  <Badge tone={t.isActive ? "green" : "gray"}>{t.isActive ? "فعال" : "غیرفعال"}</Badge>
                </button>
              </div>
              <p className="mb-3 truncate text-xs text-white/40" dir="ltr">{t.link || "بدون لینک"}</p>
              <div className="flex gap-2">
                <button onClick={() => openEdit(t)} className="flex-1 rounded-lg bg-white/5 py-1.5 text-xs text-white/70 hover:bg-white/10">
                  <Pencil className="mx-auto h-3.5 w-3.5" />
                </button>
                <button onClick={() => handleDelete(t)} className="flex-1 rounded-lg bg-white/5 py-1.5 text-xs text-red-400 hover:bg-red-500/10">
                  <Trash2 className="mx-auto h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "ویرایش باکس" : "باکس جدید"}>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <p className="mb-1.5 text-sm text-white/70">تصاویر (چند تصویر ممکن است)</p>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-line py-6 text-white/40 transition-colors hover:border-mustard-400/40 hover:text-white/60">
              {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
              <span className="text-xs">آپلود تصویر</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                disabled={uploading}
                onChange={(e) => handleImageUpload(e.target.files)}
              />
            </label>
            {images.length > 0 && (
              <div className="mt-2 grid grid-cols-4 gap-2">
                {images.map((img, i) => (
                  <div key={img + i} className="group relative aspect-square overflow-hidden rounded-lg bg-white/5">
                    <Image src={img} alt="" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                      className="absolute inset-0 flex items-center justify-center bg-ink-950/60 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Input label="عنوان (اختیاری)" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثلاً: کنسول‌های بازی" />
          <Input label="لینک مقصد (اختیاری)" value={link} onChange={(e) => setLink(e.target.value)} placeholder="/products?category=apple" />
          <div>
            <p className="mb-1.5 text-sm text-white/70">رنگ نئون دور باکس</p>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setBorderColor(c.value)}
                  className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110"
                  style={{ backgroundColor: c.value, borderColor: borderColor === c.value ? "#fff" : "transparent" }}
                  aria-label={c.label}
                />
              ))}
              <input
                type="color"
                value={borderColor}
                onChange={(e) => setBorderColor(e.target.value)}
                className="h-8 w-8 cursor-pointer rounded-full border-2 border-white/20 bg-transparent"
              />
            </div>
          </div>
          <Button type="submit" loading={saving} className="w-full">
            ذخیره
          </Button>
        </form>
      </Modal>
    </AdminShell>
  );
}
