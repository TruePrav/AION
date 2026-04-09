import GradeBadge from "@/components/GradeBadge";
import { ArrowRight, Send, Search, Award, ShieldCheck, Rocket } from "lucide-react";

const gradeThresholds = [
  { grade: "S" as const, range: "90-100", description: "Elite smart money — top 1% of tracked wallets." },
  { grade: "A" as const, range: "75-89", description: "High conviction — consistently profitable." },
  { grade: "B" as const, range: "60-74", description: "Above average — shows strong patterns." },
  { grade: "C" as const, range: "40-59", description: "Average — mixed results." },
  { grade: "D" as const, range: "0-39", description: "Below average — inconsistent or unprofitable." },
];

const pipelineSteps = [
  {
    step: 1,
    title: "Discovery",
    tagline: "Scan & detect",
    icon: Search,
    tone: "lime" as const,
    bullets: [
      "Scans 500+ tokens across Solana, Ethereum, and Base.",
      "Identifies tokens with unusual smart money activity.",
      "Runs every 6 hours automatically.",
    ],
  },
  {
    step: 2,
    title: "Grading",
    tagline: "Score & rank",
    icon: Award,
    tone: "pink" as const,
    bullets: [
      "Scores wallets on PnL, win rate, timing, sizing, consistency.",
      "Assigns S/A/B/C/D grades updated daily.",
      "Rolling 90-day performance window.",
    ],
  },
  {
    step: 3,
    title: "Validation",
    tagline: "Cross-check signals",
    icon: ShieldCheck,
    tone: "yellow" as const,
    bullets: [
      "Cross-references multiple signals: convergence, volume, holders.",
      "Calculates accumulation score and risk tier.",
      "Filters tokens that don't meet minimum thresholds.",
    ],
  },
  {
    step: 4,
    title: "Execution",
    tagline: "Trade & manage",
    icon: Rocket,
    tone: "lime" as const,
    bullets: [
      "Executes trades based on validated discoveries.",
      "Automated position sizing and stop-loss.",
      "Take-profit tiers with partial exits.",
    ],
  },
];

const TONE_STYLES: Record<"lime" | "pink" | "yellow", { bar: string; iconBg: string; badge: string }> = {
  lime: {
    bar: "bg-primary",
    iconBg: "bg-primary/25 border-primary/50",
    badge: "bg-primary/20 text-foreground border-primary/50",
  },
  pink: {
    bar: "bg-secondary",
    iconBg: "bg-secondary/50 border-secondary/70",
    badge: "bg-secondary/50 text-foreground border-secondary/70",
  },
  yellow: {
    bar: "bg-accent",
    iconBg: "bg-accent/50 border-accent/70",
    badge: "bg-accent/50 text-foreground border-accent/70",
  },
};

const CREDIT_COSTS = [
  { op: "Discovery scan", credits: 50, freq: "Every 6 hours" },
  { op: "Wallet grading", credits: 10, freq: "Per wallet" },
  { op: "Token lookup", credits: 5, freq: "Per query" },
  { op: "Scout query", credits: 20, freq: "Per query" },
  { op: "Trade execution", credits: 15, freq: "Per trade" },
];

