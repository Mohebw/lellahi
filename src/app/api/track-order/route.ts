import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { trackOrderSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = trackOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "اطلاعات وارد شده معتبر نیست" }, { status: 400 });
  }

  const code = parsed.data.trackingCode.trim().toUpperCase();
  const phone = parsed.data.customerPhone;

  // 1. Try a single-product purchase request first (from a product page's "درخواست خرید").
  const purchaseRequest = await prisma.purchaseRequest.findUnique({
    where: { trackingCode: code },
    include: { product: { select: { name: true, price: true, images: { take: 1, orderBy: { order: "asc" } } } } }
  });
  if (purchaseRequest && purchaseRequest.customerPhone === phone) {
    return NextResponse.json({
      type: "single",
      trackingCode: purchaseRequest.trackingCode,
      status: purchaseRequest.status,
      items: [{ name: purchaseRequest.product.name, image: purchaseRequest.product.images[0]?.url || null, price: purchaseRequest.product.price, quantity: 1 }],
      total: purchaseRequest.product.price,
      createdAt: purchaseRequest.createdAt,
      updatedAt: purchaseRequest.updatedAt,
      message: purchaseRequest.message
    });
  }

  // 2. Otherwise try a multi-item cart order (from /cart checkout).
  const order = await prisma.order.findUnique({
    where: { trackingCode: code },
    include: { items: { include: { product: { select: { name: true, images: { take: 1, orderBy: { order: "asc" } } } } } } }
  });
  if (order && order.customerPhone === phone) {
    return NextResponse.json({
      type: "multi",
      trackingCode: order.trackingCode,
      status: order.status,
      items: order.items.map((it) => ({
        name: it.product.name,
        image: it.product.images[0]?.url || null,
        price: it.priceAtOrder,
        quantity: it.quantity
      })),
      total: order.items.reduce((sum, it) => sum + it.priceAtOrder * it.quantity, 0),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      message: order.message
    });
  }

  return NextResponse.json({ error: "سفارشی با این مشخصات یافت نشد" }, { status: 404 });
}
