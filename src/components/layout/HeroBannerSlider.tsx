"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Banner = { id: string; image: string; title: string | null; link: string | null };

export function HeroBannerSlider() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/banners")
      .then((r) => r.json())
      .then((data) => {
        setBanners(data);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const next = useCallback(() => setIndex((i) => (i + 1) % banners.length), [banners.length]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + banners.length) % banners.length), [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(next, 4500);
    return () => clearInterval(timer);
  }, [banners.length, next]);

  if (!loaded || banners.length === 0) return null;

  const current = banners[index];

  const slideContent = (
    <>
      <Image
        src={current.image}
        alt={current.title || "بنر تبلیغاتی"}
        fill
        priority={index === 0}
        sizes="100vw"
        className="object-cover"
      />
      {current.title && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/80 to-transparent p-4 sm:p-6">
          <p className="text-sm font-semibold text-white sm:text-lg">{current.title}</p>
        </div>
      )}
    </>
  );

  return (
    <section className="container-lellahi pt-6">
      <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl border border-line shadow-glass sm:aspect-[3/1]">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0"
          >
            {current.link ? (
              <Link href={current.link} className="relative block h-full w-full">
                {slideContent}
              </Link>
            ) : (
              <div className="relative block h-full w-full">{slideContent}</div>
            )}
          </motion.div>
        </AnimatePresence>

        {banners.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="بنر قبلی"
              className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-ink-950/60 text-white backdrop-blur-md transition-colors hover:bg-ink-950/80"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              aria-label="بنر بعدی"
              className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-ink-950/60 text-white backdrop-blur-md transition-colors hover:bg-ink-950/80"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {banners.map((b, i) => (
                <button
                  key={b.id}
                  onClick={() => setIndex(i)}
                  aria-label={`بنر ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-mustard-400" : "w-1.5 bg-white/40"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
