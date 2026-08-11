import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  try {
    const review = await prisma.review.update({
      where: { id: params.id },
      data: { isApproved: body?.isApproved ?? true }
    });
    return NextResponse.json(review);
  } catch {
    return NextResponse.json({ error: "نظر یافت نشد" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.review.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "نظر یافت نشد" }, { status: 404 });
  }
}
