"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Tile = { id: string; images: string[]; title: string | null; link: string | null; borderColor: string };

export function PromoTileCard({ tile }: { tile: Tile }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (tile.images.length <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % tile.images.length), 2800);
    return () => clearInterval(timer);
  }, [tile.images.length]);

  const content = (
    <div
      className="group relative aspect-[16/10] w-full overflow-hidden rounded-2xl border-2 transition-shadow duration-300"
      style={{ borderColor: tile.borderColor, boxShadow: `0 0 24px 0 ${tile.borderColor}33` }}
    >
      {tile.images.map((img, i) => (
        <Image
          key={img + i}
          src={img}
          alt={tile.title || ""}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-opacity duration-700"
          style={{ opacity: i === index ? 1 : 0 }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent transition-opacity duration-300 group-hover:from-ink-950/85" />
      {tile.title && (
        <span className="absolute bottom-4 right-4 text-sm font-bold text-white sm:text-base">{tile.title}</span>
      )}
    </div>
  );

  return tile.link ? <Link href={tile.link}>{content}</Link> : content;
}
