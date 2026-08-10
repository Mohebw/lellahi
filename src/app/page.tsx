import Link from "next/link";
import { ArrowLeft, ShieldCheck, Truck, Headphones, BadgeCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/products/ProductCard";
import { HeroVisual } from "@/components/layout/HeroVisual";
import { CategoryIcon } from "@/components/products/CategoryIcon";
import { MagneticLink } from "@/components/ui/MagneticLink";

export const revalidate = 60;

async function getHomeData() {
  const [categories, featured] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      take: 4
    }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { images: { orderBy: { order: "asc" }, take: 1 } }
    })
  ]);
  return { categories, featured };
}

export default async function HomePage() {
  const { categories, featured } = await getHomeData();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container-lellahi grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-28">
          <div className="animate-fade-up">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-mustard-400/30 bg-mustard-400/10 px-3 py-1 text-xs text-mustard-300">
              فروشگاه للهی، آمل
            </span>
            <h1 className="mb-5 text-4xl font-extrabold leading-tight text-white sm:text-5xl">
              موبایل اصل،
              <br />
              مشاوره‌ی <span className="text-mustard-400">صادقانه</span>.
            </h1>
            <p className="mb-8 max-w-md text-white/60 leading-8">
              جدیدترین گوشی‌های اپل، سامسونگ و شیائومی را با گارانتی معتبر و بهترین قیمت از للهی
              بخواهید — بدون واسطه، با مشاوره‌ی تخصصی همکاران ما.
            </p>
            <div className="flex flex-wrap gap-3">
              <MagneticLink href="/products" className="btn-primary">
                مشاهده محصولات
                <ArrowLeft className="h-4 w-4" />
              </MagneticLink>
              <MagneticLink href="/contact" className="btn-secondary">
                تماس با فروشگاه
              </MagneticLink>
            </div>
          </div>
          <HeroVisual />
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-line bg-white/[0.02]">
        <div className="container-lellahi grid grid-cols-2 gap-6 py-8 sm:grid-cols-4">
          {[
            { icon: BadgeCheck, label: "کالای اصل و گارانتی‌دار" },
            { icon: ShieldCheck, label: "مشاوره تخصصی رایگان" },
            { icon: Truck, label: "ارسال سریع به سراسر کشور" },
            { icon: Headphones, label: "پشتیبانی پس از خرید" }
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <item.icon className="h-6 w-6 shrink-0 text-mustard-400" />
              <span className="text-sm text-white/70">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="container-lellahi py-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">دسته‌بندی محصولات</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="glass-panel glass-panel-hover group flex flex-col items-center gap-3 px-4 py-8 text-center"
              >
                <CategoryIcon slug={cat.slug} />
                <span className="text-sm font-medium text-white">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      <section className="container-lellahi pb-20">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">جدیدترین محصولات</h2>
          <Link href="/products" className="text-sm text-mustard-400 hover:text-mustard-300">
            مشاهده همه
          </Link>
        </div>
        {featured.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/40">هنوز محصولی ثبت نشده است.</p>
        )}
      </section>
    </>
  );
}
