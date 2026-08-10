import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatsCard({
  icon: Icon,
  label,
  value,
  tone = "default"
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  tone?: "default" | "mustard" | "green" | "red";
}) {
  const toneClasses = {
    default: "bg-white/5 text-white/70",
    mustard: "bg-mustard-400/15 text-mustard-300",
    green: "bg-emerald-500/15 text-emerald-300",
    red: "bg-red-500/15 text-red-300"
  }[tone];

  return (
    <div className="glass-panel flex items-center gap-4 p-5">
      <div className={cn("rounded-xl p-3", toneClasses)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-white/40">{label}</p>
        <p className="font-mono text-xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
