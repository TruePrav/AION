import { cn } from "@/lib/utils";

// ════════════════════════════════════════════════════════════════
// GradeBadge — visual hierarchy S > A > B > C > D
// Colored tiers (S/A/B) always use DARK ink for reliable contrast
// in both light and dark modes. C/D use token colors so they flip.
// ════════════════════════════════════════════════════════════════

type Grade = "S" | "A" | "B" | "C" | "D";
type Size = "sm" | "md" | "lg";

interface GradeBadgeProps {
  grade: string;
  size?: Size;
}

const SIZE: Record<Size, { box: string; text: string }> = {
  sm: { box: "h-5 min-w-[22px] px-1", text: "text-[10px]" },
  md: { box: "h-6 min-w-[28px] px-1.5", text: "text-xs" },
  lg: { box: "h-10 min-w-[44px] px-2", text: "text-lg" },
};

// Dark ink color used on colored backgrounds so text stays readable
// regardless of theme. Explicit near-black (not `text-foreground`).
const INK = "text-[hsl(0_0%_8%)]";

const TIER_CLASSES: Record<Grade, string> = {
  // ── S: trophy. Yellow fill + dark ink + heavy shadow.
  S: [
    "relative bg-gradient-to-b from-accent to-[hsl(44_97%_68%)]",
    INK,
    "font-black",
    "border-[2px] border-[hsl(0_0%_12%)]",
    "rounded-md",
    "shadow-[0_0_0_2px_hsl(var(--accent)/0.35),_0_6px_18px_-4px_hsl(var(--accent)/0.55),_0_2px_0_0_hsl(0_0%_12%)]",
    "ring-1 ring-white/60 ring-inset",
  ].join(" "),

  // ── A: strong lime, dark ink.
  A: [
    "bg-primary",
    INK,
    "font-extrabold",
    "border-[1.5px] border-[hsl(0_0%_12%)]",
    "rounded-md",
    "shadow-[0_4px_12px_-4px_hsl(var(--primary)/0.55),_0_1px_0_0_hsl(0_0%_12%)]",
  ].join(" "),

  // ── B: pink fill, dark ink.
  B: [
    "bg-secondary",
    INK,
    "font-bold",
    "border border-[hsl(0_0%_20%)]",
    "rounded-md",
  ].join(" "),

  // ── C: neutral — flips via tokens.
  C: [
    "bg-foreground/10",
    "text-foreground/80",
    "font-semibold",
    "border border-foreground/25",
    "rounded-md",
  ].join(" "),

  // ── D: muted, buried.
  D: [
    "bg-foreground/[0.06]",
    "text-foreground/45",
    "font-medium",
    "border border-foreground/15",
    "rounded-md",
  ].join(" "),
};

const FALLBACK =
  "bg-foreground/10 text-foreground/50 font-semibold border border-foreground/20 rounded-md";

export default function GradeBadge({ grade, size = "md" }: GradeBadgeProps) {
  const g = (grade || "?").toUpperCase().charAt(0) as Grade;
  const tier = TIER_CLASSES[g] || FALLBACK;
  const s = SIZE[size];

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center uppercase tracking-wider",
        s.box,
        s.text,
        tier
      )}
    >
      {grade || "?"}
    </span>
  );
}
