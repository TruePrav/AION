"use client";

import { useState } from "react";

interface Feature {
  title: string;
  description: string;
  status: "shipped" | "in_progress" | "planned";
  phase: "1" | "2" | "3";
  eta?: string;
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
    title: "Live Paper Portfolio",
    description: "10 simulated positions with real DexScreener prices, live P/L, editable SL/TP targets, and progress bars.",
  },
  {
    phase: "1",
    status: "shipped",
    title: "Explicit Nansen CLI Command Log",
    description: "Every backend call shown as a monospace command block with credit cost, duration, and copy-to-clipboard — full transparency.",
  },

  // ── Phase 2 (Coming Next) ──
  {
    phase: "2",
    status: "in_progress",
    title: "Non-Custodial Copy Trade",
    description: "One-click wallet-to-wallet copy trading. AION finds the signal, you sign the swap with your own wallet. Zero custody, zero trust required.",
    eta: "~1-2 days after competition",
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
    title: "Auto SL/TP via Nansen Wallet",
    description: "Background monitor loop that watches open positions and auto-executes exits via `nansen trade` when stop-loss or take-profit levels are hit.",
    eta: "2-3 days post-comp",
    highlights: [
      "Per-position SL/TP (already wired in UI)",
      "30s tick against Jupiter prices",
      "Slippage guard — reject fills >10% off market",
      "Liquidity gate — refuse exit if pool < $10k",
      "Kill-switch endpoint + UI badge for safety",
      "Live mode behind LIVE_TRADING=1 env flag",
    ],
  },
  {
    phase: "2",
    status: "in_progress",
    title: "Admin Control Panel (secure)",
    description: "A password-gated admin view at /admin that enables the hidden mutation controls (edit SL/TP, close positions, trigger copy trades, update settings) — keeping the public site locked down as view-only.",
    eta: "1 day",
    highlights: [
      "HttpOnly session cookie auth (no key in browser)",
      "Rate-limited via Flask-Limiter",
      "IP allowlist option for extra lockdown",
      "All admin actions audit-logged to /data/audit.jsonl",
      "Public site stays pure read-only, no attack surface",
    ],
  },
  {
    phase: "2",
    status: "planned",
    title: "Public Telegram Signal Channel",
    description: "@AIONSignals — free public broadcast of every high-conviction discovery with rich embeds (graph, reasoning, CLI commands).",
    eta: "1 day",
  },
  {
    phase: "2",
    status: "planned",
    title: "Multi-Chain Expansion",
    description: "ETH + Base + BNB scanning alongside Solana. Cross-chain convergence signals when the same smart-money cluster accumulates on multiple chains.",
    eta: "1 week",
  },
  {
    phase: "2",
    status: "planned",
    title: "Multi-Timeframe Convergence",
    description: "Scan 1h / 4h / 24h / 7d windows simultaneously. Highest conviction signals are the ones that align across all four.",
    eta: "3-4 days",
  },

  // ── Phase 3 (Long-term) ──
  {
    phase: "3",
    status: "planned",
    title: "Multi-User Watchlists",
    description: "Personal AION per user. Save favorite tokens, set custom alerts, track your own Nansen CLI usage.",
    eta: "2+ weeks",
    highlights: [
      "Supabase auth + per-user state",
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
    shipped: { label: "SHIPPED", color: "bg-primary/25 text-primary border-primary/50" },
    in_progress: { label: "IN PROGRESS", color: "bg-accent/25 text-accent border-accent/50" },
    planned: { label: "PLANNED", color: "bg-foreground/5 text-foreground/60 border-foreground/15" },
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
        {feature.eta && (
          <span className="text-[10px] text-foreground/55 font-mono font-semibold">ETA {feature.eta}</span>
        )}
      </div>
      <h3 className="text-base font-bold text-foreground leading-tight mb-2 tracking-tight">{feature.title}</h3>
      <p className="text-[13px] text-foreground/70 leading-relaxed font-medium">{feature.description}</p>
      {hasHighlights && (
        <>
          <button
            onClick={() => setOpen((v) => !v)}
            className="mt-3 text-[11px] font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
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
              <span className="text-[10px] font-mono font-bold tracking-wider text-primary bg-primary/20 border border-primary/40 px-2 py-0.5 rounded">
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
              <div className="rounded-xl border border-primary/40 bg-primary/15 p-3 backdrop-blur-md">
                <div className="text-2xl font-bold text-primary font-mono tabular-nums">{counts.shipped}</div>
                <div className="text-[10px] text-primary/80 font-bold tracking-wider">SHIPPED</div>
              </div>
              <div className="rounded-xl border border-accent/40 bg-accent/15 p-3 backdrop-blur-md">
                <div className="text-2xl font-bold text-accent font-mono tabular-nums">{counts.inProgress}</div>
                <div className="text-[10px] text-accent/80 font-bold tracking-wider">IN PROGRESS</div>
              </div>
              <div className="rounded-xl border border-foreground/15 bg-foreground/5 p-3 backdrop-blur-md">
                <div className="text-2xl font-bold text-foreground/80 font-mono tabular-nums">{counts.planned}</div>
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
          accent="bg-primary/20 text-primary"
        />

        <PhaseSection
          phase="2"
          title="Coming next"
          subtitle="post-competition, next 1–2 weeks"
          features={p2}
          accent="bg-accent/20 text-accent"
        />

        <PhaseSection
          phase="3"
          title="The vision"
          subtitle="long-term bets"
          features={p3}
          accent="bg-foreground/10 text-foreground/70"
        />

        {/* ── Footer CTA ── */}
        <div className="glass-card p-6 text-center">
          <p className="text-sm text-foreground/75 font-medium">
            Want to follow AION&apos;s development? Signals drop soon on{" "}
            <span className="text-primary font-bold">@AIONSignals</span> — stay tuned.
          </p>
        </div>
      </div>
    </div>
  );
}
