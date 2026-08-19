"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { formatToman } from "@/lib/utils";

type SearchProduct = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  images: { url: string }[];
};

export function LiveSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/products-search?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then(setResults)
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  function goToAllResults() {
    setOpen(false);
    router.push(`/products?q=${encodeURIComponent(query)}`);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg p-2 text-white/70 transition-colors hover:bg-white/5 hover:text-white"
        aria-label="جستجو"
      >
        <Search className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute left-0 top-12 z-50 w-80 sm:w-96">
          <div className="glass-panel p-3">
            <div className="relative mb-2">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && query.trim() && goToAllResults()}
                placeholder="جستجوی نام، برند یا مدل..."
                className="w-full rounded-xl border border-line bg-white/5 py-2.5 pr-10 pl-8 text-sm text-white placeholder:text-white/30 focus:border-mustard-400/50 focus:outline-none"
              />
              {loading && <Loader2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-white/30" />}
              {!loading && query && (
                <button onClick={() => setQuery("")} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {results.length > 0 && (
              <div className="flex flex-col gap-1">
                {results.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/5"
                  >
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white/5">
                      {p.images[0] && <Image src={p.images[0].url} alt={p.name} fill className="object-contain p-1" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-white">{p.name}</p>
                      <p className="font-mono text-xs text-mustard-400">{formatToman(p.price)}</p>
                    </div>
                  </Link>
                ))}
                <button
                  onClick={goToAllResults}
                  className="mt-1 rounded-lg py-2 text-center text-xs text-mustard-400 hover:bg-white/5"
                >
                  مشاهده همه نتایج ←
                </button>
              </div>
            )}

            {query.trim().length >= 2 && !loading && results.length === 0 && (
              <p className="py-3 text-center text-xs text-white/40">نتیجه‌ای یافت نشد</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
