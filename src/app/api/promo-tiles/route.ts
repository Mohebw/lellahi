import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const tiles = await prisma.promoTile.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    select: { id: true, images: true, title: true, link: true, borderColor: true }
  });
  return NextResponse.json(tiles);
}
