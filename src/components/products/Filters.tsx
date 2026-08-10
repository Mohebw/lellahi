"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export function Filters({
  categories
}: {
  categories: { slug: string; name: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [, startTransition] = useTransition();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  return (
    <div className="glass-panel mb-8 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
      <form
        className="relative flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          updateParam("q", q);
        }}
      >
        <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="جستجوی نام، برند یا مدل..."
          className="pr-10"
        />
      </form>

      <div className="flex flex-wrap gap-3">
        <Select
          defaultValue={searchParams.get("category") || ""}
          onChange={(e) => updateParam("category", e.target.value)}
          className="min-w-[130px]"
        >
          <option value="">همه دسته‌ها</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </Select>

        <Select
          defaultValue={searchParams.get("sort") || "newest"}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="min-w-[130px]"
        >
          <option value="newest">جدیدترین</option>
          <option value="cheapest">ارزان‌ترین</option>
          <option value="expensive">گران‌ترین</option>
        </Select>

        <Select
          defaultValue={searchParams.get("stock") || ""}
          onChange={(e) => updateParam("stock", e.target.value)}
          className="min-w-[110px]"
        >
          <option value="">همه</option>
          <option value="in">موجود</option>
        </Select>
      </div>

      <SlidersHorizontal className="hidden h-4 w-4 shrink-0 text-white/30 sm:block" />
    </div>
  );
}
