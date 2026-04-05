"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, type Status, type DiscoveryToken, type ScoutResult, type Trade } from "@/lib/api";
import { fmtUsd, fmtPct, truncAddr } from "@/lib/utils";
import StatCard from "@/components/StatCard";
import GradeBadge from "@/components/GradeBadge";
import Spinner from "@/components/Spinner";

export default function HomePage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [tokens, setTokens] = useState<DiscoveryToken[]>([]);
  const [scout, setScout] = useState<ScoutResult | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

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
      } catch { /* show empty state */ }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <Spinner />;

  const topTokens = [...tokens].sort((a, b) => b.net_flow_7d - a.net_flow_7d).slice(0, 6);
  const closedTrades = trades.filter((t) => t.status === "closed").slice(0, 5);

  return (
    <div className="gradient-mesh min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">

        {/* Hero */}
        <div className="relative text-center py-6 space-y-5 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-96 h-40 bg-gradient-to-b from-emerald-500/10 to-transparent blur-3xl rounded-full" />
          </div>
          <div className="relative space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-emerald-400">Live &middot; Nansen Smart Money Tracking</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-tight">
              <span className="text-white">Smart Money</span>
              <br />
              <span className="gradient-text">Intelligence</span>
            </h1>
            <p className="text-base text-gray-400 max-w-xl mx-auto leading-relaxed">
              Oracle tracks Nansen&rsquo;s labeled wallets, grades their performance, and surfaces real alpha &mdash; before the crowd catches on.
            </p>
            <div className="flex justify-center gap-3 pt-1 flex-wrap">
              <Link
                href="/discovery"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-7 py-3 text-sm font-bold text-black transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-400/30 hover:scale-[1.02]"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
                View Discovery
              </Link>
              <a
                href="https://t.me/OracleAITradingBot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-7 py-3 text-sm font-semibold text-gray-200 transition-all duration-200 hover:border-white/20"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
                Get Telegram Bot
              </a>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        {status && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard label="Tokens Tracked" value={String(status.tokens_in_run)} accent={false} />
            <StatCard label="Wallets Monitored" value={String(status.wallets_graded)} accent={false} />
            <StatCard label="Total Trades" value={String(status.total_trades)} accent={false} />
            <StatCard label="Win Rate" value={status.win_rate > 0 ? fmtPct(status.win_rate) : "\u2014"} accent={false} />
            <StatCard label="Total PnL" value={status.total_pnl !== 0 ? fmtUsd(status.total_pnl) : "\u2014"} accent={false} />
          </div>
        )}

        {/* Hot Tokens + Top Wallets */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Hot Tokens */}
          <div className="glass-card p-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <h2 className="text-base font-bold text-white">Tokens Smart Money Is Buying</h2>
              </div>
              <Link href="/discovery" className="text-xs text-emerald-400/70 hover:text-emerald-400 font-medium transition-colors flex items-center gap-1">
                View All
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            {topTokens.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-2 text-center">
                <div className="text-3xl opacity-30">&#128202;</div>
                <p className="text-sm text-gray-500">No discovery data yet.</p>
                <p className="text-xs text-gray-600">Run <span className="text-emerald-400/70">/discover</span> on Telegram to start.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {topTokens.map((t) => (
                  <div key={t.address} className="flex items-center justify-between rounded-xl bg-gray-800/40 p-4 hover:bg-gray-800/70 transition-all duration-200">
                    <div className="flex items-center gap-3 min-w-0">
                      <GradeBadge grade={t.accumulation.grade as "S"|"A"|"B"|"C"|"D"} size="sm" />
                      <div className="min-w-0">
                        <a
                          href={`https://app.nansen.ai/token/${t.address}?chain=${t.chain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-white/90 hover:text-emerald-400 transition-colors text-sm truncate block"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {t.symbol}
                        </a>
                        <div className="text-xs text-gray-500">MCap {fmtUsd(t.market_cap)}</div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <div className={`font-mono font-bold text-sm ${t.net_flow_7d >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {t.net_flow_7d >= 0 ? "+" : ""}{fmtUsd(t.net_flow_7d)}
                      </div>
                      <div className="text-[10px] text-gray-600">7d SM flow</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Wallets */}
          <div className="glass-card p-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                <h2 className="text-base font-bold text-white">Highest Scoring Wallets</h2>
              </div>
              <Link href="/wallets" className="text-xs text-emerald-400/70 hover:text-emerald-400 font-medium transition-colors flex items-center gap-1">
                View All
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            {!scout ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-2 text-center">
                <div className="text-3xl opacity-30">&#128269;</div>
                <p className="text-sm text-gray-500">No scout data yet.</p>
                <p className="text-xs text-gray-600">Run <span className="text-emerald-400/70">/scout</span> on Telegram to find top wallets.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  href={`/wallet/${scout.wallet.address}`}
                  className="flex items-center justify-between rounded-xl bg-gray-800/40 p-4 hover:bg-emerald-500/5 hover:border hover:border-emerald-500/20 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <GradeBadge grade={scout.wallet.grade as "S"|"A"|"B"|"C"|"D"} size="lg" />
                    <div className="min-w-0">
                      <div className="font-semibold text-white/90 group-hover:text-emerald-400 transition-colors text-sm truncate">
                        {scout.wallet.label || truncAddr(scout.wallet.address)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Score <span className="text-white font-mono">{scout.wallet.score}</span> &middot; {scout.wallet.win_rate > 0 ? fmtPct(scout.wallet.win_rate) : "\u2014"} win rate
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <div className={`font-mono font-bold text-sm ${scout.wallet.total_pnl_realized >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {scout.wallet.total_pnl_realized >= 0 ? "+" : ""}{fmtUsd(scout.wallet.total_pnl_realized)}
                    </div>
                    <div className="text-[10px] text-gray-600">Realized PnL</div>
                  </div>
                </Link>
                {scout.recent_buys && scout.recent_buys.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-gray-600 mb-2 uppercase tracking-widest flex items-center gap-1.5">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Latest Buys
                    </p>
                    <div className="space-y-1.5">
                      {scout.recent_buys.slice(0, 3).map((b, i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg bg-gray-800/20 px-3 py-2 text-sm">
                          <span className="text-gray-300 font-medium text-xs">{b.token || truncAddr(b.token_address || "")}</span>
                          <div className="text-right flex items-center gap-2">
                            <span className="font-mono text-gray-400 text-xs">{fmtUsd(b.value)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Trades */}
        <div className="glass-card p-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
              <h2 className="text-base font-bold text-white">Recent Trade Results</h2>
            </div>
            <Link href="/trades" className="text-xs text-emerald-400/70 hover:text-emerald-400 font-medium transition-colors flex items-center gap-1">
              View All
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          {closedTrades.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="text-3xl opacity-30 mb-2">&#128203;</div>
              <p className="text-sm text-gray-500">No closed trades yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-gray-500 text-[11px] uppercase tracking-wider">
                    <th className="text-left py-2 pr-4 font-medium">Token</th>
                    <th className="text-right py-2 px-3 font-medium">Amount</th>
                    <th className="text-right py-2 px-3 font-medium">Entry</th>
                    <th className="text-right py-2 px-3 font-medium">PnL %</th>
                    <th className="text-right py-2 pl-4 font-medium">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {closedTrades.map((t) => (
                    <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-gray-300">{truncAddr(t.token)}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-gray-400 text-xs">{fmtUsd(t.size_usdc)}</td>
                      <td className="py-3.5 px-3 text-right font-mono text-gray-500 text-xs">
                        {t.entry_price > 0 ? `$${t.entry_price.toFixed(4)}` : "\u2014"}
                      </td>
                      <td className={`py-3.5 px-3 text-right font-mono font-semibold text-sm ${(t.pnl_pct || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {t.pnl_pct !== null ? `${(t.pnl_pct || 0) >= 0 ? "+" : ""}${t.pnl_pct.toFixed(2)}%` : "\u2014"}
                      </td>
                      <td className="py-3.5 pl-4 text-right">
                        <span className={`font-bold text-sm ${(t.pnl_usd || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {(t.pnl_usd || 0) >= 0 ? "+" : ""}{fmtUsd(t.pnl_usd || 0)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* CTA Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/8 to-transparent p-8 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
          <div className="relative">
            <h3 className="text-xl font-black text-white mb-2 tracking-tight">Ready to find alpha?</h3>
            <p className="text-gray-400 text-sm mb-5 max-w-md mx-auto">
              Add the Oracle bot to your Telegram group and get real-time alerts when top wallets trade.
            </p>
            <a
              href="https://t.me/OracleAITradingBot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-7 py-3 text-sm font-bold text-black transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:scale-[1.02]"
            >
              Try the Bot Free
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
