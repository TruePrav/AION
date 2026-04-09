"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import StatCard from "@/components/StatCard";
import { AlertTriangle, TrendingUp, BarChart3, Trophy, Activity } from "lucide-react";

interface Trade {
  id: string;
  token: string;
  symbol?: string;
  chain: string;
  side: "buy" | "sell";
  size_usdc: number;
  entry_price: number;
  exit_price: number | null;
  status: "open" | "closed" | "stopped";
  pnl_usd: number | null;
  pnl_pct: number | null;
  tx_hash?: string;
  timestamp: string;
  dry_run?: boolean;
  recommended?: boolean;
  grade?: string;
  exit_reason?: string | null;
}

interface TradeStats {
  total: number;
  wins: number;
  losses: number;
  win_rate: number;
  total_pnl: number;
  avg_profit: number;
  avg_loss: number;
}

const CHAIN_STYLES: Record<string, string> = {
  solana: "bg-[hsl(270_50%_50%/0.15)] border-[hsl(270_60%_55%/0.4)] text-[hsl(270_60%_40%)] dark:text-[hsl(270_80%_80%)]",
  ethereum: "bg-[hsl(210_50%_50%/0.15)] border-[hsl(210_60%_55%/0.4)] text-[hsl(210_70%_38%)] dark:text-[hsl(210_85%_80%)]",
  base: "bg-[hsl(220_60%_50%/0.15)] border-[hsl(220_70%_55%/0.4)] text-[hsl(220_75%_38%)] dark:text-[hsl(220_85%_80%)]",
};

function chainBadge(chain: string) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border",
        CHAIN_STYLES[chain] ?? "bg-foreground/5 border-foreground/15 text-foreground/70"
      )}
    >
      {chain}
    </span>
  );
}

function sideBadge(side: "buy" | "sell") {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase border",
        side === "buy"
          ? "bg-profit/15 text-profit border-profit/40"
          : "bg-loss/15 text-loss border-loss/40"
      )}
    >
      {side}
    </span>
  );
}

function statusBadge(status: "open" | "closed" | "stopped") {
  const styles: Record<string, string> = {
    open: "bg-primary/20 text-foreground border-primary/50",
    closed: "bg-foreground/10 text-foreground/80 border-foreground/25",
    stopped: "bg-loss/15 text-loss border-loss/40",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase border",
        styles[status]
      )}
    >
      {status}
    </span>
  );
}

