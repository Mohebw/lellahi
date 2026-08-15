"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/lib/useCart";
import { cn } from "@/lib/utils";

export function AddToCartButton({
  productId,
  outOfStock,
  variant = "icon",
  className
}: {
  productId: string;
  outOfStock?: boolean;
  variant?: "icon" | "full";
  className?: string;
}) {
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    addToCart(productId, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={handleAdd}
        disabled={outOfStock}
        className={cn("btn-secondary w-full sm:w-auto", outOfStock && "opacity-50 pointer-events-none", className)}
      >
        {justAdded ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
        {justAdded ? "اضافه شد" : "افزودن به سبد"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={outOfStock}
      aria-label="افزودن به سبد خرید"
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface-950/60 backdrop-blur-md transition-colors hover:border-mustard-400/40",
        outOfStock && "opacity-40 pointer-events-none",
        className
      )}
    >
      {justAdded ? (
        <Check className="h-4 w-4 text-emerald-400" />
      ) : (
        <ShoppingBag className="h-4 w-4 text-white/60" />
      )}
    </button>
  );
}
