import GradeBadge from "@/components/GradeBadge";
import { ArrowRight, Send, Search, Layers, Zap, Shield, Activity, Target, Brain, LineChart, Check, X } from "lucide-react";

// ─────────────────────────────────────────────
// Pipeline stages
// ─────────────────────────────────────────────
const PIPELINE = [
  {
    n: 1,
    title: "Hot token scan",
    icon: Search,
    bullets: [
      "Pulls the top smart-money flow tokens per chain via Nansen CLI",
      "Solana, Ethereum, Base in parallel",
      "~30 raw candidates per chain",
    ],
    cost: "1 cr/chain",
  },
  {
    n: 2,
    title: "Smart-money filter",
    icon: Zap,
    bullets: [
      "Pulls the top buyers on each hot token",
      "Keeps wallets Nansen labels as Smart Money / Fund / Whale",
      "Drops retail noise immediately",
    ],
    cost: "1 cr/token",
  },
  {
    n: 3,
    title: "Wallet grading",
    icon: Target,
    bullets: [
      "Runs every SM wallet through the profiler endpoint",
      "Scores on PnL, win rate, trade count, consistency",
      "Assigns deterministic S / A / B / C / D tier",
    ],
    cost: "3 cr/wallet",
  },
  {
    n: 4,
    title: "Accumulation scoring",
    icon: LineChart,
    bullets: [
      "Composite score from buy/sell ratio, buyer concentration (HHI), SM-buyer %, volume consistency",
      "Produces one number you can rank by",
      "Tunable weights (see Evolution loop below)",
    ],
    cost: "0 cr (local)",
  },
  {
    n: 5,
    title: "Convergence detection",
    icon: Layers,
    bullets: [
      "The core unlock. Finds wallets buying ≥2 hot tokens in the same window",
      "One wallet in one token = noise. Same cluster in three = syndicate",
      "This is the join Nansen's UI doesn't expose",
    ],
    cost: "0 cr (local)",
  },
  {
    n: 6,
    title: "Risk filter",
    icon: Shield,
    bullets: [
      "GoPlus honeypot / rug / tax check",
      "Risk tier preset: degen / balanced / conservative",
      "Community blocklist voting",
    ],
    cost: "0 cr",
  },
  {
    n: 7,
    title: "AI reasoning",
    icon: Brain,
    bullets: [
      "LLM synthesises the raw data into a verdict: strong_buy / buy / watch / avoid",
      "Outputs confidence, bullish factors, bearish factors, risk flags",
      "Turns 40 numbers into one sentence",
    ],
    cost: "LLM call",
  },
  {
    n: 8,
    title: "Action layer",
    icon: Activity,
    bullets: [
      "Paper portfolio with live P/L",
      "Editable SL/TP per position",
      "Telegram alerts + copy-trade scaffolding",
    ],
    cost: "0 cr",
  },
];

// ─────────────────────────────────────────────
// Wallet grading factors
// ─────────────────────────────────────────────
const WALLET_GRADE_FACTORS = [
  { name: "Win rate", weight: 30, desc: "% of tracked trades that closed profitable" },
  { name: "Realised PnL", weight: 30, desc: "Total $ made from closed positions over rolling window" },
  { name: "Trade count", weight: 15, desc: "Sample size — more trades = more reliable signal" },
  { name: "Consistency", weight: 15, desc: "Low variance across months, not one lucky hit" },
  { name: "Nansen label", weight: 10, desc: "Bonus for Smart Money / Fund / Whale labels" },
];

const WALLET_GRADES = [
  { grade: "S" as const, range: "90–100", description: "Elite — top 1% of tracked wallets. Systematic alpha." },
  { grade: "A" as const, range: "75–89", description: "High conviction. Consistently profitable across trades." },
  { grade: "B" as const, range: "60–74", description: "Above average. Shows strong patterns but some noise." },
  { grade: "C" as const, range: "40–59", description: "Mixed results. Watch list." },
  { grade: "D" as const, range: "0–39", description: "Inconsistent or unprofitable. Filtered out." },
];

// ─────────────────────────────────────────────
// Accumulation scoring factors
// ─────────────────────────────────────────────
const ACCUM_FACTORS = [
  { name: "Buy/sell ratio", weight: 25, desc: "Smart money buying more than selling" },
  { name: "Buyer diversity", weight: 25, desc: "Low Herfindahl (HHI) — spread across many wallets, not one" },
  { name: "SM presence", weight: 20, desc: "% of buyers that Nansen labels as Smart Money" },
  { name: "Volume consistency", weight: 15, desc: "Steady accumulation over time, not one spike" },
  { name: "Buyer count", weight: 15, desc: "Raw number of distinct SM wallets" },
];

// ─────────────────────────────────────────────
// Differentiator table
// ─────────────────────────────────────────────
type CheckValue = boolean | "raw" | "partial";
interface DiffRow {
  feature: string;
  nansen: CheckValue;
  aion: CheckValue;
  note: string;
}

