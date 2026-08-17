import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const banners = await prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    select: { id: true, image: true, title: true, link: true }
  });
  return NextResponse.json(banners);
}
