"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Scale, X } from "lucide-react";
import { useLocalStorageIds } from "@/lib/useLocalStorageIds";
import { EmptyState } from "@/components/ui/States";
import { formatToman } from "@/lib/utils";

type CompareProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  stock: number;
  specs: Record<string, string> | null;
  images: { url: string }[];
  category: { name: string };
};

export default function ComparePage() {
  const { ids, ready, toggle } = useLocalStorageIds("lellahi_compare");
  const [products, setProducts] = useState<CompareProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    fetch(`/api/products-compare?ids=${ids.join(",")}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  }, [ready, ids]);

  const allSpecKeys = useMemo(() => {
    const keys = new Set<string>();
    products.forEach((p) => Object.keys(p.specs || {}).forEach((k) => keys.add(k)));
    return Array.from(keys);
  }, [products]);

  return (
    <div className="container-lellahi py-10">
      <h1 className="mb-6 text-2xl font-bold text-white">مقایسه محصولات</h1>

      {loading ? (
        <p className="text-sm text-white/40">در حال بارگذاری...</p>
      ) : products.length === 0 ? (
        <EmptyState
          icon={Scale}
          title="محصولی برای مقایسه انتخاب نشده"
          description="روی آیکون ترازو کنار هر محصول بزنید تا اینجا برای مقایسه اضافه شود (حداکثر ۳ محصول)."
        />
      ) : (
        <div className="glass-panel overflow-x-auto p-0">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-line">
                <td className="w-40 px-4 py-4 text-white/40">محصول</td>
                {products.map((p) => (
                  <td key={p.id} className="px-4 py-4">
                    <div className="relative mb-2 flex items-center justify-between">
                      <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-white/5">
                        {p.images[0] && <Image src={p.images[0].url} alt={p.name} fill className="object-contain p-2" />}
                      </div>
                      <button onClick={() => toggle(p.id)} className="text-white/30 hover:text-red-400">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <Link href={`/products/${p.slug}`} className="font-medium text-white hover:text-mustard-400">
                      {p.name}
                    </Link>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-line bg-white/[0.02]">
                <td className="px-4 py-3 text-white/40">برند / دسته‌بندی</td>
                {products.map((p) => (
                  <td key={p.id} className="px-4 py-3 text-white/80">
                    {p.brand} — {p.category.name}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-line">
                <td className="px-4 py-3 text-white/40">قیمت</td>
                {products.map((p) => (
                  <td key={p.id} className="px-4 py-3 font-mono text-mustard-400">
                    {formatToman(p.price)}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-line bg-white/[0.02]">
                <td className="px-4 py-3 text-white/40">موجودی</td>
                {products.map((p) => (
                  <td key={p.id} className="px-4 py-3 text-white/80">
                    {p.stock > 0 ? "موجود" : "ناموجود"}
                  </td>
                ))}
              </tr>
              {allSpecKeys.map((key, i) => (
                <tr key={key} className={i % 2 === 0 ? "border-b border-line" : "border-b border-line bg-white/[0.02]"}>
                  <td className="px-4 py-3 text-white/40">{key}</td>
                  {products.map((p) => (
                    <td key={p.id} className="px-4 py-3 text-white/80">
                      {p.specs?.[key] || "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
