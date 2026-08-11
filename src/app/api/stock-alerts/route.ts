import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  productId: z.string().min(1),
  customerPhone: z.string().trim().regex(/^09\d{9}$/, "شماره تماس معتبر نیست")
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "شماره تماس معتبر نیست" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product) return NextResponse.json({ error: "محصول یافت نشد" }, { status: 404 });

  await prisma.stockAlert.create({ data: parsed.data });

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatIds = (process.env.TELEGRAM_ADMIN_CHAT_IDS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (token && chatIds.length > 0) {
    const text = `🔔 *درخواست اطلاع موجود شدن کالا*\n\n📦 محصول: ${product.name}\n📱 شماره مشتری: ${parsed.data.customerPhone}`;
    await Promise.all(
      chatIds.map((chatId) =>
        fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" })
        }).catch(() => null)
      )
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
