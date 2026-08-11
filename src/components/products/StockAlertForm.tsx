"use client";

import { useState } from "react";
import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

export function StockAlertForm({ productId }: { productId: string }) {
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { show } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^09\d{9}$/.test(phone)) {
      show("شماره تماس معتبر نیست", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/stock-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, customerPhone: phone })
      });
      if (!res.ok) {
        show("خطا در ثبت درخواست", "error");
        return;
      }
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="glass-panel flex items-center gap-2 p-4 text-sm text-emerald-300">
        <BellRing className="h-4 w-4" />
        ثبت شد — به‌محض موجود شدن با شما تماس می‌گیریم.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <Input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="شماره تماس برای اطلاع‌رسانی"
        dir="ltr"
        className="text-right"
        inputMode="numeric"
      />
      <Button type="submit" variant="secondary" loading={loading} className="whitespace-nowrap">
        <BellRing className="h-4 w-4" />
        اطلاع بده موجود شد
      </Button>
    </form>
  );
}
