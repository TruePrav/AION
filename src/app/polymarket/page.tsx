"use client";

import { useEffect, useState } from "react";
import { API } from "@/lib/api";
import { fmtUsd, truncAddr, cn } from "@/lib/utils";
import GradeBadge from "@/components/GradeBadge";
import CopyButton from "@/components/CopyButton";
import { ExternalLink, TrendingUp, Users, Zap, Layers, RefreshCw } from "lucide-react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface PMMarket {
  market_id: string;
  question: string;
  event_title: string;
  event_id: string;
  tags: string[];
  end_date: string;
  volume: number;
  volume_24hr: number;
  volume_1wk: number;
  liquidity: number;
  open_interest: number;
  volume_change_pct: number;
  best_bid: number;
  best_ask: number;
  last_trade_price: number;
  one_day_price_change: number;
  implied_prob: number;
  unique_traders_24h: number;
  age_hours: number;
  slug: string;
}

interface PMHolder {
  address: string;
  owner_address: string;
  side: string;
  outcome_index: number;
  position_size: number;
  position_usd: number;
  avg_entry_price: number;
  current_price: number;
  unrealized_pnl_usd: number;
}

interface PMTrade {
  timestamp: string;
  buyer: string;
  seller: string;
  taker_action: string;
  side: string;
  size: number;
  price: number;
  usdc_value: number;
  tx_hash: string;
}

interface PMHotMarket extends PMMarket {
  top_holders: PMHolder[];
  recent_trades: PMTrade[];
}

interface PMWhaleMarket {
  market_id: string;
  question: string;
  side: string;
  position_usd: number;
  unrealized_pnl_usd: number;
}

interface PMWhale {
  owner_address: string;
  total_position_usd: number;
  total_unrealized_pnl: number;
  position_count: number;
  markets: PMWhaleMarket[];
  grade: "S" | "A" | "B" | "C" | "D";
}

interface PMFunnel {
  scanned_markets: number;
  hot_markets: number;
  deep_dive_markets: number;
  unique_whales: number;
  graded_whales: number;
  convergence_whales: number;
}

