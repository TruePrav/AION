import GradeBadge from "@/components/GradeBadge";
import { cn } from "@/lib/utils";
import { TrendingUp, Trophy, Clock, Scale, BarChart3 } from "lucide-react";

const scoringFactors = [
  {
    name: "Historical PnL",
    weight: 30,
    description: "Cumulative profit/loss across all tracked trades.",
    icon: <TrendingUp className="h-4 w-4" />,
  },
  {
    name: "Win rate",
    weight: 25,
    description: "Percentage of profitable trades over a 90-day window.",
    icon: <Trophy className="h-4 w-4" />,
  },
  {
    name: "Entry timing",
    weight: 20,
    description: "How early the wallet enters positions relative to price moves.",
    icon: <Clock className="h-4 w-4" />,
  },
  {
    name: "Position sizing",
    weight: 15,
    description: "Risk management and portfolio allocation patterns.",
    icon: <Scale className="h-4 w-4" />,
  },
  {
    name: "Consistency",
    weight: 10,
    description: "Regularity of trading activity and strategy adherence.",
    icon: <BarChart3 className="h-4 w-4" />,
  },
];

const gradeThresholds = [
  {
    grade: "S" as const,
    range: "90 - 100",
    description: "Elite smart money — top 1% of tracked wallets.",
  },
  {
    grade: "A" as const,
    range: "75 - 89",
    description: "High conviction — consistently profitable.",
  },
  {
    grade: "B" as const,
    range: "60 - 74",
    description: "Above average — shows strong patterns.",
  },
  {
    grade: "C" as const,
    range: "40 - 59",
    description: "Average — mixed results.",
  },
  {
    grade: "D" as const,
    range: "0 - 39",
    description: "Below average — inconsistent or unprofitable.",
  },
];

const accumulationSignals = [
  {
    name: "Wallet convergence",
    description:
      "Multiple high-grade wallets buying the same token within a short window, signaling coordinated smart money interest.",
  },
  {
    name: "Volume anomaly",
    description:
      "Unusual volume spike relative to the 30-day average, often preceding significant price movements.",
  },
  {
    name: "Holder growth",
    description:
      "Accelerating unique holder count indicates growing organic demand and widening distribution.",
  },
  {
    name: "Whale accumulation",
    description: "Large wallets increasing positions, suggesting high-conviction bets from major players.",
  },
  {
    name: "Smart money consensus",
    description: "3+ S/A-grade wallets aligned on the same token — the strongest confluence signal in AION.",
  },
];

const riskTiers = [
  {
    tier: "Low",
    range: "1 - 3",
    color: "text-profit",
    dotClass: "bg-profit",
    characteristics: "High liquidity, established project, multiple audits.",
  },
  {
    tier: "Medium",
    range: "4 - 6",
    color: "text-[hsl(30_90%_42%)] dark:text-[hsl(38_95%_62%)]",
    dotClass: "bg-[hsl(30_90%_50%)] dark:bg-[hsl(38_95%_62%)]",
    characteristics: "Moderate liquidity, growing community, some risk factors.",
  },
  {
    tier: "High",
    range: "7 - 10",
    color: "text-loss",
    dotClass: "bg-loss",
    characteristics: "Low liquidity, new/unaudited, high volatility.",
  },
];

export default function GradingPage() {
  return (
    <div className="glass-bg min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-16 space-y-14">
        {/* ── Hero ── */}
        <section className="text-center py-6 space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            Wallet grading system
          </h1>
          <p className="text-base text-foreground/70 max-w-xl mx-auto">
            How AION scores and ranks smart money wallets.
          </p>
        </section>

        {/* ── Scoring Factors ── */}
        <section className="space-y-5">
          <h2 className="text-lg font-bold text-foreground tracking-tight">The 5 scoring factors</h2>
          {/*
            5 items in a 2-column grid would leave the 5th orphaned in the
            left slot. The `last:` variant makes the 5th card span both
            columns and center itself at the same visual width as a single
            cell so it doesn't look stranded.
          */}
          <div className="grid gap-4 sm:grid-cols-2">
            {scoringFactors.map((factor) => (
              <div
                key={factor.name}
                className="glass-card p-5 space-y-4 last:sm:col-span-2 last:sm:max-w-[calc(50%-0.5rem)] last:sm:mx-auto last:sm:w-full"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-foreground/5 border border-foreground/15 flex items-center justify-center text-foreground">
                      {factor.icon}
                    </div>
                    <span className="font-bold text-foreground text-sm">{factor.name}</span>
                  </div>
                  <span className="text-lg font-black text-foreground font-mono tabular-nums">
                    {factor.weight}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/8 border border-foreground/10">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${factor.weight}%` }} />
                </div>
                <p className="text-xs text-foreground/65 leading-relaxed">{factor.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Grade Thresholds ── */}
        <section className="space-y-5">
          <h2 className="text-lg font-bold text-foreground tracking-tight">Grade thresholds</h2>
          <div className="glass-card overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-foreground/10">
                  <th className="px-6 py-3 text-[10px] font-bold text-foreground/55 uppercase tracking-[0.08em]">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-[10px] font-bold text-foreground/55 uppercase tracking-[0.08em]">
                    Score range
                  </th>
                  <th className="px-6 py-3 text-[10px] font-bold text-foreground/55 uppercase tracking-[0.08em]">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {gradeThresholds.map((row) => (
                  <tr key={row.grade} className="transition-colors hover:bg-foreground/[0.04]">
                    <td className="px-6 py-4">
                      <GradeBadge grade={row.grade} size="lg" />
                    </td>
                    <td className="px-6 py-4 font-mono text-sm font-bold text-foreground tabular-nums">{row.range}</td>
                    <td className="px-6 py-4 text-sm text-foreground/70">{row.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Accumulation Scoring ── */}
        <section className="space-y-5">
          <h2 className="text-lg font-bold text-foreground tracking-tight">Accumulation scoring</h2>
          <p className="text-sm text-foreground/70 leading-relaxed">
            AION detects accumulation patterns by monitoring five key signals. When multiple signals fire
            simultaneously, the conviction score increases.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {accumulationSignals.map((signal) => (
              <div
                key={signal.name}
                className="glass-card p-5 space-y-2 hover:bg-foreground/[0.04] transition-colors"
              >
                <h3 className="font-bold text-foreground text-sm">{signal.name}</h3>
                <p className="text-xs leading-relaxed text-foreground/65">{signal.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Risk Tiers ── */}
        <section className="space-y-5">
          <h2 className="text-lg font-bold text-foreground tracking-tight">Risk tiers</h2>
          <div className="glass-card overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-foreground/10">
                  <th className="px-6 py-3 text-[10px] font-bold text-foreground/55 uppercase tracking-[0.08em]">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-[10px] font-bold text-foreground/55 uppercase tracking-[0.08em]">
                    Score range
                  </th>
                  <th className="px-6 py-3 text-[10px] font-bold text-foreground/55 uppercase tracking-[0.08em]">
                    Characteristics
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {riskTiers.map((row) => (
                  <tr key={row.tier} className="transition-colors hover:bg-foreground/[0.04]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className={cn("inline-block h-2.5 w-2.5 rounded-full", row.dotClass)} />
                        <span className={cn("text-sm font-bold", row.color)}>{row.tier}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm font-bold text-foreground tabular-nums">{row.range}</td>
                    <td className="px-6 py-4 text-sm text-foreground/70">{row.characteristics}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
