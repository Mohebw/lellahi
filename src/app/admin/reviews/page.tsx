"use client";

import { useEffect, useState } from "react";
import { Check, Trash2, Star } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Table, THead, TBody, Th, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { relativeTimeFa } from "@/lib/utils";

type ReviewRow = {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  product: { name: string };
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { show } = useToast();

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/reviews");
    setReviews(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(id: string) {
    await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved: true })
    });
    show("نظر تایید و نمایش داده شد", "success");
    load();
  }

  async function remove(id: string) {
    if (!confirm("این نظر حذف شود؟")) return;
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    show("نظر حذف شد", "success");
    load();
  }

  return (
    <AdminShell>
      <h1 className="mb-6 text-2xl font-bold text-white">مدیریت نظرات</h1>

      {loading ? (
        <p className="text-sm text-white/40">در حال بارگذاری...</p>
      ) : reviews.length === 0 ? (
        <EmptyState title="نظری ثبت نشده" />
      ) : (
        <Table>
          <THead>
            <Th>مشتری</Th>
            <Th>محصول</Th>
            <Th>امتیاز</Th>
            <Th>نظر</Th>
            <Th>زمان</Th>
            <Th>وضعیت</Th>
            <Th>عملیات</Th>
          </THead>
          <TBody>
            {reviews.map((r) => (
              <tr key={r.id}>
                <Td className="text-white">{r.customerName}</Td>
                <Td>{r.product.name}</Td>
                <Td>
                  <div className="flex items-center gap-1">
                    {r.rating}
                    <Star className="h-3.5 w-3.5 fill-mustard-400 text-mustard-400" />
                  </div>
                </Td>
                <Td className="max-w-[240px] truncate">{r.comment}</Td>
                <Td className="whitespace-nowrap text-xs text-white/40">{relativeTimeFa(new Date(r.createdAt))}</Td>
                <Td>
                  <Badge tone={r.isApproved ? "green" : "gray"}>{r.isApproved ? "نمایش داده می‌شود" : "در انتظار تایید"}</Badge>
                </Td>
                <Td>
                  <div className="flex gap-2">
                    {!r.isApproved && (
                      <button onClick={() => approve(r.id)} className="rounded-lg p-1.5 text-white/50 hover:bg-emerald-500/10 hover:text-emerald-400">
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={() => remove(r.id)} className="rounded-lg p-1.5 text-white/50 hover:bg-red-500/10 hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
          </TBody>
        </Table>
      )}
    </AdminShell>
  );
}
