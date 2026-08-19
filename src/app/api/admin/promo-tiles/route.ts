import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const tiles = await prisma.promoTile.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(tiles);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.images || body.images.length === 0) {
    return NextResponse.json({ error: "حداقل یک تصویر الزامی است" }, { status: 400 });
  }
  const tile = await prisma.promoTile.create({
    data: {
      images: body.images,
      title: body.title || null,
      link: body.link || null,
      borderColor: body.borderColor || "#FCCF04",
      order: body.order ?? 0,
      isActive: body.isActive ?? true
    }
  });
  return NextResponse.json(tile, { status: 201 });
}
