import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, createCustomerSession } from "@/lib/customerAuth";

const schema = z.object({
  name: z.string().trim().min(2, "نام باید حداقل ۲ حرف باشد").max(60),
  phone: z
    .string()
    .trim()
    .regex(/^09\d{9}$/, "شماره تماس معتبر نیست (مثال: 09121234567)"),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد")
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "اطلاعات معتبر نیست" },
      { status: 400 }
    );
  }

  const exists = await prisma.customer.findUnique({ where: { phone: parsed.data.phone } });
  if (exists) {
    return NextResponse.json({ error: "این شماره قبلاً ثبت‌نام کرده — وارد شوید" }, { status: 409 });
  }

  const customer = await prisma.customer.create({
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      passwordHash: await hashPassword(parsed.data.password)
    }
  });

  await createCustomerSession({ customerId: customer.id, phone: customer.phone, name: customer.name });

  return NextResponse.json({ ok: true }, { status: 201 });
}
