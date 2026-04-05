"use client";

import { useEffect, useState, Fragment } from "react";
import Link from "next/link";
import { apiFetch, Discovery } from "@/lib/api";
import { fmtUsd, truncAddr, nansenToken, nansenWallet, fmtPct } from "@/lib/utils";
import GradeBadge from "@/components/GradeBadge";
import CopyButton from "@/components/CopyButton";
import Spinner from "@/components/Spinner";

interface BlocklistEntry {
  address: string;
  votes: number;
  voters: string[];
}

interface BlocklistResponse {
  blocklist: BlocklistEntry[];
  total_listed: number;
}

type Grade = "S" | "A" | "B" | "C" | "D";

export default function DiscoveryPage() {
  const [data, setData] = useState<Discovery | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedToken, setExpandedToken] = useState<string | null>(null);
  const [expandedWallet, setExpandedWallet] = useState<string | null>(null);
  const [blocklist, setBlocklist] = useState<BlocklistEntry[]>([]);
  const [blockVotes, setBlockVotes] = useState<Record<string, number>>({});
  const [votingToken, setVotingToken] = useState<string | null>(null);
  const [userId] = useState(() => Math.random().toString(36).slice(2, 10));

  useEffect(() => {
    apiFetch<Discovery>("/api/discovery/latest")
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
    fetch("http://178.128.253.120:5001/api/blocklist")
      .then((r) => r.json())
      .then((d: BlocklistResponse) => {
        setBlocklist(d.blocklist || []);
        const votes: Record<string, number> = {};
        (d.blocklist || []).forEach((b: BlocklistEntry) => { votes[b.address] = b.votes; });
        setBlockVotes(votes);
      })
      .catch(() => {});
  }, []);

  async function voteBlocklist(address: string) {
    setVotingToken(address);
    try {
      const res = await fetch("http://178.128.253.120:5001/api/blocklist/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, user_id: userId }),
      });
      const result = await res.json();
      if (result.success) {
        setBlockVotes((prev) => ({ ...prev, [address]: result.votes }));
        if (result.reason?.startsWith("auto-blocked")) {
          setBlocklist((prev) => [...prev.filter((b) => b.address !== address), { address, votes: result.votes, voters: [] }]);
        }
      }
    } finally {
      setVotingToken(null);
    }
  }

  if (loading) return <Spinner />;
  if (!data) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-gray-500">
      <div className="text-5xl mb-4 opacity-20">📡</div>
      <p className="text-lg font-medium text-gray-400 mb-1">No discovery data yet</p>
      <p className="text-sm text-gray-600">Run <span className="text-emerald-400/70">/discover</span> on Telegram to populate this page.</p>
    </div>
  );

  const tokens = data.tokens ?? [];
  const wallets = data.wallets ?? [];
  const graph = data.graph;
  const validated = data.validated_tokens ?? [];
  const blockedSet = new Set(blocklist.map((b) => b.address));

  return (
    <div className="gradient-mesh min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">

        {/* ── Page Header ── */}
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-gray-900/80 to-gray-900/40 p-8 backdrop-blur-sm">
          <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
              <span className="text-xs font-medium text-emerald-400/70 uppercase tracking-wider">Live Discovery</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Discovery</h1>
            <p className="text-sm text-gray-400 mt-1">
              Chain: <span className="text-white font-mono">{data.chain}</span> &bull; {tokens.length} tokens &bull; {wallets.length} wallets
            </p>
          </div>
        </div>

        {/* ── Blocklist Alert ── */}
        {blocklist.length > 0 && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent pointer-events-none" />
            <div className="relative flex items-start gap-4">
              <div className="flex-shrink-0 mt-0.5">
                <div className="h-8 w-8 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center">
                  <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728A9 9 0 015.636 5.636" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-red-400 mb-1 flex items-center gap-2">
                  Blocked Tokens
                  <span className="text-xs font-mono bg-red-500/20 px-2 py-0.5 rounded-full border border-red-500/20">{blocklist.length}</span>
                  <span className="text-xs text-red-400/60 font-normal">3 votes auto-blocks a token</span>
                </h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {blocklist.map((b) => (
                    <div key={b.address} className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/15 rounded-xl">
                      <span className="text-white text-xs font-mono">{truncAddr(b.address)}</span>
                      <span className="text-xs text-red-400/70 font-mono">{b.votes} votes</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tokens Section ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white">Tokens</h2>
              <span className="text-xs font-mono text-gray-500 bg-gray-800 px-2.5 py-1 rounded-full border border-white/5">{tokens.length}</span>
            </div>
            <span className="text-xs text-gray-600">Sorted by 7d SM inflow</span>
          </div>

          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 text-[11px] uppercase tracking-wider">
                  <th className="text-left px-5 py-3.5 font-medium">Symbol</th>
                  <th className="text-right px-3 py-3.5 font-medium">MCap</th>
                  <th className="text-right px-3 py-3.5 font-medium">Age</th>
                  <th className="text-right px-3 py-3.5 font-medium">7d Inflow</th>
                  <th className="text-right px-3 py-3.5 font-medium">24h Inflow</th>
                  <th className="text-right px-3 py-3.5 font-medium">30d Inflow</th>
                  <th className="text-right px-3 py-3.5 font-medium">Traders</th>
                  <th className="text-center px-3 py-3.5 font-medium">Accum</th>
                  <th className="text-center px-3 py-3.5 font-medium">Tier</th>
                  <th className="text-center px-5 py-3.5 font-medium">Block</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {tokens.map((t) => (
                  <Fragment key={t.address}>
                    <tr
                      className="table-row-stripe cursor-pointer transition-colors duration-150"
                      onClick={() => setExpandedToken(expandedToken === t.address ? null : t.address)}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <a
                            href={nansenToken(t.address, t.chain)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:text-emerald-300 font-semibold text-sm transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {t.symbol}
                          </a>
                          {t.sectors && t.sectors.length > 0 && (
                            <span className="text-[10px] text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded">{t.sectors[0]}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-right font-mono text-gray-400 text-xs">{fmtUsd(t.market_cap)}</td>
                      <td className="px-3 py-3.5 text-right font-mono text-gray-500 text-xs">
                        {t.token_age_days ? (t.token_age_days >= 30 ? `${Math.round(t.token_age_days/30)}mo` : `${t.token_age_days}d`) : '—'}
                      </td>
                      <td className={`px-3 py-3.5 text-right font-mono font-semibold text-xs ${t.net_flow_7d >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {fmtUsd(t.net_flow_7d)}
                      </td>
                      <td className={`px-3 py-3.5 text-right font-mono text-xs ${t.net_flow_24h >= 0 ? "text-emerald-400/80" : "text-red-400/80"}`}>
                        {fmtUsd(t.net_flow_24h)}
                      </td>
                      <td className={`px-3 py-3.5 text-right font-mono text-xs ${t.net_flow_30d >= 0 ? "text-emerald-400/60" : "text-red-400/60"}`}>
                        {fmtUsd(t.net_flow_30d)}
                      </td>
                      <td className="px-3 py-3.5 text-right text-gray-400 text-xs">{t.trader_count}</td>
                      <td className="px-3 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <GradeBadge grade={t.accumulation.grade as Grade} size="sm" />
                          <span className="text-[10px] text-gray-600 font-mono">{t.accumulation.score}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold border ${
                          t.tier_filter.passed
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}>
                          {t.tier_filter.tier} {t.tier_filter.passed ? "Pass" : "Fail"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {blockedSet.has(t.address) ? (
                          <span className="text-[10px] text-red-400/70 font-mono bg-red-500/10 px-2 py-0.5 rounded border border-red-500/15">
                            Blocked ({blockVotes[t.address] || 0})
                          </span>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); voteBlocklist(t.address); }}
                            disabled={votingToken === t.address}
                            className="text-[10px] px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 text-gray-500 hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-30"
                          >
                            {votingToken === t.address ? "..." : "Vote"}
                          </button>
                        )}
                      </td>
                    </tr>
                    {expandedToken === t.address && (
                      <tr>
                        <td colSpan={10} className="bg-gray-900/60 px-6 py-5 border-t border-white/5">
                          <div className="grid gap-5 sm:grid-cols-3">
                            <div className="space-y-3">
                              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Token Details</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Age</span>
                                  <span className="font-mono text-white">{t.token_age_days ? `${t.token_age_days} days` : '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Market Cap</span>
                                  <span className="font-mono text-white">{fmtUsd(t.market_cap)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">30d SM Inflow</span>
                                  <span className={`font-mono ${t.net_flow_30d >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fmtUsd(t.net_flow_30d)}</span>
                                </div>
                                {t.sectors && t.sectors.length > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Sectors</span>
                                    <span className="text-white text-xs">{t.sectors.join(", ")}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2 pt-1">
                                  <a href={nansenToken(t.address, t.chain)} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 hover:underline flex items-center gap-0.5">Nansen ↗</a>
                                  <a href={`https://dexscreener.com/solana/${t.address}`} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 hover:underline flex items-center gap-0.5">DexScreener ↗</a>
                                </div>
                                <div className="flex items-center gap-1.5 pt-1">
                                  <span className="text-xs text-gray-600 font-mono">{truncAddr(t.address)}</span>
                                  <CopyButton text={t.address} />
                                </div>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Accumulation Details</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Buy/Sell Ratio</span>
                                  <span className="font-mono text-white">{t.accumulation.metrics.buy_sell_ratio.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Buyer HHI</span>
                                  <span className="font-mono text-white">{t.accumulation.metrics.buyer_concentration_hhi.toFixed(4)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">SM Presence</span>
                                  <span className="font-mono text-white">{t.accumulation.metrics.sm_buyer_count} ({fmtPct(t.accumulation.metrics.sm_buyer_pct)})</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Buyers / Sellers</span>
                                  <span className="font-mono text-white">{t.accumulation.metrics.n_buyers} / {t.accumulation.metrics.n_sellers}</span>
                                </div>
                                {t.accumulation.signals.length > 0 && (
                                  <div className="flex flex-wrap gap-1 pt-1">
                                    {t.accumulation.signals.map((s, i) => (
                                      <span key={i} className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">{s}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="space-y-3">
                              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tier Filter</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Tier</span>
                                  <span className="font-mono text-white">{t.tier_filter.tier}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Score</span>
                                  <span className="font-mono text-white">{t.tier_filter.accum_score}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Grade</span>
                                  <GradeBadge grade={t.accumulation.grade as Grade} size="sm" />
                                </div>
                                {t.tier_filter.reasons.length > 0 && (
                                  <div className="mt-2 space-y-1">
                                    {t.tier_filter.reasons.map((r, i) => (
                                      <div key={i} className="text-xs text-amber-400/80 flex items-start gap-1">
                                        <span className="mt-0.5">⚠</span>
                                        <span>{r}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Wallet Leaderboard ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white">Wallet Leaderboard</h2>
              <span className="text-xs font-mono text-gray-500 bg-gray-800 px-2.5 py-1 rounded-full border border-white/5">{wallets.length}</span>
            </div>
            <span className="text-xs text-gray-600">Click row to expand top tokens</span>
          </div>

          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 text-[11px] uppercase tracking-wider">
                  <th className="text-center px-4 py-3.5 font-medium">Grade</th>
                  <th className="text-right px-3 py-3.5 font-medium">Score</th>
                  <th className="text-left px-4 py-3.5 font-medium">Address</th>
                  <th className="text-left px-4 py-3.5 font-medium">Label</th>
                  <th className="text-right px-3 py-3.5 font-medium">Convergence</th>
                  <th className="text-right px-4 py-3.5 font-medium">Hot Buys</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {wallets.map((w) => (
                  <Fragment key={w.address}>
                    <tr
                      className="table-row-stripe cursor-pointer transition-colors duration-150"
                      onClick={() => setExpandedWallet(expandedWallet === w.address ? null : w.address)}
                    >
                      <td className="px-4 py-3.5 text-center"><GradeBadge grade={w.grade as Grade} size="md" /></td>
                      <td className="px-3 py-3.5 text-right font-mono font-bold text-white">{w.score}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Link href={`/wallet/${w.address}`} className="font-mono text-emerald-400 hover:text-emerald-300 text-xs transition-colors" onClick={(e) => e.stopPropagation()}>
                            {truncAddr(w.address, 6)}
                          </Link>
                          <CopyButton text={w.address} />
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-300 text-xs max-w-[180px] truncate">{w.label || "—"}</td>
                      <td className="px-3 py-3.5 text-right font-mono text-gray-300 text-xs">{w.convergence_score}</td>
                      <td className="px-4 py-3.5 text-right text-gray-400 text-xs">{w.hot_token_buys?.length ?? 0}</td>
                    </tr>
                    {expandedWallet === w.address && w.top_tokens.length > 0 && (
                      <tr>
                        <td colSpan={6} className="bg-gray-900/40 px-6 py-5 border-t border-white/5">
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4 text-xs text-gray-400">
                            <span>Win Rate: <span className="text-white font-mono">{fmtPct(w.win_rate)}</span></span>
                            <span>Realized PnL: <span className={`font-mono ${w.total_pnl_realized >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fmtUsd(w.total_pnl_realized)}</span></span>
                            <span>W/L: <span className="text-white font-mono">{w.wins}W / {w.losses}L</span></span>
                            <span>Trades: <span className="text-white font-mono">{w.total_trades}</span></span>
                            <a href={nansenWallet(w.address, w.chain)} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline ml-auto flex items-center gap-0.5">View on Nansen ↗</a>
                          </div>
                          <h4 className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-3">Top Tokens</h4>
                          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {w.top_tokens.slice(0, 6).map((tok) => (
                              <div key={tok.address} className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs">
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="font-semibold text-white">{tok.symbol}</span>
                                  <a href={`https://dexscreener.com/solana/${tok.address}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-gray-600 hover:text-emerald-400 transition-colors">Dex ↗</a>
                                </div>
                                <div className="space-y-0.5">
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">PnL</span>
                                    <span className={`font-mono ${tok.pnl_realized >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fmtUsd(tok.pnl_realized)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">ROI</span>
                                    <span className="font-mono text-gray-300">{tok.roi >= 0 ? "+" : ""}{(tok.roi * 100).toFixed(1)}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Buys / Sells</span>
                                    <span className="font-mono text-gray-500">{tok.buys} / {tok.sells}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Graph Section ── */}
        {graph && graph.nodes.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-5">
              <h2 className="text-xl font-bold text-white">Wallet Graph</h2>
              <span className="text-xs font-mono text-gray-500 bg-gray-800 px-2.5 py-1 rounded-full border border-white/5">{graph.nodes.length} nodes · {graph.edges.length} edges</span>
            </div>
            <div className="glass-card p-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nodes</h4>
                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    {graph.nodes.map((n) => (
                      <div key={n.address} className="flex items-center gap-2 text-xs py-1">
                        <GradeBadge grade={n.grade as Grade} size="sm" />
                        <Link href={`/wallet/${n.address}`} className="text-emerald-400 hover:text-emerald-300 truncate transition-colors">
                          {n.label || truncAddr(n.address)}
                        </Link>
                        {n.is_target && (
                          <span className="text-[10px] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded-full ml-auto flex-shrink-0">TARGET</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="lg:col-span-2 space-y-3">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Connections</h4>
                  <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                    {graph.edges.slice(0, 30).map((e, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs py-1 text-gray-400">
                        <span className="font-mono text-gray-300">{truncAddr(e.from, 4)}</span>
                        <svg className="h-3 w-3 text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="font-mono text-gray-300">{truncAddr(e.to, 4)}</span>
                        <span className="text-gray-600 ml-1">{e.label}</span>
                      </div>
                    ))}
                    {graph.edges.length > 30 && (
                      <p className="text-xs text-gray-600 pt-1">...+{graph.edges.length - 30} more connections</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Validated Tokens ── */}
        {validated.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-5">
              <h2 className="text-xl font-bold text-white">Validated Tokens</h2>
              <span className="text-xs font-mono text-gray-500 bg-gray-800 px-2.5 py-1 rounded-full border border-white/5">GoPlus Security</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {validated.map((v) => (
                <div key={v.address} className="glass-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white text-sm">{v.symbol}</span>
                    <span className="font-mono text-[10px] text-gray-600">{truncAddr(v.address)}</span>
                  </div>
                  {v.goplus && (
                    <div className="space-y-1 text-[11px]">
                      {Object.entries(v.goplus).slice(0, 5).map(([k, val]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-gray-500">{k}</span>
                          <span className="text-gray-300">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}