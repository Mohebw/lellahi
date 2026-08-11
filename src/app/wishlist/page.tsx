"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useLocalStorageIds } from "@/lib/useLocalStorageIds";
import { ProductCard, type ProductCardData } from "@/components/products/ProductCard";
import { EmptyState } from "@/components/ui/States";

export default function WishlistPage() {
  const { ids, ready } = useLocalStorageIds("lellahi_wishlist");
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    fetch(`/api/products-by-ids?ids=${ids.join(",")}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  }, [ready, ids]);

  return (
    <div className="container-lellahi py-10">
      <h1 className="mb-6 text-2xl font-bold text-white">علاقه‌مندی‌های من</h1>
      {loading ? (
        <p className="text-sm text-white/40">در حال بارگذاری...</p>
      ) : products.length === 0 ? (
        <EmptyState icon={Heart} title="لیست علاقه‌مندی‌ها خالی است" description="روی آیکون قلب هر محصول بزنید تا اینجا اضافه شود." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
