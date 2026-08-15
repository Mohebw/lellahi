import type { Metadata } from "next";
import { Vazirmatn, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { WhatsAppFloatingButton } from "@/components/layout/WhatsAppFloatingButton";
import { ToastProvider } from "@/components/ui/Toast";

const vazir = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazir",
  display: "swap"
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap"
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://departman.ir";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "للهی | Lellahi Tel — فروشگاه موبایل و لوازم دیجیتال",
    template: "%s | للهی"
  },
  description:
    "فروشگاه اینترنتی للهی در آمل — خرید موبایل اپل، سامسونگ، شیائومی و لوازم جانبی اصل با مشاوره تخصصی.",
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "للهی | Lellahi Tel"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={`${vazir.variable} ${mono.variable}`}>
      <head>
        <script
          // Runs before paint so the saved theme applies with no flash of the wrong theme.
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('lellahi_theme')==='light'){document.documentElement.classList.add('light')}}catch(e){}`
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans">
        <ToastProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <WhatsAppFloatingButton />
        </ToastProvider>
      </body>
    </html>
  );
}
