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
    solana: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    ethereum: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    base: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider border ${
        styles[chain] ?? "bg-gray-500/15 text-gray-400 border-gray-500/30"
      }`}
    >
      {chain}
    </span>
  );
}

function sideBadge(side: "buy" | "sell") {
  return side === "buy" ? (
    <span className="inline-flex items-center rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-medium uppercase">
      Buy
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-red-500/15 text-red-400 border border-red-500/30 px-2.5 py-0.5 text-xs font-medium uppercase">
      Sell
    </span>
  );
}

function statusBadge(status: "open" | "closed" | "stopped") {
  const styles: Record<string, string> = {
    open: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    closed: "bg-gray-500/15 text-gray-400 border-gray-500/30",
    stopped: "bg-red-500/15 text-red-400 border-red-500/30",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize border ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function triggerBadge(trigger: "discovery" | "manual" | "scout") {
  const styles: Record<string, string> = {
    discovery: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    manual: "bg-gray-500/15 text-gray-400 border-gray-500/30",
    scout: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize border ${styles[trigger]}`}
    >
      {trigger}
    </span>
  );
}

function formatUsd(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPrice(price: number): string {
  if (price < 0.001) {
    return `$${price.toFixed(7)}`;
  }
  if (price < 1) {
    return `$${price.toFixed(4)}`;
  }
  return `$${price.toFixed(2)}`;
}

function formatPnl(pnl: number | null | undefined): string {
  if (pnl == null || isNaN(pnl)) return "—";
  const prefix = pnl >= 0 ? "+" : "";
  return `${prefix}${formatUsd(pnl)}`;
}

function formatPnlPercent(pct: number): string {
  const prefix = pct >= 0 ? "+" : "";
  return `${prefix}${pct.toFixed(1)}%`;
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

  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function TradesPage() {
  const data = readJson<TradesData>("trades.json");
  const { stats, trades } = data;

  const sortedTrades = [...trades].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Trades</h1>
        <p className="mt-1 text-sm text-gray-500">
          Execution history and performance metrics
        </p>
      </div>

      {/* Section 1: Trade Stats Summary */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          label="Total Trades"
          value={stats.total_trades}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
          }
        />
        <StatCard
          label="Win Rate"
          value={`${(stats.win_rate * 100).toFixed(0)}%`}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.04 6.04 0 01-2.27.895m0 0a6.04 6.04 0 01-2.27-.895" />
            </svg>
          }
        />
        <StatCard
          label="Total PnL"
          value={stats.total_pnl_formatted}
          icon={
            <span className={stats.total_pnl >= 0 ? "text-emerald-400" : "text-red-400"}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
            </span>
          }
        />
        <StatCard
          label="Best Trade"
          value={stats.best_trade_pnl != null && !isNaN(stats.best_trade_pnl) ? `+${formatUsd(stats.best_trade_pnl)}` : "—"}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
          }
        />
      </section>

      {/* Section 2: Trades Table */}
      <section className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Trade History</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3 font-medium">Token</th>
                <th className="px-4 py-3 font-medium">Side</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Entry</th>
                <th className="px-4 py-3 font-medium">Exit</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">PnL</th>
                <th className="px-4 py-3 font-medium">PnL %</th>
                <th className="px-4 py-3 font-medium">Trigger</th>
                <th className="px-4 py-3 font-medium">Tx</th>
                <th className="px-4 py-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {sortedTrades.map((trade, i) => (
                <tr
                  key={trade.id}
                  className={`border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors ${
                    i % 2 === 0 ? "bg-gray-900" : "bg-gray-900/50"
                  }`}
                >
                  {/* Token */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{trade.token}</span>
                      {chainBadge(trade.chain)}
                    </div>
                  </td>

                  {/* Side */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {sideBadge(trade.side)}
                  </td>

                  {/* Amount */}
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-gray-300">
                    {formatUsd(trade.amount_usd)}
                  </td>

                  {/* Entry Price */}
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-gray-300">
                    {formatPrice(trade.entry_price)}
                  </td>

                  {/* Exit Price */}
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-gray-300">
                    {trade.exit_price !== null
                      ? formatPrice(trade.exit_price)
                      : <span className="text-gray-600">&mdash;</span>
                    }
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {statusBadge(trade.status)}
                  </td>

                  {/* PnL */}
                  <td className="px-4 py-3 whitespace-nowrap font-mono">
                    {trade.pnl !== null ? (
                      <span className={trade.pnl >= 0 ? "text-emerald-400" : "text-red-400"}>
                        {formatPnl(trade.pnl)}
                      </span>
                    ) : (
                      <span className="text-gray-600">&mdash;</span>
                    )}
                  </td>

                  {/* PnL % */}
                  <td className="px-4 py-3 whitespace-nowrap font-mono">
                    {trade.pnl_percent !== null ? (
                      <span className={trade.pnl_percent >= 0 ? "text-emerald-400" : "text-red-400"}>
                        {formatPnlPercent(trade.pnl_percent)}
                      </span>
                    ) : (
                      <span className="text-gray-600">&mdash;</span>
                    )}
                  </td>

                  {/* Trigger */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {triggerBadge(trade.trigger)}
                  </td>

                  {/* Tx Hash */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <a
                      href="#"
                      className="font-mono text-xs text-amber-400/70 hover:text-amber-400 transition-colors"
                    >
                      {truncateHash(trade.tx_hash)}
                    </a>
                  </td>

                  {/* Time */}
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-xs">
                    {relativeTime(trade.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
