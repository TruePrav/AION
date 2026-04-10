type RiskTier = "low" | "medium" | "high";

interface RiskBadgeProps {
  tier: RiskTier;
  score?: number;
}

const TIER_STYLES: Record<RiskTier, { bg: string; text: string; border: string; label: string }> = {
  low: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-500/30",
    label: "Low Risk",
  },
  medium: {
    bg: "bg-yellow-500/15",
    text: "text-yellow-700 dark:text-yellow-400",
    border: "border-yellow-500/30",
    label: "Medium Risk",
  },
  high: {
    bg: "bg-red-500/15",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-500/30",
    label: "High Risk",
  },
};

export default function RiskBadge({ tier, score }: RiskBadgeProps) {
  const style = TIER_STYLES[tier];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${style.bg} ${style.text} ${style.border}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full bg-current`} />
      {style.label}
      {score !== undefined && (
        <span className="ml-0.5 opacity-75">({score})</span>
      )}
    </span>
  );
}
