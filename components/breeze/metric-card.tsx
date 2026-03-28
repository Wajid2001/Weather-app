import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface MetricCardProps {
  icon: string;
  label: string;
  value: string | number;
  unit: string;
  detail?: string;
  /** Optional warm glow effect (e.g. for UV) */
  glow?: boolean;
  /** Optional accent color for the unit label */
  unitColor?: string;
  /** Compact mode for inline usage */
  compact?: boolean;
  className?: string;
}

export function MetricCard({
  icon,
  label,
  value,
  unit,
  detail,
  glow = false,
  unitColor,
  compact = false,
  className,
}: MetricCardProps) {
  if (compact) {
    return (
      <Card
        className={cn(
          "metric-card bg-surface rounded-xl p-4 flex items-center gap-4 shadow-sm relative overflow-hidden ",
          className
        )}
      >
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-primary text-xl" aria-hidden="true">{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">{label}</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-foreground text-2xl font-bold" style={{ fontFamily: "var(--font-data)" }}>{value}</span>
            <span className={cn("text-sm font-medium", unitColor ? "" : "text-muted-foreground")} style={unitColor ? { color: unitColor } : undefined}>{unit}</span>
          </div>
          {detail && <p className="text-xs text-muted-foreground mt-0.5 truncate">{detail}</p>}
        </div>
        {glow && (
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-accent-warm opacity-10 rounded-full blur-2xl" />
        )}
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "metric-card bg-surface rounded-xl p-4 sm:p-5 md:p-6 flex flex-col justify-between aspect-square w-full !min-w-[100%] !max-w-[100%] mx-auto sm:mx-0 shadow-sm relative overflow-hidden",
        className
      )}
    >
      {/* Label Row */}
      <div className="flex items-center gap-2 text-muted-foreground relative z-10">
        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">{icon}</span>
        <span className="text-[11px] sm:text-[13px] font-bold uppercase tracking-widest">
          {label}
        </span>
      </div>

      {/* Data Point */}
      <div className="flex flex-col items-center justify-center flex-1 relative z-10">
        <div
          className="font-semibold text-foreground text-[36px] sm:text-[48px] leading-none"
          style={{ fontFamily: "var(--font-data)" }}
        >
          {value}
        </div>
        <div
          className={cn("text-base sm:text-lg mt-1", unitColor ? "" : "text-muted-foreground")}
          style={unitColor ? { color: unitColor } : undefined}
        >
          {unit}
        </div>
      </div>

      {/* Footer Detail */}
      {detail && (
        <div className="text-xs sm:text-sm text-muted-foreground text-center border-t border-border-muted pt-2 sm:pt-3 mt-1 sm:mt-2 relative z-10">
          {detail}
        </div>
      )}

      {/* Optional Warm Glow */}
      {glow && (
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-accent-warm opacity-10 rounded-full blur-2xl" />
      )}
    </Card>
  );
}
