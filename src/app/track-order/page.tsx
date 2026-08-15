"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, PackageSearch } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/States";
import { formatToman, relativeTimeFa } from "@/lib/utils";

type OrderItem = { name: string; image: string | null; price: number; quantity: number };

type OrderResult = {
  trackingCode: string;
  status: "NEW" | "IN_PROGRESS" | "CONTACTED" | "COMPLETED" | "CANCELLED";
  items: OrderItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
  message: string | null;
};

const STATUS_TONE = {
  NEW: "blue",
  IN_PROGRESS: "mustard",
  CONTACTED: "gray",
  COMPLETED: "green",
  CANCELLED: "red"
} as const;

const STATUS_LABEL = {
  NEW: "سفارش شما ثبت شد",
  IN_PROGRESS: "در حال بررسی توسط همکاران ما",
  CONTACTED: "با شما تماس گرفته شد",
  COMPLETED: "سفارش تکمیل شد",
  CANCELLED: "سفارش لغو شد"
} as const;

const STEPS: OrderResult["status"][] = ["NEW", "IN_PROGRESS", "CONTACTED", "COMPLETED"];

export default function TrackOrderPage() {
  const [trackingCode, setTrackingCode] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OrderResult | null>(null);
  const [notFound, setNotFound] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setNotFound(false);
    setResult(null);
    try {
      const res = await fetch("/api/track-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingCode, customerPhone: phone })
      });
      if (!res.ok) {
        setNotFound(true);
        return;
      }
      setResult(await res.json());
    } finally {
      setLoading(false);
    }
  }

  const activeStepIndex = result ? STEPS.indexOf(result.status) : -1;
  const isCancelled = result?.status === "CANCELLED";

  return (
    <div className="container-lellahi py-16">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-mustard-400/30 bg-mustard-400/10 px-3 py-1 text-xs text-mustard-300">
            <Search className="h-3.5 w-3.5" />
            پیگیری سفارش
          </span>
          <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl">پیگیری وضعیت سفارش</h1>
          <p className="text-sm text-white/50">کد پیگیری و شماره تماسی که هنگام ثبت سفارش وارد کردید را وارد کنید.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel mb-6 flex flex-col gap-4 p-5">
          <Input
            label="کد پیگیری"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
            placeholder="LLH-XXXXX"
            dir="ltr"
            className="text-right font-mono"
            required
          />
          <Input
            label="شماره تماس"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="09121234567"
            dir="ltr"
            className="text-right"
            inputMode="numeric"
            required
          />
          <Button type="submit" loading={loading} className="w-full">
            پیگیری سفارش
          </Button>
        </form>

        {notFound && (
          <EmptyState
            icon={PackageSearch}
            title="سفارشی یافت نشد"
            description="کد پیگیری یا شماره تماس را دوباره بررسی کنید."
          />
        )}

        {result && (
          <div className="glass-panel p-5">
            <div className="mb-4 space-y-3">
              {result.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white/5">
                    {item.image && <Image src={item.image} alt={item.name} fill className="object-contain p-1" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-medium text-white">{item.name}</p>
                    <p className="font-mono text-xs text-white/40">
                      {formatToman(item.price)} × {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-4 flex items-center justify-between border-t border-line pt-3">
              <span className="text-sm text-white/50">جمع کل</span>
              <span className="font-mono text-base font-bold text-mustard-400">{formatToman(result.total)}</span>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-xs text-white/40" dir="ltr">{result.trackingCode}</span>
              <Badge tone={STATUS_TONE[result.status]}>{STATUS_LABEL[result.status]}</Badge>
            </div>

            {!isCancelled && (
              <div className="mb-4 flex items-center">
                {STEPS.map((step, i) => (
                  <div key={step} className="flex flex-1 items-center last:flex-none">
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        i <= activeStepIndex ? "bg-mustard-400 text-ink-950" : "bg-white/10 text-white/30"
                      }`}
                    >
                      {i + 1}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`h-0.5 flex-1 ${i < activeStepIndex ? "bg-mustard-400" : "bg-white/10"}`} />
                    )}
                  </div>
                ))}
              </div>
            )}

            {result.message && (
              <p className="mb-3 rounded-lg bg-white/5 p-3 text-xs text-white/50">پیام شما: {result.message}</p>
            )}

            <p className="text-xs text-white/30">آخرین به‌روزرسانی: {relativeTimeFa(new Date(result.updatedAt))}</p>
          </div>
        )}
      </div>
    </div>
  );
}
