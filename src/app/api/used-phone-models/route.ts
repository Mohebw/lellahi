import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const models = await prisma.usedPhoneModel.findMany({
    where: { isActive: true },
    orderBy: [{ brand: "asc" }, { order: "asc" }],
    select: { id: true, brand: true, name: true }
  });
  return NextResponse.json(models);
}