const DIFF_ROWS: DiffRow[] = [
  { feature: "Raw wallet + token data", nansen: true, aion: true, note: "AION uses Nansen as the intel source" },
  { feature: "One-page-at-a-time browsing", nansen: true, aion: false, note: "Nansen's UI is siloed" },
  { feature: "Deterministic wallet grading (S/A/B/C/D)", nansen: false, aion: true, note: "Reproducible score, tunable weights" },
  { feature: "Accumulation composite score", nansen: false, aion: true, note: "Buy/sell × HHI × SM-% × consistency" },
  { feature: "Cross-token convergence join", nansen: false, aion: true, note: "Wallets buying multiple hot tokens at once" },
  { feature: "Risk filter (honeypot / rug check)", nansen: false, aion: true, note: "GoPlus integration + blocklist" },
  { feature: "AI verdict + reasoning", nansen: false, aion: true, note: "LLM summary of raw signals" },
  { feature: "Prediction market whale tracking", nansen: "raw", aion: true, note: "Same pipeline applied to Polymarket" },
  { feature: "Self-evolving scoring", nansen: false, aion: "partial", note: "Records snapshots, evaluates forward returns" },
  { feature: "Transparent CLI command log", nansen: false, aion: true, note: "Every Nansen call exposed with credit cost" },
];

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────
export default function HowItWorksPage() {
  return (
    <div className="glass-bg min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-16 space-y-16">
        {/* ── Hero ── */}
        <section className="text-center py-6 space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">How AION works</h1>
          <p className="text-base text-foreground/70 max-w-2xl mx-auto leading-relaxed font-medium">
            Nansen gives you the raw data. AION gives you the answer.
            Eight-stage pipeline, fully automated, every 6 hours.
          </p>
        </section>

        {/* ── Pipeline ── */}
        <section className="space-y-6">
          <div className="flex items-baseline justify-between flex-wrap gap-2">
            <h2 className="text-xl font-bold text-foreground tracking-tight">The 8-stage pipeline</h2>
            <span className="text-[11px] text-foreground/55 font-mono">~50 credits per full run</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PIPELINE.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.n} className="glass-card p-4 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary">
                      Step {s.n}
                    </span>
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-primary/40 bg-primary/15">
                      <Icon className="h-4 w-4 text-primary" strokeWidth={2.5} />
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground tracking-tight mb-2">{s.title}</h3>
                  <ul className="space-y-1.5 flex-1">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-1.5 text-[11px] text-foreground/75 leading-snug font-medium">
                        <span className="mt-1 h-1 w-1 rounded-full bg-primary flex-shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 pt-2 border-t border-foreground/10">
                    <span className="text-[9px] font-mono font-bold text-foreground/55 tracking-wider">{s.cost.toUpperCase()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── AION vs Nansen ── */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground tracking-tight">AION vs raw Nansen</h2>
            <p className="text-sm text-foreground/65 font-medium leading-relaxed max-w-2xl">
              Nansen is the best on-chain data source in crypto — it&apos;s where AION gets its input.
              But going to nansen.ai directly means clicking through a hundred pages by hand.
              Here&apos;s what AION adds on top.
            </p>
          </div>
          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-foreground/10 bg-foreground/[0.03]">
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-foreground/60 uppercase tracking-wider">
                    Capability
                  </th>
                  <th className="text-center px-3 py-3 text-[10px] font-bold text-foreground/60 uppercase tracking-wider w-20">
                    Nansen
                  </th>
                  <th className="text-center px-3 py-3 text-[10px] font-bold text-foreground/60 uppercase tracking-wider w-20">
                    AION
                  </th>
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-foreground/60 uppercase tracking-wider hidden md:table-cell">
                    Note
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {DIFF_ROWS.map((row) => (
                  <tr key={row.feature} className="hover:bg-foreground/[0.04]">
                    <td className="px-5 py-3.5 font-semibold text-foreground text-xs">{row.feature}</td>
                    <td className="px-3 py-3.5 text-center"><CheckCell value={row.nansen} /></td>
                    <td className="px-3 py-3.5 text-center"><CheckCell value={row.aion} /></td>
                    <td className="px-5 py-3.5 text-foreground/60 text-[11px] font-medium hidden md:table-cell">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="glass-card p-5 bg-primary/5 border-primary/30">
            <div className="flex items-start gap-3">
              <Layers className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2.5} />
              <div>
                <div className="text-sm font-bold text-foreground mb-1">The single most important differentiator</div>
                <p className="text-[13px] text-foreground/75 font-medium leading-relaxed">
                  <span className="text-primary font-bold">Cross-token convergence detection.</span>{" "}
                  Nansen will never tell you &ldquo;these three wallets are buying Token A <em>and</em> Token B <em>and</em>{" "}
                  Token C right now.&rdquo; That join doesn&apos;t exist in their UI. One wallet in one token is noise.
                  The same cluster showing up in three is a syndicate. This is the signal that separates alpha from coincidence.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Wallet grading ── */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground tracking-tight">How wallet grading works</h2>
            <p className="text-sm text-foreground/65 font-medium leading-relaxed max-w-2xl">
              Every wallet gets scored on five weighted factors, producing a 0–100 score that maps to a tier.
              The weights are tunable via the self-evolving loop.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Factors */}
            <div className="glass-card p-5 space-y-3">
              <div className="text-[10px] font-bold tracking-wider text-foreground/55 mb-2">SCORING FACTORS</div>
              {WALLET_GRADE_FACTORS.map((f) => (
                <div key={f.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] font-bold text-foreground">{f.name}</span>
                    <span className="text-[10px] font-mono font-bold text-primary tabular-nums">{f.weight} pts</span>
                  </div>
                  <div className="h-1.5 bg-foreground/10 rounded-full overflow-hidden mb-1">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${f.weight}%` }} />
                  </div>
                  <p className="text-[11px] text-foreground/60 font-medium leading-snug">{f.desc}</p>
                </div>
              ))}
            </div>

            {/* Grade tiers */}
            <div className="glass-card overflow-hidden">
              <div className="px-5 pt-5 text-[10px] font-bold tracking-wider text-foreground/55">GRADE TIERS</div>
              <table className="w-full text-sm mt-3">
                <tbody className="divide-y divide-foreground/5">
                  {WALLET_GRADES.map((row) => (
                    <tr key={row.grade}>
                      <td className="px-5 py-3"><GradeBadge grade={row.grade} size="md" /></td>
                      <td className="px-2 py-3 font-mono text-[11px] font-bold text-foreground/70 tabular-nums whitespace-nowrap">{row.range}</td>
                      <td className="px-5 py-3 text-[11px] text-foreground/70 font-medium">{row.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Accumulation scoring ── */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground tracking-tight">How accumulation scoring works</h2>
            <p className="text-sm text-foreground/65 font-medium leading-relaxed max-w-2xl">
              Separate from wallet grading — this scores the <em>token</em>, not the wallet. Answers: &ldquo;Is
              smart money actually accumulating this, or is it just volatile noise?&rdquo;
            </p>
          </div>

          <div className="glass-card p-5 space-y-3">
            {ACCUM_FACTORS.map((f) => (
              <div key={f.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] font-bold text-foreground">{f.name}</span>
                  <span className="text-[10px] font-mono font-bold text-accent tabular-nums">{f.weight} pts</span>
                </div>
                <div className="h-1.5 bg-foreground/10 rounded-full overflow-hidden mb-1">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${f.weight}%` }} />
                </div>
                <p className="text-[11px] text-foreground/60 font-medium leading-snug">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Self-evolving loop ── */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground tracking-tight">Self-evolving scoring loop</h2>
            <p className="text-sm text-foreground/65 font-medium leading-relaxed max-w-2xl">
              Karpathy-style autoresearch pattern: <span className="font-mono text-primary">hypothesis → experiment → evaluate → improve</span>. Every discovery run is a live experiment.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            {[
              { n: 1, title: "Hypothesis", desc: "Current scoring weights are loaded as the active model", color: "primary" },
              { n: 2, title: "Experiment", desc: "Discovery run records a snapshot: every token, its score, its entry price", color: "accent" },
              { n: 3, title: "Evaluate", desc: "Forward price checks at +24h / +48h. High-score vs low-score returns compared", color: "secondary" },
              { n: 4, title: "Improve", desc: "Weights adjusted if high-score tokens underperform. New version committed", color: "primary" },
            ].map((s) => (
              <div key={s.n} className="glass-card p-4">
                <div className={`text-[10px] font-mono font-bold tracking-wider mb-2 text-${s.color}`}>
                  STAGE {s.n}
                </div>
                <div className="text-sm font-bold text-foreground mb-1">{s.title}</div>
                <p className="text-[11px] text-foreground/65 font-medium leading-snug">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="glass-card p-5 text-[12px] text-foreground/70 leading-relaxed font-medium">
            <span className="font-bold text-foreground">Storage:</span> snapshots and evaluations live in flat JSON files on the backend
            (<span className="font-mono text-primary text-[11px]">data/evolution.json</span> + <span className="font-mono text-primary text-[11px]">data/scoring_weights.json</span>).
            No database needed at this scale — a snapshot every 6 hours is ~4 records/day.
            The design mirrors Karpathy&apos;s markdown-wiki approach: append-only, git-friendly, human-readable.
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="glass-card p-10 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-2 tracking-tight">Ready to get started?</h3>
          <p className="text-foreground/70 text-sm font-medium mb-6 max-w-md mx-auto">
            Add the AION bot to Telegram and start tracking smart money in minutes.
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

// ─────────────────────────────────────────────
// Subcomponents
// ─────────────────────────────────────────────
function CheckCell({ value }: { value: boolean | "raw" | "partial" }) {
  if (value === true) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 border border-primary/50">
        <Check className="h-3.5 w-3.5 text-primary" strokeWidth={3} />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-foreground/5 border border-foreground/15">
        <X className="h-3.5 w-3.5 text-foreground/40" strokeWidth={3} />
      </span>
    );
  }
  // "raw" or "partial"
  const label = value === "raw" ? "raw" : "wip";
  return (
    <span className="inline-flex items-center justify-center rounded-full bg-accent/20 border border-accent/50 px-2 py-0.5 text-[9px] font-bold tracking-wider text-accent">
      {label.toUpperCase()}
    </span>
  );
}
