import { prisma } from "@/lib/prisma";
import { ProductCard } from "./ProductCard";

export async function RelatedProducts({ categoryId, excludeId }: { categoryId: string; excludeId: string }) {
  const products = await prisma.product.findMany({
    where: { categoryId, isActive: true, id: { not: excludeId } },
    take: 4,
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { order: "asc" }, take: 1 } }
  });

  if (products.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="mb-4 text-base font-semibold text-white">محصولات مشابه</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
