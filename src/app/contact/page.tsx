import type { Metadata } from "next";
import { Phone, MessageCircle, Instagram, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "تماس با ما",
  description: "راه‌های ارتباطی با فروشگاه للهی در آمل."
};

const CONTACTS = [
  { icon: Phone, label: "تماس تلفنی", value: "011 44299000", href: "tel:01144299000" },
  { icon: MessageCircle, label: "واتساپ", value: "0911 121 4499", href: "https://wa.me/989111214499" },
  { icon: Instagram, label: "اینستاگرام", value: "Lellahi.tel", href: "https://instagram.com/lellahi.tel" }
];

export default function ContactPage() {
  return (
    <div className="container-lellahi py-16">
      <h1 className="mb-8 text-3xl font-bold text-white">تماس با ما</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {CONTACTS.map((c) => (
          <a
            key={c.label}
            href={c.href}
            target={c.href.startsWith("http") ? "_blank" : undefined}
            className="glass-panel glass-panel-hover flex flex-col items-center gap-2 p-6 text-center"
          >
            <c.icon className="h-6 w-6 text-mustard-400" />
            <span className="text-sm text-white/50">{c.label}</span>
            <span className="font-mono text-sm text-white" dir="ltr">{c.value}</span>
          </a>
        ))}
      </div>

      <div className="glass-panel mt-6 flex items-start gap-3 p-6">
        <MapPin className="h-5 w-5 shrink-0 text-mustard-400" />
        <p className="text-sm leading-7 text-white/70">
          آمل، خیابان هراز، بین آفتاب ۲۲ و ۲۴، فروشگاه للهی
        </p>
      </div>
    </div>
  );
}
