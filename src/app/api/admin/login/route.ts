import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "اطلاعات ورود معتبر نیست" }, { status: 400 });
  }

  const admin = await prisma.admin.findUnique({ where: { email: parsed.data.email } });
  if (!admin) {
    return NextResponse.json({ error: "ایمیل یا رمز عبور اشتباه است" }, { status: 401 });
  }

  const ok = await verifyPassword(parsed.data.password, admin.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "ایمیل یا رمز عبور اشتباه است" }, { status: 401 });
  }

  await createSession({ adminId: admin.id, email: admin.email, name: admin.name, role: admin.role });

  return NextResponse.json({ ok: true });
}
