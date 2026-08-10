"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "خانه" },
  { href: "/products", label: "همه محصولات" },
  { href: "/products?category=apple", label: "اپل" },
  { href: "/products?category=samsung", label: "سامسونگ" },
  { href: "/products?category=xiaomi", label: "شیائومی" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس با ما" }
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled
          ? "border-b border-line bg-ink-950/70 backdrop-blur-xl shadow-glass"
          : "bg-transparent"
      )}
    >
      <div className="container-lellahi flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="للهی" width={30} height={30} className="h-7 w-7" priority />
          <span className="text-lg font-bold tracking-tight text-white">
            للهی <span className="text-white/40 font-normal text-sm">Lellahi Tel</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/products"
            className="rounded-lg p-2 text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="جستجو"
          >
            <Search className="h-5 w-5" />
          </Link>
        </div>

        <button
          className="rounded-lg p-2 text-white lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="منو"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden border-t border-line bg-ink-950/95 backdrop-blur-xl lg:hidden"
          >
            <nav className="container-lellahi flex flex-col gap-1 py-3">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2.5 text-sm text-white/80 hover:bg-white/5"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
