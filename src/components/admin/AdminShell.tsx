"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, Tags, ClipboardList, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "داشبورد", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "محصولات", icon: Package },
  { href: "/admin/categories", label: "دسته‌بندی‌ها", icon: Tags },
  { href: "/admin/requests", label: "درخواست‌های خرید", icon: ClipboardList }
];

export function AdminShell({
  children,
  adminName
}: {
  children: React.ReactNode;
  adminName?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const SidebarContent = (
    <>
      <div className="mb-8 flex items-center gap-2 px-2">
        <Image src="/logo.png" alt="للهی" width={26} height={26} />
        <span className="font-bold text-white">پنل للهی</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active ? "bg-mustard-400/15 text-mustard-300" : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-4 border-t border-line pt-4">
        {adminName && <p className="mb-2 px-2 text-xs text-white/40">{adminName}</p>}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-white/60 transition-colors hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-4 w-4" />
          خروج
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-l border-line bg-ink-900/60 p-4 backdrop-blur-xl lg:flex">
        {SidebarContent}
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-line px-4 py-3 lg:hidden">
          <span className="font-bold text-white">پنل للهی</span>
          <button onClick={() => setMobileOpen((v) => !v)} className="text-white">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </header>
        {mobileOpen && (
          <div className="flex flex-col border-b border-line bg-ink-900/95 p-4 lg:hidden">
            {SidebarContent}
          </div>
        )}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
