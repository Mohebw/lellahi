import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { User, Package, MessageSquare, LogOut } from "lucide-react";
import { getCustomerSession } from "@/lib/customerAuth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/States";
import { formatToman, relativeTimeFa } from "@/lib/utils";
import { LogoutButton } from "./LogoutButton";

export const dynamic = "force-dynamic";

const STATUS_TONE = {
  NEW: "blue",
  IN_PROGRESS: "mustard",
  CONTACTED: "gray",
  COMPLETED: "green",
  CANCELLED: "red"
} as const;

const STATUS_LABEL = {
  NEW: "ثبت شده",
  IN_PROGRESS: "در حال بررسی",
  CONTACTED: "تماس گرفته شد",
  COMPLETED: "تکمیل شد",
  CANCELLED: "لغو شد"
} as const;

export default async function AccountPage() {
  const session = await getCustomerSession();
  if (!session) redirect("/account/login");

  const [purchaseRequests, orders, reviews] = await Promise.all([
    prisma.purchaseRequest.findMany({
      where: { customerPhone: session.phone },
      orderBy: { createdAt: "desc" },
      include: { product: { select: { name: true, price: true, images: { take: 1, orderBy: { order: "asc" } } } } }
    }),
    prisma.order.findMany({
      where: { customerPhone: session.phone },
      orderBy: { createdAt: "desc" },
      include: { items: { include: { product: { select: { name: true, images: { take: 1, orderBy: { order: "asc" } } } } } } }
    }),
    prisma.review.findMany({
      where: { customerPhone: session.phone },
      orderBy: { createdAt: "desc" },
      include: { product: { select: { name: true } } }
    })
  ]);

  const allOrders = [
    ...purchaseRequests.map((r) => ({
      id: r.id,
      trackingCode: r.trackingCode,
      status: r.status,
      createdAt: r.createdAt,
      total: r.product.price,
      items: [{ name: r.product.name, image: r.product.images[0]?.url || null, quantity: 1 }]
    })),
    ...orders.map((o) => ({
      id: o.id,
      trackingCode: o.trackingCode,
      status: o.status,
      createdAt: o.createdAt,
      total: o.items.reduce((s, it) => s + it.priceAtOrder * it.quantity, 0),
      items: o.items.map((it) => ({ name: it.product.name, image: it.product.images[0]?.url || null, quantity: it.quantity }))
    }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="container-lellahi py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mustard-400/15 text-mustard-400">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{session.name}</h1>
            <p className="font-mono text-sm text-white/40" dir="ltr">{session.phone}</p>
          </div>
        </div>
        <LogoutButton />
      </div>

      <section className="mb-10">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-white">
          <Package className="h-4 w-4 text-mustard-400" />
          سفارش‌های من
        </h2>
        {allOrders.length === 0 ? (
          <EmptyState icon={Package} title="هنوز سفارشی ثبت نکرده‌اید" />
        ) : (
          <div className="flex flex-col gap-3">
            {allOrders.map((o) => (
              <div key={o.id} className="glass-panel p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-xs text-white/40" dir="ltr">{o.trackingCode}</span>
                  <Badge tone={STATUS_TONE[o.status]}>{STATUS_LABEL[o.status]}</Badge>
                </div>
                <div className="mb-2 flex flex-wrap gap-3">
                  {o.items.map((it, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-white/5">
                        {it.image && <Image src={it.image} alt={it.name} fill className="object-contain p-1" />}
                      </div>
                      <span className="text-xs text-white/70">
                        {it.name} {it.quantity > 1 && `× ${it.quantity}`}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-white/40">
                  <span>{relativeTimeFa(o.createdAt)}</span>
                  <span className="font-mono text-mustard-400">{formatToman(o.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-white">
          <MessageSquare className="h-4 w-4 text-mustard-400" />
          نظرات من
        </h2>
        {reviews.length === 0 ? (
          <EmptyState icon={MessageSquare} title="هنوز نظری ثبت نکرده‌اید" />
        ) : (
          <div className="flex flex-col gap-3">
            {reviews.map((r) => (
              <div key={r.id} className="glass-panel p-4">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{r.product.name}</span>
                  <Badge tone={r.isApproved ? "green" : "gray"}>{r.isApproved ? "نمایش داده شده" : "در انتظار تایید"}</Badge>
                </div>
                <p className="text-sm text-white/60">{r.comment}</p>
                <p className="mt-1 text-xs text-white/30">{relativeTimeFa(r.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="mt-10 text-center">
        <Link href="/wishlist" className="text-sm text-mustard-400 hover:text-mustard-300">
          مشاهده لیست علاقه‌مندی‌ها ←
        </Link>
      </div>
    </div>
  );
}
