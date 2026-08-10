import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Card";
import { ProductGallery } from "@/components/products/ProductGallery";
import { PurchaseCTA } from "@/components/products/PurchaseCTA";
import { formatToman } from "@/lib/utils";

export const revalidate = 60;

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { order: "asc" } },
      category: true
    }
  });
}

export async function generateMetadata({
  params
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.shortDescription || `خرید ${product.name} از فروشگاه للهی آمل`,
    openGraph: {
      title: product.name,
      description: product.shortDescription || undefined,
      images: product.images[0] ? [product.images[0].url] : undefined
    }
  };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product || !product.isActive) notFound();

  const specs = (product.specs as Record<string, string> | null) || {};
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((i) => i.url),
    description: product.shortDescription,
    brand: { "@type": "Brand", name: product.brand },
    offers: {
      "@type": "Offer",
      priceCurrency: "IRR",
      price: product.price * 10,
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  return (
    <div className="container-lellahi py-10">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} alt={product.name} />

        <div>
          <p className="mb-1 text-sm text-white/40">
            {product.category.name} / {product.brand}
          </p>
          <h1 className="mb-3 text-2xl font-bold text-white sm:text-3xl">{product.name}</h1>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            {product.badge === "NEW" && <Badge tone="blue">جدید</Badge>}
            {product.badge === "FEATURED" && <Badge tone="mustard">ویژه</Badge>}
            {product.badge === "DISCOUNT" && <Badge tone="red">تخفیف</Badge>}
            <Badge tone={product.stock > 0 ? "green" : "gray"}>
              {product.stock > 0 ? "موجود" : "ناموجود"}
            </Badge>
          </div>

          <div className="mb-6 flex items-baseline gap-3">
            <span className="font-mono text-2xl font-bold text-mustard-400">
              {formatToman(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="font-mono text-base text-white/30 line-through">
                {formatToman(product.compareAtPrice)}
              </span>
            )}
          </div>

          {product.shortDescription && (
            <p className="mb-6 leading-7 text-white/60">{product.shortDescription}</p>
          )}

          {product.colors.length > 0 && (
            <div className="mb-6">
              <p className="mb-2 text-sm text-white/50">رنگ‌بندی</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <span key={c} className="rounded-lg border border-line bg-white/5 px-3 py-1.5 text-sm text-white">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          <PurchaseCTA productId={product.id} productName={product.name} outOfStock={product.stock <= 0} />

          {Object.keys(specs).length > 0 && (
            <div className="glass-panel mt-8 divide-y divide-line p-0">
              {Object.entries(specs).map(([key, value]) => (
                <div key={key} className="flex justify-between px-5 py-3 text-sm">
                  <span className="text-white/50">{key}</span>
                  <span className="font-medium text-white">{value}</span>
                </div>
              ))}
            </div>
          )}

          {product.description && (
            <div className="mt-8">
              <h2 className="mb-2 text-base font-semibold text-white">توضیحات کامل</h2>
              <p className="whitespace-pre-line leading-7 text-white/60">{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
