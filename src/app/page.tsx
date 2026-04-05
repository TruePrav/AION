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

  const topTokens = [...tokens].sort((a, b) => b.net_flow_7d - a.net_flow_7d).slice(0, 5);
  const closedTrades = trades.filter(t => t.status === "closed").slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
      {/* Hero */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold tracking-tight">
          Find the <span className="text-emerald-400">Smart Money</span>.<br />Before Everyone Else.
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          ORACLE tracks Nansen&apos;s labeled wallets, grades their performance, and surfaces real alpha — before the crowd catches on.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            href="/discovery"
            className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors"
          >
            View Discovery
          </Link>
          <a
            href="https://t.me/OracleAITradingBot"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-gray-700 px-6 py-2.5 text-sm font-semibold text-gray-300 hover:bg-gray-800 transition-colors"
          >
            Get Telegram Bot
          </a>
        </div>
      </div>

      {/* Public Stats Bar */}
      {status && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard label="Tokens Tracked" value={String(status.tokens_in_run)} />
          <StatCard label="Wallets Monitored" value={String(status.wallets_graded)} />
          <StatCard label="Total Trades" value={String(status.total_trades)} />
          <StatCard label="Win Rate" value={status.win_rate > 0 ? fmtPct(status.win_rate) : "—"} />
          <StatCard label="Total PnL" value={status.total_pnl !== 0 ? fmtUsd(status.total_pnl) : "—"} />
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Hot Tokens */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Tokens Smart Money Is Buying</h2>
            <Link href="/discovery" className="text-sm text-emerald-400 hover:text-emerald-300 font-medium">View All →</Link>
          </div>
          {topTokens.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">No discovery data yet. Run /discover on Telegram to start.</p>
          ) : (
            <div className="space-y-3">
              {topTokens.map((t) => (
                <div key={t.address} className="flex items-center justify-between rounded-xl bg-gray-800/40 px-4 py-3 hover:bg-gray-800/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <GradeBadge grade={t.accumulation.grade as "S"|"A"|"B"|"C"|"D"} size="sm" />
                    <div>
                      <a
                        href={`https://app.nansen.ai/token/${t.address}?chain=${t.chain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-white hover:text-emerald-400 transition-colors"
                      >
                        {t.symbol}
                      </a>
                      <div className="text-xs text-gray-500">MCap {fmtUsd(t.market_cap)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-mono font-semibold ${t.net_flow_7d >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {t.net_flow_7d >= 0 ? "+" : ""}{fmtUsd(t.net_flow_7d)}
                    </div>
                    <div className="text-xs text-gray-500">7d SM flow</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Wallets */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Highest Scoring Wallets</h2>
            <Link href="/wallets" className="text-sm text-emerald-400 hover:text-emerald-300 font-medium">View All →</Link>
          </div>
          {!scout ? (
            <p className="text-sm text-gray-500 py-8 text-center">No scout data yet. Run /scout on Telegram to find top wallets.</p>
          ) : (
            <div className="space-y-4">
              {/* Main wallet */}
              <Link
                href={`/wallet/${scout.wallet.address}`}
                className="flex items-center justify-between rounded-xl bg-gray-800/40 px-4 py-3 hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <GradeBadge grade={scout.wallet.grade as "S"|"A"|"B"|"C"|"D"} size="lg" />
                  <div>
                    <div className="font-semibold text-white">
                      {scout.wallet.label || truncAddr(scout.wallet.address)}
                    </div>
                    <div className="text-xs text-gray-400">
                      Score {scout.wallet.score} · {scout.wallet.win_rate > 0 ? fmtPct(scout.wallet.win_rate) : "—"} win rate
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-mono font-semibold ${scout.wallet.total_pnl_realized >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {scout.wallet.total_pnl_realized >= 0 ? "+" : ""}{fmtUsd(scout.wallet.total_pnl_realized)}
                  </div>
                  <div className="text-xs text-gray-500">Realized PnL</div>
                </div>
              </Link>
              {/* Recent buys */}
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Latest Buys</p>
                <div className="space-y-2">
                  {scout.recent_buys.map((b, i) => (
                    <div key={i} className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-gray-800/20">
                      <span className="text-gray-300 font-medium">{b.token}</span>
                      <div className="text-right">
                        <span className="font-mono text-gray-400 text-xs">{fmtUsd(b.value)}</span>
                        {b.timestamp && (
                          <span className="text-xs text-gray-600 ml-2">
                            {new Date(b.timestamp).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Trades */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Trade Results</h2>
          <Link href="/trades" className="text-sm text-emerald-400 hover:text-emerald-300 font-medium">View All →</Link>
        </div>
        {closedTrades.length === 0 ? (
          <p className="text-sm text-gray-500 py-6 text-center">No closed trades yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 text-xs">
                  <th className="text-left py-2 pr-4">Token</th>
                  <th className="text-right py-2 px-4">Amount</th>
                  <th className="text-right py-2 px-4">Entry</th>
                  <th className="text-right py-2 px-4">PnL %</th>
                  <th className="text-right py-2 pl-4">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {closedTrades.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 pr-4">
                      <span className="font-mono text-xs text-gray-400">{truncAddr(t.token, 6)}</span>
                      <span className="ml-2 text-xs text-gray-600">{t.chain}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-gray-300">{fmtUsd(t.size_usdc)}</td>
                    <td className="py-3 px-4 text-right font-mono text-gray-400">
                      {t.entry_price > 0 ? `$${t.entry_price.toFixed(4)}` : "—"}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-semibold ${(t.pnl_pct || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {t.pnl_pct !== null ? `${t.pnl_pct >= 0 ? "+" : ""}${t.pnl_pct.toFixed(2)}%` : "—"}
                    </td>
                    <td className="py-3 pl-4 text-right">
                      {(t.pnl_usd || 0) >= 0 ? (
                        <span className="text-emerald-400 font-semibold">{fmtUsd(t.pnl_usd || 0)}</span>
                      ) : (
                        <span className="text-red-400 font-semibold">{fmtUsd(t.pnl_usd || 0)}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CTA Footer */}
      <div className="text-center rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8">
        <h3 className="text-xl font-bold text-white mb-2">Ready to find alpha?</h3>
        <p className="text-gray-400 mb-5">Add the Oracle bot to your Telegram group and get real-time alerts when top wallets trade.</p>
        <a
          href="https://t.me/OracleAITradingBot"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors"
        >
          Try the Bot Free →
        </a>
      </div>
    </div>
  );
}
