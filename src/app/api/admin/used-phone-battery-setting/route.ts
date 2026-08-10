import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const setting = await prisma.usedPhoneBatterySetting.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" }
  });
  return NextResponse.json(setting);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (typeof body?.thresholdPercent !== "number" || typeof body?.percentPerPointBelow !== "number") {
    return NextResponse.json({ error: "اطلاعات معتبر نیست" }, { status: 400 });
  }
  const setting = await prisma.usedPhoneBatterySetting.upsert({
    where: { id: "default" },
    update: { thresholdPercent: body.thresholdPercent, percentPerPointBelow: body.percentPerPointBelow },
    create: {
      id: "default",
      thresholdPercent: body.thresholdPercent,
      percentPerPointBelow: body.percentPerPointBelow
    }
  });
  return NextResponse.json(setting);
}
