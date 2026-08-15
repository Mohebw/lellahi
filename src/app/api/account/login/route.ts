import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createCustomerSession } from "@/lib/customerAuth";

const schema = z.object({
  phone: z.string().trim().regex(/^09\d{9}$/, "شماره تماس معتبر نیست"),
  password: z.string().min(1, "رمز عبور را وارد کنید")
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "اطلاعات ورود معتبر نیست" }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({ where: { phone: parsed.data.phone } });
  if (!customer) {
    return NextResponse.json({ error: "شماره یا رمز عبور اشتباه است" }, { status: 401 });
  }

  const ok = await verifyPassword(parsed.data.password, customer.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "شماره یا رمز عبور اشتباه است" }, { status: 401 });
  }

  await createCustomerSession({ customerId: customer.id, phone: customer.phone, name: customer.name });

  return NextResponse.json({ ok: true });
}
