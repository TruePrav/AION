import fs from "fs";
import path from "path";
import StatCard from "@/components/StatCard";

interface Trade {
  id: string;
  token: string;
  chain: string;
  side: "buy" | "sell";
  amount_usd: number;
  entry_price: number;
  exit_price: number | null;
  status: "open" | "closed" | "stopped";
  pnl: number | null;
  pnl_percent: number | null;
  tx_hash: string;
  timestamp: string;
  trigger: "discovery" | "manual" | "scout";
}

interface TradesData {
  stats: {
    total_trades: number;
    win_rate: number;
    total_pnl: number;
    total_pnl_formatted: string;
    best_trade_pnl: number;
    worst_trade_pnl: number;
  };
  trades: Trade[];
}

function readJson<T>(filename: string): T {
  const filePath = path.join(process.cwd(), "public", "data", filename);
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

function chainBadge(chain: string) {
  const styles: Record<string, string> = {
    solana: "bg-purple-500/10 text-purple-300 border-purple-500/20",
    ethereum: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    base: "bg-sky-500/10 text-sky-300 border-sky-500/20",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
        styles[chain] ?? "bg-gray-500/10 text-gray-400 border-gray-500/20"
      }`}
    >
      {chain}
    </span>
  );
}

function sideBadge(side: "buy" | "sell") {
  return side === "buy" ? (
    <span className="inline-flex items-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-bold uppercase">
      Buy
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-0.5 text-xs font-bold uppercase">
      Sell
    </span>
  );
}

function statusBadge(status: "open" | "closed" | "stopped") {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    open: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
    closed: { bg: "bg-gray-500/10", text: "text-gray-400", border: "border-gray-500/20" },
    stopped: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
  };
  const s = styles[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase border ${s.bg} ${s.text} ${s.border}`}>
      {status}
    </span>
  );
}

function triggerBadge(trigger: "discovery" | "manual" | "scout") {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    discovery: { bg: "bg-purple-500/10", text: "text-purple-300", border: "border-purple-500/20" },
    manual: { bg: "bg-gray-500/10", text: "text-gray-400", border: "border-gray-500/20" },
    scout: { bg: "bg-blue-500/10", text: "text-blue-300", border: "border-blue-500/20" },
  };
  const s = styles[trigger];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold capitalize border ${s.bg} ${s.text} ${s.border}`}>
      {trigger}
    </span>
  );
}

function formatUsd(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value);
}

function formatPrice(price: number): string {
  if (price < 0.001) return `$${price.toFixed(7)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(2)}`;
}

function truncateHash(hash: string): string {
  if (hash.length <= 12) return hash;
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

function relativeTime(iso: string): string {
  const now = new Date();
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function TradesPage() {
  const data = readJson<TradesData>("trades.json");
  const { stats, trades } = data;
  const sortedTrades = [...trades].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="gradient-mesh min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">

        {/* ── Page Header ── */}
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-gray-900/80 to-gray-900/40 p-8 backdrop-blur-sm">
          <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 pulse-dot" style={{animationDelay: "0.5s"}} />
              <span className="text-xs font-medium text-blue-400/70 uppercase tracking-wider">Execution History</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Trades</h1>
            <p className="text-sm text-gray-500 mt-1">Performance metrics and trade history</p>
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="Total Trades"
            value={stats.total_trades}
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
            }
          />
          <StatCard
            label="Win Rate"
            value={`${(stats.win_rate * 100).toFixed(0)}%`}
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label="Total PnL"
            value={stats.total_pnl_formatted}
            accent={stats.total_pnl >= 0}
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
            }
          />
          <StatCard
            label="Best Trade"
            value={stats.best_trade_pnl != null && !isNaN(stats.best_trade_pnl) ? `+${formatUsd(stats.best_trade_pnl)}` : "—"}
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
            }
          />
        </div>

        {/* ── Trades Table ── */}
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-500 pulse-dot" style={{animationDelay: "0.7s"}} />
            <h2 className="text-base font-bold text-white">Trade History</h2>
            <span className="text-xs font-mono text-gray-500 bg-gray-800 px-2.5 py-1 rounded-full border border-white/5 ml-auto">{sortedTrades.length} trades</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 text-[11px] uppercase tracking-wider">
                  <th className="text-left px-4 py-3.5 font-medium">Token</th>
                  <th className="text-center px-3 py-3.5 font-medium">Side</th>
                  <th className="text-right px-3 py-3.5 font-medium">Amount</th>
                  <th className="text-right px-3 py-3.5 font-medium">Entry</th>
                  <th className="text-right px-3 py-3.5 font-medium">Exit</th>
                  <th className="text-center px-3 py-3.5 font-medium">Status</th>
                  <th className="text-right px-3 py-3.5 font-medium">PnL</th>
                  <th className="text-right px-3 py-3.5 font-medium">PnL %</th>
                  <th className="text-center px-3 py-3.5 font-medium">Trigger</th>
                  <th className="text-right px-4 py-3.5 font-medium">Tx Hash</th>
                  <th className="text-right px-4 py-3.5 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {sortedTrades.map((trade, i) => (
                  <tr key={trade.id} className="table-row-stripe transition-colors">
                    {/* Token */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{trade.token}</span>
                        {chainBadge(trade.chain)}
                      </div>
                    </td>
                    {/* Side */}
                    <td className="px-3 py-3.5 text-center whitespace-nowrap">{sideBadge(trade.side)}</td>
                    {/* Amount */}
                    <td className="px-3 py-3.5 text-right whitespace-nowrap font-mono text-gray-300 text-xs">{formatUsd(trade.amount_usd)}</td>
                    {/* Entry */}
                    <td className="px-3 py-3.5 text-right whitespace-nowrap font-mono text-gray-400 text-xs">{formatPrice(trade.entry_price)}</td>
                    {/* Exit */}
                    <td className="px-3 py-3.5 text-right whitespace-nowrap font-mono text-gray-400 text-xs">
                      {trade.exit_price !== null ? formatPrice(trade.exit_price) : <span className="text-gray-700">—</span>}
                    </td>
                    {/* Status */}
                    <td className="px-3 py-3.5 text-center whitespace-nowrap">{statusBadge(trade.status)}</td>
                    {/* PnL */}
                    <td className="px-3 py-3.5 text-right whitespace-nowrap font-mono text-sm">
                      {trade.pnl !== null ? (
                        <span className={trade.pnl >= 0 ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
                          {trade.pnl >= 0 ? "+" : ""}{formatUsd(trade.pnl)}
                        </span>
                      ) : <span className="text-gray-700">—</span>}
                    </td>
                    {/* PnL % */}
                    <td className="px-3 py-3.5 text-right whitespace-nowrap font-mono text-sm">
                      {trade.pnl_percent !== null ? (
                        <span className={trade.pnl_percent >= 0 ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
                          {trade.pnl_percent >= 0 ? "+" : ""}{trade.pnl_percent.toFixed(1)}%
                        </span>
                      ) : <span className="text-gray-700">—</span>}
                    </td>
                    {/* Trigger */}
                    <td className="px-3 py-3.5 text-center whitespace-nowrap">{triggerBadge(trade.trigger)}</td>
                    {/* Tx */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <a
                        href={`https://solscan.io/tx/${trade.tx_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-amber-400/60 hover:text-amber-400 transition-colors"
                      >
                        {truncateHash(trade.tx_hash)}
                      </a>
                    </td>
                    {/* Time */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap text-gray-500 text-xs">{relativeTime(trade.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}