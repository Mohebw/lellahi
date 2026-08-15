"use client";

import { Heart } from "lucide-react";
import { useLocalStorageIds } from "@/lib/useLocalStorageIds";
import { cn } from "@/lib/utils";

export function WishlistButton({ productId, className }: { productId: string; className?: string }) {
  const { ids, ready, toggle } = useLocalStorageIds("lellahi_wishlist");
  const active = ready && ids.includes(productId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      aria-label={active ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface-950/60 backdrop-blur-md transition-colors hover:border-mustard-400/40",
        className
      )}
    >
      <Heart className={cn("h-4 w-4 transition-colors", active ? "fill-mustard-400 text-mustard-400" : "text-white/60")} />
    </button>
  );
}
