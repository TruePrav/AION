"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import GradeBadge from "@/components/GradeBadge";
import CopyButton from "@/components/CopyButton";
import StatCard from "@/components/StatCard";
import { type WalletDetail, type WalletTopToken, copyTrade, type CopyTradeResult } from "@/lib/api";
import { fmtUsd, fmtPct, truncAddr, nansenWallet, nansenToken } from "@/lib/utils";

export default function WalletPage() {
  const params = useParams();
  const address = params.address as string;
  const [wallet, setWallet] = useState<WalletDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<WalletTopToken | null>(null);
  const [tradeAmount, setTradeAmount] = useState<number>(10);
  const [tradeResult, setTradeResult] = useState<CopyTradeResult | null>(null);
  const [tradeLoading, setTradeLoading] = useState(false);

  useEffect(() => {
    if (!address) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://178.128.253.120:5001"}/api/wallet/${address}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setWallet(data.wallet || data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load wallet");
        setLoading(false);
      });
  }, [address]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-400">
        <div className="h-10 w-10 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mb-4" />
        <p className="text-sm text-gray-500">Loading wallet...</p>
      </div>
    );
  }

  if (error || !wallet) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="text-5xl mb-4 opacity-20">🔍</div>
        <p className="text-lg font-medium text-gray-400 mb-2">Wallet not found</p>
        <p className="text-sm text-gray-600 mb-4">{error || "No data for this wallet"}</p>
        <Link href="/discovery" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
          ← Back to Discovery
        </Link>
      </div>
    );
  }

  const topTokens = wallet.top_tokens || [];
  const holdings = topTokens.filter((t: WalletTopToken) => t.holding_usd > 0);
  const closedTrades = topTokens.filter((t: WalletTopToken) => t.sold_usd > 0);
  const totalHolding = holdings.reduce((s: number, t: WalletTopToken) => s + t.holding_usd, 0);

  async function handleCopyTrade() {
    if (!wallet || !selectedToken) return;
    setTradeLoading(true);
    setTradeResult(null);
    try {
      const result = await copyTrade(
        { address: selectedToken.address, chain: wallet.chain || "solana", symbol: selectedToken.symbol },
        tradeAmount
      );
      setTradeResult(result);
    } catch (e) {
      setTradeResult({ success: false, error: String(e) });
    } finally {
      setTradeLoading(false);
    }
  }

  return (
    <div className="gradient-mesh min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

        {/* ── Profile Header ── */}
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-gray-900/90 to-gray-900/40 p-8 backdrop-blur-sm">
          {/* Ambient glow based on grade */}
          <div className={`absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl ${
            wallet.grade === "S" ? "bg-amber-500/10" :
            wallet.grade === "A" ? "bg-emerald-500/8" :
            "bg-gray-700/10"
          } pointer-events-none`} />

          <div className="relative">
            {/* Top row */}
            <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <GradeBadge grade={wallet.grade as "S" | "A" | "B" | "C" | "D"} size="lg" />
                  {wallet.grade === "S" && (
                    <div className="absolute inset-0 rounded-full grade-s-glow pointer-events-none" />
                  )}
                </div>
                <div>
                  <div className="text-4xl font-black text-white tracking-tight">{wallet.score}<span className="text-xl text-gray-500 font-normal">/100</span></div>
                  <div className="text-xs text-gray-500 mt-0.5">Overall Score</div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <a href={`https://dexscreener.com/solana/${wallet.address}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium text-gray-300 transition-all hover:text-white">
                  DexScreener
                </a>
                <a href={nansenWallet(wallet.address, wallet.chain || "solana")} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium text-gray-300 transition-all hover:text-white">
                  Nansen
                </a>
                <CopyButton text={wallet.address} />
              </div>
            </div>

            {/* Label + address */}
            <div className="space-y-1">
              {wallet.label && <p className="text-lg font-semibold text-emerald-400/80">{wallet.label}</p>}
              <p className="text-xs text-gray-500 font-mono break-all bg-gray-800/50 rounded-lg px-3 py-2 inline-block border border-white/5">{wallet.address}</p>
            </div>
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Win Rate" value={fmtPct(wallet.win_rate)} icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.04 6.04 0 01-2.27.895m0 0a6.04 6.04 0 01-2.27-.895" />
            </svg>
          } />
          <StatCard label="Realized PnL" value={wallet.total_pnl_realized >= 0 ? `+${fmtUsd(wallet.total_pnl_realized)}` : fmtUsd(wallet.total_pnl_realized)} accent={wallet.total_pnl_realized >= 0} icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
          } />
          <StatCard label="Unrealized PnL" value={wallet.total_pnl_unrealized >= 0 ? `+${fmtUsd(wallet.total_pnl_unrealized)}` : fmtUsd(wallet.total_pnl_unrealized)} icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          } />
          <StatCard label="Total Trades" value={String(wallet.total_trades)} icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
          } />
          <StatCard label="Tokens Traded" value={String(wallet.token_count)} icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          } />
          <StatCard label="Wins" value={String(wallet.wins)} icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          } />
          <StatCard label="Losses" value={String(wallet.losses)} icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          } />
          <StatCard label="Volume Bought" value={fmtUsd(wallet.total_bought_usd)} icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-2.25m0 0l-.75 1.5h3.75a1.5 1.5 0 000-3h-3.75a1.5 1.5 0 00-1.5 1.5v3.75m0 0l1.5 1.5m-1.5-1.5l1.5-1.5" />
            </svg>
          } />
        </div>

        {/* ── Copy Trade ── */}
        {holdings.length > 0 && (
          <div className="emerald-card p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20">
                <div className="h-2 w-2 rounded-full bg-emerald-400 pulse-dot" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Copy Trade Terminal</h2>
                <p className="text-xs text-gray-500">Executes from Oracle VPS wallet via Nansen API</p>
              </div>
              {tradeLoading && (
                <div className="ml-auto">
                  <div className="h-5 w-5 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Token selector */}
            <div className="mb-5">
              <label className="text-xs text-gray-500 font-medium uppercase tracking-wider block mb-3">Select Token to Copy</label>
              <div className="flex flex-wrap gap-2">
                {holdings.map((t) => (
                  <button
                    key={t.address}
                    onClick={() => { setSelectedToken(t); setTradeResult(null); }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all duration-200 ${
                      selectedToken?.address === t.address
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                        : "border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10"
                    }`}
                  >
                    <span className="font-semibold">{t.symbol}</span>
                    <span className="text-xs opacity-60 font-mono">{fmtUsd(t.holding_usd)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount selector */}
            {selectedToken && (
              <>
                <div className="mb-5">
                  <label className="text-xs text-gray-500 font-medium uppercase tracking-wider block mb-3">Amount (USDC)</label>
                  <div className="flex gap-2 flex-wrap">
                    {[5, 10, 25, 50].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setTradeAmount(amt)}
                        className={`px-5 py-2 rounded-xl border text-sm font-mono transition-all duration-200 ${
                          tradeAmount === amt
                            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                            : "border-white/10 bg-white/5 text-gray-300 hover:border-white/20"
                        }`}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Result */}
                {tradeResult && (
                  <div className={`rounded-xl p-4 mb-5 border text-sm font-mono transition-all ${
                    tradeResult.success
                      ? "bg-emerald-500/8 border-emerald-500/25 text-emerald-400"
                      : "bg-red-500/8 border-red-500/25 text-red-400"
                  }`}>
                    {tradeResult.success ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 font-bold text-base">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Trade Submitted!
                        </div>
                        <div className="text-xs space-y-0.5 opacity-80">
                          {tradeResult.tx_hash && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">Tx:</span>
                              <a href={`https://solscan.io/tx/${tradeResult.tx_hash}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-300">
                                {tradeResult.tx_hash.slice(0, 16)}...
                              </a>
                            </div>
                          )}
                          {tradeResult.dry_run && <div className="text-amber-400/70">Mode: dry_run (no real funds)</div>}
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">Token:</span>
                            <span>{selectedToken.symbol}</span>
                            <span className="text-gray-400">·</span>
                            <span>${tradeAmount} USDC</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 font-bold text-base">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Trade Failed
                        </div>
                        <div className="text-xs opacity-80">{tradeResult.error}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Execute button */}
                <button
                  onClick={handleCopyTrade}
                  disabled={tradeLoading || !selectedToken}
                  className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 bg-emerald-500 hover:bg-emerald-400 text-black disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-400/30 hover:scale-[1.01] active:scale-[0.99]"
                >
                  {tradeLoading ? (
                    <>
                      <span className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Executing via Nansen...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Copy {selectedToken.symbol} — ${tradeAmount} USDC
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        )}

        {/* ── Holdings ── */}
        {holdings.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-white">Current Holdings</h2>
              <span className="text-xs font-mono text-gray-500 bg-gray-800 px-2.5 py-1 rounded-full border border-white/5">{holdings.length}</span>
              <span className="text-xs text-gray-600 ml-auto">{fmtUsd(totalHolding)} total</span>
            </div>
            <div className="glass-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-gray-500 text-[11px] uppercase tracking-wider">
                    <th className="text-left py-3.5 px-5 font-medium">Token</th>
                    <th className="text-right py-3.5 px-4 font-medium">Holding Value</th>
                    <th className="text-right py-3.5 px-4 font-medium">Unrealized PnL</th>
                    <th className="text-right py-3.5 px-4 font-medium">ROI</th>
                    <th className="text-right py-3.5 px-5 font-medium">Chart</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {holdings.map((t: WalletTopToken) => (
                    <tr key={t.address} className="table-row-stripe transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <div>
                            <span className="font-semibold text-white text-sm">{t.symbol}</span>
                            <p className="text-gray-600 text-[10px] font-mono">{truncAddr(t.address)}</p>
                          </div>
                          <a href={`https://dexscreener.com/solana/${t.address}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-gray-600 hover:text-emerald-400 transition-colors ml-1">Dex ↗</a>
                          <CopyButton text={t.address} />
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-white text-sm">{fmtUsd(t.holding_usd)}</td>
                      <td className={`py-3.5 px-4 text-right font-mono font-semibold text-sm ${t.pnl_unrealized >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {t.pnl_unrealized >= 0 ? "+" : ""}{fmtUsd(t.pnl_unrealized)}
                      </td>
                      <td className={`py-3.5 px-4 text-right font-mono font-semibold text-sm ${t.roi >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {t.roi >= 0 ? "+" : ""}{(t.roi * 100).toFixed(1)}%
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <a href={nansenToken(t.address, wallet.chain || "solana")} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                          Nansen ↗
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Recent Sells ── */}
        {closedTrades.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-white">Recent Sells</h2>
              <span className="text-xs font-mono text-gray-500 bg-gray-800 px-2.5 py-1 rounded-full border border-white/5">{closedTrades.length}</span>
            </div>
            <div className="glass-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-gray-500 text-[11px] uppercase tracking-wider">
                    <th className="text-left py-3.5 px-5 font-medium">Token</th>
                    <th className="text-right py-3.5 px-4 font-medium">Bought</th>
                    <th className="text-right py-3.5 px-4 font-medium">Sold</th>
                    <th className="text-right py-3.5 px-4 font-medium">Realized PnL</th>
                    <th className="text-right py-3.5 px-4 font-medium">ROI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {closedTrades.map((t: WalletTopToken) => (
                    <tr key={t.address} className="table-row-stripe transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <div>
                            <span className="font-semibold text-white text-sm">{t.symbol}</span>
                            <p className="text-gray-600 text-[10px] font-mono">{truncAddr(t.address)}</p>
                          </div>
                          <a href={`https://dexscreener.com/solana/${t.address}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-gray-600 hover:text-emerald-400 transition-colors ml-1">Dex ↗</a>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-gray-400 text-xs">{fmtUsd(t.bought_usd)}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-gray-400 text-xs">{fmtUsd(t.sold_usd)}</td>
                      <td className={`py-3.5 px-4 text-right font-mono font-semibold text-sm ${t.pnl_realized >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {t.pnl_realized >= 0 ? "+" : ""}{fmtUsd(t.pnl_realized)}
                      </td>
                      <td className={`py-3.5 px-4 text-right font-mono font-semibold text-sm ${t.roi >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {t.roi >= 0 ? "+" : ""}{(t.roi * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── All Traded Tokens ── */}
        {topTokens.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-white">All Traded Tokens</h2>
              <span className="text-xs font-mono text-gray-500 bg-gray-800 px-2.5 py-1 rounded-full border border-white/5">{topTokens.length}</span>
            </div>
            <div className="glass-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-gray-500 text-[11px] uppercase tracking-wider">
                    <th className="text-left py-3.5 px-5 font-medium">Token</th>
                    <th className="text-right py-3.5 px-3 font-medium">Bought</th>
                    <th className="text-right py-3.5 px-3 font-medium">Sold</th>
                    <th className="text-right py-3.5 px-3 font-medium">Holding</th>
                    <th className="text-right py-3.5 px-3 font-medium">Realized PnL</th>
                    <th className="text-right py-3.5 px-3 font-medium">ROI</th>
                    <th className="text-right py-3.5 px-3 font-medium">Buys</th>
                    <th className="text-right py-3.5 px-5 font-medium">Sells</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {topTokens.map((t: WalletTopToken) => (
                    <tr key={t.address} className="table-row-stripe transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-sm">{t.symbol}</span>
                          <span className="text-[10px] text-gray-600 font-mono">{truncAddr(t.address)}</span>
                          <a href={`https://dexscreener.com/solana/${t.address}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-gray-600 hover:text-emerald-400 transition-colors">Dex ↗</a>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-gray-400 text-xs">{fmtUsd(t.bought_usd)}</td>
                      <td className="py-3.5 px-3 text-right font-mono text-gray-400 text-xs">{fmtUsd(t.sold_usd)}</td>
                      <td className="py-3.5 px-3 text-right font-mono text-gray-400 text-xs">{t.holding_usd > 0 ? fmtUsd(t.holding_usd) : "—"}</td>
                      <td className={`py-3.5 px-3 text-right font-mono font-semibold text-sm ${t.pnl_realized !== 0 ? (t.pnl_realized >= 0 ? "text-emerald-400" : "text-red-400") : "text-gray-600"}`}>
                        {t.pnl_realized !== 0 ? `${t.pnl_realized >= 0 ? "+" : ""}${fmtUsd(t.pnl_realized)}` : "—"}
                      </td>
                      <td className={`py-3.5 px-3 text-right font-mono font-semibold text-sm ${t.roi !== 0 ? (t.roi >= 0 ? "text-emerald-400" : "text-red-400") : "text-gray-600"}`}>
                        {t.roi !== 0 ? `${t.roi >= 0 ? "+" : ""}${(t.roi * 100).toFixed(1)}%` : "—"}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-gray-400 text-xs">{t.buys}</td>
                      <td className="py-3.5 px-5 text-right font-mono text-gray-400 text-xs">{t.sells}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}