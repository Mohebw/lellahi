import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const options = await prisma.usedPhoneFactorOption.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(options);
}

// Body: { updates: [{ id: string, percent: number }, ...] }
export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!Array.isArray(body?.updates)) {
    return NextResponse.json({ error: "اطلاعات معتبر نیست" }, { status: 400 });
  }

  try {
    await prisma.$transaction(
      body.updates.map((u: { id: string; percent: number }) =>
        prisma.usedPhoneFactorOption.update({
          where: { id: u.id },
          data: { percent: u.percent }
        })
      )
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "خطا در به‌روزرسانی" }, { status: 400 });
  }
}
