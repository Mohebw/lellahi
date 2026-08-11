import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const reviewSchema = z.object({
  productId: z.string().min(1),
  customerName: z.string().trim().min(2).max(60),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(5).max(500)
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "شناسه محصول لازم است" }, { status: 400 });

  const reviews = await prisma.review.findMany({
    where: { productId, isApproved: true },
    orderBy: { createdAt: "desc" }
  });
  const avg =
    reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;

  return NextResponse.json({ reviews, average: avg, count: reviews.length });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "اطلاعات وارد شده معتبر نیست" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product) return NextResponse.json({ error: "محصول یافت نشد" }, { status: 404 });

  await prisma.review.create({ data: parsed.data });
  return NextResponse.json({ ok: true, message: "نظر شما ثبت شد و پس از بررسی نمایش داده می‌شود" }, { status: 201 });
}
