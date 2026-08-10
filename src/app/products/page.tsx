import type { Metadata } from "next";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/products/ProductCard";
import { Filters } from "@/components/products/Filters";
import { EmptyState } from "@/components/ui/States";

export const metadata: Metadata = {
  title: "همه محصولات",
  description: "خرید موبایل اپل، سامسونگ و شیائومی از فروشگاه للهی آمل."
};

export const revalidate = 30;

type SearchParams = {
  q?: string;
  category?: string;
  sort?: string;
  stock?: string;
};

async function getProducts(sp: SearchParams) {
  const where: Prisma.ProductWhereInput = { isActive: true };

  if (sp.q) {
    where.OR = [
      { name: { contains: sp.q, mode: "insensitive" } },
      { brand: { contains: sp.q, mode: "insensitive" } },
      { model: { contains: sp.q, mode: "insensitive" } }
    ];
  }
  if (sp.category) {
    where.category = { slug: sp.category };
  }
  if (sp.stock === "in") {
    where.stock = { gt: 0 };
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sp.sort === "cheapest"
      ? { price: "asc" }
      : sp.sort === "expensive"
      ? { price: "desc" }
      : { createdAt: "desc" };

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      include: { images: { orderBy: { order: "asc" }, take: 1 } }
    }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { order: "asc" } })
  ]);

  return { products, categories };
}

export default async function ProductsPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const { products, categories } = await getProducts(searchParams);

  return (
    <div className="container-lellahi py-10">
      <h1 className="mb-6 text-2xl font-bold text-white">همه محصولات</h1>
      <Filters categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} />

      {products.length === 0 ? (
        <EmptyState title="محصولی یافت نشد" description="فیلترها را تغییر دهید یا جستجوی دیگری را امتحان کنید." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
