"use client";

import { useState } from "react";
import Image from "next/image";

export function ProductGallery({
  images,
  alt
}: {
  images: { url: string }[];
  alt: string;
}) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative mb-4 aspect-square overflow-hidden rounded-2xl bg-white/5">
        {images[active] ? (
          <Image
            src={images[active].url}
            alt={alt}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain p-6"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-white/20">بدون تصویر</div>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((img, i) => (
            <button
              key={img.url + i}
              onClick={() => setActive(i)}
              className={`relative h-16 w-16 overflow-hidden rounded-lg border transition-colors ${
                active === i ? "border-mustard-400" : "border-line"
              }`}
              aria-label={`تصویر ${i + 1}`}
            >
              <Image src={img.url} alt="" fill className="object-contain p-1.5" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
