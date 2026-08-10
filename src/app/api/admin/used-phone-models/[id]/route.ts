import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "اطلاعات معتبر نیست" }, { status: 400 });

  try {
    const model = await prisma.usedPhoneModel.update({
      where: { id: params.id },
      data: {
        brand: body.brand,
        name: body.name,
        basePrice: body.basePrice,
        isActive: body.isActive,
        order: body.order
      }
    });
    return NextResponse.json(model);
  } catch {
    return NextResponse.json({ error: "مدل یافت نشد" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.usedPhoneModel.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "مدل یافت نشد" }, { status: 404 });
  }
}
