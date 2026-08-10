"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { purchaseRequestSchema } from "@/lib/validations";
import { CheckCircle2 } from "lucide-react";

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
  const [done, setDone] = useState(false);
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
      if (!res.ok) throw new Error();
      setDone(true);
      show("درخواست خرید شما ثبت شد", "success");
    } catch {
      show("ثبت درخواست با خطا مواجه شد، دوباره تلاش کنید", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    onClose();
    setTimeout(() => {
      setDone(false);
      setName("");
      setPhone("");
      setMessage("");
    }, 200);
  }

  return (
    <Modal open={open} onClose={handleClose} title={done ? undefined : "درخواست خرید"}>
      {done ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">درخواست شما ثبت شد</h3>
          <p className="text-sm text-white/50">
            همکاران ما به‌زودی از طریق شماره‌ای که وارد کردید با شما تماس می‌گیرند.
          </p>
          <Button onClick={handleClose} className="mt-2 w-full">
            متوجه شدم
          </Button>
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
