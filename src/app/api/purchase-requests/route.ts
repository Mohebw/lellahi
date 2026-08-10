import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { purchaseRequestSchema } from "@/lib/validations";
import { notifyAdminsOfPurchaseRequest } from "@/lib/telegram";

// Very small in-memory rate limiter (per-instance). Good enough to blunt spam bursts;
// for multi-instance deployments swap for a Redis-backed limiter.
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

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "تعداد درخواست‌ها بیش از حد مجاز است" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = purchaseRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "اطلاعات ارسالی معتبر نیست", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product) {
    return NextResponse.json({ error: "محصول یافت نشد" }, { status: 404 });
  }

  // 1. Persist the request first — the customer's request must never be lost,
  //    even if the Telegram notification below fails.
  const request = await prisma.purchaseRequest.create({
    data: {
      productId: product.id,
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      message: parsed.data.message || null
    }
  });

  // 2. Best-effort Telegram notification.
  const sent = await notifyAdminsOfPurchaseRequest(request, product).catch(() => false);
  if (sent) {
    await prisma.purchaseRequest.update({ where: { id: request.id }, data: { telegramSent: true } });
  }

  return NextResponse.json({ id: request.id }, { status: 201 });
}
