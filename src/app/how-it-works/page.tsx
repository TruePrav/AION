"use client";

import { useState } from "react";
import GradeBadge from "@/components/GradeBadge";
import { ArrowRight, Send, Search, Layers, Zap, Shield, Activity, Target, Brain, LineChart, Check, X, ChevronDown, Vote, RefreshCw, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────
// Pipeline stages
// ─────────────────────────────────────────────
// Each stage lists the actual `nansen ...` commands the backend runs at that
// step so visitors can verify the credit math themselves and reproduce a run
// from a terminal. `cli` strings appear in the dropdown when a card expands.
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
    cli: [
      "nansen smart-money inflows --chain solana --limit 30 --json",
      "nansen smart-money inflows --chain base   --limit 30 --json",
      "nansen smart-money inflows --chain ethereum --limit 30 --json",
    ],
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
    cli: [
      "nansen token top-traders --chain {chain} --address {token} --json",
    ],
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
    cli: [
      "nansen profiler pnl-summary --address {wallet} --json",
      "nansen profiler trades --address {wallet} --window 30d --json",
    ],
  },
  {
    n: 4,
    title: "Accumulation scoring",
    icon: LineChart,
    bullets: [
      "Composite score from buy/sell ratio, buyer concentration (HHI), SM-buyer %, volume consistency",
      "Produces one number you can rank by",
      "Tunable weights (see Self-learning loop below)",
    ],
    cost: "0 cr (local)",
    cli: ["# local computation — see scoring/accumulation.py"],
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
    cli: ["# local SQL-style join across step-2 holder lists"],
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
    cli: [
      "curl https://api.gopluslabs.io/api/v1/token_security/{chain_id}?contract={token}",
    ],
  },
  {
    n: 7,
    title: "Polymarket whales",
    icon: Vote,
    bullets: [
      "Same wallet+convergence pipeline applied to prediction markets",
      "Top 60 hot markets, deep-dive 5",
      "Free Polymarket data-api fetches the full position book per whale",
    ],
    cost: "~31 cr/run",
    cli: [
      "nansen research prediction-market market-screener --sort-by volume_24hr --limit 180 --json",
      "nansen research prediction-market top-holders   --market-id {id} --json   # ×5",
      "nansen research prediction-market trades-by-market --market-id {id} --json # ×5",
    ],
  },
  {
    n: 8,
    title: "AI reasoning",
    icon: Brain,
    bullets: [
      "LLM synthesises the raw data into a verdict: strong_buy / buy / watch / avoid",
      "Outputs confidence, bullish factors, bearish factors, risk flags",
      "Turns 40 numbers into one sentence",
    ],
    cost: "LLM call",
    cli: ["# webhook_server.py /api/discovery/reasoning — server-side LLM"],
  },
  {
    n: 9,
    title: "Action layer",
    icon: Activity,
    bullets: [
      "Paper portfolio with live P/L (DexScreener prices, free)",
      "Editable SL/TP per position + auto-exit cron",
      "Telegram alerts + copy-trade scaffolding",
    ],
    cost: "0 cr",
    cli: [
      "# cron: */5 * * * * python3 run_discovery_cron.py auto_exit",
      "# manual close: POST /api/positions/{addr}/close",
    ],
  },
  {
    n: 10,
    title: "Self-learning",
    icon: RefreshCw,
    bullets: [
      "Curator records every snapshot to /data/evolution.json",
      "Forward-price tracker fills in +24h / +48h / +7d returns",
      "Scoring weights nudged when high-score tokens underperform",
    ],
    cost: "0 cr (local)",
    cli: [
      "# cron: 0 * * * * python3 price_tracker.py",
      "# curator_hook.after_discovery → reweight + commit",
    ],
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
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">Inside the AION pipeline</h1>
          <p className="text-base text-foreground/70 max-w-2xl mx-auto leading-relaxed font-medium">
            Nansen gives you the raw data. AION gives you the answer.
            Ten-stage pipeline, fully automated, every 4 hours. Click any stage to see the
            actual <span className="font-mono text-foreground/85">nansen …</span> command it runs.
          </p>
        </section>

        {/* ── Pipeline (circular loop) ── */}
        <section className="space-y-6">
          <div className="flex items-baseline justify-between flex-wrap gap-2">
            <h2 className="text-xl font-bold text-foreground tracking-tight">The 10-stage pipeline</h2>
            <span className="text-[11px] text-foreground/55 font-mono">
              ~85 cr (Solana + Base) + ~65 cr (Ethereum) + ~31 cr (Polymarket) ≈ 180 credits / full run
            </span>
          </div>

          {/* How we count Nansen API calls — answers the competition question */}
          <div className="glass-card p-4 flex items-start gap-3 bg-primary/[0.05] border-primary/25">
            <Terminal className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={2.5} />
            <div className="text-[12px] leading-relaxed font-medium text-foreground/75">
              <div className="font-bold text-foreground text-[13px] mb-1">
                What counts as a Nansen API call?
              </div>
              Every CLI command is one call. A single discovery run fires{" "}
              <span className="font-mono text-foreground font-bold">100+ calls</span> —
              <span className="font-mono"> 3 </span>
              smart-money inflows (one per chain), <span className="font-mono">~30</span>{" "}
              top-traders (one per hot token), <span className="font-mono">~60</span>{" "}
              profiler pnl lookups (one per SM wallet), plus the whole Polymarket branch
              (<span className="font-mono">1 + 5 + 5 = 11</span>). Every call is logged to{" "}
              <span className="font-mono text-foreground">data/credit_log.jsonl</span>{" "}
              and visible on the <a href="/commands" className="underline underline-offset-2 hover:text-foreground">Command Log</a> tab.
              Well past the 10-call minimum on every run.
            </div>
          </div>

          {/* Big circular diagram for desktop */}
          <PipelineLoop />

          {/* Compact grid for tablet/mobile — still shows every stage with
              its CLI dropdown so nothing is hidden on small screens. */}
          <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
            {PIPELINE.map((s) => (
              <PipelineCard key={s.n} stage={s} />
            ))}
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
              { n: 1, title: "Hypothesis", desc: "Current scoring weights are loaded as the active model" },
              { n: 2, title: "Experiment", desc: "Discovery run records a snapshot: every token, its score, its entry price" },
              { n: 3, title: "Evaluate", desc: "Forward price checks at +24h / +48h. High-score vs low-score returns compared" },
              { n: 4, title: "Improve", desc: "Weights adjusted if high-score tokens underperform. New version committed" },
            ].map((s) => (
              <div key={s.n} className="glass-card p-4">
                {/*
                  Stage pill: solid foreground/background combo so the text
                  stays readable in BOTH light and dark themes (the previous
                  text-primary / text-accent / text-secondary tokens were too
                  pale on the light glass background).
                */}
                <div className="inline-flex items-center rounded-full bg-foreground text-background px-2 py-0.5 text-[9px] font-mono font-black tracking-wider mb-2">
                  STAGE {s.n}
                </div>
                <div className="text-sm font-bold text-foreground mb-1">{s.title}</div>
                <p className="text-[11px] text-foreground/65 font-medium leading-snug">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="glass-card p-5 text-[12px] text-foreground/70 leading-relaxed font-medium">
            <span className="font-bold text-foreground">Storage:</span> snapshots and evaluations live in flat JSON files on the backend
            (<span className="font-mono text-foreground text-[11px]">data/evolution.json</span> + <span className="font-mono text-foreground text-[11px]">data/scoring_weights.json</span>).
            No database needed at this scale — a snapshot every 4 hours is ~6 records/day.
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
type PipelineStage = (typeof PIPELINE)[number];

function PipelineCard({ stage }: { stage: PipelineStage }) {
  const [open, setOpen] = useState(false);
  const Icon = stage.icon;
  return (
    <div className="glass-card p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        {/*
          Step pill: previous version was bg-primary/15 + text-primary, which
          collapses to near-invisible in light mode where the primary token
          is itself a light tint. Switching to a solid foreground/background
          pill guarantees max contrast in BOTH themes.
        */}
        <span className="inline-flex items-center rounded-full bg-foreground text-background px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
          Step {stage.n}
        </span>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-primary/40 bg-primary/15">
          <Icon className="h-4 w-4 text-foreground" strokeWidth={2.5} />
        </span>
      </div>
      <h3 className="text-sm font-bold text-foreground tracking-tight mb-2">{stage.title}</h3>
      <ul className="space-y-1.5 flex-1">
        {stage.bullets.map((b) => (
          <li key={b} className="flex items-start gap-1.5 text-[11px] text-foreground/75 leading-snug font-medium">
            <span className="mt-1 h-1 w-1 rounded-full bg-primary flex-shrink-0" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 pt-2 border-t border-foreground/10 flex items-center justify-between gap-2">
        <span className="text-[9px] font-mono font-bold text-foreground/55 tracking-wider">{stage.cost.toUpperCase()}</span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="inline-flex items-center gap-1 rounded-full border border-foreground/15 bg-foreground/[0.04] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-foreground/70 hover:bg-foreground/10 hover:text-foreground transition-colors"
        >
          <Terminal className="h-2.5 w-2.5" strokeWidth={2.5} />
          CLI
          <ChevronDown className={cn("h-2.5 w-2.5 transition-transform", open && "rotate-180")} strokeWidth={2.5} />
        </button>
      </div>
      {open && (
        <pre className="mt-3 overflow-x-auto rounded-lg border border-foreground/10 bg-foreground/[0.06] p-2.5 text-[10px] font-mono leading-relaxed text-foreground/85">
          {stage.cli.join("\n")}
        </pre>
      )}
    </div>
  );
}

/**
 * Circular pipeline visualization. Ten stage nodes placed around a ring
 * with the selected stage's detail shown in the center. Reinforces the
 * idea that discovery is a repeating loop — the output of stage 10
 * (self-learning) flows back into stage 1's weights on the next run.
 *
 * Only renders on `lg:` and up (≥1024px); smaller viewports fall back to
 * the compact grid handled above.
 */
function PipelineLoop() {
  const [selected, setSelected] = useState<number>(1);
  const stage = PIPELINE.find((s) => s.n === selected) || PIPELINE[0];
  const Icon = stage.icon;
  const SIZE = 720;
  const RADIUS = 290;
  const CENTER = SIZE / 2;

  return (
    <div className="hidden lg:block">
      <div
        className="relative mx-auto"
        style={{ width: SIZE, height: SIZE }}
      >
        {/* Dashed ring + rotating arrow */}
        <svg
          width={SIZE}
          height={SIZE}
          className="absolute inset-0 pointer-events-none"
          viewBox={`0 0 ${SIZE} ${SIZE}`}
        >
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" className="text-primary" />
            </marker>
          </defs>
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            strokeWidth={1.5}
            strokeDasharray="6 8"
            className="text-foreground/20 stroke-current"
          />
          {/* Flow arc: covers ~340° then arrow back, implying a loop */}
          <path
            d={arcPath(CENTER, CENTER, RADIUS - 6, -85, 265)}
            fill="none"
            strokeWidth={2}
            className="text-primary/45 stroke-current"
            markerEnd="url(#arrow)"
          />
        </svg>

        {/* Stage nodes positioned on the ring */}
        {PIPELINE.map((s, i) => {
          // Angle: start at top (12 o'clock), clockwise. -90° puts stage 1 on top.
          const angle = (i / PIPELINE.length) * 360 - 90;
          const rad = (angle * Math.PI) / 180;
          const x = CENTER + RADIUS * Math.cos(rad);
          const y = CENTER + RADIUS * Math.sin(rad);
          const active = s.n === selected;
          const NodeIcon = s.icon;
          return (
            <button
              key={s.n}
              type="button"
              onClick={() => setSelected(s.n)}
              onMouseEnter={() => setSelected(s.n)}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 rounded-2xl transition-all focus:outline-none",
                "px-2.5 py-2 w-[108px]",
                active
                  ? "bg-primary/25 border-2 border-primary shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.55)] scale-110"
                  : "bg-foreground/[0.04] border border-foreground/15 hover:bg-foreground/10 hover:border-foreground/25"
              )}
              style={{ left: x, top: y }}
              aria-label={`Stage ${s.n}: ${s.title}`}
            >
              <span className="inline-flex items-center gap-1">
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-foreground text-background text-[10px] font-black tabular-nums">
                  {s.n}
                </span>
                <NodeIcon className="h-3.5 w-3.5 text-foreground" strokeWidth={2.5} />
              </span>
              <span className="text-[10px] font-bold text-foreground text-center leading-tight">
                {s.title}
              </span>
            </button>
          );
        })}

        {/* Center detail panel for the currently selected stage */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px]"
        >
          <div className="glass-card p-5 bg-background/85 backdrop-blur-md border-primary/30 shadow-[0_12px_40px_-12px_hsl(var(--primary)/0.35)]">
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center rounded-full bg-foreground text-background px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                Step {stage.n} / {PIPELINE.length}
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-primary/40 bg-primary/15">
                <Icon className="h-4 w-4 text-foreground" strokeWidth={2.5} />
              </span>
            </div>
            <h3 className="text-base font-bold text-foreground tracking-tight mb-2">{stage.title}</h3>
            <ul className="space-y-1.5 mb-3">
              {stage.bullets.map((b) => (
                <li key={b} className="flex items-start gap-1.5 text-[11px] text-foreground/75 leading-snug font-medium">
                  <span className="mt-1 h-1 w-1 rounded-full bg-primary flex-shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="pt-2 border-t border-foreground/10 flex items-center justify-between gap-2">
              <span className="text-[9px] font-mono font-bold text-foreground/55 tracking-wider">{stage.cost.toUpperCase()}</span>
              <span className="text-[9px] font-mono text-foreground/45 tracking-wider">LOOPS BACK TO STEP 1</span>
            </div>
            <pre className="mt-3 overflow-x-auto rounded-lg border border-foreground/10 bg-foreground/[0.06] p-2.5 text-[10px] font-mono leading-relaxed text-foreground/85">
              {stage.cli.join("\n")}
            </pre>
          </div>
        </div>
      </div>
      <p className="text-center text-[11px] text-foreground/55 font-medium mt-4">
        Click a node or hover to inspect. Output of stage 10 feeds back into stage 1 — the loop is the feature.
      </p>
    </div>
  );
}

/** Polar → Cartesian for SVG arc construction. */
function polarToCart(cx: number, cy: number, r: number, angleDeg: number) {
  const a = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

/** Build an SVG arc path from startAngle to startAngle+sweepDeg clockwise. */
function arcPath(cx: number, cy: number, r: number, startAngle: number, sweepDeg: number) {
  const start = polarToCart(cx, cy, r, startAngle);
  const end = polarToCart(cx, cy, r, startAngle + sweepDeg);
  const largeArc = sweepDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

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
