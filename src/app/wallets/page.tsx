"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, type DiscoveryWallet } from "@/lib/api";
import { fmtUsd, fmtPct, truncAddr, cn } from "@/lib/utils";
import GradeBadge from "@/components/GradeBadge";
import CopyButton from "@/components/CopyButton";
import { AlertTriangle, TrendingUp, Target, Activity, ArrowUpRight } from "lucide-react";

type Grade = "S" | "A" | "B" | "C" | "D";

export default function WalletsPage() {
  const [wallets, setWallets] = useState<DiscoveryWallet[]>([]);
  const [filter, setFilter] = useState<Grade | "ALL">("ALL");
  const [sort, setSort] = useState<"score" | "pnl" | "winrate">("score");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<DiscoveryWallet[]>("/api/discovery/wallets")
      .then(setWallets)
      .catch((e) => setError(e.message || "Failed to load wallets"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="glass-bg min-h-screen flex flex-col items-center justify-center">
        <div className="h-10 w-10 border-2 border-foreground/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-sm text-foreground/60">Loading wallets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-bg min-h-screen flex flex-col items-center justify-center">
        <AlertTriangle className="h-8 w-8 mb-3 text-accent" />
        <p className="text-base font-semibold text-foreground mb-1">Failed to load wallets</p>
        <p className="text-sm text-foreground/60">{error}</p>
      </div>
    );
  }

  const filtered = wallets
    .filter((w) => filter === "ALL" || w.grade === filter)
    .sort((a, b) => {
      if (sort === "score") return b.score - a.score;
      if (sort === "pnl") return b.total_pnl_realized - a.total_pnl_realized;
      return b.win_rate - a.win_rate;
    });

  return (
    <div className="glass-bg min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">
        {/* ── Header ── */}
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Wallets</h1>
            <p className="text-sm text-foreground/60 mt-1">
              {filtered.length} smart money wallets from latest discovery
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/5 border border-foreground/15 px-2.5 py-1 text-[11px] font-semibold text-foreground/80">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" />
              {wallets.length} tracked
            </span>
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Grade filter */}
          <div className="flex gap-1.5 flex-wrap">
            {(["ALL", "S", "A", "B", "C", "D"] as const).map((g) => {
              const isActive = filter === g;
              return (
                <button
                  key={g}
                  onClick={() => setFilter(g)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all border",
                    isActive
                      ? "bg-foreground text-background border-foreground shadow-[0_4px_16px_-4px_hsl(var(--foreground)/0.3)]"
                      : "bg-foreground/5 text-foreground/70 border-foreground/15 hover:bg-foreground/10 hover:text-foreground"
                  )}
                >
                  {g}
                </button>
              );
            })}
          </div>
          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-foreground/50 font-semibold uppercase tracking-wider">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as "score" | "pnl" | "winrate")}
              className="glass-input text-xs font-semibold cursor-pointer"
            >
              <option value="score">Score</option>
              <option value="pnl">Realized PnL</option>
              <option value="winrate">Win rate</option>
            </select>
          </div>
        </div>

        {/* ── Wallet Grid ── */}
        {filtered.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <p className="text-sm text-foreground/60">No wallets match your filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((w) => (
              <WalletCard key={w.address} w={w} />
            ))}
          </div>
        )}

        {/* ── Footer note ── */}
        <div className="text-center text-[11px] text-foreground/40 space-y-1 pt-4">
          <p>Data from latest discovery run.</p>
          <p>
            <a
              href="https://t.me/OracleAITradingBot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Run /discover on Telegram
            </a>{" "}
            to refresh.
          </p>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// WalletCard — tile in the grid
// ════════════════════════════════════════════════════════════════

