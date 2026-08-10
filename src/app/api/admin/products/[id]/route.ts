import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: { orderBy: { order: "asc" } } }
  });
  if (!product) return NextResponse.json({ error: "محصول یافت نشد" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const parsed = productSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "اطلاعات معتبر نیست", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { images, ...productData } = parsed.data;

  try {
    const product = await prisma.$transaction(async (tx) => {
      if (images) {
        await tx.productImage.deleteMany({ where: { productId: params.id } });
        await tx.productImage.createMany({
          data: images.map((url, order) => ({ productId: params.id, url, order }))
        });
      }
      return tx.product.update({
        where: { id: params.id },
        data: productData,
        include: { images: { orderBy: { order: "asc" } } }
      });
    });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "محصول یافت نشد" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "محصول یافت نشد" }, { status: 404 });
  }
}
