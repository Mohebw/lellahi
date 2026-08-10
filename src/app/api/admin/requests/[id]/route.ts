import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requestStatusSchema } from "@/lib/validations";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const parsed = requestStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "وضعیت معتبر نیست" }, { status: 400 });
  }

  try {
    const request = await prisma.purchaseRequest.update({
      where: { id: params.id },
      data: { status: parsed.data.status }
    });
    return NextResponse.json(request);
  } catch {
    return NextResponse.json({ error: "درخواست یافت نشد" }, { status: 404 });
  }
}
