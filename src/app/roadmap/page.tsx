"use client";

import { useState } from "react";

interface Feature {
  title: string;
  description: string;
  status: "shipped" | "in_progress" | "planned";
  phase: "1" | "2" | "3";
  highlights?: string[];
  tag?: string;
}

const FEATURES: Feature[] = [
  // ── Phase 1 (Shipped) ──
  {
    phase: "1",
    status: "shipped",
    title: "Nansen CLI Discovery Pipeline",
    description: "8-stage autonomous scanner — from raw hot tokens to graded, risk-filtered, convergence-validated alpha.",
    highlights: [
      "Hot token scan + smart-money filter",
      "Wallet grading (S/A/B/C/D) via Nansen profiler",
      "Accumulation scoring (buy/sell ratio, HHI, volume consistency)",
      "GoPlus security validation",
      "Risk tier presets (degen / balanced / conservative)",
    ],
  },
  {
    phase: "1",
    status: "shipped",
    title: "Wallet Convergence Graph",
    description: "Bubblemap-style force-directed visualization showing smart-money clusters and shared wallet relationships.",
    highlights: [
      "Zero-dep SVG force layout",
      "Draggable nodes with grade-colored bubbles",
      "Hover tooltips + target highlighting",
    ],
  },
  {
    phase: "1",
    status: "shipped",
    title: "AI Signal Reasoning",
    description: "Per-token verdicts (strong_buy / buy / watch / avoid) with confidence scores, bullish/bearish factor breakdowns, and risk flags.",
  },
  {
    phase: "1",
    status: "shipped",
    title: "Self-Evolving Scoring",
    description: "Karpathy autoresearch-pattern loop: record → observe performance → LLM proposes weight adjustments → evaluate → commit.",
    highlights: [
      "Tracks discovery snapshots + forward returns",
      "Compares high-score vs low-score performance",
      "Suggests weight changes with reasoning",
    ],
  },
  {
    phase: "1",
    status: "shipped",
    title: "Live Portfolio + Copy Trading",
    description: "Real positions with DexScreener prices, live P/L, editable SL/TP targets, progress bars, and one-click copy trading via Nansen API.",
    highlights: [
      "Quick buy from discovery page or wallet detail",
      "Custom trade amounts + preset buttons",
      "Auto SL/TP monitoring with 5-minute cron",
      "Dry run / live toggle from dashboard settings",
    ],
  },
  {
    phase: "1",
    status: "shipped",
    title: "Explicit Nansen CLI Command Log",
    description: "Every backend call shown as a monospace command block with credit cost, duration, and copy-to-clipboard — full transparency.",
  },
  {
    phase: "1",
    status: "shipped",
    title: "Polymarket Whale Intelligence",
    description: "Same discovery playbook on prediction markets. Scans hot markets, extracts top holders, grades them, and surfaces wallets betting across multiple events.",
    tag: "cross-market",
    highlights: [
      "Nansen prediction-market: market-screener + top-holders + trades-by-market",
      "Grades whales S/A/B/C/D by position size + unrealized PnL + breadth",
      "Convergence detection: wallets appearing in ≥2 hot markets",
      "Deep-dive view with top holders and recent trade flow per market",
      "~31 credits per run, 4h default cadence",
    ],
  },
  {
    phase: "1",
    status: "shipped",
    title: "Telegram Discovery Bot",
    description: "Push notifications after every 4h discovery run (EVM + Polymarket) with top tokens/markets, chart links, and credit usage.",
    highlights: [
      "Fires from cron — no polling daemon needed",
      "HTML formatting with inline DexScreener links",
      "Separate messages for EVM + Polymarket runs",
      "Smart alerts for whale moves and convergence events",
    ],
  },
  {
    phase: "1",
    status: "shipped",
    title: "Manual Scan Trigger + Live Status",
    description: "On-demand discovery scans from the dashboard with real-time progress tracking, step indicators, and completion summaries.",
  },

  // ── Phase 2 (Coming Next) ──
  {
    phase: "2",
    status: "in_progress",
    title: "Non-Custodial Wallet Connect",
    description: "Connect your own wallet to execute trades directly. AION finds the signal, you sign the swap. Zero custody, zero trust required.",
    tag: "killer feature",
    highlights: [
      "Phantom / Solflare / Backpack via @solana/wallet-adapter",
      "Jupiter v6 swap API for routing + price discovery",
      "Browser builds the tx, user signs, user broadcasts",
      "AION never touches private keys",
      "Per-token size slider + slippage control",
    ],
  },
  {
    phase: "2",
    status: "in_progress",
    title: "Multi-Chain Expansion",
    description: "Full scanning across all Nansen-supported chains. Cross-chain convergence signals when the same smart-money cluster accumulates on multiple chains.",
    highlights: [
      "Currently live: Solana, Base",
      "Adding: Ethereum, BNB, Arbitrum, Optimism, Polygon, Avalanche",
      "Also supported: Scroll, Linea, Mantle, Sei, Sonic, Ronin, Monad, HyperEVM, Plasma, IOTA EVM",
      "Cross-chain wallet matching + unified leaderboard",
    ],
  },
  {
    phase: "2",
    status: "planned",
    title: "Telegram Trading Controls",
    description: "Interactive controls beyond notifications. Inline Buy/Skip buttons on each summary, /buy /close slash commands, and opt-in auto-buy for high-conviction signals.",
    tag: "phase 2",
    highlights: [
      "Inline Buy $10 / $25 / $100 buttons per token",
      "/positions, /close, /status slash commands",
      "/autobuy on|off toggle with per-user budget",
    ],
  },
  {
    phase: "2",
    status: "planned",
    title: "Multi-Timeframe Convergence",
    description: "Scan 1h / 4h / 24h / 7d windows simultaneously. Highest conviction signals are the ones that align across all four.",
  },

  // ── Phase 3 (Long-term) ──
  {
    phase: "3",
    status: "planned",
    title: "Multi-User Platform",
    description: "Personal AION per user. Save favorite tokens, set custom alerts, track your own portfolio with on-chain history.",
    highlights: [
      "Auth + per-user state",
      "Encrypted wallet connection storage",
      "Personal P/L tracking from on-chain history",
    ],
  },
  {
    phase: "3",
    status: "planned",
    title: "Wallet Behavior Prediction",
    description: "Time-series ML on wallet clusters to predict next moves — not just detect current positions. Going beyond syndicate mapping.",
  },
  {
    phase: "3",
    status: "planned",
    title: "Cross-Market Intelligence",
    description: "Combine on-chain smart-money signals with Polymarket, Farcaster sentiment, and governance vote data for a holistic alpha score.",
  },
  {
    phase: "3",
    status: "planned",
    title: "AION MCP Server",
    description: "Expose the full discovery + reasoning pipeline as an MCP tool so any LLM (Claude, GPT) can query AION conversationally.",
    tag: "AI-native",
  },
];

