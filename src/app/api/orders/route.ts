import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { notifyAdminsOfOrder } from "@/lib/telegram";
import { generateTrackingCode } from "@/lib/utils";

const orderSchema = z.object({
  customerName: z.string().trim().min(2, "نام باید حداقل ۲ حرف باشد").max(80),
  customerPhone: z
    .string()
    .trim()
    .regex(/^09\d{9}$/, "شماره تماس معتبر نیست (مثال: 09121234567)"),
  message: z.string().trim().max(500).optional().or(z.literal("")),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().min(1).max(20)
      })
    )
    .min(1, "سبد خرید خالی است")
});

// Small in-memory rate limiter, mirrors the purchase-requests endpoint.
const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_HITS = 5;
function isRateLimited(ip: string) {
  const now = Date.now();
  const timestamps = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  hits.set(ip, timestamps);
  return timestamps.length > MAX_HITS;
}

async function uniqueTrackingCode() {
  for (let i = 0; i < 8; i++) {
    const code = generateTrackingCode();
    const exists = await prisma.order.findUnique({ where: { trackingCode: code } });
    if (!exists) return code;
  }
  return `LLH-${Date.now().toString(36).toUpperCase()}`;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "تعداد درخواست‌ها بیش از حد مجاز است" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "اطلاعات ارسالی معتبر نیست", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const productIds = parsed.data.items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  if (products.length === 0) {
    return NextResponse.json({ error: "هیچ محصول معتبری در سبد یافت نشد" }, { status: 404 });
  }

  const trackingCode = await uniqueTrackingCode();

  // 1. Persist the order first — must never be lost even if Telegram fails below.
  const order = await prisma.order.create({
    data: {
      trackingCode,
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      message: parsed.data.message || null,
      items: {
        create: parsed.data.items
          .filter((i) => products.some((p) => p.id === i.productId))
          .map((i) => {
            const product = products.find((p) => p.id === i.productId)!;
            return { productId: product.id, quantity: i.quantity, priceAtOrder: product.price };
          })
      }
    },
    include: { items: { include: { product: true } } }
  });

  // 2. Best-effort Telegram notification.
  const sent = await notifyAdminsOfOrder(
    order,
    order.items.map((it) => ({ productName: it.product.name, quantity: it.quantity, priceAtOrder: it.priceAtOrder }))
  ).catch(() => false);
  if (sent) {
    await prisma.order.update({ where: { id: order.id }, data: { telegramSent: true } });
  }

  return NextResponse.json({ id: order.id, trackingCode: order.trackingCode }, { status: 201 });
}
