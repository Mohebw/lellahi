import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("glass-panel p-5", className)} {...props} />;
}

type BadgeTone = "mustard" | "green" | "red" | "gray" | "blue";

const toneClasses: Record<BadgeTone, string> = {
  mustard: "bg-mustard-400/15 text-mustard-300 border-mustard-400/30",
  green: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  red: "bg-red-500/15 text-red-300 border-red-500/30",
  gray: "bg-white/10 text-white/60 border-white/15",
  blue: "bg-sky-500/15 text-sky-300 border-sky-500/30"
};

export function Badge({
  tone = "gray",
  className,
  children
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
