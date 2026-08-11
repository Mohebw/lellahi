"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Instagram, MessageCircle, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="mt-20 border-t border-line bg-ink-900/50">
      <div className="container-lellahi grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Image src="/logo.png" alt="للهی" width={26} height={26} />
            <span className="font-bold text-white">للهی | Lellahi Tel</span>
          </div>
          <p className="text-sm leading-6 text-white/50">
            فروشگاه تخصصی موبایل و لوازم دیجیتال در آمل — کیفیت اصل، مشاوره صادقانه.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">دسترسی سریع</h4>
          <ul className="space-y-2 text-sm text-white/50">
            <li><Link href="/products" className="hover:text-mustard-400">همه محصولات</Link></li>
            <li><Link href="/warranty" className="hover:text-mustard-400">گارانتی و مرجوعی</Link></li>
            <li><Link href="/about" className="hover:text-mustard-400">درباره ما</Link></li>
            <li><Link href="/contact" className="hover:text-mustard-400">تماس با ما</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">دسته‌بندی‌ها</h4>
          <ul className="space-y-2 text-sm text-white/50">
            <li><Link href="/products?category=apple" className="hover:text-mustard-400">اپل</Link></li>
            <li><Link href="/products?category=samsung" className="hover:text-mustard-400">سامسونگ</Link></li>
            <li><Link href="/products?category=xiaomi" className="hover:text-mustard-400">شیائومی</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">تماس با ما</h4>
          <ul className="space-y-2.5 text-sm text-white/50">
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-mustard-400 mt-0.5" />
              آمل، خیابان هراز، بین آفتاب ۲۲ و ۲۴، فروشگاه للهی
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-mustard-400" />
              <a href="tel:01144299000" className="hover:text-mustard-400" dir="ltr">011 44299000</a>
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 shrink-0 text-mustard-400" />
              <a href="https://wa.me/989111214499" target="_blank" className="hover:text-mustard-400" dir="ltr">
                0911 121 4499
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Instagram className="h-4 w-4 shrink-0 text-mustard-400" />
              <a href="https://instagram.com/lellahi.tel" target="_blank" className="hover:text-mustard-400">
                Lellahi.tel
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-5 text-center text-xs text-white/30">
        © {new Date().getFullYear()} للهی Lellahi Tel. تمامی حقوق محفوظ است.
      </div>
    </footer>
  );
}
