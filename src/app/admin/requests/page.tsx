"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Table, THead, TBody, Th, Td } from "@/components/ui/Table";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { formatToman, relativeTimeFa } from "@/lib/utils";

type RequestRow = {
  id: string;
  customerName: string;
  customerPhone: string;
  message: string | null;
  status: "NEW" | "IN_PROGRESS" | "CONTACTED" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  telegramSent: boolean;
  product: { name: string; price: number };
};

const STATUS_OPTIONS = [
  { value: "NEW", label: "جدید" },
  { value: "IN_PROGRESS", label: "در حال بررسی" },
  { value: "CONTACTED", label: "تماس گرفته شد" },
  { value: "COMPLETED", label: "تکمیل شد" },
  { value: "CANCELLED", label: "لغو شد" }
];

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const { show } = useToast();

  async function load(status = "") {
    setLoading(true);
    const res = await fetch(`/api/admin/requests${status ? `?status=${status}` : ""}`);
    setRequests(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      show("خطا در به‌روزرسانی وضعیت", "error");
      return;
    }
    show("وضعیت به‌روزرسانی شد", "success");
    load(filter);
  }

  return (
    <AdminShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">درخواست‌های خرید</h1>
        <Select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            load(e.target.value);
          }}
          className="max-w-[180px]"
        >
          <option value="">همه وضعیت‌ها</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </Select>
      </div>

      {loading ? (
        <p className="text-sm text-white/40">در حال بارگذاری...</p>
      ) : requests.length === 0 ? (
        <EmptyState title="درخواستی یافت نشد" />
      ) : (
        <Table>
          <THead>
            <Th>مشتری</Th>
            <Th>تماس</Th>
            <Th>محصول</Th>
            <Th>پیام</Th>
            <Th>زمان</Th>
            <Th>وضعیت</Th>
          </THead>
          <TBody>
            {requests.map((r) => (
              <tr key={r.id}>
                <Td className="text-white">{r.customerName}</Td>
                <Td className="font-mono" dir="ltr">
                  <a href={`tel:${r.customerPhone}`} className="hover:text-mustard-400" dir="ltr">
                    {r.customerPhone}
                  </a>
                </Td>
                <Td>
                  {r.product.name}
                  <p className="font-mono text-xs text-white/40">{formatToman(r.product.price)}</p>
                </Td>
                <Td className="max-w-[200px] truncate">{r.message || "—"}</Td>
                <Td className="whitespace-nowrap text-xs text-white/40">{relativeTimeFa(new Date(r.createdAt))}</Td>
                <Td>
                  <Select
                    value={r.status}
                    onChange={(e) => updateStatus(r.id, e.target.value)}
                    className="min-w-[130px] py-1.5 text-xs"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </Select>
                </Td>
              </tr>
            ))}
          </TBody>
        </Table>
      )}
    </AdminShell>
  );
}
