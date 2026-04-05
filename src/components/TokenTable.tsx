"use client";

import { Fragment, useState } from "react";
import GradeBadge from "./GradeBadge";
import RiskBadge from "./RiskBadge";

interface Wallet {
  address: string;
  grade: "S" | "A" | "B" | "C" | "D";
  score: number;
  position_size: number;
  entry_price: number;
  pnl_percent: number;
}

interface Signals {
  wallet_convergence: boolean;
  volume_anomaly: boolean;
  holder_growth: boolean;
  whale_accumulation: boolean;
  smart_money_consensus: boolean;
}

interface Token {
  symbol: string;
  name: string;
  chain: string;
  contract: string;
  mcap: number;
  mcap_formatted: string;
  price: number;
  price_change_24h: number;
  sm_inflow_7d: number;
  sm_inflow_7d_formatted: string;
  sm_traders: number;
  accumulation_grade: "S" | "A" | "B" | "C" | "D";
  accumulation_score: number;
  risk_score: number;
  risk_tier: "low" | "medium" | "high";
  signals: Signals;
  top_wallets: Wallet[];
}

const CHAIN_BADGE: Record<string, { bg: string; text: string }> = {
  solana: { bg: "bg-purple-500/20", text: "text-purple-400" },
  ethereum: { bg: "bg-blue-500/20", text: "text-blue-400" },
  base: { bg: "bg-cyan-500/20", text: "text-cyan-400" },
};

const SIGNAL_LABELS: Record<keyof Signals, string> = {
  wallet_convergence: "Wallet Convergence",
  volume_anomaly: "Volume Anomaly",
  holder_growth: "Holder Growth",
  whale_accumulation: "Whale Accumulation",
  smart_money_consensus: "SM Consensus",
};

function truncateAddress(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatUsd(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export default function TokenTable({ tokens }: { tokens: Token[] }) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800 bg-gray-900/60 text-left text-xs uppercase tracking-wider text-gray-400">
            <th className="px-4 py-3">Symbol</th>
            <th className="px-4 py-3">Chain</th>
            <th className="px-4 py-3 text-right">MCap</th>
            <th className="px-4 py-3 text-right">7d SM Inflow</th>
            <th className="px-4 py-3 text-right">SM Traders</th>
            <th className="px-4 py-3 text-center">Grade</th>
            <th className="px-4 py-3 text-center">Risk</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/60">
          {tokens.map((token) => {
            const isExpanded = expandedRow === token.symbol;
            const chain = CHAIN_BADGE[token.chain] ?? {
              bg: "bg-gray-500/20",
              text: "text-gray-400",
            };
            const inflowPositive = token.sm_inflow_7d >= 0;

            return (
              <Fragment key={token.symbol}>
                <tr
                  className="cursor-pointer transition-colors hover:bg-gray-800/40"
                  onClick={() =>
                    setExpandedRow(isExpanded ? null : token.symbol)
                  }
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs transition-transform ${isExpanded ? "rotate-90" : ""}`}
                      >
                        &#9654;
                      </span>
                      <span className="font-semibold text-white">
                        {token.symbol}
                      </span>
                      <span className="text-xs text-gray-500">
                        {token.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${chain.bg} ${chain.text}`}
                    >
                      {token.chain}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-gray-300">
                    {token.mcap_formatted}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-mono ${inflowPositive ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {inflowPositive ? "+" : ""}
                    {token.sm_inflow_7d_formatted}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-gray-300">
                    {token.sm_traders}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <GradeBadge grade={token.accumulation_grade} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <RiskBadge
                      tier={token.risk_tier}
                      score={token.risk_score}
                    />
                  </td>
                </tr>

                {isExpanded && (
                  <tr className="bg-gray-900/80">
                    <td colSpan={7} className="px-6 py-4">
                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Signals */}
                        <div>
                          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Accumulation Signals
                          </h4>
                          <div className="space-y-1.5">
                            {(
                              Object.entries(token.signals) as [
                                keyof Signals,
                                boolean,
                              ][]
                            ).map(([key, val]) => (
                              <div
                                key={key}
                                className="flex items-center gap-2 text-sm"
                              >
                                <span
                                  className={
                                    val ? "text-emerald-400" : "text-red-400"
                                  }
                                >
                                  {val ? "\u2713" : "\u2717"}
                                </span>
                                <span className="text-gray-300">
                                  {SIGNAL_LABELS[key]}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Top Wallets */}
                        <div>
                          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Top Wallets
                          </h4>
                          <div className="overflow-x-auto rounded border border-gray-800">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b border-gray-800 text-left text-gray-500">
                                  <th className="px-3 py-2">Address</th>
                                  <th className="px-3 py-2 text-center">
                                    Grade
                                  </th>
                                  <th className="px-3 py-2 text-right">
                                    Position
                                  </th>
                                  <th className="px-3 py-2 text-right">PnL</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-800/60">
                                {token.top_wallets.map((w) => (
                                  <tr key={w.address}>
                                    <td className="px-3 py-2 font-mono text-gray-300">
                                      {truncateAddress(w.address)}
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                      <GradeBadge grade={w.grade} size="sm" />
                                    </td>
                                    <td className="px-3 py-2 text-right font-mono text-gray-300">
                                      {formatUsd(w.position_size)}
                                    </td>
                                    <td
                                      className={`px-3 py-2 text-right font-mono ${w.pnl_percent >= 0 ? "text-emerald-400" : "text-red-400"}`}
                                    >
                                      {w.pnl_percent >= 0 ? "+" : ""}
                                      {w.pnl_percent.toFixed(1)}%
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
