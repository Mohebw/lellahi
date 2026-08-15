"use client";

import { Scale } from "lucide-react";
import { useLocalStorageIds } from "@/lib/useLocalStorageIds";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

export function CompareButton({ productId, className }: { productId: string; className?: string }) {
  const { ids, ready, toggle } = useLocalStorageIds("lellahi_compare");
  const active = ready && ids.includes(productId);
  const { show } = useToast();

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!active && ids.length >= 3) {
          show("حداکثر ۳ محصول را می‌توانید مقایسه کنید", "error");
          return;
        }
        toggle(productId, 3);
      }}
      aria-label={active ? "حذف از مقایسه" : "افزودن به مقایسه"}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface-950/60 backdrop-blur-md transition-colors hover:border-mustard-400/40",
        className
      )}
    >
      <Scale className={cn("h-4 w-4 transition-colors", active ? "text-mustard-400" : "text-white/60")} />
    </button>
  );
}
