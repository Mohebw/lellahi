import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Body: { modelId: string, batteryHealth: number, optionIds: string[] }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.modelId || typeof body?.batteryHealth !== "number" || !Array.isArray(body?.optionIds)) {
    return NextResponse.json({ error: "اطلاعات ارسالی معتبر نیست" }, { status: 400 });
  }

  const [model, options, batterySetting] = await Promise.all([
    prisma.usedPhoneModel.findUnique({ where: { id: body.modelId } }),
    prisma.usedPhoneFactorOption.findMany({ where: { id: { in: body.optionIds } } }),
    prisma.usedPhoneBatterySetting.upsert({
      where: { id: "default" },
      update: {},
      create: { id: "default" }
    })
  ]);

  if (!model || !model.isActive) {
    return NextResponse.json({ error: "مدل یافت نشد" }, { status: 404 });
  }

  const batteryHealth = Math.max(0, Math.min(100, body.batteryHealth));
  const batteryDeductionPercent =
    batteryHealth < batterySetting.thresholdPercent
      ? (batterySetting.thresholdPercent - batteryHealth) * batterySetting.percentPerPointBelow
      : 0;

  const breakdown = [
    ...options.map((o) => ({ label: `${o.groupLabel}: ${o.optionLabel}`, percent: o.percent })),
    ...(batteryDeductionPercent > 0
      ? [{ label: `سلامت باتری (${batteryHealth}٪)`, percent: -batteryDeductionPercent }]
      : [])
  ];

  const totalDeductionPercent = Math.min(
    95,
    options.reduce((sum, o) => sum + Math.abs(o.percent), 0) + batteryDeductionPercent
  );

  const estimatedPrice = Math.round((model.basePrice * (100 - totalDeductionPercent)) / 100);

  return NextResponse.json({
    modelName: `${model.brand} ${model.name}`,
    basePrice: model.basePrice,
    totalDeductionPercent: Math.round(totalDeductionPercent * 10) / 10,
    estimatedPrice: Math.max(0, estimatedPrice),
    breakdown
  });
}
