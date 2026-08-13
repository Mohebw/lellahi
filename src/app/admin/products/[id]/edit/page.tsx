import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "ویرایش محصول" };

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: { orderBy: { order: "asc" } } }
  });
  if (!product) notFound();

  return (
    <AdminShell>
      <h1 className="mb-6 text-2xl font-bold text-white">ویرایش محصول</h1>
      <ProductForm
        productId={product.id}
        initial={{
          name: product.name,
          brand: product.brand,
          model: product.model,
          categoryId: product.categoryId,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          stock: product.stock,
          isActive: product.isActive,
          shortDescription: product.shortDescription || "",
          description: product.description || "",
          specs: (product.specs as Record<string, string>) || {},
          colors: product.colors,
          badge: product.badge,
          images: product.images.map((i) => i.url),
          videoUrl: product.videoUrl || ""
        }}
      />
    </AdminShell>
  );
}
