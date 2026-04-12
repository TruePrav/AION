"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { apiFetch, type Status, type DiscoveryToken, type ScoutResult, type Trade, type Settings } from "@/lib/api";
import { fmtUsd, fmtPct, truncAddr, cn } from "@/lib/utils";
import StatCard from "@/components/StatCard";
import GradeBadge from "@/components/GradeBadge";
import { ArrowRight, Activity, Wallet, TrendingUp, Trophy, BarChart3, Send, AlertTriangle, Timer } from "lucide-react";

interface ScanStatus {
  running: boolean;
  finished_at?: string;
  started_at?: string;
  step?: string;
  progress?: number;
}

export default function HomePage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [tokens, setTokens] = useState<DiscoveryToken[]>([]);
  const [scout, setScout] = useState<ScoutResult | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<string | null>(null);
  const [scanRunning, setScanRunning] = useState(false);
  const [nextRunMs, setNextRunMs] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, t, sc, tr] = await Promise.all([
          apiFetch<Status>("/api/status"),
          apiFetch<DiscoveryToken[]>("/api/discovery/tokens").catch(() => []),
          apiFetch<ScoutResult>("/api/scout/latest").catch(() => null),
          apiFetch<Trade[]>("/api/trades?status=closed&limit=5").catch(() => []),
        ]);
        setStatus(s);
        setTokens(t);
        setScout(sc);
        setTrades(tr);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to connect to AION API");
      }
      setLoading(false);
    };
    load();
  }, []);

  // Fetch scan status + settings to compute next run time
  useEffect(() => {
    const fetchScanInfo = async () => {
      try {
        const [scanRes, settingsRes] = await Promise.all([
          apiFetch<ScanStatus>("/api/discovery/scan-status").catch(() => null),
          apiFetch<Settings>("/api/settings").catch(() => null),
        ]);
        if (scanRes?.running) {
          setScanRunning(true);
          setNextRunMs(null);
          return;
        }
        setScanRunning(false);
        if (scanRes?.finished_at && settingsRes?.scan_interval_minutes) {
          const finished = new Date(scanRes.finished_at).getTime();
          const intervalMs = settingsRes.scan_interval_minutes * 60 * 1000;
          setNextRunMs(finished + intervalMs);
        }
      } catch (_e) { /* swallow */ }
    };
    fetchScanInfo();
  }, []);

  // Tick the countdown every second
  useEffect(() => {
    if (scanRunning) {
      setCountdown("Scanning now...");
      return;
    }
    if (!nextRunMs) return;
    const tick = () => {
      const diff = nextRunMs - Date.now();
      if (diff <= 0) {
        setCountdown("Starting soon...");
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [nextRunMs, scanRunning]);

  if (loading) {
    return (
      <div className="glass-bg min-h-screen flex flex-col items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-foreground/20 border-t-primary animate-spin mb-4" />
        <p className="text-sm text-foreground/60">Loading AION…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-bg min-h-screen flex flex-col items-center justify-center px-6">
        <div className="glass-card p-6 max-w-md">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <p className="text-sm font-semibold text-foreground">AION API unreachable</p>
          </div>
          <p className="text-xs text-foreground/70 leading-relaxed">{error}</p>
          <p className="text-[11px] text-foreground/50 mt-3">
            Check that <code className="inline-block rounded bg-foreground/5 border border-foreground/10 px-1.5 py-0.5 font-mono">NEXT_PUBLIC_API_URL</code> is set correctly.
          </p>
        </div>
      </div>
    );
  }

  // Only show tokens that can produce a real dexscreener link + logo. Anything
  // missing an address or symbol is almost certainly a junk row from a partial
  // scrape — we drop it so users never see "ghost" cards with broken images.
  const isRenderable = (t: DiscoveryToken) =>
    !!t.address && !!t.symbol && t.address.length >= 30;
  const topTokens = [...tokens]
    .filter(isRenderable)
    .sort((a, b) => b.net_flow_7d - a.net_flow_7d)
    .slice(0, 6);
  const closedTrades = trades.filter((t) => t.status === "closed").slice(0, 5);

  // DexScreener chain slugs. We normalize whatever the API returns so
  // "SOLANA", "Base", "eth" all map to valid URL segments.
  const dsChain = (raw?: string) => {
    const c = (raw || "solana").toLowerCase();
    if (c === "eth" || c === "ethereum") return "ethereum";
    if (c === "bsc" || c === "binance") return "bsc";
    return c; // solana, base, arbitrum, polygon, etc.
  };

  return (
    <div className="glass-bg min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-12 space-y-10">
        {/* ══ HERO ══ */}
        <section className="py-6 space-y-6">
          {countdown && (
            <div className={cn(
              "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 border",
              scanRunning
                ? "bg-primary/20 border-primary/40"
                : "bg-foreground/[0.06] border-foreground/15"
            )}>
              <Timer className={cn("h-3.5 w-3.5", scanRunning ? "text-primary animate-pulse" : "text-cyan-400")} strokeWidth={2.5} />
              <span className="text-[11px] font-bold uppercase tracking-wider text-foreground/70">
                {scanRunning ? "Scan in progress" : "Next scan in"}
              </span>
              {!scanRunning && (
                <span className="text-[12px] font-mono font-bold text-cyan-400 tabular-nums tracking-wide">
                  {countdown}
                </span>
              )}
            </div>
          )}
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.05] max-w-4xl text-foreground">
            Smart Money.
            <br />
            <span className="bg-gradient-to-r from-primary via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_24px_hsl(var(--primary)/0.35)]">
              Decoded.
            </span>
          </h1>
          <p className="text-base text-foreground/70 max-w-xl leading-relaxed">
            AION hunts the wallets that move markets. We grade them. We track them. You eat.
          </p>
          <div className="flex gap-4 pt-4 flex-wrap">
            <Link
              href="/discovery"
              className="inline-flex items-center gap-3 rounded-2xl bg-primary border border-foreground/15 px-8 py-4 text-base font-bold text-[hsl(0_0%_8%)] hover:bg-primary/85 transition-colors shadow-[0_8px_32px_-8px_hsl(var(--primary)/0.55)]"
            >
              View Discovery <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
            </Link>
            <a
              href="https://t.me/AIONSignalBot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl glass-btn px-6 py-4 text-sm font-bold"
            >
              <Send className="h-4 w-4" strokeWidth={2.5} /> Telegram Bot
            </a>
          </div>
        </section>

        {/* ══ STATS BAR ══ */}
        {status && (() => {
          const cards = [
            <StatCard key="tokens" label="Tokens" value={String(status.tokens_in_run)} icon={<Activity className="h-4 w-4" />} tone="white" />,
            <StatCard key="wallets" label="Wallets" value={String(status.wallets_graded)} icon={<Wallet className="h-4 w-4" />} tone="pink" />,
            <StatCard key="trades" label="Trades" value={String(status.total_trades)} icon={<BarChart3 className="h-4 w-4" />} tone="white" />,
          ];
          if (status.win_rate > 0) {
            cards.push(<StatCard key="wr" label="Win Rate" value={fmtPct(status.win_rate)} icon={<Trophy className="h-4 w-4" />} tone="yellow" />);
          }
          if (status.total_pnl !== 0) {
            cards.push(<StatCard key="pnl" label="Total PnL" value={fmtUsd(status.total_pnl)} icon={<TrendingUp className="h-4 w-4" />} tone={status.total_pnl >= 0 ? "lime" : "red"} />);
          }
          const cols = cards.length <= 3 ? "grid-cols-3" : cards.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5";
          return (
            <div className={`grid gap-4 ${cols}`}>
              {cards}
            </div>
          );
        })()}

        {/* ══ HOT TOKENS + TOP WALLETS ══ */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel
            title="Smart Money Is Buying"
            href="/discovery"
            empty={topTokens.length === 0}
            emptyText="No discovery data yet."
            emptyHint="Run /discover on Telegram to start."
          >
            <div className="space-y-2">
              {topTokens.map((t) => {
                const chain = dsChain(t.chain);
                return (
                <a
                  key={t.address}
                  href={`https://dexscreener.com/${chain}/${t.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl bg-foreground/[0.04] border border-foreground/10 p-3 hover:bg-foreground/[0.08] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://dd.dexscreener.com/ds-data/tokens/${chain}/${t.address}.png`}
                      alt=""
                      loading="lazy"
                      className="h-8 w-8 rounded-lg bg-foreground/5 border border-foreground/10 flex-shrink-0"
                      onError={(e) => {
                        // CRITICAL: never set src="" — that resolves to the
                        // current page URL, fails to load as an image, and
                        // re-fires onError in an infinite loop that pegs the
                        // browser. Hide the element and detach the handler
                        // so it can't fire again.
                        const el = e.currentTarget;
                        el.onerror = null;
                        el.style.display = "none";
                      }}
                    />
                    <GradeBadge grade={t.accumulation.grade as "S" | "A" | "B" | "C" | "D"} size="sm" />
                    <div className="min-w-0">
                      <div className="font-bold text-foreground text-sm truncate">
                        {t.symbol}
                      </div>
                      <div className="text-[11px] font-mono text-foreground/55 tabular-nums">
                        MCAP {fmtUsd(t.market_cap)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <div
                      className={cn(
                        "inline-flex items-center rounded-md px-1.5 py-0.5 font-mono text-xs font-bold tabular-nums",
                        t.net_flow_7d >= 0
                          ? "text-profit bg-profit/15"
                          : "text-loss bg-loss/15"
                      )}
                    >
                      {t.net_flow_7d >= 0 ? "+" : ""}
                      {fmtUsd(t.net_flow_7d)}
                    </div>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-foreground/45 mt-0.5">
                      7D SM Flow
                    </div>
                  </div>
                </a>
                );
              })}
            </div>
          </Panel>

          <Panel
            title="Highest Scoring Wallets"
            href="/wallets"
            empty={!scout}
            emptyText="No scout data yet."
            emptyHint="Run /scout on Telegram to find top wallets."
          >
            {scout && (
              <div className="space-y-4">
                <Link
                  href={`/wallet/${scout.wallet.address}`}
                  className="flex items-center justify-between rounded-xl bg-foreground/[0.04] border border-foreground/10 p-4 hover:bg-foreground/[0.08] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <GradeBadge grade={scout.wallet.grade as "S" | "A" | "B" | "C" | "D"} size="lg" />
                    <div className="min-w-0">
                      <div className="font-bold text-foreground text-sm truncate">
                        {scout.wallet.label || truncAddr(scout.wallet.address)}
                      </div>
                      <div className="text-[11px] text-foreground/55 tabular-nums font-mono">
                        SCORE <span className="font-bold text-foreground/80">{scout.wallet.score}</span> ·{" "}
                        {scout.wallet.win_rate > 0 ? fmtPct(scout.wallet.win_rate) : "—"} WIN
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <div
                      className={cn(
                        "inline-flex items-center rounded-md px-1.5 py-0.5 font-mono text-xs font-bold tabular-nums",
                        scout.wallet.total_pnl_realized >= 0
                          ? "text-profit bg-profit/15"
                          : "text-loss bg-loss/15"
                      )}
                    >
                      {scout.wallet.total_pnl_realized >= 0 ? "+" : ""}
                      {fmtUsd(scout.wallet.total_pnl_realized)}
                    </div>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-foreground/45 mt-0.5">
                      Realized
                    </div>
                  </div>
                </Link>
                {scout.recent_buys && scout.recent_buys.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-foreground/50 mb-2 uppercase tracking-wider">
                      Latest Buys
                    </p>
                    <div className="space-y-1.5">
                      {scout.recent_buys.slice(0, 3).map((b, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-lg bg-foreground/[0.035] border border-foreground/10 px-3 py-2 text-xs"
                        >
                          <span className="font-semibold text-foreground">
                            {b.token || truncAddr(b.token_address || "")}
                          </span>
                          <span className="font-mono font-bold text-foreground/80 tabular-nums">
                            {fmtUsd(b.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Panel>
        </div>

        {/* ══ RECENT TRADES ══ */}
        <Panel
          title="Recent Trade Results"
          href="/trades"
          empty={closedTrades.length === 0}
          emptyText="No closed trades yet."
        >
          <div className="overflow-x-auto rounded-xl border border-foreground/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-foreground/10 bg-foreground/[0.04] text-foreground/50 text-[10px] uppercase tracking-wider">
                  <th className="text-left py-2.5 px-4 font-semibold">Token</th>
                  <th className="text-right py-2.5 px-3 font-semibold">Amount</th>
                  <th className="text-right py-2.5 px-3 font-semibold">Entry</th>
                  <th className="text-right py-2.5 px-3 font-semibold">PnL %</th>
                  <th className="text-right py-2.5 px-4 font-semibold">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/[0.07]">
                {closedTrades.map((t) => (
                  <tr key={t.id} className="hover:bg-foreground/[0.04] transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-foreground text-xs">{truncAddr(t.token)}</span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-foreground/80 text-xs tabular-nums">
                      {fmtUsd(t.size_usdc)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-foreground/60 text-xs tabular-nums">
                      {t.entry_price > 0 ? `$${t.entry_price.toFixed(4)}` : "—"}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md px-1.5 py-0.5 font-mono text-xs font-bold tabular-nums",
                          (t.pnl_pct || 0) >= 0
                            ? "text-profit bg-profit/15"
                            : "text-loss bg-loss/15"
                        )}
                      >
                        {t.pnl_pct !== null ? `${(t.pnl_pct || 0) >= 0 ? "+" : ""}${t.pnl_pct.toFixed(2)}%` : "—"}
                      </span>
                    </td>
                    <td
                      className={cn(
                        "py-3 px-4 text-right font-mono text-xs font-bold tabular-nums",
                        (t.pnl_usd || 0) >= 0 ? "text-profit" : "text-loss"
                      )}
                    >
                      {(t.pnl_usd || 0) >= 0 ? "+" : ""}
                      {fmtUsd(t.pnl_usd || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* ══ CTA ══ */}
        <section className="glass-card p-10 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-2 tracking-tight">
            Ready to find alpha?
          </h3>
          <p className="text-sm text-foreground/70 mb-6 max-w-md mx-auto">
            Add the AION bot to your Telegram and get real-time alerts when top wallets trade.
          </p>
          <a
            href="https://t.me/AIONSignalBot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-primary/90 border border-foreground/15 px-5 py-2.5 text-sm font-bold text-[hsl(0_0%_8%)] hover:bg-primary transition-colors shadow-[0_4px_16px_-6px_hsl(var(--primary)/0.45)]"
          >
            <Send className="h-4 w-4" strokeWidth={2.5} />
            Try the bot free
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </a>
        </section>
      </div>
    </div>
  );
}

// ── Helpers ──

function Panel({
  title,
  href,
  empty,
  emptyText,
  emptyHint,
  children,
}: {
  title: string;
  href?: string;
  empty?: boolean;
  emptyText?: string;
  emptyHint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass-card p-6">
      <div className="mb-5 flex items-center justify-between border-b border-foreground/10 pb-3">
        <h2 className="text-sm font-bold text-foreground tracking-tight">{title}</h2>
        {href && (
          <Link
            href={href}
            className="inline-flex items-center gap-1 rounded-full bg-foreground/5 border border-foreground/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground/70 hover:bg-foreground/10 hover:text-foreground transition-colors"
          >
            View all
            <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
          </Link>
        )}
      </div>
      {empty ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm font-semibold text-foreground/70">{emptyText}</p>
          {emptyHint && <p className="text-xs text-foreground/50 mt-1">{emptyHint}</p>}
        </div>
      ) : (
        children
      )}
    </section>
  );
}
