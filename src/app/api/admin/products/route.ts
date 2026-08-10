import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || undefined;

  const products = await prisma.product.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { brand: { contains: q, mode: "insensitive" } }
          ]
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { order: "asc" }, take: 1 }, category: true }
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "اطلاعات معتبر نیست", issues: parsed.error.flatten() }, { status: 400 });
  }

  const baseSlug = slugify(`${parsed.data.brand}-${parsed.data.name}`);
  let slug = baseSlug;
  let i = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++i}`;
  }

  const { images, ...productData } = parsed.data;

  const product = await prisma.product.create({
    data: {
      ...productData,
      slug,
      shortDescription: productData.shortDescription || null,
      description: productData.description || null,
      colors: productData.colors || [],
      images: images?.length
        ? { create: images.map((url, order) => ({ url, order })) }
        : undefined
    },
    include: { images: true }
  });

  return NextResponse.json(product, { status: 201 });
}
