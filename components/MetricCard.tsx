import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface MetricCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  description?: ReactNode;
  to?: string;
}

export function MetricCard({ icon: Icon, value, label, description, to }: MetricCardProps) {
  const inner = (
    <div className="h-full px-4 py-4 sm:px-5 sm:py-5 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-1">{label}</p>
          {description && (
            <div className="text-xs text-muted-foreground/70 mt-1.5 hidden sm:block">{description}</div>
          )}
        </div>
        <Icon className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-1.5" />
      </div>
    </div>
  );

  if (to) {
    return (
      <a href={to} className="no-underline text-inherit block h-full">
        {inner}
      </a>
    );
  }

  return inner;
}