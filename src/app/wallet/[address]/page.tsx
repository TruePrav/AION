"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import GradeBadge from "@/components/GradeBadge";
import CopyButton from "@/components/CopyButton";
import StatCard from "@/components/StatCard";
import {
  type WalletDetail,
  type WalletTopToken,
  copyTrade,
  type CopyTradeResult,
  apiUrl,
  READONLY_MODE,
} from "@/lib/api";
import { fmtUsd, fmtPct, truncAddr, nansenWallet, nansenToken, cn } from "@/lib/utils";
import {
  ArrowLeft,
  Trophy,
  TrendingUp,
  BarChart3,
  Coins,
  Check,
  X,
  ShoppingCart,
  Lock,
  ExternalLink,
  Zap,
} from "lucide-react";

type Grade = "S" | "A" | "B" | "C" | "D";

/**
 * Build a DexScreener token chart URL filtered to a specific maker
 * (wallet). DexScreener supports `?maker=<addr>` which paints buy/sell
 * markers from that wallet directly on the chart — exactly what users
 * want when looking at a wallet's traded tokens.
 */
function dexFor(tokenAddress: string, walletAddress: string, chain?: string): string {
  const c = (chain || "solana").toLowerCase();
  const slug = c === "eth" ? "ethereum" : c === "bnb" || c === "binance" ? "bsc" : c;
  return `https://dexscreener.com/${slug}/${tokenAddress}?maker=${walletAddress}`;
}

