"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Search, Heart, Scale, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useCartCount } from "@/lib/useCart";

const LINKS = [
  { href: "/", label: "خانه" },
  { href: "/products", label: "همه محصولات" },
  { href: "/products?category=apple", label: "اپل" },
  { href: "/products?category=samsung", label: "سامسونگ" },
  { href: "/products?category=xiaomi", label: "شیائومی" },
  { href: "/products?category=jbl", label: "JBL" },
  { href: "/used-phones", label: "قیمت گوشی دست‌دوم" },
  { href: "/track-order", label: "پیگیری سفارش" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس با ما" }
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const cartCount = useCartCount();

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
          ? "border-b border-line bg-surface-950/70 backdrop-blur-xl shadow-glass"
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
          <Link
            href="/wishlist"
            className="rounded-lg p-2 text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="علاقه‌مندی‌ها"
          >
            <Heart className="h-5 w-5" />
          </Link>
          <Link
            href="/compare"
            className="rounded-lg p-2 text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="مقایسه محصولات"
          >
            <Scale className="h-5 w-5" />
          </Link>
          <Link
            href="/cart"
            className="relative rounded-lg p-2 text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="سبد خرید"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -left-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-mustard-400 text-[10px] font-bold text-ink-950">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>
          <Link
            href="/account"
            className="rounded-lg p-2 text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="حساب کاربری"
          >
            <User className="h-5 w-5" />
          </Link>
          <ThemeToggle />
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
            className="overflow-hidden border-t border-line bg-surface-950/95 backdrop-blur-xl lg:hidden"
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
              <div className="mt-2 flex items-center gap-2 border-t border-line px-3 pt-3">
                <Link
                  href="/wishlist"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/5 py-2.5 text-xs text-white/70"
                >
                  <Heart className="h-4 w-4" />
                  علاقه‌مندی‌ها
                </Link>
                <Link
                  href="/compare"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/5 py-2.5 text-xs text-white/70"
                >
                  <Scale className="h-4 w-4" />
                  مقایسه
                </Link>
                <Link
                  href="/cart"
                  className="relative flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/5 py-2.5 text-xs text-white/70"
                >
                  <ShoppingBag className="h-4 w-4" />
                  سبد خرید
                  {cartCount > 0 && (
                    <span className="absolute top-1 left-6 flex h-4 w-4 items-center justify-center rounded-full bg-mustard-400 text-[9px] font-bold text-ink-950">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </Link>
              </div>
              <Link
                href="/account"
                className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-white/80 hover:bg-white/5"
              >
                <User className="h-4 w-4" />
                حساب کاربری
              </Link>
              <div className="flex items-center justify-between px-3 pt-2">
                <span className="text-sm text-white/50">حالت نمایش</span>
                <ThemeToggle className="rounded-lg p-2 text-white/70 hover:bg-white/5 hover:text-white" />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
