"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Table, THead, TBody, Th, Td } from "@/components/ui/Table";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { formatToman, relativeTimeFa } from "@/lib/utils";

type OrderRow = {
  id: string;
  trackingCode: string;
  customerName: string;
  customerPhone: string;
  message: string | null;
  status: "NEW" | "IN_PROGRESS" | "CONTACTED" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  items: { quantity: number; priceAtOrder: number; product: { name: string } }[];
};

const STATUS_OPTIONS = [
  { value: "NEW", label: "جدید" },
  { value: "IN_PROGRESS", label: "در حال بررسی" },
  { value: "CONTACTED", label: "تماس گرفته شد" },
  { value: "COMPLETED", label: "تکمیل شد" },
  { value: "CANCELLED", label: "لغو شد" }
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const { show } = useToast();

  async function load(status = "") {
    setLoading(true);
    const res = await fetch(`/api/admin/orders${status ? `?status=${status}` : ""}`);
    setOrders(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/orders/${id}`, {
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
        <h1 className="text-2xl font-bold text-white">سفارش‌های سبد خرید</h1>
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
      ) : orders.length === 0 ? (
        <EmptyState title="سفارشی یافت نشد" />
      ) : (
        <Table>
          <THead>
            <Th>مشتری</Th>
            <Th>کد پیگیری</Th>
            <Th>تماس</Th>
            <Th>اقلام</Th>
            <Th>جمع کل</Th>
            <Th>زمان</Th>
            <Th>وضعیت</Th>
          </THead>
          <TBody>
            {orders.map((o) => {
              const total = o.items.reduce((s, it) => s + it.priceAtOrder * it.quantity, 0);
              return (
                <tr key={o.id}>
                  <Td className="text-white">{o.customerName}</Td>
                  <Td className="font-mono text-xs" dir="ltr">{o.trackingCode}</Td>
                  <Td className="font-mono" dir="ltr">
                    <a href={`tel:${o.customerPhone}`} className="hover:text-mustard-400">{o.customerPhone}</a>
                  </Td>
                  <Td className="max-w-[220px]">
                    {o.items.map((it, i) => (
                      <p key={i} className="truncate text-xs text-white/70">
                        {it.product.name} × {it.quantity}
                      </p>
                    ))}
                  </Td>
                  <Td className="font-mono">{formatToman(total)}</Td>
                  <Td className="whitespace-nowrap text-xs text-white/40">{relativeTimeFa(new Date(o.createdAt))}</Td>
                  <Td>
                    <Select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className="min-w-[130px] py-1.5 text-xs"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </Select>
                  </Td>
                </tr>
              );
            })}
          </TBody>
        </Table>
      )}
    </AdminShell>
  );
}
