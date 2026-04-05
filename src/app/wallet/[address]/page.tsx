"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import GradeBadge from "@/components/GradeBadge";
import CopyButton from "@/components/CopyButton";
import { type WalletDetail, type WalletTopToken } from "@/lib/api";
import { fmtUsd, fmtPct, truncAddr, nansenWallet, nansenToken } from "@/lib/utils";

export default function WalletPage() {
  const params = useParams();
  const address = params.address as string;
  const [wallet, setWallet] = useState<WalletDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <div className="max-w-5xl mx-auto px-6 py-16 text-center text-gray-400">
        Loading wallet...
      </div>
    );
  }

  if (error || !wallet) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16 text-center">
        <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
          <p className="text-red-400 text-lg mb-2">Wallet not found</p>
          <p className="text-gray-500 text-sm">{error || "No data for this wallet"}</p>
          <Link href="/discovery" className="inline-block mt-4 text-emerald-400 hover:text-emerald-300">
            Back to Discovery
          </Link>
        </div>
      </div>
    );
  }

  const topTokens = wallet.top_tokens || [];
  const holdings = topTokens.filter((t: WalletTopToken) => t.holding_usd > 0);
  const closedTrades = topTokens.filter((t: WalletTopToken) => t.sold_usd > 0);
  const totalHolding = holdings.reduce((s: number, t: WalletTopToken) => s + t.holding_usd, 0);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <GradeBadge grade={wallet.grade as "S" | "A" | "B" | "C" | "D"} size="lg" />
              <span className="text-2xl font-bold text-white">{wallet.score}</span>
              <span className="text-gray-500 text-sm">/ 100</span>
            </div>
            <p className="text-gray-400 font-mono text-sm mb-1 break-all">{wallet.address}</p>
            {wallet.label && <p className="text-emerald-400 text-sm">{wallet.label}</p>}
          </div>
          <div className="flex gap-2">
            <a
              href={`https://dexscreener.com/solana/${wallet.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
            >
              DexScreener
            </a>
            <a
              href={nansenWallet(wallet.address, wallet.chain || "solana")}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
            >
              Nansen
            </a>
            <CopyButton text={wallet.address} />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Win Rate", value: fmtPct(wallet.win_rate) },
            { label: "Realized PnL", value: fmtUsd(wallet.total_pnl_realized) },
            { label: "Unrealized PnL", value: fmtUsd(wallet.total_pnl_unrealized) },
            { label: "Total Trades", value: String(wallet.total_trades) },
            { label: "Tokens Traded", value: String(wallet.token_count) },
            { label: "Wins", value: String(wallet.wins) },
            { label: "Losses", value: String(wallet.losses) },
            { label: "Volume Bought", value: fmtUsd(wallet.total_bought_usd) },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <p className="text-gray-500 text-xs mb-1">{stat.label}</p>
              <p className={`text-lg font-bold ${stat.label.includes("PnL") && Number(stat.value.replace(/[^0-9.-]/g, "")) < 0 ? "text-red-400" : "text-white"}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Holdings */}
        {holdings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">
              Current Holdings ({holdings.length}) — {fmtUsd(totalHolding)} total
            </h2>
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 text-xs">
                    <th className="text-left py-3 px-4">Token</th>
                    <th className="text-right py-3 px-4">Holding Value</th>
                    <th className="text-right py-3 px-4">Unrealized PnL</th>
                    <th className="text-right py-3 px-4">ROI</th>
                    <th className="text-right py-3 px-4">Nansen</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((t: WalletTopToken) => (
                    <tr key={t.address} className="border-b border-gray-800/50 hover:bg-gray-800/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <span className="font-medium text-white">{t.symbol}</span>
                            <p className="text-gray-500 text-xs font-mono">{truncAddr(t.address)}</p>
                          </div>
                          <a href={`https://dexscreener.com/solana/${t.address}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-gray-600 hover:text-emerald-400">Dex ↗</a>
                          <CopyButton text={t.address} />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-white">{fmtUsd(t.holding_usd)}</td>
                      <td className={`py-3 px-4 text-right ${t.pnl_unrealized >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {fmtUsd(t.pnl_unrealized)}
                      </td>
                      <td className={`py-3 px-4 text-right ${t.roi >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {t.roi >= 0 ? "+" : ""}{(t.roi * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 text-right">
                        <a href={nansenToken(t.address, wallet.chain || "solana")} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 text-xs">
                          Chart
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Sells */}
        {closedTrades.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">
              Recent Sells ({closedTrades.length})
            </h2>
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 text-xs">
                    <th className="text-left py-3 px-4">Token</th>
                    <th className="text-right py-3 px-4">Bought</th>
                    <th className="text-right py-3 px-4">Sold</th>
                    <th className="text-right py-3 px-4">Realized PnL</th>
                    <th className="text-right py-3 px-4">ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {closedTrades.map((t: WalletTopToken) => (
                    <tr key={t.address} className="border-b border-gray-800/50 hover:bg-gray-800/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <span className="font-medium text-white">{t.symbol}</span>
                            <p className="text-gray-500 text-xs font-mono">{truncAddr(t.address)}</p>
                          </div>
                          <a href={`https://dexscreener.com/solana/${t.address}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-gray-600 hover:text-emerald-400">Dex ↗</a>
                          <CopyButton text={t.address} />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-300">{fmtUsd(t.bought_usd)}</td>
                      <td className="py-3 px-4 text-right text-gray-300">{fmtUsd(t.sold_usd)}</td>
                      <td className={`py-3 px-4 text-right ${t.pnl_realized >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {t.pnl_realized >= 0 ? "+" : ""}{fmtUsd(t.pnl_realized)}
                      </td>
                      <td className={`py-3 px-4 text-right ${t.roi >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {t.roi >= 0 ? "+" : ""}{(t.roi * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* All Tokens */}
        {topTokens.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">
              All Traded Tokens ({topTokens.length})
            </h2>
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 text-xs">
                    <th className="text-left py-3 px-4">Token</th>
                    <th className="text-right py-3 px-4">Bought</th>
                    <th className="text-right py-3 px-4">Sold</th>
                    <th className="text-right py-3 px-4">Holding</th>
                    <th className="text-right py-3 px-4">Realized PnL</th>
                    <th className="text-right py-3 px-4">ROI</th>
                    <th className="text-right py-3 px-4">Buys</th>
                    <th className="text-right py-3 px-4">Sells</th>
                  </tr>
                </thead>
                <tbody>
                  {topTokens.map((t: WalletTopToken) => (
                    <tr key={t.address} className="border-b border-gray-800/50 hover:bg-gray-800/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <span className="font-medium text-white">{t.symbol}</span>
                            <p className="text-gray-500 text-xs font-mono">{truncAddr(t.address)}</p>
                          </div>
                          <a href={`https://dexscreener.com/solana/${t.address}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-gray-600 hover:text-emerald-400">Dex ↗</a>
                          <CopyButton text={t.address} />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-300">{fmtUsd(t.bought_usd)}</td>
                      <td className="py-3 px-4 text-right text-gray-300">{fmtUsd(t.sold_usd)}</td>
                      <td className="py-3 px-4 text-right text-gray-300">{t.holding_usd > 0 ? fmtUsd(t.holding_usd) : "—"}</td>
                      <td className={`py-3 px-4 text-right ${t.pnl_realized >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {t.pnl_realized !== 0 ? `${t.pnl_realized >= 0 ? "+" : ""}${fmtUsd(t.pnl_realized)}` : "—"}
                      </td>
                      <td className={`py-3 px-4 text-right ${t.roi >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {t.roi !== 0 ? `${t.roi >= 0 ? "+" : ""}${(t.roi * 100).toFixed(1)}%` : "—"}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-300">{t.buys}</td>
                      <td className="py-3 px-4 text-right text-gray-300">{t.sells}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  );
}
