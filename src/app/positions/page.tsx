"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { fmtUsd, truncAddr } from "@/lib/utils";
import StatCard from "@/components/StatCard";

interface OpenPosition {
  id: string;
  token: string;
  chain: string;
  side: string;
  entry_price: number;
  size_usdc: number;
  current_price?: number;
  pnl_usd?: number;
  pnl_pct?: number;
  timestamp: string;
  trailing_stop_triggered?: boolean;
  stop_reason?: string;
  tx_hash?: string;
  status: string;
}

interface PositionsResponse {
  positions: OpenPosition[];
  count: number;
}

function SolscanLink({ hash, label }: { hash: string; label: string }) {
  if (!hash) return null;
  return (
    <a href={`https://solscan.io/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="text-emerald-400/70 hover:text-emerald-400 text-xs transition-colors flex items-center gap-0.5">
      {label}
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
      </svg>
    </a>
  );
}

export default function PositionsPage() {
  const [positions, setPositions] = useState<OpenPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadPositions();
    const interval = setInterval(loadPositions, 15000);
    return () => clearInterval(interval);
  }, []);

  async function loadPositions() {
    try {
      const data = await apiFetch<PositionsResponse>("/api/positions");
      setPositions(data.positions || []);
      setLastUpdate(new Date());
    } catch {
      const res = await fetch("http://178.128.253.120:5001/api/positions");
      const data = await res.json();
      setPositions(data.positions || []);
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  }

  async function closePosition(token: string, reason: string) {
    if (!confirm(`Close position for ${token.slice(0, 12)}...?\nReason: ${reason}`)) return;
    setClosing(token);
    try {
      const res = await fetch("http://178.128.253.120:5001/api/positions/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: token, reason }),
      });
      const result = await res.json();
      if (result.success) {
        setPositions((prev) => prev.filter((p) => p.token !== token));
      } else {
        alert(`Close failed: ${result.error}`);
      }
    } catch (e) {
      alert(`Error: ${e}`);
    } finally {
      setClosing(null);
    }
  }

  const totalPnl = positions.reduce((s, p) => s + (p.pnl_usd || 0), 0);
  const totalValue = positions.reduce((s, p) => s + (p.size_usdc || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-400">
        <div className="h-10 w-10 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mb-4" />
        <p className="text-sm text-gray-500">Loading positions...</p>
      </div>
    );
  }

  return (
    <div className="gradient-mesh min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

        {/* ── Header ── */}
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-gray-900/80 to-gray-900/40 p-8 backdrop-blur-sm">
          <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="relative flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
                <span className="text-xs font-medium text-emerald-400/70 uppercase tracking-wider">Live Tracking</span>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight">Positions</h1>
              <p className="text-sm text-gray-500 mt-1">Auto-refreshes every 15s &bull; Updated {lastUpdate.toLocaleTimeString()}</p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
              <span className="text-xs text-gray-400 font-medium">Live</span>
            </div>
          </div>
        </div>

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard label="Open Positions" value={String(positions.length)} icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          } />
          <StatCard label="Total Invested" value={fmtUsd(totalValue)} icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
          } />
          <StatCard label="Unrealized P&L" value={totalPnl >= 0 ? `+${fmtUsd(totalPnl)}` : fmtUsd(totalPnl)} accent={totalPnl >= 0} icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
          } />
        </div>

        {/* ── Empty State ── */}
        {positions.length === 0 ? (
          <div className="glass-card p-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-800/50 border border-white/5">
              <svg className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-300 mb-1">No open positions</h3>
            <p className="text-sm text-gray-600 mb-2">Discovery signals will appear here when Oracle finds convergence.</p>
            <p className="text-xs text-gray-600">Run <span className="text-emerald-400/60">/discover</span> on Telegram to start.</p>
          </div>
        ) : (
          /* ── Positions List ── */
          <div className="space-y-4">
            {positions.map((pos) => {
              const pnlPct = pos.pnl_pct ?? null;
              const pnlUsd = pos.pnl_usd ?? null;
              const hasPnl = pnlPct !== null && !isNaN(pnlPct);
              const isProfit = hasPnl && pnlPct >= 0;
              return (
                <div
                  key={pos.id}
                  className={`glass-card p-6 transition-all duration-200 ${
                    pos.trailing_stop_triggered
                      ? "border-red-500/25 bg-red-500/3 shadow-[0_0_20px_rgba(239,68,68,0.06)]"
                      : ""
                  }`}
                >
                  {pos.trailing_stop_triggered && (
                    <div className="flex items-center gap-2 mb-5 text-red-400 text-xs font-semibold rounded-lg bg-red-500/10 border border-red-500/15 px-3 py-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse flex-shrink-0" />
                      Trailing stop triggered &mdash; {pos.stop_reason}
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    {/* Token Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-bold text-white text-lg">{pos.token.slice(0, 14)}...</span>
                        <span className="font-mono text-[10px] text-gray-600 bg-gray-800/60 rounded-lg px-2 py-0.5">{truncAddr(pos.token)}</span>
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${
                          pos.side === "buy"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}>
                          {pos.side.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                        <span>Entry: <span className="text-white font-mono">${pos.entry_price?.toFixed(6) || "—"}</span></span>
                        <span>Size: <span className="text-white font-mono">{fmtUsd(pos.size_usdc)}</span></span>
                        {pos.tx_hash && <SolscanLink hash={pos.tx_hash} label="Entry Tx" />}
                        <span className="text-gray-700">·</span>
                        <span>{new Date(pos.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </div>

                    {/* P&L */}
                    <div className="text-right flex-shrink-0">
                      <div className={`text-2xl font-black font-mono tracking-tight ${hasPnl ? (isProfit ? "text-emerald-400" : "text-red-400") : "text-gray-500"}`}>
                        {hasPnl ? `${isProfit ? "+" : ""}${pnlPct.toFixed(2)}%` : "—"}
                      </div>
                      <div className={`text-sm font-mono mt-0.5 ${hasPnl ? (isProfit ? "text-emerald-400/60" : "text-red-400/60") : "text-gray-600"}`}>
                        {hasPnl ? `${isProfit ? "+" : ""}${fmtUsd(pnlUsd)}` : "—"}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => closePosition(pos.token, "manual")}
                        disabled={closing === pos.token}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-gray-300 hover:text-white transition-all disabled:opacity-30 text-center"
                      >
                        {closing === pos.token ? "Closing..." : "Close Position"}
                      </button>
                      {pos.trailing_stop_triggered && (
                        <button
                          onClick={() => closePosition(pos.token, pos.stop_reason || "trailing_stop")}
                          className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm transition-all text-center font-semibold"
                        >
                          Exit Now (Stop Hit)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}