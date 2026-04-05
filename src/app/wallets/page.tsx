"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, type DiscoveryWallet } from "@/lib/api";
import { fmtUsd, fmtPct, truncAddr } from "@/lib/utils";
import GradeBadge from "@/components/GradeBadge";
import CopyButton from "@/components/CopyButton";
import Spinner from "@/components/Spinner";

type Grade = "S" | "A" | "B" | "C" | "D";

const gradeColors: Record<Grade, { active: string; idle: string }> = {
  S: { active: "bg-amber-500/20 border-amber-500/30", idle: "bg-gray-800 border-white/5" },
  A: { active: "bg-emerald-500/20 border-emerald-500/30", idle: "bg-gray-800 border-white/5" },
  B: { active: "bg-yellow-500/20 border-yellow-500/30", idle: "bg-gray-800 border-white/5" },
  C: { active: "bg-orange-500/20 border-orange-500/30", idle: "bg-gray-800 border-white/5" },
  D: { active: "bg-red-500/20 border-red-500/30", idle: "bg-gray-800 border-white/5" },
};

export default function WalletsPage() {
  const [wallets, setWallets] = useState<DiscoveryWallet[]>([]);
  const [filter, setFilter] = useState<Grade | "ALL">("ALL");
  const [sort, setSort] = useState<"score" | "pnl" | "winrate">("score");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<DiscoveryWallet[]>("/api/discovery/wallets")
      .then(setWallets)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const filtered = wallets
    .filter(w => filter === "ALL" || w.grade === filter)
    .sort((a, b) => {
      if (sort === "score") return b.score - a.score;
      if (sort === "pnl") return b.total_pnl_realized - a.total_pnl_realized;
      return b.win_rate - a.win_rate;
    });

  return (
    <div className="gradient-mesh min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">

        {/* ── Page Header ── */}
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-gray-900/80 to-gray-900/40 p-8 backdrop-blur-sm">
          <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="relative flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 pulse-dot" style={{animationDelay: "0.5s"}} />
                <span className="text-xs font-medium text-amber-400/70 uppercase tracking-wider">Live Leaderboard</span>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight">Wallets</h1>
              <p className="text-sm text-gray-500 mt-1">{filtered.length} wallets from latest discovery</p>
            </div>
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Grade filter */}
          <div className="flex gap-1.5 flex-wrap">
            {(["ALL", "S", "A", "B", "C", "D"] as const).map(g => {
              const isActive = filter === g;
              const colors = g === "ALL" ? { active: "bg-emerald-500/20 border-emerald-500/30", idle: "bg-gray-800 border-white/5" } : (gradeColors[g as Grade]);
              return (
                <button
                  key={g}
                  onClick={() => setFilter(g)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 border ${
                    isActive ? colors.active : colors.idle
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Sort by</span>
            <select
              value={sort}
              onChange={e => setSort(e.target.value as "score" | "pnl" | "winrate")}
              className="rounded-xl bg-gray-800/80 border border-white/10 px-3 py-1.5 text-xs text-gray-300 outline-none cursor-pointer focus:border-emerald-500/30 transition-colors"
            >
              <option value="score">Score</option>
              <option value="pnl">Realized PnL</option>
              <option value="winrate">Win Rate</option>
            </select>
          </div>
        </div>

        {/* ── Table ── */}
        {filtered.length === 0 ? (
          <div className="glass-card p-20 text-center">
            <div className="text-5xl mb-4 opacity-20">🔍</div>
            <p className="text-base font-medium text-gray-400">No wallets match your filter</p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 text-[11px] uppercase tracking-wider">
                  <th className="text-center px-4 py-3.5 font-medium">Grade</th>
                  <th className="text-right px-4 py-3.5 font-medium">Score</th>
                  <th className="text-left px-5 py-3.5 font-medium">Wallet</th>
                  <th className="text-right px-4 py-3.5 font-medium">Win Rate</th>
                  <th className="text-right px-4 py-3.5 font-medium">Realized PnL</th>
                  <th className="text-right px-4 py-3.5 font-medium">Unrealized PnL</th>
                  <th className="text-right px-4 py-3.5 font-medium">Trades</th>
                  <th className="text-left px-5 py-3.5 font-medium">Top Tokens</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((w) => (
                  <tr key={w.address} className="table-row-stripe">
                    <td className="px-4 py-4 text-center">
                      <GradeBadge grade={w.grade as Grade} size="md" />
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-black text-white text-base">{w.score}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div>
                          <Link
                            href={`/wallet/${w.address}`}
                            className="font-medium text-emerald-400/80 hover:text-emerald-400 transition-colors text-sm"
                          >
                            {w.label || truncAddr(w.address, 8)}
                          </Link>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[10px] text-gray-600">{truncAddr(w.address, 4)}...</span>
                            <CopyButton text={w.address} />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className={w.win_rate >= 0.7 ? "text-emerald-400 font-semibold" : w.win_rate >= 0.5 ? "text-yellow-400" : "text-red-400"}>
                        {w.win_rate > 0 ? fmtPct(w.win_rate) : "—"}
                      </span>
                    </td>
                    <td className={`px-4 py-4 text-right font-mono font-semibold text-sm ${w.total_pnl_realized >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {w.total_pnl_realized >= 0 ? "+" : ""}{fmtUsd(w.total_pnl_realized)}
                    </td>
                    <td className={`px-4 py-4 text-right font-mono text-sm ${w.total_pnl_unrealized >= 0 ? "text-emerald-400/70" : "text-red-400/70"}`}>
                      {w.total_pnl_unrealized >= 0 ? "+" : ""}{fmtUsd(w.total_pnl_unrealized)}
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-gray-500 text-xs">{w.total_trades}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {w.top_tokens.slice(0, 3).map((t) => (
                          <span
                            key={t.address}
                            className="inline-flex items-center rounded-full bg-gray-800/60 px-2 py-0.5 text-xs text-gray-300 border border-white/5"
                          >
                            <span className="truncate max-w-[60px]">{t.symbol}</span>
                            <span className={`ml-1 ${t.pnl_realized >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                              {t.roi >= 0 ? "+" : ""}{(t.roi * 100).toFixed(0)}%
                            </span>
                          </span>
                        ))}
                        {w.top_tokens.length > 3 && (
                          <span className="text-[10px] text-gray-600 self-center">+{w.top_tokens.length - 3}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Footer note ── */}
        <div className="text-center text-xs text-gray-600 space-y-1">
          <p>Data from latest discovery run.</p>
          <p>
            <a href="https://t.me/OracleAITradingBot" target="_blank" rel="noopener noreferrer" className="text-emerald-500/70 hover:text-emerald-400 transition-colors">
              Run /discover on Telegram
            </a>{" "}
            to refresh.
          </p>
        </div>
      </div>
    </div>
  );
}