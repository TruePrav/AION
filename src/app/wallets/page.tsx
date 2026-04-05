"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, type DiscoveryWallet } from "@/lib/api";
import { fmtUsd, fmtPct, truncAddr } from "@/lib/utils";
import GradeBadge from "@/components/GradeBadge";
import CopyButton from "@/components/CopyButton";
import Spinner from "@/components/Spinner";

type Grade = "S" | "A" | "B" | "C" | "D";

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

  const gradeColors: Record<Grade, string> = {
    S: "text-amber-400 border-amber-500/30",
    A: "text-emerald-400 border-emerald-500/30",
    B: "text-yellow-400 border-yellow-500/30",
    C: "text-orange-400 border-orange-500/30",
    D: "text-red-400 border-red-500/30",
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Wallet Leaderboard</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} wallets from latest discovery</p>
        </div>
        <div className="flex gap-3">
          {/* Grade filter */}
          <div className="flex gap-1">
            {(["ALL", "S", "A", "B", "C", "D"] as const).map(g => (
              <button
                key={g}
                onClick={() => setFilter(g)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filter === g
                    ? g === "ALL"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : `bg-gray-700 ${gradeColors[g as Grade]}`
                    : "bg-gray-800 text-gray-500 hover:text-gray-300"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          {/* Sort */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value as "score" | "pnl" | "winrate")}
            className="rounded-lg bg-gray-800 border border-gray-700 px-3 py-1.5 text-xs text-gray-300"
          >
            <option value="score">Sort: Score</option>
            <option value="pnl">Sort: Realized PnL</option>
            <option value="winrate">Sort: Win Rate</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          No wallets match your filter.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/80 text-gray-400 text-xs">
                <th className="px-4 py-3 text-left">Grade</th>
                <th className="px-4 py-3 text-right">Score</th>
                <th className="px-4 py-3 text-left">Wallet</th>
                <th className="px-4 py-3 text-right">Win Rate</th>
                <th className="px-4 py-3 text-right">Realized PnL</th>
                <th className="px-4 py-3 text-right">Unrealized PnL</th>
                <th className="px-4 py-3 text-right">Trades</th>
                <th className="px-4 py-3 text-left">Top Tokens</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filtered.map((w) => (
                <tr key={w.address} className="hover:bg-gray-800/40 transition-colors">
                  <td className="px-4 py-4">
                    <GradeBadge grade={w.grade as Grade} size="md" />
                  </td>
                  <td className="px-4 py-4 text-right font-mono font-bold text-white">{w.score}</td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/wallet/${w.address}`}
                      className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      {w.label || truncAddr(w.address, 8)}
                    </Link>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="font-mono text-xs text-gray-600">{truncAddr(w.address, 4)}</span>
                      <CopyButton text={w.address} />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className={w.win_rate >= 0.7 ? "text-emerald-400" : w.win_rate >= 0.5 ? "text-yellow-400" : "text-red-400"}>
                      {w.win_rate > 0 ? fmtPct(w.win_rate) : "—"}
                    </span>
                  </td>
                  <td className={`px-4 py-4 text-right font-mono font-semibold ${w.total_pnl_realized >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {w.total_pnl_realized >= 0 ? "+" : ""}{fmtUsd(w.total_pnl_realized)}
                  </td>
                  <td className={`px-4 py-4 text-right font-mono ${w.total_pnl_unrealized >= 0 ? "text-emerald-400/70" : "text-red-400/70"}`}>
                    {w.total_pnl_unrealized >= 0 ? "+" : ""}{fmtUsd(w.total_pnl_unrealized)}
                  </td>
                  <td className="px-4 py-4 text-right text-gray-400 font-mono text-xs">{w.total_trades}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {w.top_tokens.slice(0, 3).map((t) => (
                        <span
                          key={t.address}
                          className="inline-flex items-center rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-300"
                          title={`ROI: ${(t.roi * 100).toFixed(0)}%`}
                        >
                          {t.symbol.length > 10 ? t.symbol.slice(0, 10) : t.symbol}
                          <span className={`ml-1 ${t.pnl_realized >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                            {t.roi >= 0 ? "+" : ""}{(t.roi * 100).toFixed(0)}%
                          </span>
                        </span>
                      ))}
                      {w.top_tokens.length > 3 && (
                        <span className="text-xs text-gray-600">+{w.top_tokens.length - 3}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-center text-xs text-gray-600">
        Data from latest discovery run.{" "}
        <a href="https://t.me/OracleAITradingBot" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-400">
          Run /discover on Telegram
        </a>{" "}
        to refresh.
      </div>
    </div>
  );
}
