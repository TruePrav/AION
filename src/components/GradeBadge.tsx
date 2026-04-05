type Grade = "S" | "A" | "B" | "C" | "D";
type Size = "sm" | "md" | "lg";

interface GradeBadgeProps {
  grade: string;
  size?: Size;
}

const GRADE_STYLES: Record<Grade, { bg: string; text: string; border: string; glow: string; extra: string }> = {
  S: {
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    border: "border-amber-400/30",
    glow: "shadow-[0_0_16px_rgba(245,158,11,0.35),0_0_32px_rgba(245,158,11,0.15)]",
    extra: "grade-s-glow",
  },
  A: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    border: "border-emerald-400/25",
    glow: "shadow-[0_0_12px_rgba(16,185,129,0.25)]",
    extra: "",
  },
  B: {
    bg: "bg-yellow-500/15",
    text: "text-yellow-400",
    border: "border-yellow-400/25",
    glow: "shadow-[0_0_8px_rgba(234,179,8,0.15)]",
    extra: "",
  },
  C: {
    bg: "bg-orange-500/15",
    text: "text-orange-400",
    border: "border-orange-400/25",
    glow: "shadow-[0_0_8px_rgba(249,115,22,0.15)]",
    extra: "",
  },
  D: {
    bg: "bg-red-500/15",
    text: "text-red-400",
    border: "border-red-400/25",
    glow: "shadow-[0_0_8px_rgba(239,68,68,0.15)]",
    extra: "",
  },
};

const FALLBACK_STYLE = {
  bg: "bg-gray-500/15",
  text: "text-gray-400",
  border: "border-gray-500/25",
  glow: "",
  extra: "",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "px-2 py-0.5 text-xs min-w-[28px] text-center",
  md: "px-3 py-1 text-sm min-w-[36px] text-center",
  lg: "px-4 py-1.5 text-lg min-w-[48px] text-center font-black",
};

export default function GradeBadge({ grade, size = "md" }: GradeBadgeProps) {
  const g = (grade || "?").toUpperCase().charAt(0) as Grade;
  const style = GRADE_STYLES[g] || FALLBACK_STYLE;
  const sizeClass = SIZE_CLASSES[size];

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold tracking-wide border ${style.bg} ${style.text} ${style.border} ${style.glow} ${style.extra} ${sizeClass}`}
      style={size === "lg" ? { fontSize: "1.1rem", letterSpacing: "0.05em" } : {}}
    >
      {grade || "?"}
    </span>
  );
}