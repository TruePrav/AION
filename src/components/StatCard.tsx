import type { ReactNode } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ════════════════════════════════════════════════════════════════
// StatCard — supports two surface variants:
//   variant="glass" (default) — soft modern glass card (auto-flips in .dark)
//   variant="brutal"          — used by the dashboard hero
// Both share the same color tones (lime/pink/yellow/white/red).
// ════════════════════════════════════════════════════════════════

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon?: ReactNode;
  accent?: boolean;
  tone?: "white" | "lime" | "pink" | "yellow" | "red";
  variant?: "glass" | "brutal";
}

const BRUTAL_TONE: Record<NonNullable<StatCardProps["tone"]>, string> = {
  white: "bg-card",
  lime: "bg-primary",
  pink: "bg-secondary",
  yellow: "bg-accent",
  red: "bg-destructive",
};

// Accent is used as a left "strip" + icon-tint on glass cards
const GLASS_ACCENT: Record<NonNullable<StatCardProps["tone"]>, { bar: string; iconBg: string; iconText: string }> = {
  white: { bar: "bg-foreground/20", iconBg: "bg-foreground/5", iconText: "text-foreground/60" },
  lime: { bar: "bg-primary", iconBg: "bg-primary/15", iconText: "text-foreground" },
  pink: { bar: "bg-secondary", iconBg: "bg-secondary/30", iconText: "text-foreground" },
  yellow: { bar: "bg-accent", iconBg: "bg-accent/40", iconText: "text-foreground" },
  red: { bar: "bg-destructive", iconBg: "bg-destructive/25", iconText: "text-foreground" },
};

export default function StatCard({
  label,
  value,
  change,
  icon,
  accent = false,
  tone,
  variant = "glass",
}: StatCardProps) {
  const positive = change != null && change >= 0;
  const resolvedTone: NonNullable<StatCardProps["tone"]> =
    tone ?? (accent ? "lime" : "white");

  if (variant === "brutal") {
    return (
      <div
        className={cn(
          "relative border-[3px] border-border shadow-[6px_6px_0_0_hsl(var(--border))] p-4",
          BRUTAL_TONE[resolvedTone]
        )}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-foreground">
            {label}
          </span>
          {icon && <span className="text-foreground">{icon}</span>}
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-foreground tabular-nums leading-none">
            {value}
          </span>

          {change !== undefined && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 border-[2px] border-border px-1 py-0 text-[10px] font-black tabular-nums",
                positive ? "bg-primary" : "bg-destructive",
                "text-foreground"
              )}
            >
              {positive ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
              {Math.abs(change).toFixed(2)}%
            </span>
          )}
        </div>
      </div>
    );
  }

  // Glass variant — uses token colors, auto-flips under .dark scope
  const a = GLASS_ACCENT[resolvedTone];

  return (
    <div className="relative overflow-hidden p-5 glass-card">
      {/* accent bar */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", a.bar)} />

      <div className="flex items-center justify-between mb-3 pl-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-foreground/60">
          {label}
        </span>
        {icon && (
          <span
            className={cn(
              "inline-flex items-center justify-center h-7 w-7 rounded-lg",
              a.iconBg,
              a.iconText
            )}
          >
            {icon}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2 pl-2">
        <span className="text-[26px] font-bold tabular-nums leading-none tracking-tight text-foreground">
          {value}
        </span>

        {change !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums border",
              positive
                ? "bg-primary/20 text-foreground border-primary/40"
                : "bg-destructive/20 text-foreground border-destructive/40"
            )}
          >
            {positive ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
            {Math.abs(change).toFixed(2)}%
          </span>
        )}
      </div>
    </div>
  );
}
