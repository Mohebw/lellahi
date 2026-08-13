import type { Metadata } from "next";
import { ShieldCheck, MapPin, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "درباره ما",
  description: "درباره فروشگاه للهی، فروشگاه موبایل و لوازم دیجیتال در آمل."
};

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
        <div className="grid gap-4 sm:grid-cols-3">
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
      </div>
    </div>
  );
}
