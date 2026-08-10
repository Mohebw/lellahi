import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { products: true } } }
  });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "اطلاعات معتبر نیست", issues: parsed.error.flatten() }, { status: 400 });
  }

  const slug = slugify(parsed.data.name);
  const exists = await prisma.category.findUnique({ where: { slug } });
  if (exists) {
    return NextResponse.json({ error: "دسته‌بندی با این نام از قبل وجود دارد" }, { status: 409 });
  }

  const category = await prisma.category.create({
    data: { ...parsed.data, slug }
  });
  return NextResponse.json(category, { status: 201 });
}
