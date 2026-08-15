"use client";

import { useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { purchaseRequestSchema } from "@/lib/validations";
import { CheckCircle2, Copy, ClipboardCheck } from "lucide-react";

export function PurchaseModal({
  open,
  onClose,
  productId,
  productName
}: {
  open: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { show } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = purchaseRequestSchema.safeParse({
      productId,
      customerName: name,
      customerPhone: phone,
      message
    });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch("/api/purchase-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data)
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      setTrackingCode(data.trackingCode);
      show("درخواست خرید شما ثبت شد", "success");
    } catch {
      show("ثبت درخواست با خطا مواجه شد، دوباره تلاش کنید", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!trackingCode) return;
    navigator.clipboard?.writeText(trackingCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleClose() {
    onClose();
    setTimeout(() => {
      setTrackingCode(null);
      setCopied(false);
      setName("");
      setPhone("");
      setMessage("");
    }, 200);
  }

  return (
    <Modal open={open} onClose={handleClose} title={trackingCode ? undefined : "درخواست خرید"}>
      {trackingCode ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">درخواست شما ثبت شد</h3>
          <p className="text-sm text-white/50">
            همکاران ما به‌زودی از طریق شماره‌ای که وارد کردید با شما تماس می‌گیرند.
          </p>

          <div className="w-full rounded-xl border border-mustard-400/30 bg-mustard-400/10 p-4">
            <p className="mb-1 text-xs text-white/50">کد پیگیری سفارش شما</p>
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-xl font-bold tracking-wider text-mustard-300" dir="ltr">
                {trackingCode}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                aria-label="کپی کد پیگیری"
                className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
              >
                {copied ? <ClipboardCheck className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-2 text-xs text-white/40">
              این کد را همراه شماره تماستان نزد خود نگه دارید تا بتوانید وضعیت سفارش را پیگیری کنید.
            </p>
          </div>

          <div className="flex w-full gap-2">
            <Link href="/track-order" className="btn-secondary flex-1 !py-2 text-sm">
              پیگیری سفارش
            </Link>
            <Button onClick={handleClose} className="flex-1">
              متوجه شدم
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <p className="text-sm text-white/50">
            محصول: <span className="text-white">{productName}</span>
          </p>
          <Input
            label="نام و نام خانوادگی"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.customerName}
            placeholder="مثلاً: علی رضایی"
          />
          <Input
            label="شماره تماس"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={errors.customerPhone}
            placeholder="09121234567"
            dir="ltr"
            className="text-right"
            inputMode="numeric"
          />
          <Textarea
            label="توضیحات (اختیاری)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="مثلاً رنگ یا حافظه‌ی مدنظرتان را بنویسید"
          />
          <Button type="submit" loading={loading} className="w-full">
            ثبت درخواست خرید
          </Button>
        </form>
      )}
    </Modal>
  );
}
