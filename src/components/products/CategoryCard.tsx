import Link from "next/link";
import Image from "next/image";
import { CategoryIcon } from "./CategoryIcon";

type CategoryCardData = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
};

export function CategoryCard({ category }: { category: CategoryCardData }) {
  if (category.image) {
    return (
      <Link
        href={`/products?category=${category.slug}`}
        className="group relative block aspect-[4/5] overflow-hidden rounded-2xl border border-line shadow-glass transition-all duration-300 hover:border-mustard-400/30 hover:shadow-glow-mustard"
      >
        <Image
          src={category.image}
          alt={category.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />
        <span className="absolute bottom-4 right-0 left-0 text-center text-sm font-semibold text-white">
          {category.name}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={`/products?category=${category.slug}`}
      className="glass-panel glass-panel-hover group flex flex-col items-center gap-3 px-4 py-8 text-center"
    >
      <CategoryIcon slug={category.slug} />
      <span className="text-sm font-medium text-white">{category.name}</span>
    </Link>
  );
}