function StatusBadge({ status }: { status: Feature["status"] }) {
  const cfg = {
    shipped: { label: "SHIPPED", color: "bg-primary/25 text-foreground border-primary/60" },
    in_progress: { label: "IN PROGRESS", color: "bg-accent/30 text-foreground border-accent/60" },
    planned: { label: "PLANNED", color: "bg-foreground/5 text-foreground/70 border-foreground/15" },
  }[status];
  return (
    <span className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function PhaseSection({
  phase,
  title,
  subtitle,
  features,
  accent,
}: {
  phase: "1" | "2" | "3";
  title: string;
  subtitle: string;
  features: Feature[];
  accent: string;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-baseline gap-3 flex-wrap border-b border-foreground/10 pb-3">
        <span className={`text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded ${accent}`}>
          PHASE {phase}
        </span>
        <h2 className="text-xl font-bold text-foreground tracking-tight">{title}</h2>
        <span className="text-xs text-foreground/55">· {subtitle}</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {features.map((f, i) => (
          <FeatureCard key={i} feature={f} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  const [open, setOpen] = useState(false);
  const hasHighlights = (feature.highlights?.length ?? 0) > 0;

  return (
    <div
      className={`glass-card p-5 transition-colors ${
        feature.status === "in_progress"
          ? "ring-1 ring-accent/30"
          : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={feature.status} />
          {feature.tag && (
            <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full border bg-secondary/25 text-secondary border-secondary/50">
              {feature.tag.toUpperCase()}
            </span>
          )}
        </div>
      </div>
      <h3 className="text-base font-bold text-foreground leading-tight mb-2 tracking-tight">{feature.title}</h3>
      <p className="text-[13px] text-foreground/70 leading-relaxed font-medium">{feature.description}</p>
      {hasHighlights && (
        <>
          <button
            onClick={() => setOpen((v) => !v)}
            className="mt-3 text-[11px] font-bold text-foreground/80 hover:text-foreground transition-colors flex items-center gap-1"
          >
            <span>{open ? "Hide" : "Show"} details</span>
            <svg
              className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          {open && (
            <ul className="mt-2 space-y-1.5 text-[12px] text-foreground/75 font-medium">
              {feature.highlights!.map((h, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-primary font-mono flex-shrink-0 font-bold">›</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default function RoadmapPage() {
  const p1 = FEATURES.filter((f) => f.phase === "1");
  const p2 = FEATURES.filter((f) => f.phase === "2");
  const p3 = FEATURES.filter((f) => f.phase === "3");
  const counts = {
    shipped: FEATURES.filter((f) => f.status === "shipped").length,
    inProgress: FEATURES.filter((f) => f.status === "in_progress").length,
    planned: FEATURES.filter((f) => f.status === "planned").length,
  };

  return (
    <div className="glass-bg min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* ── Hero ── */}
        <div className="glass-card p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-mono font-bold tracking-wider text-foreground bg-primary/25 border border-primary/50 px-2 py-0.5 rounded">
                ROADMAP
              </span>
              <span className="text-[10px] text-foreground/55 font-semibold">
                Updated {new Date().toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3">
              Where AION is going next
            </h1>
            <p className="text-foreground/70 max-w-2xl leading-relaxed text-sm font-medium">
              The product is live for Week 4 of the Nansen CLI competition. Here&apos;s what&apos;s shipped,
              what&apos;s coming next, and what we&apos;re dreaming about.
            </p>

            <div className="grid grid-cols-3 gap-3 mt-6 max-w-md">
              <div className="rounded-xl border border-primary/40 bg-primary/15 p-3">
                <div className="text-2xl font-bold text-foreground font-mono tabular-nums">{counts.shipped}</div>
                <div className="text-[10px] text-foreground/75 font-bold tracking-wider">SHIPPED</div>
              </div>
              <div className="rounded-xl border border-accent/50 bg-accent/20 p-3">
                <div className="text-2xl font-bold text-foreground font-mono tabular-nums">{counts.inProgress}</div>
                <div className="text-[10px] text-foreground/75 font-bold tracking-wider">IN PROGRESS</div>
              </div>
              <div className="rounded-xl border border-foreground/15 bg-foreground/5 p-3">
                <div className="text-2xl font-bold text-foreground font-mono tabular-nums">{counts.planned}</div>
                <div className="text-[10px] text-foreground/60 font-bold tracking-wider">PLANNED</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Phase sections ── */}
        <PhaseSection
          phase="1"
          title="Live today"
          subtitle="shipped for Nansen CLI competition Week 4"
          features={p1}
          accent="bg-primary/25 text-foreground border border-primary/50"
        />

        <PhaseSection
          phase="2"
          title="Coming next"
          subtitle="post-competition"
          features={p2}
          accent="bg-accent/25 text-foreground border border-accent/50"
        />

        <PhaseSection
          phase="3"
          title="The vision"
          subtitle="long-term bets"
          features={p3}
          accent="bg-foreground/10 text-foreground/80 border border-foreground/15"
        />
      </div>
    </div>
  );
}
