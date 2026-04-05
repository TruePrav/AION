"use client";

import { useEffect, useState, Fragment } from "react";
import Link from "next/link";
import { apiFetch, Discovery } from "@/lib/api";
import { fmtUsd, truncAddr, nansenToken, nansenWallet, fmtPct } from "@/lib/utils";
import GradeBadge from "@/components/GradeBadge";
import CopyButton from "@/components/CopyButton";
import Spinner from "@/components/Spinner";

type Grade = "S" | "A" | "B" | "C" | "D";

export default function DiscoveryPage() {
  const [data, setData] = useState<Discovery | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedToken, setExpandedToken] = useState<string | null>(null);
  const [expandedWallet, setExpandedWallet] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Discovery>("/api/discovery/latest")
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data) return <div className="py-20 text-center text-gray-500">No data yet</div>;

  const tokens = data.tokens ?? [];
  const wallets = data.wallets ?? [];
  const graph = data.graph;
  const validated = data.validated_tokens ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Discovery</h1>
        <p className="text-sm text-gray-500 mt-1">Chain: {data.chain}</p>
      </div>

      {/* Token Table */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Tokens ({tokens.length})</h2>
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-900 text-gray-400">
              <tr>
                <th className="px-4 py-3 text-left">Symbol</th>
                <th className="px-4 py-3 text-right">MCap</th>
                <th className="px-4 py-3 text-right">Age</th>
                <th className="px-4 py-3 text-right">7d SM Inflow</th>
                <th className="px-4 py-3 text-right">24h Inflow</th>
                <th className="px-4 py-3 text-right">30d Inflow</th>
                <th className="px-4 py-3 text-right">SM Traders</th>
                <th className="px-4 py-3 text-center">Accum</th>
                <th className="px-4 py-3 text-center">Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {tokens.map((t) => (
                <Fragment key={t.address}>
                  <tr
                    className="hover:bg-gray-800/50 cursor-pointer transition-colors"
                    onClick={() => setExpandedToken(expandedToken === t.address ? null : t.address)}
                  >
                    <td className="px-4 py-3">
                      <a href={nansenToken(t.address, t.chain)} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline font-medium" onClick={(e) => e.stopPropagation()}>
                        {t.symbol}
                      </a>
                      {t.sectors && t.sectors.length > 0 && (
                        <span className="ml-1 text-[10px] text-gray-600">{t.sectors[0]}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-gray-400 text-xs">{t.token_age_days ? (t.token_age_days >= 30 ? `${Math.round(t.token_age_days/30)}mo` : `${t.token_age_days}d`) : '—'}</td>
                    <td className="px-4 py-3 text-right font-mono">{fmtUsd(t.market_cap)}</td>
                    <td className={`px-4 py-3 text-right font-mono ${t.net_flow_7d >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fmtUsd(t.net_flow_7d)}</td>
                    <td className={`px-4 py-3 text-right font-mono ${t.net_flow_24h >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fmtUsd(t.net_flow_24h)}</td>
                    <td className={`px-4 py-3 text-right font-mono text-gray-400 text-xs ${t.net_flow_30d >= 0 ? "text-emerald-400/70" : "text-red-400/70"}`}>{fmtUsd(t.net_flow_30d)}</td>
                    <td className="px-4 py-3 text-right">{t.trader_count}</td>
                    <td className="px-4 py-3 text-center"><GradeBadge grade={t.accumulation.grade as Grade} size="sm" /><span className="text-xs text-gray-500 ml-1">{t.accumulation.score}</span></td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${t.tier_filter.passed ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                        {t.tier_filter.tier} {t.tier_filter.passed ? "Pass" : "Fail"}
                      </span>
                    </td>
                  </tr>
                  {expandedToken === t.address && (
                    <tr>
                      <td colSpan={9} className="bg-gray-900/50 px-6 py-4">
                        <div className="grid gap-4 sm:grid-cols-3">
                          <div>
                            <h4 className="text-xs font-semibold text-gray-400 mb-2">Token Details</h4>
                            <div className="space-y-1 text-sm">
                              <div>Age: <span className="font-mono text-white">{t.token_age_days ? `${t.token_age_days} days` : '—'}</span></div>
                              <div>Market Cap: <span className="font-mono text-white">{fmtUsd(t.market_cap)}</span></div>
                              <div>30d SM Inflow: <span className={`font-mono ${t.net_flow_30d >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fmtUsd(t.net_flow_30d)}</span></div>
                              {t.sectors && t.sectors.length > 0 && (
                                <div>Sectors: <span className="text-white">{t.sectors.join(", ")}</span></div>
                              )}
                              <div className="mt-1 flex gap-2">
                                <a href={nansenToken(t.address, t.chain)} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 hover:underline">Nansen ↗</a>
                                <a href={`https://dexscreener.com/solana/${t.address}`} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 hover:underline">DexScreener ↗</a>
                              </div>
                              <div className="mt-1">
                                <span className="text-xs text-gray-500 font-mono">{truncAddr(t.address)}</span>
                                <CopyButton text={t.address} />
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-gray-400 mb-2">Accumulation Details</h4>
                            <div className="space-y-1 text-sm">
                              <div>Buy/Sell Ratio: <span className="font-mono text-white">{t.accumulation.metrics.buy_sell_ratio.toFixed(2)}</span></div>
                              <div>Buyer Diversity (HHI): <span className="font-mono text-white">{t.accumulation.metrics.buyer_concentration_hhi.toFixed(4)}</span></div>
                              <div>SM Presence: <span className="font-mono text-white">{t.accumulation.metrics.sm_buyer_count} ({fmtPct(t.accumulation.metrics.sm_buyer_pct)})</span></div>
                              <div>Buyers: <span className="font-mono text-white">{t.accumulation.metrics.n_buyers}</span> | Sellers: <span className="font-mono text-white">{t.accumulation.metrics.n_sellers}</span></div>
                              {t.accumulation.signals.length > 0 && (
                                <div>Signals: <span className="text-emerald-400">{t.accumulation.signals.join(", ")}</span></div>
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-gray-400 mb-2">Tier Filter</h4>
                            <div className="space-y-1 text-sm">
                              <div>Tier: <span className="font-mono text-white">{t.tier_filter.tier}</span></div>
                              <div>Score: <span className="font-mono text-white">{t.tier_filter.accum_score}</span></div>
                              <div>Grade: <GradeBadge grade={t.accumulation.grade as Grade} size="sm" /></div>
                              {t.tier_filter.reasons.length > 0 && (
                                <div className="text-amber-400">
                                  {t.tier_filter.reasons.map((r, i) => <div key={i}>- {r}</div>)}
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

      {/* Wallet Leaderboard */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Wallet Leaderboard ({wallets.length})</h2>
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-900 text-gray-400">
              <tr>
                <th className="px-4 py-3 text-center">Grade</th>
                <th className="px-4 py-3 text-right">Score</th>
                <th className="px-4 py-3 text-left">Address</th>
                <th className="px-4 py-3 text-left">Label</th>
                <th className="px-4 py-3 text-right">Convergence</th>
                <th className="px-4 py-3 text-right">Hot Buys</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {wallets.map((w) => (
                <Fragment key={w.address}>
                  <tr
                    className="hover:bg-gray-800/50 cursor-pointer transition-colors"
                    onClick={() => setExpandedWallet(expandedWallet === w.address ? null : w.address)}
                  >
                    <td className="px-4 py-3 text-center"><GradeBadge grade={w.grade as Grade} size="sm" /></td>
                    <td className="px-4 py-3 text-right font-mono">{w.score}</td>
                    <td className="px-4 py-3">
                      <Link href={`/wallet/${w.address}`} className="font-mono text-emerald-400 hover:underline text-xs" onClick={(e) => e.stopPropagation()}>
                        {truncAddr(w.address, 6)}
                      </Link>
                      <CopyButton text={w.address} />
                    </td>
                    <td className="px-4 py-3 text-gray-300 text-xs max-w-[200px] truncate">{w.label}</td>
                    <td className="px-4 py-3 text-right font-mono">{w.convergence_score}</td>
                    <td className="px-4 py-3 text-right">{w.hot_token_buys?.length ?? 0}</td>
                  </tr>
                  {expandedWallet === w.address && w.top_tokens.length > 0 && (
                    <tr>
                      <td colSpan={6} className="bg-gray-900/50 px-6 py-4">
                        <div className="flex items-center gap-4 mb-3 text-xs text-gray-400">
                          <span>Win Rate: <span className="text-white font-mono">{fmtPct(w.win_rate)}</span></span>
                          <span>Realized PnL: <span className={`font-mono ${w.total_pnl_realized >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fmtUsd(w.total_pnl_realized)}</span></span>
                          <span>W/L: <span className="text-white font-mono">{w.wins}W / {w.losses}L</span></span>
                          <span>Trades: <span className="text-white font-mono">{w.total_trades}</span></span>
                          <a href={nansenWallet(w.address, w.chain)} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline ml-auto">View on Nansen ↗</a>
                        </div>
                        <h4 className="text-xs font-semibold text-gray-400 mb-2">Top Tokens</h4>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {w.top_tokens.slice(0, 5).map((tok) => (
                            <div key={tok.address} className="rounded-lg border border-gray-700 bg-gray-800/50 p-3 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-white">{tok.symbol}</span>
                                <a href={`https://dexscreener.com/solana/${tok.address}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-gray-500 hover:text-emerald-400">Dex ↗</a>
                              </div>
                              <div className="text-gray-400 mt-1">
                                PnL: <span className={tok.pnl_realized >= 0 ? "text-emerald-400" : "text-red-400"}>{fmtUsd(tok.pnl_realized)}</span>
                                {" | "}ROI: <span className="font-mono">{(tok.roi * 100).toFixed(1)}%</span>
                              </div>
                              <div className="text-gray-500">Buys: {tok.buys} | Sells: {tok.sells}</div>
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

      {/* Graph Section */}
      {graph && graph.nodes.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Wallet Graph</h2>
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <h4 className="text-xs font-semibold text-gray-400 mb-2">Nodes ({graph.nodes.length})</h4>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {graph.nodes.map((n) => (
                    <div key={n.address} className="flex items-center gap-2 text-xs">
                      <GradeBadge grade={n.grade as Grade} size="sm" />
                      <Link href={`/wallet/${n.address}`} className="text-emerald-400 hover:underline truncate">{n.label || truncAddr(n.address)}</Link>
                      {n.is_target && <span className="text-amber-400 text-[10px]">TARGET</span>}
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-2">
                <h4 className="text-xs font-semibold text-gray-400 mb-2">Connections ({graph.edges.length})</h4>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {graph.edges.slice(0, 30).map((e, i) => (
                    <div key={i} className="text-xs text-gray-400">
                      <span className="font-mono">{truncAddr(e.from, 4)}</span>
                      <span className="text-gray-600 mx-1">&rarr;</span>
                      <span className="font-mono">{truncAddr(e.to, 4)}</span>
                      <span className="text-gray-500 ml-1">({e.label})</span>
                    </div>
                  ))}
                  {graph.edges.length > 30 && <p className="text-xs text-gray-600">...+{graph.edges.length - 30} more</p>}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Validated Tokens */}
      {validated.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Validated Tokens (GoPlus)</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {validated.map((v) => (
              <div key={v.address} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{v.symbol}</span>
                  <span className="font-mono text-xs text-gray-500">{truncAddr(v.address)}</span>
                </div>
                {v.goplus && (
                  <div className="mt-2 text-xs text-gray-400 space-y-0.5">
                    {Object.entries(v.goplus).slice(0, 6).map(([k, val]) => (
                      <div key={k}>{k}: <span className="text-white">{String(val)}</span></div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
