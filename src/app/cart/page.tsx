"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Minus, Plus, Trash2, CheckCircle2, Copy, ClipboardCheck } from "lucide-react";
import { useCart } from "@/lib/useCart";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { formatToman } from "@/lib/utils";

type CartProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  stock: number;
  images: { url: string }[];
};

export default function CartPage() {
  const { lines, ready, updateQuantity, removeFromCart, clearCart } = useCart();
  const [products, setProducts] = useState<CartProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [orderTrackingCode, setOrderTrackingCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { show } = useToast();

  useEffect(() => {
    if (!ready) return;
    if (lines.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    fetch(`/api/products-by-ids?ids=${lines.map((l) => l.productId).join(",")}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  }, [ready, lines]);

  const total = lines.reduce((sum, l) => {
    const p = products.find((pr) => pr.id === l.productId);
    return sum + (p ? p.price * l.quantity : 0);
  }, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (name.trim().length < 2) newErrors.name = "نام باید حداقل ۲ حرف باشد";
    if (!/^09\d{9}$/.test(phone)) newErrors.phone = "شماره تماس معتبر نیست (مثال: 09121234567)";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          message,
          items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity }))
        })
      });
      const data = await res.json();
      if (!res.ok) {
        show(data.error || "خطا در ثبت سفارش", "error");
        return;
      }
      setDone(true);
      setOrderTrackingCode(data.trackingCode);
      clearCart();
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="container-lellahi flex flex-col items-center gap-4 py-24 text-center">
        <CheckCircle2 className="h-14 w-14 text-emerald-400" />
        <h1 className="text-2xl font-bold text-white">سفارش شما ثبت شد</h1>
        <p className="max-w-sm text-sm text-white/50">
          همکاران ما به‌زودی از طریق شماره‌ای که وارد کردید با شما تماس می‌گیرند.
        </p>
        {orderTrackingCode && (
          <div className="w-full max-w-xs rounded-xl border border-mustard-400/30 bg-mustard-400/10 p-4">
            <p className="mb-1 text-xs text-white/50">کد پیگیری سفارش شما</p>
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-xl font-bold tracking-wider text-mustard-300" dir="ltr">
                {orderTrackingCode}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(orderTrackingCode).then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  });
                }}
                aria-label="کپی کد پیگیری"
                className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
              >
                {copied ? <ClipboardCheck className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <Link href="/track-order" className="btn-secondary">
            پیگیری سفارش
          </Link>
          <Link href="/products" className="btn-primary">
            بازگشت به محصولات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-lellahi py-10">
      <h1 className="mb-6 text-2xl font-bold text-white">سبد خرید</h1>

      {loading ? (
        <p className="text-sm text-white/40">در حال بارگذاری...</p>
      ) : lines.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="سبد خرید شما خالی است"
          action={{ label: "مشاهده محصولات", onClick: () => (window.location.href = "/products") }}
        />
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            {lines.map((line) => {
              const product = products.find((p) => p.id === line.productId);
              if (!product) return null;
              return (
                <div key={line.productId} className="glass-panel flex items-center gap-4 p-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white/5">
                    {product.images[0] && (
                      <Image src={product.images[0].url} alt={product.name} fill className="object-contain p-1.5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/products/${product.slug}`} className="line-clamp-1 text-sm font-medium text-white hover:text-mustard-400">
                      {product.name}
                    </Link>
                    <p className="font-mono text-xs text-mustard-400">{formatToman(product.price)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg border border-line px-1.5 py-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, line.quantity - 1)}
                      className="flex h-6 w-6 items-center justify-center text-white/60 hover:text-white"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-5 text-center font-mono text-sm text-white">{line.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, line.quantity + 1)}
                      className="flex h-6 w-6 items-center justify-center text-white/60 hover:text-white"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(product.id)}
                    className="rounded-lg p-1.5 text-white/30 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="glass-panel h-fit p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-white/50">جمع کل</span>
              <span className="font-mono text-lg font-bold text-mustard-400">{formatToman(total)}</span>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <Input label="نام و نام خانوادگی" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
              <Input
                label="شماره تماس"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={errors.phone}
                dir="ltr"
                className="text-right"
                inputMode="numeric"
                placeholder="09121234567"
              />
              <Textarea label="توضیحات (اختیاری)" value={message} onChange={(e) => setMessage(e.target.value)} rows={2} />
              <Button type="submit" loading={submitting} className="w-full">
                ثبت نهایی سفارش
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
