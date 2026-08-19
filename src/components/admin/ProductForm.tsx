"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, X, UploadCloud, Loader2, Sparkles, Film } from "lucide-react";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

type Category = { id: string; name: string; slug: string };

const PHONE_SPEC_TEMPLATE: Record<string, string> = {
  "برند تراشه": "",
  "رم": "",
  "حافظه داخلی": "",
  "اندازه صفحه نمایش": "",
  "نوع و رزولوشن صفحه": "",
  "دوربین اصلی": "",
  "دوربین سلفی": "",
  "ظرفیت باتری": "",
  "شارژ سریع": "",
  "وزن": "",
  "مقاومت به آب و گردوغبار": ""
};

const SPEAKER_SPEC_TEMPLATE: Record<string, string> = {
  "توان خروجی": "",
  "نسخه بلوتوث": "",
  "مدت‌زمان شارژدهی باتری": "",
  "زمان شارژ کامل": "",
  "مقاومت به آب": "",
  "قابلیت اتصال چندگانه (Party Boost)": "",
  "وزن": "",
  "ابعاد": ""
};

export type ProductFormValues = {
  name: string;
  brand: string;
  model: string;
  categoryId: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  isActive: boolean;
  shortDescription: string;
  description: string;
  specs: Record<string, string>;
  colors: string[];
  badge: "NONE" | "NEW" | "FEATURED" | "DISCOUNT" | "OUT_OF_STOCK";
  images: string[];
  videoUrl: string;
  isFlashSale: boolean;
};

const EMPTY: ProductFormValues = {
  name: "",
  brand: "",
  model: "",
  categoryId: "",
  price: 0,
  compareAtPrice: null,
  stock: 0,
  isActive: true,
  shortDescription: "",
  description: "",
  specs: {},
  colors: [],
  badge: "NONE",
  images: [],
  videoUrl: "",
  isFlashSale: false
};