function WalletCard({ w }: { w: DiscoveryWallet }) {
  const pnlPos = w.total_pnl_realized >= 0;
  const winHigh = w.win_rate >= 0.7;
  const winMid = w.win_rate >= 0.5 && w.win_rate < 0.7;

  return (
    <div className="glass-card p-5 group hover:bg-foreground/[0.07] transition-colors">
      {/* Header: grade + score + address */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <GradeBadge grade={w.grade as Grade} size="lg" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <Link
                href={`/wallet/${w.address}`}
                className="font-bold text-foreground text-sm truncate max-w-[180px] hover:text-primary transition-colors"
              >
                {w.label || truncAddr(w.address, 8)}
              </Link>
              <ArrowUpRight className="h-3 w-3 text-foreground/40 group-hover:text-foreground transition-colors" />
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-mono text-[10px] text-foreground/45">
                {truncAddr(w.address, 4)}
              </span>
              <CopyButton text={w.address} />
            </div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-[10px] text-foreground/40 uppercase font-bold tracking-wider">Score</div>
          <div className="font-mono text-xl font-bold text-foreground tabular-nums leading-none mt-0.5">
            {w.score}
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <Kpi
          icon={<Target className="h-3 w-3" />}
          label="Win rate"
          value={w.win_rate > 0 ? fmtPct(w.win_rate) : "—"}
          valueClass={
            winHigh ? "text-profit" : winMid ? "text-foreground" : "text-loss"
          }
        />
        <Kpi
          icon={<Activity className="h-3 w-3" />}
          label="Trades"
          value={String(w.total_trades)}
          valueClass="text-foreground"
        />
        <Kpi
          icon={<TrendingUp className="h-3 w-3" />}
          label="Realized"
          value={
            (w.total_pnl_realized >= 0 ? "+" : "") +
            fmtUsdCompact(w.total_pnl_realized)
          }
          valueClass={pnlPos ? "text-profit" : "text-loss"}
        />
      </div>

      {/* Unrealized pnl strip */}
      <div className="flex items-center justify-between gap-3 rounded-lg bg-foreground/[0.035] border border-foreground/10 px-3 py-2 mb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">
          Unrealized
        </span>
        <span
          className={cn(
            "font-mono text-sm font-bold tabular-nums",
            w.total_pnl_unrealized >= 0 ? "text-profit" : "text-loss"
          )}
        >
          {w.total_pnl_unrealized >= 0 ? "+" : ""}
          {fmtUsd(w.total_pnl_unrealized)}
        </span>
      </div>

      {/* Top tokens */}
      {w.top_tokens.length > 0 && (
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 mb-2">
            Top tokens
          </div>
          <div className="flex flex-wrap gap-1.5">
            {w.top_tokens.slice(0, 4).map((t) => (
              <span
                key={t.address}
                className="inline-flex items-center gap-1 rounded-full bg-foreground/8 border border-foreground/15 px-2 py-0.5 text-[10px]"
              >
                <span className="font-bold text-foreground truncate max-w-[60px]">{t.symbol}</span>
                <span
                  className={cn(
                    "font-mono tabular-nums font-semibold",
                    t.pnl_realized >= 0 ? "text-profit" : "text-loss"
                  )}
                >
                  {t.roi >= 0 ? "+" : ""}
                  {(t.roi * 100).toFixed(0)}%
                </span>
              </span>
            ))}
            {w.top_tokens.length > 4 && (
              <span className="inline-flex items-center rounded-full bg-foreground/5 border border-foreground/10 px-2 py-0.5 text-[10px] text-foreground/50">
                +{w.top_tokens.length - 4}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-lg bg-foreground/[0.035] border border-foreground/10 px-2.5 py-2">
      <div className="flex items-center gap-1 text-foreground/45 text-[9px] font-bold uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <div
        className={cn(
          "font-mono text-[13px] font-bold tabular-nums mt-0.5 truncate",
          valueClass || "text-foreground"
        )}
      >
        {value}
      </div>
    </div>
  );
}

// Compact $ formatter for small tiles
function fmtUsdCompact(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `$${(v / 1e3).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}
