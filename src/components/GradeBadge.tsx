type Grade = "S" | "A" | "B" | "C" | "D";
type Size = "sm" | "md" | "lg";

interface GradeBadgeProps {
  grade: string; // Accept any string, safely fallback
  size?: Size;
}

const GRADE_STYLES: Record<Grade, { bg: string; text: string; glow: string }> = {
  S: {
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    glow: "shadow-[0_0_10px_rgba(245,158,11,0.3)]",
  },
  A: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    glow: "shadow-[0_0_10px_rgba(16,185,129,0.3)]",
  },
  B: {
    bg: "bg-yellow-500/15",
    text: "text-yellow-400",
    glow: "shadow-[0_0_10px_rgba(234,179,8,0.3)]",
  },
  C: {
    bg: "bg-orange-500/15",
    text: "text-orange-400",
    glow: "shadow-[0_0_10px_rgba(249,115,22,0.3)]",
  },
  D: {
    bg: "bg-red-500/15",
    text: "text-red-400",
    glow: "shadow-[0_0_10px_rgba(239,68,68,0.3)]",
  },
};

const FALLBACK_STYLE = {
  bg: "bg-gray-500/15",
  text: "text-gray-400",
  glow: "",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
  lg: "px-4 py-1.5 text-base",
};

export default function GradeBadge({ grade, size = "md" }: GradeBadgeProps) {
  const g = (grade || "?").toUpperCase().charAt(0) as Grade;
  const style = GRADE_STYLES[g] || FALLBACK_STYLE;
  const sizeClass = SIZE_CLASSES[size];

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold tracking-wide border ${style.bg} ${style.text} ${style.glow} ${sizeClass} border-current/20`}
    >
      {grade || "?"}
    </span>
  );
}
