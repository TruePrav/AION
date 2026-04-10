"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, type DiscoveryWallet } from "@/lib/api";
import { fmtUsd, fmtPct, truncAddr, cn } from "@/lib/utils";
import GradeBadge from "@/components/GradeBadge";
import CopyButton from "@/components/CopyButton";
import { AlertTriangle, TrendingUp, Target, Activity, ArrowUpRight, Info, LayoutGrid, List } from "lucide-react";

type Grade = "S" | "A" | "B" | "C" | "D";

type SortKey = "score" | "pnl" | "winrate" | "trades" | "unrealized";

export default function WalletsPage() {
  const [wallets, setWallets] = useState<DiscoveryWallet[]>([]);
  const [filter, setFilter] = useState<Grade | "ALL">("ALL");
  const [sort, setSort] = useState<SortKey>("pnl");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
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

  // Sort that pushes wallets with no signal (e.g. win_rate=0 because they
  // have no closed trades yet) to the BOTTOM regardless of direction. That
  // fixes the "broken sort" complaint where sorting by win rate showed a sea
  // of zero-trade wallets at the top.
  const filtered = [...wallets]
    .filter((w) => filter === "ALL" || w.grade === filter)
    .sort((a, b) => {
      const getKey = (w: DiscoveryWallet): { value: number; valid: boolean } => {
        switch (sort) {
          case "score":
            return { value: w.score || 0, valid: (w.score || 0) > 0 };
          case "pnl":
            return { value: w.total_pnl_realized || 0, valid: w.total_trades > 0 };
          case "winrate":
            return { value: w.win_rate || 0, valid: w.total_trades > 0 };
          case "trades":
            return { value: w.total_trades || 0, valid: true };
          case "unrealized":
            return { value: w.total_pnl_unrealized || 0, valid: true };
        }
      };
      const ka = getKey(a);
      const kb = getKey(b);
      // Always sink invalid rows to the end so they don't dominate the top.
      if (ka.valid !== kb.valid) return ka.valid ? -1 : 1;
      const diff = ka.value - kb.value;
      return sortDir === "desc" ? -diff : diff;
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
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="glass-input text-xs font-semibold cursor-pointer"
            >
              <option value="score">Score</option>
              <option value="pnl">Realized PnL</option>
              <option value="unrealized">Unrealized PnL</option>
              <option value="winrate">Win rate</option>
              <option value="trades">Trade count</option>
            </select>
            <button
              type="button"
              onClick={() => setSortDir(sortDir === "desc" ? "asc" : "desc")}
              title={`Switch to ${sortDir === "desc" ? "ascending" : "descending"} order`}
              className="rounded-lg bg-foreground/5 border border-foreground/15 px-2.5 py-1.5 text-[11px] font-bold text-foreground/80 hover:bg-foreground/10 transition-colors"
            >
              {sortDir === "desc" ? "↓ High first" : "↑ Low first"}
            </button>
            {/* View toggle */}
            <div className="flex rounded-lg border border-foreground/15 overflow-hidden">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="Grid view"
                className={cn(
                  "px-2.5 py-1.5 transition-colors",
                  viewMode === "grid"
                    ? "bg-foreground text-background"
                    : "bg-foreground/5 text-foreground/60 hover:bg-foreground/10"
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                title="List view"
                className={cn(
                  "px-2.5 py-1.5 transition-colors",
                  viewMode === "list"
                    ? "bg-foreground text-background"
                    : "bg-foreground/5 text-foreground/60 hover:bg-foreground/10"
                )}
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Win rate explainer — answers the user's "100% win rate but
            unrealized losses?" confusion. Win rate only counts CLOSED
            trades; open positions can be down without affecting it. */}
        <div className="rounded-xl bg-foreground/[0.04] border border-foreground/10 px-4 py-3 flex items-start gap-2.5 text-[12px] text-foreground/70 leading-relaxed">
          <Info className="h-3.5 w-3.5 text-foreground/50 mt-0.5 flex-shrink-0" />
          <p>
            <span className="font-bold text-foreground/85">Win rate</span> is the share of
            this wallet&apos;s <em>closed</em> trades that ended profitably. Open positions
            (which feed the <span className="font-bold text-foreground/85">Unrealized</span>
            {" "}row) are <em>not</em> in this calculation, so it&apos;s normal to see a 100% win
            rate alongside negative unrealized PnL — it just means every realized exit was
            green but some held positions are currently down.
          </p>
        </div>

        {/* ── Wallet Grid / List ── */}
        {filtered.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <p className="text-sm text-foreground/60">No wallets match your filter</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((w) => (
              <WalletCard key={w.address} w={w} />
            ))}
          </div>
        ) : (
          <WalletListView wallets={filtered} />
        )}

        {/* ── Footer note ── */}
        <div className="text-center text-[11px] text-foreground/40 space-y-1 pt-4">
          <p>Data from latest discovery run.</p>
          <p>
            <a
              href="https://t.me/AIONSignalBot"
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
// WalletListView — compact table layout
// ════════════════════════════════════════════════════════════════

function WalletListView({ wallets }: { wallets: DiscoveryWallet[] }) {
  const colClass = "grid-cols-[36px_1fr_56px_64px_48px_80px_80px_56px] md:grid-cols-[40px_1fr_70px_70px_60px_90px_90px_60px]";
  return (
    <div className="glass-card overflow-x-auto">
      {/* Header */}
      <div className={cn("grid gap-2 px-4 py-2.5 border-b border-foreground/10 bg-foreground/[0.03] min-w-[600px]", colClass)}>
        <span className="text-[9px] font-bold uppercase tracking-wider text-foreground/40">Grade</span>
        <span className="text-[9px] font-bold uppercase tracking-wider text-foreground/40">Wallet</span>
        <span className="text-[9px] font-bold uppercase tracking-wider text-foreground/40 text-right">Score</span>
        <span className="text-[9px] font-bold uppercase tracking-wider text-foreground/40 text-right">Win Rate</span>
        <span className="text-[9px] font-bold uppercase tracking-wider text-foreground/40 text-right">Trades</span>
        <span className="text-[9px] font-bold uppercase tracking-wider text-foreground/40 text-right">Realized</span>
        <span className="text-[9px] font-bold uppercase tracking-wider text-foreground/40 text-right">Unrealized</span>
        <span className="text-[9px] font-bold uppercase tracking-wider text-foreground/40 text-right">Chain</span>
      </div>
      {/* Rows */}
      {wallets.map((w) => {
        const hasClosedTrades = w.total_trades > 0;
        return (
          <Link
            key={w.address}
            href={`/wallet/${w.address}`}
            className={cn("grid gap-2 px-4 py-2.5 border-b border-foreground/[0.06] hover:bg-foreground/[0.05] transition-colors items-center min-w-[600px]", colClass)}
          >
            <GradeBadge grade={w.grade as Grade} size="sm" />
            <div className="min-w-0 flex items-center gap-1.5">
              <span className="font-bold text-foreground text-xs truncate">
                {w.label || truncAddr(w.address, 6)}
              </span>
              <span className="font-mono text-[10px] text-foreground/35 hidden sm:inline">
                {truncAddr(w.address, 4)}
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-foreground tabular-nums text-right">
              {w.score}
            </span>
            <span
              className={cn(
                "font-mono text-xs font-bold tabular-nums text-right",
                !hasClosedTrades
                  ? "text-foreground/40"
                  : w.win_rate >= 0.7
                    ? "text-profit"
                    : w.win_rate >= 0.5
                      ? "text-foreground"
                      : "text-loss"
              )}
            >
              {hasClosedTrades ? fmtPct(w.win_rate) : "—"}
            </span>
            <span className="font-mono text-xs text-foreground/80 tabular-nums text-right">
              {w.total_trades}
            </span>
            <span
              className={cn(
                "font-mono text-xs font-bold tabular-nums text-right",
                w.total_pnl_realized >= 0 ? "text-profit" : "text-loss"
              )}
            >
              {w.total_pnl_realized >= 0 ? "+" : ""}
              {fmtUsdCompact(w.total_pnl_realized)}
            </span>
            <span
              className={cn(
                "font-mono text-xs font-bold tabular-nums text-right",
                w.total_pnl_unrealized >= 0 ? "text-profit" : "text-loss"
              )}
            >
              {w.total_pnl_unrealized >= 0 ? "+" : ""}
              {fmtUsdCompact(w.total_pnl_unrealized)}
            </span>
            <span className="text-[10px] text-foreground/50 font-semibold text-right capitalize">
              {w.chain || "—"}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// WalletCard — tile in the grid
// ════════════════════════════════════════════════════════════════

function WalletCard({ w }: { w: DiscoveryWallet }) {
  const pnlPos = w.total_pnl_realized >= 0;
  const hasClosedTrades = w.total_trades > 0;
  const winHigh = hasClosedTrades && w.win_rate >= 0.7;
  const winMid = hasClosedTrades && w.win_rate >= 0.5 && w.win_rate < 0.7;

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
          value={hasClosedTrades ? fmtPct(w.win_rate) : "—"}
          // No closed trades = render as muted, not as red. Red implies a
          // bad signal; "no signal" should look neutral.
          valueClass={
            !hasClosedTrades
              ? "text-foreground/40"
              : winHigh
                ? "text-profit"
                : winMid
                  ? "text-foreground"
                  : "text-loss"
          }
          tooltip="Share of CLOSED trades that ended profitably. Open positions don't count — that's why a 100% win rate can coexist with negative unrealized PnL."
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
  tooltip,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
  tooltip?: string;
}) {
  return (
    <div
      className="rounded-lg bg-foreground/[0.035] border border-foreground/10 px-2.5 py-2"
      title={tooltip}
    >
      <div className="flex items-center gap-1 text-foreground/45 text-[9px] font-bold uppercase tracking-wider">
        {icon}
        {label}
        {tooltip && <Info className="h-2.5 w-2.5 opacity-60" />}
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
