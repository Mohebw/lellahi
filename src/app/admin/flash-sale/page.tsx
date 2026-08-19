"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function AdminFlashSalePage() {
  const [title, setTitle] = useState("پیشنهاد شگفت‌انگیز");
  const [endsAt, setEndsAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { show } = useToast();

  useEffect(() => {
    fetch("/api/admin/flash-sale")
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setTitle(data.title);
          setEndsAt(new Date(data.endsAt).toISOString().slice(0, 16));
        }
        setLoading(false);
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!endsAt) {
      show("زمان پایان را مشخص کنید", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/flash-sale", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, endsAt: new Date(endsAt).toISOString() })
      });
      if (!res.ok) {
        show("خطا در ذخیره‌سازی", "error");
        return;
      }
      show("تنظیمات پیشنهاد شگفت‌انگیز ذخیره شد", "success");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      <h1 className="mb-2 flex items-center gap-2 text-2xl font-bold text-white">
        <Zap className="h-6 w-6 text-mustard-400" />
        پیشنهاد شگفت‌انگیز
      </h1>
      <p className="mb-6 text-sm text-white/50">
        این بخش فقط تا زمانی که مشخص می‌کنید فعال است. برای اینکه محصولی در این بخش نمایش داده شود، از
        صفحه‌ی ویرایش محصول، گزینه‌ی «پیشنهاد شگفت‌انگیز» را فعال کنید.
      </p>

      {loading ? (
        <p className="text-sm text-white/40">در حال بارگذاری...</p>
      ) : (
        <Card className="max-w-md">
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <Input label="عنوان بخش" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input
              label="زمان پایان شمارش معکوس"
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
            />
            <Button type="submit" loading={saving} className="w-full">
              ذخیره
            </Button>
          </form>
        </Card>
      )}
    </AdminShell>
  );
}