function formatUsd(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPrice(price: number): string {
  if (price < 0.001) return `$${price.toFixed(7)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(2)}`;
}

function truncateHash(hash: string): string {
  if (hash.length <= 12) return hash;
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

function relativeTime(iso: string): string {
  const now = new Date();
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type StatusFilter = "all" | "open" | "closed" | "stopped";
type SideFilter = "all" | "buy" | "sell";
type TypeFilter = "all" | "live" | "dry_run";
type SortKey = "newest" | "oldest" | "pnl_desc" | "pnl_asc" | "size_desc";

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState<TradeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sideFilter, setSideFilter] = useState<SideFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sortBy, setSortBy] = useState<SortKey>("newest");

  useEffect(() => {
    Promise.all([
      apiFetch<Trade[]>("/api/trades").catch(() => []),
      apiFetch<TradeStats>("/api/trades/stats").catch(() => null),
    ])
      .then(([t, s]) => {
        setTrades(Array.isArray(t) ? t : []);
        setStats(s);
      })
      .catch((e) => setError(e.message || "Failed to load trades"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="glass-bg min-h-screen flex flex-col items-center justify-center">
        <div className="h-10 w-10 border-2 border-foreground/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-sm text-foreground/60">Loading trades...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-bg min-h-screen flex flex-col items-center justify-center">
        <AlertTriangle className="h-8 w-8 mb-3 text-accent" />
        <p className="text-base font-semibold text-foreground mb-1">Could not load trades</p>
        <p className="text-sm text-foreground/60">{error}</p>
      </div>
    );
  }

  const filteredTrades = trades.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (sideFilter !== "all" && t.side !== sideFilter) return false;
    if (typeFilter === "live" && t.dry_run) return false;
    if (typeFilter === "dry_run" && !t.dry_run) return false;
    return true;
  });

  const sortedTrades = [...filteredTrades].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      case "pnl_desc":
        return (b.pnl_usd ?? -Infinity) - (a.pnl_usd ?? -Infinity);
      case "pnl_asc":
        return (a.pnl_usd ?? Infinity) - (b.pnl_usd ?? Infinity);
      case "size_desc":
        return (b.size_usdc || 0) - (a.size_usdc || 0);
      case "newest":
      default:
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
  });

  return (
    <div className="glass-bg min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">
        {/* ── Page Header ── */}
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Trades</h1>
          <p className="text-sm text-foreground/60 mt-1">Performance metrics and trade history</p>
        </div>

        {/* ── Stats Grid ── */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total trades"
              value={String(stats.total || sortedTrades.length)}
              icon={<BarChart3 className="h-3.5 w-3.5" />}
              tone="white"
            />
            <StatCard
              label="Win rate"
              value={stats.win_rate > 0 ? `${(stats.win_rate * 100).toFixed(0)}%` : "—"}
              icon={<Trophy className="h-3.5 w-3.5" />}
              tone="pink"
            />
            <StatCard
              label="Total PnL"
              value={stats.total_pnl !== 0 ? formatUsd(stats.total_pnl) : "—"}
              icon={<TrendingUp className="h-3.5 w-3.5" />}
              accent={stats.total_pnl >= 0}
              tone={stats.total_pnl >= 0 ? "lime" : "red"}
            />
            <StatCard
              label="W / L"
              value={`${stats.wins}W / ${stats.losses}L`}
              icon={<Activity className="h-3.5 w-3.5" />}
              tone="white"
            />
          </div>
        )}

        {/* ── Filters ── */}
        <div className="glass-card p-4 flex flex-wrap items-center gap-4">
          <FilterGroup
            label="Status"
            options={[
              { key: "all", label: "All" },
              { key: "open", label: "Open" },
              { key: "closed", label: "Closed" },
              { key: "stopped", label: "Stopped" },
            ]}
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as StatusFilter)}
          />
          <FilterGroup
            label="Side"
            options={[
              { key: "all", label: "All" },
              { key: "buy", label: "Buy" },
              { key: "sell", label: "Sell" },
            ]}
            value={sideFilter}
            onChange={(v) => setSideFilter(v as SideFilter)}
          />
          <FilterGroup
            label="Type"
            options={[
              { key: "all", label: "All" },
              { key: "live", label: "Live" },
              { key: "dry_run", label: "Dry" },
            ]}
            value={typeFilter}
            onChange={(v) => setTypeFilter(v as TypeFilter)}
          />
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[11px] text-foreground/50 font-semibold uppercase tracking-wider">
              Sort
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="glass-input text-xs font-semibold cursor-pointer"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="pnl_desc">PnL · high → low</option>
              <option value="pnl_asc">PnL · low → high</option>
              <option value="size_desc">Largest size</option>
            </select>
          </div>
        </div>

        {/* ── Trades Table ── */}
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-foreground/10 flex items-center gap-2">
            <h2 className="text-sm font-bold text-foreground tracking-tight">Trade history</h2>
            <span className="ml-auto inline-flex items-center rounded-full bg-foreground/5 border border-foreground/15 px-2.5 py-0.5 text-[11px] font-mono font-semibold text-foreground/70">
              {sortedTrades.length} {sortedTrades.length === 1 ? "trade" : "trades"}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-foreground/10 text-foreground/45 text-[10px] uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-bold">Token</th>
                  <th className="text-center px-3 py-3 font-bold">Side</th>
                  <th className="text-right px-3 py-3 font-bold">Size</th>
                  <th className="text-right px-3 py-3 font-bold">Entry</th>
                  <th className="text-right px-3 py-3 font-bold">Exit</th>
                  <th className="text-center px-3 py-3 font-bold">Status</th>
                  <th className="text-right px-3 py-3 font-bold">PnL</th>
                  <th className="text-right px-3 py-3 font-bold">PnL %</th>
                  <th className="text-center px-3 py-3 font-bold">Type</th>
                  <th className="text-right px-4 py-3 font-bold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {sortedTrades.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <BarChart3 className="h-8 w-8 text-foreground/20" strokeWidth={1.5} />
                        <p className="text-sm font-semibold text-foreground/60">
                          {trades.length === 0 ? "No trades yet" : "No trades match your filters"}
                        </p>
                        <p className="text-xs text-foreground/40">
                          {trades.length === 0
                            ? "Trades will appear here once the pipeline executes signals"
                            : "Try adjusting the filters above to see more results"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
                {sortedTrades.map((trade) => (
                  <tr key={trade.id} className="hover:bg-foreground/[0.04] transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">
                          {trade.symbol || truncateHash(trade.token)}
                        </span>
                        {chainBadge(trade.chain)}
                        {trade.grade && (
                          <span className="text-[10px] font-mono font-bold text-foreground/70 bg-foreground/8 border border-foreground/15 px-1.5 py-0.5 rounded">
                            {trade.grade}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center whitespace-nowrap">{sideBadge(trade.side)}</td>
                    <td className="px-3 py-3 text-right whitespace-nowrap font-mono text-foreground/85 text-xs font-semibold tabular-nums">
                      {formatUsd(trade.size_usdc)}
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap font-mono text-foreground/60 text-xs tabular-nums">
                      {trade.entry_price > 0 ? (
                        formatPrice(trade.entry_price)
                      ) : (
                        <span className="text-foreground/30">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap font-mono text-foreground/60 text-xs tabular-nums">
                      {trade.exit_price !== null && trade.exit_price !== undefined ? (
                        formatPrice(trade.exit_price)
                      ) : (
                        <span className="text-foreground/30">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center whitespace-nowrap">
                      {statusBadge(trade.status as "open" | "closed" | "stopped")}
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap font-mono text-sm tabular-nums">
                      {trade.pnl_usd !== null && trade.pnl_usd !== undefined ? (
                        <span
                          className={cn(
                            "font-bold",
                            trade.pnl_usd >= 0 ? "text-profit" : "text-loss"
                          )}
                        >
                          {trade.pnl_usd >= 0 ? "+" : ""}
                          {formatUsd(trade.pnl_usd)}
                        </span>
                      ) : (
                        <span className="text-foreground/30">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap font-mono text-sm tabular-nums">
                      {trade.pnl_pct !== null && trade.pnl_pct !== undefined ? (
                        <span
                          className={cn(
                            "font-bold",
                            trade.pnl_pct >= 0 ? "text-profit" : "text-loss"
                          )}
                        >
                          {trade.pnl_pct >= 0 ? "+" : ""}
                          {trade.pnl_pct.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-foreground/30">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center whitespace-nowrap">
                      {trade.dry_run ? (
                        <span className="inline-flex items-center rounded-full bg-accent/25 text-foreground border border-accent/60 px-2 py-0.5 text-[9px] font-bold uppercase">
                          Dry run
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-primary/25 text-foreground border border-primary/60 px-2 py-0.5 text-[9px] font-bold uppercase">
                          Live
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap text-foreground/55 text-xs tabular-nums">
                      {relativeTime(trade.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { key: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-foreground/50 font-semibold uppercase tracking-wider">
        {label}
      </span>
      <div className="flex gap-1">
        {options.map((opt) => {
          const active = value === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onChange(opt.key)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border transition-all",
                active
                  ? "bg-foreground text-background border-foreground"
                  : "bg-foreground/5 text-foreground/70 border-foreground/15 hover:bg-foreground/10 hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
