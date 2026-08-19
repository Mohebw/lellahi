"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { ProductCard, type ProductCardData } from "./ProductCard";

export function BestsellersRow() {
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/bestsellers")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  if (!loaded || products.length === 0) return null;

  return (
    <section className="container-lellahi pb-16">
      <div className="mb-6 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-mustard-400" />
        <h2 className="text-xl font-bold text-white">پرفروش‌ترین‌ها</h2>
      </div>
      <div className="scrollbar-none flex gap-4 overflow-x-auto pb-2">
        {products.map((p) => (
          <div key={p.id} className="w-40 shrink-0 sm:w-52">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
