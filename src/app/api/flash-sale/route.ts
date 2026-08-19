import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const setting = await prisma.flashSaleSetting.findFirst();
  if (!setting || setting.endsAt <= new Date()) {
    return NextResponse.json({ active: false });
  }
  const products = await prisma.product.findMany({
    where: { isFlashSale: true, isActive: true },
    take: 8,
    include: { images: { orderBy: { order: "asc" }, take: 1 } }
  });
  if (products.length === 0) return NextResponse.json({ active: false });
  return NextResponse.json({ active: true, title: setting.title, endsAt: setting.endsAt, products });
}
