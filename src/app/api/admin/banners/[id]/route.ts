import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "اطلاعات معتبر نیست" }, { status: 400 });
  try {
    const banner = await prisma.banner.update({
      where: { id: params.id },
      data: {
        image: body.image,
        title: body.title,
        link: body.link,
        order: body.order,
        isActive: body.isActive
      }
    });
    return NextResponse.json(banner);
  } catch {
    return NextResponse.json({ error: "بنر یافت نشد" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.banner.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "بنر یافت نشد" }, { status: 404 });
  }
}
