import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// "Bestseller" = products with the most combined purchase-requests + cart-order-items.
export async function GET() {
  const [requestCounts, orderItemCounts] = await Promise.all([
    prisma.purchaseRequest.groupBy({ by: ["productId"], _count: { productId: true } }),
    prisma.orderItem.groupBy({ by: ["productId"], _count: { productId: true } })
  ]);

  const scoreByProduct = new Map<string, number>();
  requestCounts.forEach((r) => scoreByProduct.set(r.productId, (scoreByProduct.get(r.productId) || 0) + r._count.productId));
  orderItemCounts.forEach((o) => scoreByProduct.set(o.productId, (scoreByProduct.get(o.productId) || 0) + o._count.productId));

  const topIds = Array.from(scoreByProduct.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([id]) => id);

  if (topIds.length === 0) {
    return NextResponse.json([]);
  }

  const products = await prisma.product.findMany({
    where: { id: { in: topIds }, isActive: true },
    include: { images: { orderBy: { order: "asc" }, take: 1 } }
  });

  const ordered = topIds.map((id) => products.find((p) => p.id === id)).filter(Boolean);
  return NextResponse.json(ordered);
}
