"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PurchaseModal } from "./PurchaseModal";

export function PurchaseCTA({
  productId,
  productName,
  outOfStock
}: {
  productId: string;
  productName: string;
  outOfStock: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="lg" className="w-full sm:w-auto" disabled={outOfStock} onClick={() => setOpen(true)}>
        <ShoppingBag className="h-5 w-5" />
        {outOfStock ? "ناموجود" : "درخواست خرید"}
      </Button>
      <PurchaseModal open={open} onClose={() => setOpen(false)} productId={productId} productName={productName} />
    </>
  );
}