export function ProductForm({
  productId,
  initial
}: {
  productId?: string;
  initial?: Partial<ProductFormValues>;
}) {
  const router = useRouter();
  const { show } = useToast();
  const [values, setValues] = useState<ProductFormValues>({ ...EMPTY, ...initial });
  const [categories, setCategories] = useState<Category[]>([]);
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");
  const [colorInput, setColorInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [saving, setSaving] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleImageUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        try {
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
          let data: { url?: string; error?: string } = {};
          try {
            data = await res.json();
          } catch {
            data = { error: "پاسخ نامعتبر از سرور — احتمالاً فضای دیسک سرور پر است" };
          }
          if (res.ok && data.url) {
            uploaded.push(data.url);
          } else {
            show(data.error || `خطا در آپلود ${file.name}`, "error");
          }
        } catch {
          show(`خطای شبکه هنگام آپلود ${file.name}`, "error");
        }
      }
      if (uploaded.length > 0) {
        set("images", [...values.images, ...uploaded]);
      }
    } finally {
      setUploading(false);
      // Reset so selecting the exact same file(s) again still triggers onChange
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  }

  async function handleVideoUpload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload-video", { method: "POST", body: formData });
      let data: { url?: string; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        data = { error: "پاسخ نامعتبر از سرور — احتمالاً فضای دیسک سرور پر است" };
      }
      if (res.ok && data.url) {
        set("videoUrl", data.url);
        show("ویدیو با موفقیت آپلود شد", "success");
      } else {
        show(data.error || "خطا در آپلود ویدیو", "error");
      }
    } catch {
      show("خطای شبکه هنگام آپلود ویدیو", "error");
    } finally {
      setUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  }

  function addSpec() {
    if (!specKey.trim() || !specValue.trim()) return;
    set("specs", { ...values.specs, [specKey.trim()]: specValue.trim() });
    setSpecKey("");
    setSpecValue("");
  }

  function removeSpec(key: string) {
    const next = { ...values.specs };
    delete next[key];
    set("specs", next);
  }

  function applySpecTemplate() {
    const category = categories.find((c) => c.id === values.categoryId);
    if (!category) {
      show("اول دسته‌بندی را انتخاب کنید", "error");
      return;
    }
    const template = category.slug === "jbl" ? SPEAKER_SPEC_TEMPLATE : PHONE_SPEC_TEMPLATE;
    set("specs", { ...template, ...values.specs });
  }

  function addColor() {
    if (!colorInput.trim()) return;
    set("colors", [...values.colors, colorInput.trim()]);
    setColorInput("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = productId ? `/api/admin/products/${productId}` : "/api/admin/products";
      const res = await fetch(url, {
        method: productId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      const data = await res.json();
      if (!res.ok) {
        show(data.error || "خطا در ذخیره‌سازی محصول", "error");
        return;
      }
      show(productId ? "محصول ویرایش شد" : "محصول ایجاد شد", "success");
      router.push("/admin/products");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
      <div className="glass-panel space-y-4 p-5 lg:col-span-2">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="نام محصول" value={values.name} onChange={(e) => set("name", e.target.value)} required />
          <Select label="دسته‌بندی" value={values.categoryId} onChange={(e) => set("categoryId", e.target.value)} required>
            <option value="">انتخاب کنید</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          <Input label="برند" value={values.brand} onChange={(e) => set("brand", e.target.value)} required />
          <Input label="مدل" value={values.model} onChange={(e) => set("model", e.target.value)} required />
          <Input
            label="قیمت (تومان)"
            type="number"
            value={values.price}
            onChange={(e) => set("price", Number(e.target.value))}
            required
          />
          <Input
            label="قیمت قبل از تخفیف (اختیاری)"
            type="number"
            value={values.compareAtPrice ?? ""}
            onChange={(e) => set("compareAtPrice", e.target.value ? Number(e.target.value) : null)}
          />
          <Input
            label="موجودی"
            type="number"
            value={values.stock}
            onChange={(e) => set("stock", Number(e.target.value))}
          />
          <Select label="Badge" value={values.badge} onChange={(e) => set("badge", e.target.value as ProductFormValues["badge"])}>
            <option value="NONE">بدون Badge</option>
            <option value="NEW">جدید</option>
            <option value="FEATURED">ویژه</option>
            <option value="DISCOUNT">تخفیف</option>
            <option value="OUT_OF_STOCK">ناموجود</option>
          </Select>
        </div>

        <Textarea
          label="توضیح کوتاه"
          value={values.shortDescription}
          onChange={(e) => set("shortDescription", e.target.value)}
          rows={2}
        />
        <Textarea
          label="توضیحات کامل"
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          rows={5}
        />

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-white/70">مشخصات فنی</p>
            <Button type="button" variant="secondary" size="sm" onClick={applySpecTemplate}>
              <Sparkles className="h-3.5 w-3.5" />
              پر کردن مشخصات پیشنهادی
            </Button>
          </div>
          <div className="mb-2 flex gap-2">
            <Input placeholder="عنوان (مثلاً حافظه)" value={specKey} onChange={(e) => setSpecKey(e.target.value)} />
            <Input placeholder="مقدار (مثلاً 256GB)" value={specValue} onChange={(e) => setSpecValue(e.target.value)} />
            <Button type="button" variant="secondary" onClick={addSpec}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {Object.entries(values.specs).length > 0 && (
            <div className="space-y-1.5">
              {Object.entries(values.specs).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-sm">
                  <span className="w-44 shrink-0 text-white/60">{k}</span>
                  <input
                    value={v}
                    onChange={(e) => set("specs", { ...values.specs, [k]: e.target.value })}
                    placeholder="مقدار را وارد کنید"
                    className="min-w-0 flex-1 bg-transparent text-white placeholder:text-white/25 focus:outline-none"
                  />
                  <button type="button" onClick={() => removeSpec(k)} className="text-white/30 hover:text-red-400">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="mb-2 text-sm text-white/70">رنگ‌بندی</p>
          <div className="mb-2 flex gap-2">
            <Input placeholder="مثلاً مشکی" value={colorInput} onChange={(e) => setColorInput(e.target.value)} />
            <Button type="button" variant="secondary" onClick={addColor}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {values.colors.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {values.colors.map((c, i) => (
                <span key={c + i} className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-white">
                  {c}
                  <button type="button" onClick={() => set("colors", values.colors.filter((_, idx) => idx !== i))}>
                    <X className="h-3.5 w-3.5 text-white/30 hover:text-red-400" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="glass-panel p-5">
          <p className="mb-3 text-sm text-white/70">تصاویر محصول</p>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line py-8 text-white/40 transition-colors hover:border-mustard-400/40 hover:text-white/60">
            {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <UploadCloud className="h-6 w-6" />}
            <span className="text-xs">آپلود تصویر (JPG, PNG, WebP - حداکثر ۵MB)</span>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => handleImageUpload(e.target.files)}
            />
          </label>
          {values.images.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {values.images.map((url, i) => (
                <div key={url + i} className="group relative aspect-square overflow-hidden rounded-lg bg-white/5">
                  <Image src={url} alt="" fill className="object-contain p-1" />
                  <button
                    type="button"
                    onClick={() => set("images", values.images.filter((_, idx) => idx !== i))}
                    className="absolute inset-0 flex items-center justify-center bg-surface-950/60 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-panel p-5">
          <p className="mb-3 text-sm text-white/70">ویدیوی محصول (اختیاری)</p>
          {values.videoUrl ? (
            <div className="relative">
              <video src={values.videoUrl} controls className="w-full rounded-xl" />
              <button
                type="button"
                onClick={() => set("videoUrl", "")}
                className="absolute top-2 left-2 flex h-8 w-8 items-center justify-center rounded-full bg-surface-950/70 text-white hover:bg-red-500/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line py-8 text-white/40 transition-colors hover:border-mustard-400/40 hover:text-white/60">
              {uploadingVideo ? <Loader2 className="h-6 w-6 animate-spin" /> : <Film className="h-6 w-6" />}
              <span className="text-xs">آپلود ویدیو (MP4, WebM, MOV - حداکثر ۴۰MB)</span>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                className="hidden"
                disabled={uploadingVideo}
                onChange={(e) => handleVideoUpload(e.target.files)}
              />
            </label>
          )}
        </div>

        <div className="glass-panel flex items-center justify-between p-5">
          <span className="text-sm text-white/70">محصول فعال</span>
          <input
            type="checkbox"
            checked={values.isActive}
            onChange={(e) => set("isActive", e.target.checked)}
            className="h-5 w-5 accent-mustard-400"
          />
        </div>

        <div className="glass-panel flex items-center justify-between p-5">
          <span className="text-sm text-white/70">پیشنهاد شگفت‌انگیز</span>
          <input
            type="checkbox"
            checked={values.isFlashSale}
            onChange={(e) => set("isFlashSale", e.target.checked)}
            className="h-5 w-5 accent-red-400"
          />
        </div>

        <Button type="submit" loading={saving} className="w-full">
          {productId ? "ذخیره تغییرات" : "ایجاد محصول"}
        </Button>
      </div>
    </form>
  );
}
