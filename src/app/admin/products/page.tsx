"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Table, THead, TBody, Th, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { formatToman } from "@/lib/utils";

type ProductRow = {
  id: string;
  name: string;
  brand: string;
  price: number;
  stock: number;
  isActive: boolean;
  category: { name: string };
  images: { url: string }[];
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const { show } = useToast();

  async function load(query = "") {
    setLoading(true);
    const res = await fetch(`/api/admin/products${query ? `?q=${encodeURIComponent(query)}` : ""}`);
    setProducts(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(p: ProductRow) {
    if (!confirm(`محصول «${p.name}» حذف شود؟`)) return;
    const res = await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
    if (!res.ok) {
      show("خطا در حذف محصول", "error");
      return;
    }
    show("محصول حذف شد", "success");
    load(q);
  }

  return (
    <AdminShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">محصولات</h1>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="h-4 w-4" />
            محصول جدید
          </Button>
        </Link>
      </div>

      <form
        className="relative mb-4 max-w-sm"
        onSubmit={(e) => {
          e.preventDefault();
          load(q);
        }}
      >
        <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجوی محصول..." className="pr-10" />
      </form>

      {loading ? (
        <p className="text-sm text-white/40">در حال بارگذاری...</p>
      ) : products.length === 0 ? (
        <EmptyState title="محصولی ثبت نشده" />
      ) : (
        <Table>
          <THead>
            <Th>تصویر</Th>
            <Th>نام</Th>
            <Th>دسته‌بندی</Th>
            <Th>قیمت</Th>
            <Th>موجودی</Th>
            <Th>وضعیت</Th>
            <Th>عملیات</Th>
          </THead>
          <TBody>
            {products.map((p) => (
              <tr key={p.id}>
                <Td>
                  <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-white/5">
                    {p.images[0] && <Image src={p.images[0].url} alt="" fill className="object-contain p-1" />}
                  </div>
                </Td>
                <Td>
                  <p className="text-white">{p.name}</p>
                  <p className="text-xs text-white/40">{p.brand}</p>
                </Td>
                <Td>{p.category.name}</Td>
                <Td className="font-mono">{formatToman(p.price)}</Td>
                <Td>
                  <Badge tone={p.stock > 0 ? "green" : "red"}>{p.stock}</Badge>
                </Td>
                <Td>
                  <Badge tone={p.isActive ? "green" : "gray"}>{p.isActive ? "فعال" : "غیرفعال"}</Badge>
                </Td>
                <Td>
                  <div className="flex gap-2">
                    <Link href={`/admin/products/${p.id}/edit`} className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button onClick={() => handleDelete(p)} className="rounded-lg p-1.5 text-white/50 hover:bg-red-500/10 hover:text-red-400">
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