export default function HowItWorksPage() {
  return (
    <div className="glass-bg min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-16 space-y-16">
        {/* Hero */}
        <section className="text-center py-6 space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">How Oracle works</h1>
          <p className="text-base text-foreground/70 max-w-2xl mx-auto leading-relaxed font-medium">
            From discovery to execution — a fully automated smart money intelligence pipeline that runs 24/7.
          </p>
        </section>

        {/* Pipeline Steps */}
        <section className="space-y-6">
          <h2 className="text-lg font-bold text-foreground tracking-tight">The 4-step pipeline</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch">
            {pipelineSteps.map((step, idx) => {
              const s = TONE_STYLES[step.tone];
              const Icon = step.icon;
              return (
                <div key={step.step} className="relative h-full">
                  <div className="glass-card relative overflow-hidden h-full p-5 space-y-4">
                    {/* accent bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${s.bar}`} />
                    <div className="flex items-center justify-between pl-2">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${s.badge}`}
                      >
                        Step {step.step}
                      </span>
                      <span
                        className={`inline-flex items-center justify-center h-9 w-9 rounded-xl border ${s.iconBg}`}
                      >
                        <Icon className="h-4 w-4 text-foreground" strokeWidth={2.5} />
                      </span>
                    </div>
                    <div className="pl-2">
                      <h3 className="text-lg font-bold text-foreground tracking-tight leading-none">
                        {step.title}
                      </h3>
                      <p className="text-[11px] font-semibold text-foreground/55 uppercase tracking-wider mt-1">
                        {step.tagline}
                      </p>
                    </div>
                    <ul className="space-y-2 pl-2">
                      {step.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-[13px] text-foreground/85 font-semibold leading-snug">
                          <span className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${s.bar}`} />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {idx < pipelineSteps.length - 1 && (
                    <div className="hidden md:flex absolute top-8 -right-3 z-10">
                      <div className="h-6 w-6 rounded-full bg-primary border-2 border-foreground/80 flex items-center justify-center shadow-[0_4px_12px_-4px_hsl(var(--primary)/0.5)]">
                        <ArrowRight className="h-3 w-3 text-[hsl(0_0%_8%)]" strokeWidth={3} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Wallet Grades */}
        <section className="space-y-6">
          <h2 className="text-lg font-bold text-foreground tracking-tight">Wallet grades</h2>
          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-foreground/10">
                  <th className="text-left px-6 py-3 text-[10px] font-bold text-foreground/60 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="text-left px-6 py-3 text-[10px] font-bold text-foreground/60 uppercase tracking-wider">
                    Score range
                  </th>
                  <th className="text-left px-6 py-3 text-[10px] font-bold text-foreground/60 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {gradeThresholds.map((row) => (
                  <tr key={row.grade} className="hover:bg-foreground/[0.04] transition-colors">
                    <td className="px-6 py-4">
                      <GradeBadge grade={row.grade} size="lg" />
                    </td>
                    <td className="px-6 py-4 font-mono text-sm font-semibold text-foreground tabular-nums">{row.range}</td>
                    <td className="px-6 py-4 text-sm text-foreground/75 font-medium">{row.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Credit Costs */}
        <section className="space-y-6">
          <h2 className="text-lg font-bold text-foreground tracking-tight">API credit costs</h2>
          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-foreground/10">
                  <th className="text-left px-6 py-3 text-[10px] font-bold text-foreground/60 uppercase tracking-wider">
                    Operation
                  </th>
                  <th className="text-right px-6 py-3 text-[10px] font-bold text-foreground/60 uppercase tracking-wider">
                    Credits
                  </th>
                  <th className="text-right px-6 py-3 text-[10px] font-bold text-foreground/60 uppercase tracking-wider">
                    Frequency
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {CREDIT_COSTS.map((row) => (
                  <tr key={row.op} className="hover:bg-foreground/[0.04] transition-colors">
                    <td className="px-6 py-4 font-bold text-foreground text-sm">{row.op}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-mono font-bold text-foreground text-sm tabular-nums">{row.credits}</span>
                    </td>
                    <td className="px-6 py-4 text-right text-foreground/65 text-xs font-medium">{row.freq}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA */}
        <section className="glass-card p-10 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-2 tracking-tight">Ready to get started?</h3>
          <p className="text-foreground/70 text-sm font-medium mb-6 max-w-md mx-auto">
            Add the Oracle bot to Telegram and start tracking smart money in minutes.
          </p>
          <a
            href="https://t.me/OracleAITradingBot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-primary/90 border border-foreground/15 px-5 py-2.5 text-sm font-bold text-[hsl(0_0%_8%)] hover:bg-primary transition-colors shadow-[0_4px_16px_-6px_hsl(var(--primary)/0.35)]"
          >
            <Send className="h-4 w-4" strokeWidth={2.5} />
            Open Telegram bot
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </a>
        </section>
      </div>
    </div>
  );
}
