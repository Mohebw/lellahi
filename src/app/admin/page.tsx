import Link from "next/link";
import { Package, PackageX, PackageCheck, ClipboardList, Sparkles, PhoneCall } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatsCard } from "@/components/admin/StatsCard";
import { Badge } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/States";
import { relativeTimeFa } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_TONE = {
  NEW: "blue",
  IN_PROGRESS: "mustard",
  CONTACTED: "gray",
  COMPLETED: "green",
  CANCELLED: "red"
} as const;

const STATUS_LABEL = {
  NEW: "جدید",
  IN_PROGRESS: "در حال بررسی",
  CONTACTED: "تماس گرفته شد",
  COMPLETED: "تکمیل شد",
  CANCELLED: "لغو شد"
} as const;

export default async function AdminDashboardPage() {
  const session = await getSession();

  const [totalProducts, inStock, outOfStock, totalRequests, newRequests, recentRequests] =
    await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { stock: { gt: 0 } } }),
      prisma.product.count({ where: { stock: { lte: 0 } } }),
      prisma.purchaseRequest.count(),
      prisma.purchaseRequest.count({ where: { status: "NEW" } }),
      prisma.purchaseRequest.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: { product: true }
      })
    ]);

  return (
    <AdminShell adminName={session?.name}>
      <h1 className="mb-6 text-2xl font-bold text-white">داشبورد</h1>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatsCard icon={Package} label="کل محصولات" value={totalProducts} />
        <StatsCard icon={PackageCheck} label="موجود" value={inStock} tone="green" />
        <StatsCard icon={PackageX} label="ناموجود" value={outOfStock} tone="red" />
        <StatsCard icon={ClipboardList} label="کل درخواست‌ها" value={totalRequests} />
        <StatsCard icon={Sparkles} label="درخواست‌های جدید" value={newRequests} tone="mustard" />
      </div>

      <div className="glass-panel p-0">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-sm font-semibold text-white">آخرین درخواست‌های خرید</h2>
          <Link href="/admin/requests" className="text-xs text-mustard-400 hover:text-mustard-300">
            مشاهده همه
          </Link>
        </div>
        {recentRequests.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={PhoneCall} title="هنوز درخواستی ثبت نشده" />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {recentRequests.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-white">{r.customerName}</p>
                  <p className="text-xs text-white/40">
                    {r.product.name} · {relativeTimeFa(r.createdAt)}
                  </p>
                </div>
                <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
