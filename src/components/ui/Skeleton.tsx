import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-white/[0.06]", className)} />;
}

/** Signature loading indicator: pulsing mustard squares echoing the Lellahi "L" logo pattern. */
export function DotPulseLoader({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1.5", className)} role="status" aria-label="در حال بارگذاری">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="h-2.5 w-2.5 rounded-[3px] bg-mustard-400 animate-dot-pulse"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="glass-panel p-4">
      <Skeleton className="mb-4 aspect-square w-full" />
      <Skeleton className="mb-2 h-4 w-3/4" />
      <Skeleton className="mb-3 h-3 w-1/2" />
      <Skeleton className="h-5 w-2/5" />
    </div>
  );
}
