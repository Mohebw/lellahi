import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Card";
import { WishlistButton } from "./WishlistButton";
import { CompareButton } from "./CompareButton";
import { AddToCartButton } from "./AddToCartButton";
import { formatToman } from "@/lib/utils";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  badge: "NONE" | "NEW" | "FEATURED" | "DISCOUNT" | "OUT_OF_STOCK";
  images: { url: string }[];
};

const badgeMap = {
  NEW: { label: "جدید", tone: "blue" as const },
  FEATURED: { label: "ویژه", tone: "mustard" as const },
  DISCOUNT: { label: "تخفیف", tone: "red" as const },
  OUT_OF_STOCK: { label: "ناموجود", tone: "gray" as const },
  NONE: null
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const badge = badgeMap[product.badge];
  const outOfStock = product.stock <= 0;
  const image = product.images[0]?.url;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="glass-panel glass-panel-hover group block overflow-hidden p-4"
    >
      <div className="relative mb-4 aspect-square overflow-hidden rounded-xl bg-white/5">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-white/20 text-xs">بدون تصویر</div>
        )}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5">
          {badge && <Badge tone={badge.tone}>{badge.label}</Badge>}
          {outOfStock && <Badge tone="gray">ناموجود</Badge>}
        </div>
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          <WishlistButton productId={product.id} />
          <CompareButton productId={product.id} />
          <AddToCartButton productId={product.id} outOfStock={outOfStock} />
        </div>
      </div>
      <p className="text-xs text-white/40">{product.brand}</p>
      <h3 className="mb-2 line-clamp-1 text-sm font-medium text-white">{product.name}</h3>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-sm font-semibold text-mustard-400">
          {formatToman(product.price)}
        </span>
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <span className="font-mono text-xs text-white/30 line-through">
            {formatToman(product.compareAtPrice)}
          </span>
        )}
      </div>
    </Link>
  );
}
