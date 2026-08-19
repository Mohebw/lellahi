import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const setting = await prisma.flashSaleSetting.findFirst();
  return NextResponse.json(setting);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.endsAt) {
    return NextResponse.json({ error: "زمان پایان الزامی است" }, { status: 400 });
  }
  const existing = await prisma.flashSaleSetting.findFirst();
  const setting = existing
    ? await prisma.flashSaleSetting.update({
        where: { id: existing.id },
        data: { title: body.title || "پیشنهاد شگفت‌انگیز", endsAt: new Date(body.endsAt) }
      })
    : await prisma.flashSaleSetting.create({
        data: { title: body.title || "پیشنهاد شگفت‌انگیز", endsAt: new Date(body.endsAt) }
      });
  return NextResponse.json(setting);
}
