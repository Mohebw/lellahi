import type { Metadata } from "next";
import { ShieldCheck, MapPin, Clock, Navigation } from "lucide-react";

export const metadata: Metadata = {
  title: "درباره ما",
  description: "درباره فروشگاه للهی، فروشگاه موبایل و لوازم دیجیتال در آمل."
};

const STORE_ADDRESS = "آمل، خیابان هراز، فروشگاه للهی";
const MAP_QUERY = encodeURIComponent(STORE_ADDRESS);
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${MAP_QUERY}`;

export default function AboutPage() {
  return (
    <div className="container-lellahi py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold text-white">درباره للهی</h1>
        <p className="mb-6 leading-8 text-white/60">
          فروشگاه للهی سال‌هاست در خیابان هراز آمل، مرجع خرید موبایل و لوازم دیجیتال اصل است.
          هدف ما ارائه‌ی محصولاتی با گارانتی معتبر و مشاوره‌ای صادقانه است، بدون واسطه و با
          قیمتی منصفانه.
        </p>
        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "کالای اصل", desc: "ضمانت اصالت روی تمام محصولات" },
            { icon: MapPin, title: "حضور فیزیکی", desc: "فروشگاه واقعی در آمل، خیابان هراز" },
            { icon: Clock, title: "پاسخگویی سریع", desc: "بررسی و تماس در کوتاه‌ترین زمان" }
          ].map((item) => (
            <div key={item.title} className="glass-panel p-5 text-center">
              <item.icon className="mx-auto mb-3 h-6 w-6 text-mustard-400" />
              <h3 className="mb-1 text-sm font-semibold text-white">{item.title}</h3>
              <p className="text-xs text-white/50">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="glass-panel overflow-hidden p-0">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-mustard-400" />
              <h2 className="text-sm font-semibold text-white">موقعیت فروشگاه — نمای ماهواره‌ای</h2>
            </div>
            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary !px-3 !py-1.5 text-xs"
            >
              <Navigation className="h-3.5 w-3.5" />
              مسیریابی
            </a>
          </div>
          <div className="aspect-video w-full">
            <iframe
              title="موقعیت فروشگاه للهی روی نقشه"
              src={`https://maps.google.com/maps?q=${MAP_QUERY}&t=k&z=18&output=embed`}
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <p className="px-5 py-3 text-xs text-white/40">
            {STORE_ADDRESS} — می‌توانید نقشه را با موس بچرخانید، بزرگ‌نمایی کنید یا مستقیم مسیر را در گوگل مپ باز کنید.
          </p>
        </div>
      </div>
    </div>
  );
}