interface PMData {
  timestamp: string;
  funnel: PMFunnel;
  markets: PMMarket[];
  hot_markets: PMHotMarket[];
  whales: PMWhale[];
  convergence: PMWhale[];
  credits: { before: number; after: number; used: number };
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function fmtCompact(n: number): string {
  if (n == null || isNaN(n)) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

function fmtRelTime(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const delta = Math.floor((Date.now() - d.getTime()) / 1000);
  if (delta < 60) return `${delta}s ago`;
  if (delta < 3600) return `${Math.floor(delta / 60)}m ago`;
  if (delta < 86400) return `${Math.floor(delta / 3600)}h ago`;
  return `${Math.floor(delta / 86400)}d ago`;
}

function polyscanAddr(addr: string): string {
  return `https://polygonscan.com/address/${addr}`;
}

function polymarketUrl(slug: string): string {
  return `https://polymarket.com/event/${slug}`;
}

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────
export default function PolymarketPage() {
  const [data, setData] = useState<PMData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"markets" | "whales" | "convergence">("markets");
  const [expandedMarket, setExpandedMarket] = useState<string | null>(null);
  const [expandedWhale, setExpandedWhale] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API}/api/polymarket/discovery/latest`, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(`API ${r.status}`);
        return r.json();
      })
      .then((d: PMData) => setData(d))
      .catch((e) => setError(e.message || "Failed to load Polymarket data"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="glass-bg min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="glass-card p-8 text-center text-foreground/60 text-sm">
            <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-3 text-primary" />
            Loading Polymarket discovery...
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-bg min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="glass-card p-8 text-center text-destructive text-sm">
            {error || "No Polymarket data available yet."}
          </div>
        </div>
      </div>
    );
  }

  const { funnel, markets, hot_markets, whales, convergence, credits, timestamp } = data;

  return (
    <div className="glass-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* ── Hero ── */}
        <div className="glass-card p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-[10px] font-mono font-bold tracking-wider text-primary bg-primary/20 border border-primary/40 px-2 py-0.5 rounded">
                POLYMARKET
              </span>
              <span className="text-[10px] font-mono font-bold tracking-wider text-accent bg-accent/20 border border-accent/40 px-2 py-0.5 rounded">
                NEW
              </span>
              <span className="text-[10px] text-foreground/55 font-semibold">
                Updated {fmtRelTime(timestamp)}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3">
              Prediction Market Intelligence
            </h1>
            <p className="text-foreground/70 max-w-2xl leading-relaxed text-sm font-medium mb-5">
              Same smart-money discovery playbook as memecoins — now applied to Polymarket. We scan the
              hottest prediction markets, extract top holders, grade them, and flag wallets appearing across
              multiple bets.
            </p>

            {/* Funnel */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
              <FunnelStep label="Markets scanned" value={funnel.scanned_markets} icon={<Layers className="h-3.5 w-3.5" />} />
              <FunnelStep label="Deep dive" value={funnel.deep_dive_markets} icon={<TrendingUp className="h-3.5 w-3.5" />} />
              <FunnelStep label="Unique whales" value={funnel.unique_whales} icon={<Users className="h-3.5 w-3.5" />} />
              <FunnelStep label="Graded S/A/B" value={funnel.graded_whales} icon={<Zap className="h-3.5 w-3.5" />} />
              <FunnelStep label="Convergence" value={funnel.convergence_whales} icon={<Zap className="h-3.5 w-3.5" />} highlight />
              <FunnelStep label="Credits used" value={credits.used} mono />
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex items-center gap-2 flex-wrap">
          <TabButton active={tab === "markets"} onClick={() => setTab("markets")} label={`Markets (${markets.length})`} />
          <TabButton active={tab === "whales"} onClick={() => setTab("whales")} label={`Whales (${whales.length})`} />
          <TabButton active={tab === "convergence"} onClick={() => setTab("convergence")} label={`Convergence (${convergence.length})`} highlight />
        </div>

        {/* ── Markets tab ── */}
        {tab === "markets" && (
          <div className="space-y-4">
            <div className="text-[11px] text-foreground/55 font-medium">
              Sorted by 24h volume. Top {hot_markets.length} markets are deep-dived with whale positions + recent trades.
            </div>
            <div className="space-y-3">
              {markets.map((m) => {
                const isHot = hot_markets.find((h) => h.market_id === m.market_id);
                const expanded = expandedMarket === m.market_id;
                return (
                  <div key={m.market_id} className="glass-card p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {isHot && (
                            <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full border bg-accent/25 text-accent border-accent/50">
                              DEEP DIVE
                            </span>
                          )}
                          {m.tags.slice(0, 3).map((t) => (
                            <span key={t} className="text-[9px] font-semibold text-foreground/55 bg-foreground/5 border border-foreground/10 px-1.5 py-0.5 rounded">
                              {t}
                            </span>
                          ))}
                        </div>
                        <h3 className="text-base font-bold text-foreground leading-tight mb-3">
                          {m.question}
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <Metric label="24h vol" value={fmtCompact(m.volume_24hr)} />
                          <Metric label="Liquidity" value={fmtCompact(m.liquidity)} />
                          <Metric label="Implied prob" value={`${(m.implied_prob * 100).toFixed(1)}%`} />
                          <Metric label="24h traders" value={m.unique_traders_24h.toLocaleString()} />
                        </div>
                      </div>
                      <a
                        href={polymarketUrl(m.slug)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold text-primary hover:text-primary/80 flex items-center gap-1 flex-shrink-0"
                      >
                        Open <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>

                    {isHot && (
                      <>
                        <button
                          onClick={() => setExpandedMarket(expanded ? null : m.market_id)}
                          className="mt-4 text-[11px] font-bold text-primary hover:text-primary/80 transition-colors"
                        >
                          {expanded ? "Hide" : "Show"} top holders + recent trades →
                        </button>
                        {expanded && <HotMarketDetail market={isHot} />}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Whales tab ── */}
        {tab === "whales" && (
          <div className="space-y-3">
            <div className="text-[11px] text-foreground/55 font-medium">
              All unique whales found across deep-dived markets, graded by position size + unrealized PnL + breadth.
            </div>
            {whales.map((w) => {
              const expanded = expandedWhale === w.owner_address;
              return (
                <div key={w.owner_address} className="glass-card p-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <GradeBadge grade={w.grade} />
                    <a
                      href={polyscanAddr(w.owner_address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      {truncAddr(w.owner_address, 6)}
                    </a>
                    <CopyButton text={w.owner_address} />
                    <div className="flex-1" />
                    <Metric label="Position" value={fmtCompact(w.total_position_usd)} />
                    <Metric
                      label="Unrealized"
                      value={fmtCompact(w.total_unrealized_pnl)}
                      color={w.total_unrealized_pnl >= 0 ? "text-primary" : "text-destructive"}
                    />
                    <Metric label="Markets" value={String(w.position_count)} />
                    <button
                      onClick={() => setExpandedWhale(expanded ? null : w.owner_address)}
                      className="text-[11px] font-bold text-primary hover:text-primary/80 transition-colors"
                    >
                      {expanded ? "Hide" : "Show"} →
                    </button>
                  </div>
                  {expanded && (
                    <div className="mt-3 pt-3 border-t border-foreground/10 space-y-2">
                      {w.markets.map((wm, i) => (
                        <div key={i} className="text-xs text-foreground/75 flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-foreground">{wm.question}</span>
                            <span
                              className={cn(
                                "ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded",
                                wm.side === "Yes"
                                  ? "bg-primary/20 text-primary"
                                  : "bg-destructive/20 text-destructive"
                              )}
                            >
                              {wm.side.toUpperCase()}
                            </span>
                          </div>
                          <div className="font-mono tabular-nums">{fmtCompact(wm.position_usd)}</div>
                          <div className={cn(
                            "font-mono tabular-nums text-[11px]",
                            wm.unrealized_pnl_usd >= 0 ? "text-primary" : "text-destructive"
                          )}>
                            {wm.unrealized_pnl_usd >= 0 ? "+" : ""}{fmtCompact(wm.unrealized_pnl_usd)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Convergence tab ── */}
        {tab === "convergence" && (
          <div className="space-y-3">
            <div className="text-[11px] text-foreground/55 font-medium">
              Wallets appearing as top holders in ≥2 hot markets — these are systematic traders, not one-off gamblers.
            </div>
            {convergence.length === 0 ? (
              <div className="glass-card p-8 text-center text-sm text-foreground/60">
                No convergence signals in this run. Run a fresh scan or expand the deep-dive count.
              </div>
            ) : (
              convergence.map((w) => (
                <div key={w.owner_address} className="glass-card p-4 ring-1 ring-accent/30">
                  <div className="flex items-center gap-3 flex-wrap mb-3">
                    <GradeBadge grade={w.grade} />
                    <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full border bg-accent/25 text-accent border-accent/50">
                      CONVERGENCE × {w.position_count}
                    </span>
                    <a
                      href={polyscanAddr(w.owner_address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      {truncAddr(w.owner_address, 6)}
                    </a>
                    <CopyButton text={w.owner_address} />
                    <div className="flex-1" />
                    <Metric label="Total" value={fmtCompact(w.total_position_usd)} />
                    <Metric
                      label="Unrealized"
                      value={fmtCompact(w.total_unrealized_pnl)}
                      color={w.total_unrealized_pnl >= 0 ? "text-primary" : "text-destructive"}
                    />
                  </div>
                  <div className="pt-3 border-t border-foreground/10 space-y-2">
                    {w.markets.map((wm, i) => (
                      <div key={i} className="text-xs text-foreground/75 flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-foreground">{wm.question}</span>
                          <span
                            className={cn(
                              "ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded",
                              wm.side === "Yes"
                                ? "bg-primary/20 text-primary"
                                : "bg-destructive/20 text-destructive"
                            )}
                          >
                            {wm.side.toUpperCase()}
                          </span>
                        </div>
                        <div className="font-mono tabular-nums">{fmtCompact(wm.position_usd)}</div>
                        <div className={cn(
                          "font-mono tabular-nums text-[11px]",
                          wm.unrealized_pnl_usd >= 0 ? "text-primary" : "text-destructive"
                        )}>
                          {wm.unrealized_pnl_usd >= 0 ? "+" : ""}{fmtCompact(wm.unrealized_pnl_usd)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Footer info ── */}
        <div className="glass-card p-5 text-[11px] text-foreground/60 leading-relaxed space-y-2">
          <div className="font-bold text-foreground/80 text-xs mb-1">How this works</div>
          <div>
            1. <span className="font-mono text-primary">nansen research prediction-market market-screener</span> — pulls top markets by 24h volume (1 cr)
          </div>
          <div>
            2. <span className="font-mono text-primary">top-holders</span> × {funnel.deep_dive_markets} deep-dive markets (5 cr each = {funnel.deep_dive_markets * 5} cr)
          </div>
          <div>
            3. <span className="font-mono text-primary">trades-by-market</span> × {funnel.deep_dive_markets} for recent flow (1 cr each = {funnel.deep_dive_markets} cr)
          </div>
          <div>
            4. Local grading + convergence detection (0 cr)
          </div>
          <div className="pt-2 text-foreground/50">
            Total: <span className="font-mono font-bold text-foreground/70">{credits.used}</span> credits per run.
            Default cadence: <span className="font-mono font-bold text-foreground/70">every 6h</span> (on-demand for now).
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Subcomponents
// ─────────────────────────────────────────────
function FunnelStep({
  label,
  value,
  icon,
  highlight,
  mono,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
  highlight?: boolean;
  mono?: boolean;
}) {
  return (
    <div className={cn(
      "rounded-xl border p-3",
      highlight
        ? "border-accent/50 bg-accent/15"
        : "border-foreground/15 bg-foreground/5"
    )}>
      <div className="flex items-center gap-1.5 mb-1">
        {icon && <span className={highlight ? "text-accent" : "text-foreground/50"}>{icon}</span>}
        <div className={cn(
          "text-[9px] font-bold tracking-wider",
          highlight ? "text-accent/90" : "text-foreground/55"
        )}>
          {label.toUpperCase()}
        </div>
      </div>
      <div className={cn(
        "text-xl font-bold tabular-nums",
        mono && "font-mono",
        highlight ? "text-accent" : "text-foreground"
      )}>
        {value}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  highlight,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-xs font-bold tracking-wide rounded-full border transition-colors",
        active
          ? highlight
            ? "bg-accent text-background border-accent"
            : "bg-foreground text-background border-foreground"
          : "bg-foreground/5 text-foreground/70 border-foreground/15 hover:bg-foreground/10 hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}

function Metric({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div>
      <div className="text-[9px] font-bold tracking-wider text-foreground/50 uppercase">{label}</div>
      <div className={cn("text-sm font-bold font-mono tabular-nums", color || "text-foreground")}>
        {value}
      </div>
    </div>
  );
}

function HotMarketDetail({ market }: { market: PMHotMarket }) {
  return (
    <div className="mt-4 pt-4 border-t border-foreground/10 space-y-4">
      {/* Top holders */}
      <div>
        <div className="text-[10px] font-bold tracking-wider text-foreground/60 mb-2">
          TOP HOLDERS ({market.top_holders.length})
        </div>
        <div className="space-y-1.5">
          {market.top_holders.slice(0, 10).map((h, i) => (
            <div key={i} className="flex items-center gap-3 text-xs bg-foreground/5 rounded-lg px-3 py-2">
              <span className="text-foreground/40 font-mono w-5">{i + 1}</span>
              <a
                href={polyscanAddr(h.owner_address)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-foreground hover:text-primary transition-colors"
              >
                {truncAddr(h.owner_address, 5)}
              </a>
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded",
                h.side === "Yes" ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"
              )}>
                {h.side.toUpperCase()}
              </span>
              <div className="flex-1" />
              <span className="font-mono tabular-nums font-semibold">{fmtCompact(h.position_usd)}</span>
              <span className={cn(
                "font-mono tabular-nums text-[11px] w-20 text-right",
                h.unrealized_pnl_usd >= 0 ? "text-primary" : "text-destructive"
              )}>
                {h.unrealized_pnl_usd >= 0 ? "+" : ""}{fmtCompact(h.unrealized_pnl_usd)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent trades */}
      <div>
        <div className="text-[10px] font-bold tracking-wider text-foreground/60 mb-2">
          RECENT TRADES ({market.recent_trades.length})
        </div>
        <div className="space-y-1.5">
          {market.recent_trades.slice(0, 10).map((t, i) => (
            <div key={i} className="flex items-center gap-3 text-xs bg-foreground/5 rounded-lg px-3 py-2">
              <span className="text-foreground/40 font-mono text-[10px] w-16">{fmtRelTime(t.timestamp)}</span>
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded",
                t.taker_action === "buy" ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"
              )}>
                {t.taker_action.toUpperCase()} {t.side}
              </span>
              <span className="text-foreground/60 font-mono text-[10px]">
                @ {(t.price * 100).toFixed(1)}¢
              </span>
              <div className="flex-1" />
              <span className="font-mono tabular-nums font-semibold">
                {fmtUsd(t.usdc_value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
