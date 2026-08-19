"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { ProductCard, type ProductCardData } from "./ProductCard";
import { toFaDigits } from "@/lib/utils";

type FlashSaleData = {
  active: boolean;
  title?: string;
  endsAt?: string;
  products?: ProductCardData[];
};

function useCountdown(endsAt: string | undefined) {
  const [remaining, setRemaining] = useState({ h: 0, m: 0, s: 0, done: false });

  useEffect(() => {
    if (!endsAt) return;
    const target = new Date(endsAt).getTime();
    function tick() {
      const diff = target - Date.now();
      if (diff <= 0) {
        setRemaining({ h: 0, m: 0, s: 0, done: true });
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining({ h, m, s, done: false });
    }
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [endsAt]);

  return remaining;
}

export function FlashSaleSection() {
  const [data, setData] = useState<FlashSaleData | null>(null);

  useEffect(() => {
    fetch("/api/flash-sale")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ active: false }));
  }, []);

  const countdown = useCountdown(data?.endsAt);

  if (!data?.active || countdown.done || !data.products?.length) return null;

  const pad = (n: number) => toFaDigits(String(n).padStart(2, "0"));

  return (
    <section className="container-lellahi py-16">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 fill-red-400 text-red-400" />
          <h2 className="text-lg font-bold text-white">{data.title}</h2>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-lg font-bold text-red-300" dir="ltr">
          <span className="rounded-lg bg-ink-950/50 px-2 py-1">{pad(countdown.h)}</span>:
          <span className="rounded-lg bg-ink-950/50 px-2 py-1">{pad(countdown.m)}</span>:
          <span className="rounded-lg bg-ink-950/50 px-2 py-1">{pad(countdown.s)}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {data.products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
