import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const options = await prisma.usedPhoneFactorOption.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(options);
}
