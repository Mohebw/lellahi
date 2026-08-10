import { LucideIcon, PackageSearch, AlertTriangle } from "lucide-react";
import { Button } from "./Button";

export function EmptyState({
  icon: Icon = PackageSearch,
  title,
  description,
  action
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="glass-panel flex flex-col items-center gap-3 px-6 py-16 text-center">
      <div className="rounded-2xl bg-white/5 p-4">
        <Icon className="h-8 w-8 text-white/40" />
      </div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {description && <p className="max-w-sm text-sm text-white/50">{description}</p>}
      {action && (
        <Button size="sm" variant="secondary" onClick={action.onClick} className="mt-2">
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function ErrorState({
  title = "مشکلی پیش آمد",
  description,
  onRetry
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="glass-panel flex flex-col items-center gap-3 px-6 py-16 text-center">
      <div className="rounded-2xl bg-red-500/10 p-4">
        <AlertTriangle className="h-8 w-8 text-red-400" />
      </div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {description && <p className="max-w-sm text-sm text-white/50">{description}</p>}
      {onRetry && (
        <Button size="sm" variant="secondary" onClick={onRetry} className="mt-2">
          تلاش دوباره
        </Button>
      )}
    </div>
  );
}
