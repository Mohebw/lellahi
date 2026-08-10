import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const parsed = categorySchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "اطلاعات معتبر نیست", issues: parsed.error.flatten() }, { status: 400 });
  }

  const data: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.name) data.slug = slugify(parsed.data.name);

  const category = await prisma.category
    .update({ where: { id: params.id }, data })
    .catch(() => null);

  if (!category) return NextResponse.json({ error: "دسته‌بندی یافت نشد" }, { status: 404 });
  return NextResponse.json(category);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const productCount = await prisma.product.count({ where: { categoryId: params.id } });
  if (productCount > 0) {
    return NextResponse.json(
      { error: "این دسته‌بندی دارای محصول است و قابل حذف نیست. ابتدا محصولات را جابه‌جا یا حذف کنید." },
      { status: 409 }
    );
  }

  await prisma.category.delete({ where: { id: params.id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
