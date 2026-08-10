import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const models = await prisma.usedPhoneModel.findMany({ orderBy: [{ brand: "asc" }, { order: "asc" }] });
  return NextResponse.json(models);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.brand || !body?.name || typeof body?.basePrice !== "number") {
    return NextResponse.json({ error: "اطلاعات معتبر نیست" }, { status: 400 });
  }
  const model = await prisma.usedPhoneModel.create({
    data: {
      brand: body.brand,
      name: body.name,
      basePrice: body.basePrice,
      isActive: body.isActive ?? true,
      order: body.order ?? 0
    }
  });
  return NextResponse.json(model, { status: 201 });
}
