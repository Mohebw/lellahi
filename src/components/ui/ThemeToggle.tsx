"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className }: { className?: string }) {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    setIsLight(document.documentElement.classList.contains("light"));
  }, []);

  function toggle() {
    const next = !isLight;
    setIsLight(next);
    document.documentElement.classList.toggle("light", next);
    try {
      localStorage.setItem("lellahi_theme", next ? "light" : "dark");
    } catch {
      // ignore
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={isLight ? "تغییر به حالت تیره" : "تغییر به حالت روشن"}
      className={
        className ||
        "rounded-lg p-2 text-white/70 transition-colors hover:bg-white/5 hover:text-white"
      }
    >
      {isLight ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </button>
  );
}