/** Block explorer URL for the wallet address itself (chain-aware). */
function explorerFor(walletAddress: string, chain?: string): string {
  const c = (chain || "solana").toLowerCase();
  if (c === "base") return `https://basescan.org/address/${walletAddress}`;
  if (c === "ethereum" || c === "eth") return `https://etherscan.io/address/${walletAddress}`;
  if (c === "bsc" || c === "bnb") return `https://bscscan.com/address/${walletAddress}`;
  if (c === "arbitrum") return `https://arbiscan.io/address/${walletAddress}`;
  if (c === "polygon") return `https://polygonscan.com/address/${walletAddress}`;
  return `https://solscan.io/account/${walletAddress}`;
}

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
    fetch(apiUrl(`/api/wallet/${address}`))
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
      <div className="glass-bg min-h-screen flex flex-col items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-foreground/20 border-t-primary animate-spin mb-4" />
        <p className="text-sm text-foreground/60">Loading wallet...</p>
      </div>
    );
  }

  if (error || !wallet) {
    return (
      <div className="glass-bg min-h-screen flex flex-col items-center justify-center px-6">
        <p className="text-xl font-semibold text-foreground mb-2">Wallet not found</p>
        <p className="text-sm text-foreground/60 mb-4">{error || "No data for this wallet"}</p>
        <Link
          href="/discovery"
          className="glass-btn text-xs"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to discovery
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
    <div className="glass-bg min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* ── Profile Header ── */}
        <div className="glass-card p-8">
          <div className="flex items-start justify-between flex-wrap gap-6 mb-6">
            <div className="flex items-center gap-5">
              <GradeBadge grade={wallet.grade as Grade} size="lg" />
              <div>
                <div className="text-5xl font-bold text-foreground tracking-tight tabular-nums leading-none">
                  {wallet.score}
                  <span className="text-2xl text-foreground/40 font-normal">/100</span>
                </div>
                <div className="text-[11px] font-semibold text-foreground/50 mt-2 uppercase tracking-wider">
                  Overall score
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <a
                href={explorerFor(wallet.address, wallet.chain)}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-btn text-xs"
                title="Open this wallet on the chain's block explorer"
              >
                Explorer <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href={nansenWallet(wallet.address, wallet.chain || "solana")}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-btn glass-btn-primary text-xs"
              >
                Nansen <ExternalLink className="h-3 w-3" />
              </a>
              <CopyButton text={wallet.address} />
            </div>
          </div>
          <div className="space-y-3">
            {wallet.label && (
              <p className="text-base font-semibold text-foreground inline-flex items-center rounded-full bg-accent/40 border border-accent/60 px-3 py-1">
                {wallet.label}
              </p>
            )}
            <p className="text-[11px] text-foreground/70 font-mono break-all rounded-lg bg-foreground/5 border border-foreground/10 px-3 py-2 inline-block">
              {wallet.address}
            </p>
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Win rate" value={fmtPct(wallet.win_rate)} icon={<Trophy className="h-3.5 w-3.5" />} tone="yellow" />
          <StatCard
            label="Realized PnL"
            value={
              wallet.total_pnl_realized >= 0
                ? `+${fmtUsd(wallet.total_pnl_realized)}`
                : fmtUsd(wallet.total_pnl_realized)
            }
            accent={wallet.total_pnl_realized >= 0}
            icon={<TrendingUp className="h-3.5 w-3.5" />}
            tone={wallet.total_pnl_realized >= 0 ? "lime" : "red"}
          />
          <StatCard
            label="Unrealized PnL"
            value={
              wallet.total_pnl_unrealized >= 0
                ? `+${fmtUsd(wallet.total_pnl_unrealized)}`
                : fmtUsd(wallet.total_pnl_unrealized)
            }
            icon={<BarChart3 className="h-3.5 w-3.5" />}
            tone="pink"
          />
          <StatCard label="Total trades" value={String(wallet.total_trades)} icon={<Zap className="h-3.5 w-3.5" />} tone="white" />
          <StatCard label="Tokens traded" value={String(wallet.token_count)} icon={<Coins className="h-3.5 w-3.5" />} tone="white" />
          <StatCard label="Wins" value={String(wallet.wins)} icon={<Check className="h-3.5 w-3.5" />} tone="lime" />
          <StatCard label="Losses" value={String(wallet.losses)} icon={<X className="h-3.5 w-3.5" />} tone="red" />
          <StatCard
            label="Volume bought"
            value={fmtUsd(wallet.total_bought_usd)}
            icon={<ShoppingCart className="h-3.5 w-3.5" />}
            tone="yellow"
          />
        </div>

        {/* ── Copy Trade (read-only mode) ── */}
        {READONLY_MODE && holdings.length > 0 && (
          <div className="glass-card p-5 flex items-start gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-accent/40 border border-accent/60 flex-shrink-0">
              <Lock className="h-4 w-4 text-foreground" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-foreground">Copy trade · Coming in Phase 2</h2>
              <p className="text-xs text-foreground/60 mt-1">
                Non-custodial copy trading via wallet connect + Jupiter.{" "}
                <Link href="/roadmap" className="underline underline-offset-2 decoration-foreground/40 hover:decoration-foreground font-medium">
                  See roadmap
                </Link>
              </p>
            </div>
          </div>
        )}

        {!READONLY_MODE && holdings.length > 0 && (
          <div className="glass-card p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5 pb-5 border-b border-foreground/10">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/20 border border-primary/40">
                <Zap className="h-4 w-4 text-foreground" fill="currentColor" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Copy trade terminal</h2>
                <p className="text-[11px] text-foreground/60">
                  Executes from AION VPS wallet via Nansen API
                </p>
              </div>
              {tradeLoading && (
                <div className="ml-auto">
                  <div className="h-4 w-4 rounded-full border-2 border-foreground/20 border-t-primary animate-spin" />
                </div>
              )}
            </div>

            {/* Token selector */}
            <div className="mb-5">
              <label className="text-[10px] text-foreground/50 font-semibold uppercase tracking-wider block mb-2.5">
                Select token to copy
              </label>
              <div className="flex flex-wrap gap-2">
                {holdings.map((t) => (
                  <button
                    key={t.address}
                    onClick={() => {
                      setSelectedToken(t);
                      setTradeResult(null);
                    }}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                      selectedToken?.address === t.address
                        ? "bg-primary/30 border border-primary/60 text-foreground"
                        : "bg-foreground/5 border border-foreground/10 text-foreground/70 hover:bg-foreground/10"
                    )}
                  >
                    <span className="font-semibold">{t.symbol}</span>
                    <span className="text-[10px] font-mono tabular-nums opacity-70">{fmtUsd(t.holding_usd)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount selector */}
            {selectedToken && (
              <>
                <div className="mb-5">
                  <label className="text-[10px] text-foreground/50 font-semibold uppercase tracking-wider block mb-2.5">
                    Amount (USDC)
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {[5, 10, 25, 50].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setTradeAmount(amt)}
                        className={cn(
                          "px-4 py-1.5 rounded-full text-xs font-semibold font-mono tabular-nums transition-all",
                          tradeAmount === amt
                            ? "bg-accent/50 border border-accent/70 text-foreground"
                            : "bg-foreground/5 border border-foreground/10 text-foreground/70 hover:bg-foreground/10"
                        )}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Result */}
                {tradeResult && (
                  <div
                    className={cn(
                      "rounded-2xl p-4 mb-5 border",
                      tradeResult.success
                        ? "bg-profit/15 border-profit/40"
                        : "bg-destructive/15 border-destructive/40"
                    )}
                  >
                    {tradeResult.success ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                          <Check className="h-3.5 w-3.5" />
                          Trade submitted
                        </div>
                        <div className="text-[11px] space-y-0.5 text-foreground/70">
                          {tradeResult.tx_hash && (
                            <div className="flex items-center gap-2">
                              <span>Tx</span>
                              <a
                                href={`https://solscan.io/tx/${tradeResult.tx_hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline underline-offset-2 font-mono font-semibold text-foreground"
                              >
                                {tradeResult.tx_hash.slice(0, 16)}...
                              </a>
                            </div>
                          )}
                          {tradeResult.dry_run && (
                            <div className="inline-block rounded-full bg-accent/40 border border-accent/60 px-2 py-0.5 text-[10px] font-semibold text-foreground">Mode: dry_run (no real funds)</div>
                          )}
                          <div className="flex items-center gap-2">
                            <span>Token</span>
                            <span className="font-semibold text-foreground">{selectedToken.symbol}</span>
                            <span>·</span>
                            <span className="font-semibold text-foreground">${tradeAmount} USDC</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                          <X className="h-3.5 w-3.5" />
                          Trade failed
                        </div>
                        <div className="text-[11px] text-foreground/70">{tradeResult.error}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Execute button */}
                <button
                  onClick={handleCopyTrade}
                  disabled={tradeLoading || !selectedToken}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm text-foreground bg-primary/90 border border-primary/70 shadow-[0_1px_0_0_hsl(0_0%_100%/0.5)_inset,0_6px_20px_-4px_hsl(var(--primary)/0.45),0_2px_6px_-2px_hsl(0_0%_0%/0.08)] hover:bg-primary hover:-translate-y-px hover:shadow-[0_1px_0_0_hsl(0_0%_100%/0.6)_inset,0_10px_24px_-4px_hsl(var(--primary)/0.5)] active:translate-y-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {tradeLoading ? (
                    <>
                      <span className="h-3 w-3 rounded-full border-2 border-foreground/30 border-t-foreground animate-spin" />
                      Executing via Nansen...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" fill="currentColor" />
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
          <TokenSection title="Current holdings" count={holdings.length} footer={`${fmtUsd(totalHolding)} total`}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-foreground/10 text-foreground/50 text-[10px] uppercase tracking-wider">
                  <th className="text-left py-3 px-5 font-semibold">Token</th>
                  <th className="text-right py-3 px-4 font-semibold">Holding value</th>
                  <th className="text-right py-3 px-4 font-semibold">Unrealized PnL</th>
                  <th className="text-right py-3 px-4 font-semibold">ROI</th>
                  <th className="text-right py-3 px-5 font-semibold">Chart</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {holdings.map((t: WalletTopToken) => (
                  <tr key={t.address} className="hover:bg-foreground/5 transition-colors">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2">
                        <div>
                          <span className="font-semibold text-foreground text-sm">{t.symbol}</span>
                          <p className="text-foreground/50 text-[10px] font-mono">{truncAddr(t.address)}</p>
                        </div>
                        <a
                          href={dexFor(t.address, wallet.address, wallet.chain)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open chart with this wallet's buy/sell markers"
                          className="text-[10px] font-semibold text-foreground/70 hover:text-foreground inline-flex items-center gap-0.5 ml-1"
                        >
                          Dex chart <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                        <CopyButton text={t.address} />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-foreground text-sm tabular-nums">
                      {fmtUsd(t.holding_usd)}
                    </td>
                    <td
                      className={cn(
                        "py-3 px-4 text-right font-mono font-semibold text-sm tabular-nums",
                        t.pnl_unrealized >= 0 ? "text-profit" : "text-loss"
                      )}
                    >
                      {t.pnl_unrealized >= 0 ? "+" : ""}
                      {fmtUsd(t.pnl_unrealized)}
                    </td>
                    <td
                      className={cn(
                        "py-3 px-4 text-right font-mono font-semibold text-sm tabular-nums",
                        t.roi >= 0 ? "text-profit" : "text-loss"
                      )}
                    >
                      {t.roi >= 0 ? "+" : ""}
                      {(t.roi * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-5 text-right">
                      <a
                        href={nansenToken(t.address, wallet.chain || "solana")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 rounded-full bg-foreground/5 border border-foreground/10 px-2 py-0.5 text-[10px] font-semibold text-foreground/80 hover:bg-foreground/10 transition-colors"
                      >
                        Nansen <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TokenSection>
        )}

        {/* ── Recent Sells ── */}
        {closedTrades.length > 0 && (
          <TokenSection title="Recent sells" count={closedTrades.length}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-foreground/10 text-foreground/50 text-[10px] uppercase tracking-wider">
                  <th className="text-left py-3 px-5 font-semibold">Token</th>
                  <th className="text-right py-3 px-4 font-semibold">Bought</th>
                  <th className="text-right py-3 px-4 font-semibold">Sold</th>
                  <th className="text-right py-3 px-4 font-semibold">Realized PnL</th>
                  <th className="text-right py-3 px-4 font-semibold">ROI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {closedTrades.map((t: WalletTopToken) => (
                  <tr key={t.address} className="hover:bg-foreground/5 transition-colors">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2">
                        <div>
                          <span className="font-semibold text-foreground text-sm">{t.symbol}</span>
                          <p className="text-foreground/50 text-[10px] font-mono">{truncAddr(t.address)}</p>
                        </div>
                        <a
                          href={dexFor(t.address, wallet.address, wallet.chain)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open chart with this wallet's buy/sell markers"
                          className="text-[10px] font-semibold text-foreground/70 hover:text-foreground inline-flex items-center gap-0.5 ml-1"
                        >
                          Dex chart <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-foreground/70 text-xs tabular-nums">
                      {fmtUsd(t.bought_usd)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-foreground/70 text-xs tabular-nums">
                      {fmtUsd(t.sold_usd)}
                    </td>
                    <td
                      className={cn(
                        "py-3 px-4 text-right font-mono font-semibold text-sm tabular-nums",
                        t.pnl_realized >= 0 ? "text-profit" : "text-loss"
                      )}
                    >
                      {t.pnl_realized >= 0 ? "+" : ""}
                      {fmtUsd(t.pnl_realized)}
                    </td>
                    <td
                      className={cn(
                        "py-3 px-4 text-right font-mono font-semibold text-sm tabular-nums",
                        t.roi >= 0 ? "text-profit" : "text-loss"
                      )}
                    >
                      {t.roi >= 0 ? "+" : ""}
                      {(t.roi * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TokenSection>
        )}

        {/* ── All Traded Tokens ── */}
        {topTokens.length > 0 && (
          <TokenSection title="All traded tokens" count={topTokens.length}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-foreground/10 text-foreground/50 text-[10px] uppercase tracking-wider">
                  <th className="text-left py-3 px-5 font-semibold">Token</th>
                  <th className="text-right py-3 px-3 font-semibold">Bought</th>
                  <th className="text-right py-3 px-3 font-semibold">Sold</th>
                  <th className="text-right py-3 px-3 font-semibold">Holding</th>
                  <th className="text-right py-3 px-3 font-semibold">Realized PnL</th>
                  <th className="text-right py-3 px-3 font-semibold">ROI</th>
                  <th className="text-right py-3 px-3 font-semibold">Buys</th>
                  <th className="text-right py-3 px-5 font-semibold">Sells</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {topTokens.map((t: WalletTopToken) => (
                  <tr key={t.address} className="hover:bg-foreground/5 transition-colors">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground text-sm">{t.symbol}</span>
                        <span className="text-[10px] text-foreground/50 font-mono">
                          {truncAddr(t.address)}
                        </span>
                        <a
                          href={dexFor(t.address, wallet.address, wallet.chain)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open chart with this wallet's buy/sell markers"
                          className="text-[10px] font-semibold text-foreground/70 hover:text-foreground inline-flex items-center gap-0.5"
                        >
                          Dex chart <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-foreground/70 text-xs tabular-nums">
                      {fmtUsd(t.bought_usd)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-foreground/70 text-xs tabular-nums">
                      {fmtUsd(t.sold_usd)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-foreground/70 text-xs tabular-nums">
                      {t.holding_usd > 0 ? fmtUsd(t.holding_usd) : "—"}
                    </td>
                    <td
                      className={cn(
                        "py-3 px-3 text-right font-mono font-semibold text-sm tabular-nums",
                        t.pnl_realized !== 0
                          ? t.pnl_realized >= 0
                            ? "text-profit"
                            : "text-loss"
                          : "text-foreground/40"
                      )}
                    >
                      {t.pnl_realized !== 0 ? `${t.pnl_realized >= 0 ? "+" : ""}${fmtUsd(t.pnl_realized)}` : "—"}
                    </td>
                    <td
                      className={cn(
                        "py-3 px-3 text-right font-mono font-semibold text-sm tabular-nums",
                        t.roi !== 0
                          ? t.roi >= 0
                            ? "text-profit"
                            : "text-loss"
                          : "text-foreground/40"
                      )}
                    >
                      {t.roi !== 0 ? `${t.roi >= 0 ? "+" : ""}${(t.roi * 100).toFixed(1)}%` : "—"}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-foreground/70 text-xs tabular-nums">
                      {t.buys}
                    </td>
                    <td className="py-3 px-5 text-right font-mono text-foreground/70 text-xs tabular-nums">
                      {t.sells}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TokenSection>
        )}
      </div>
    </div>
  );
}

// ── Helpers ──

function TokenSection({
  title,
  count,
  footer,
  children,
}: {
  title: string;
  count: number;
  footer?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-foreground tracking-tight">{title}</h2>
        <span className="inline-flex items-center rounded-full bg-foreground/5 border border-foreground/10 px-2 py-0.5 text-[10px] font-semibold font-mono text-foreground/70">
          {count}
        </span>
        {footer && (
          <span className="text-[11px] font-semibold text-foreground/60 ml-auto tabular-nums">
            {footer}
          </span>
        )}
      </div>
      <div className="glass-card overflow-hidden">
        {children}
      </div>
    </div>
  );
}
