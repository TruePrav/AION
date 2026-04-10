"use client";

import { useEffect, useState, Fragment } from "react";
import Link from "next/link";
import { apiFetch, API, Discovery } from "@/lib/api";
import { fmtUsd, truncAddr, nansenToken, nansenWallet, fmtPct } from "@/lib/utils";
import GradeBadge from "@/components/GradeBadge";
import CopyButton from "@/components/CopyButton";
import WalletGraph from "@/components/WalletGraph";
import AIReasoning, { type TokenReasoning } from "@/components/AIReasoning";
import PipelineCommands, { type PipelineCommand } from "@/components/PipelineCommands";
import ScoringEvolution, { type EvolutionStatus } from "@/components/ScoringEvolution";
import { cn } from "@/lib/utils";
import { AlertTriangle, ThumbsUp, ThumbsDown, ExternalLink, ArrowUp, ArrowDown, ArrowUpDown, Info } from "lucide-react";
import ChainIcon, { normalizeChain, chainLabel, dsSlug, type ChainKey } from "@/components/ChainIcon";

interface TokenRating {
  address: string;
  upvotes: number;
  downvotes: number;
  user_vote?: "up" | "down" | null;
}

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

type TokenSortField =
  | "mcap"
  | "age"
  | "inflow_7d"
  | "inflow_24h"
  | "inflow_30d"
  | "traders";
type SortDirection = "asc" | "desc";

export default function DiscoveryPage() {
  const [data, setData] = useState<Discovery | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedToken, setExpandedToken] = useState<string | null>(null);
  const [expandedWallet, setExpandedWallet] = useState<string | null>(null);
  const [sortField, setSortField] = useState<TokenSortField>("mcap");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  // Chain filter: default to ALL selected. `null` sentinel means "all chains",
  // which we reset to whenever the user clicks the "All" chip. Individual
  // chain chips toggle presence in a Set.
  const [chainFilter, setChainFilter] = useState<Set<ChainKey> | null>(null);

  function toggleSort(field: TokenSortField) {
    if (sortField === field) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }
  const [blocklist, setBlocklist] = useState<BlocklistEntry[]>([]);
  const [, setBlockVotes] = useState<Record<string, number>>({});
  const [ratings, setRatings] = useState<Record<string, TokenRating>>({});
  const [votingToken, setVotingToken] = useState<string | null>(null);
  const [userId] = useState(() => {
    if (typeof window === "undefined") return "";
    const stored = localStorage.getItem("oracle_voter_id");
    if (stored) return stored;
    const id = crypto.randomUUID();
    localStorage.setItem("oracle_voter_id", id);
    return id;
  });

  const [error, setError] = useState<string | null>(null);
  const [reasoning, setReasoning] = useState<TokenReasoning[] | null>(null);
  const [reasoningLoading, setReasoningLoading] = useState(true);
  const [commands, setCommands] = useState<PipelineCommand[] | null>(null);
  const [evolution, setEvolution] = useState<EvolutionStatus | null>(null);
  const [evolutionLoading, setEvolutionLoading] = useState(true);

  useEffect(() => {
    apiFetch<Discovery>("/api/discovery/latest")
      .then(setData)
      .catch((e) => setError(e.message || "Failed to load discovery"))
      .finally(() => setLoading(false));
    fetch(`${API}/api/blocklist`)
      .then((r) => r.json())
      .then((d: BlocklistResponse) => {
        setBlocklist(d.blocklist || []);
        const votes: Record<string, number> = {};
        (d.blocklist || []).forEach((b: BlocklistEntry) => { votes[b.address] = b.votes; });
        setBlockVotes(votes);
      })
      .catch(() => {});
    fetch(`${API}/api/ratings?user_id=${userId}`)
      .then((r) => r.json())
      .then((d: { ratings: Record<string, TokenRating> }) => setRatings(d.ratings || {}))
      .catch(() => {});
    fetch(`${API}/api/discovery/reasoning`)
      .then((r) => r.json())
      .then((d: { reasoning: TokenReasoning[] }) => setReasoning(d.reasoning || null))
      .catch(() => {})
      .finally(() => setReasoningLoading(false));
    fetch(`${API}/api/discovery/commands`)
      .then((r) => r.json())
      .then((d: { commands: PipelineCommand[] }) => setCommands(d.commands || null))
      .catch(() => {});
    fetch(`${API}/api/evolution/status`)
      .then((r) => r.json())
      .then((d: EvolutionStatus) => setEvolution(d))
      .catch(() => {})
      .finally(() => setEvolutionLoading(false));
  }, [userId]);

  async function rateToken(address: string, direction: "up" | "down") {
    setVotingToken(address);
    try {
      const res = await fetch(`${API}/api/ratings/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, user_id: userId, direction }),
      });
      const result = await res.json();
      if (result.success) {
        setRatings((prev) => ({
          ...prev,
          [address]: { address, upvotes: result.upvotes, downvotes: result.downvotes, user_vote: result.user_vote },
        }));
        if (result.downvotes >= 3) {
          setBlocklist((prev) => {
            if (prev.find((b) => b.address === address)) return prev;
            return [...prev, { address, votes: result.downvotes, voters: [] }];
          });
        }
      }
    } finally {
      setVotingToken(null);
    }
  }

  if (loading)
    return (
      <div className="glass-bg min-h-screen flex flex-col items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-foreground/20 border-t-primary animate-spin mb-4" />
        <p className="text-sm text-foreground/60">Loading discovery...</p>
      </div>
    );
  if (error)
    return (
      <div className="glass-bg min-h-screen flex flex-col items-center justify-center">
        <AlertTriangle className="h-8 w-8 mb-3 text-foreground/40" />
        <p className="text-base font-semibold text-foreground mb-1">Failed to load discovery</p>
        <p className="text-sm text-foreground/60">{error}</p>
      </div>
    );
  if (!data)
    return (
      <div className="glass-bg min-h-screen flex flex-col items-center justify-center">
        <p className="text-base font-semibold text-foreground mb-1">No discovery data yet</p>
        <p className="text-sm text-foreground/60">
          Run <span className="inline-block bg-primary/20 border border-primary/40 rounded px-1.5 py-0.5 font-mono text-foreground">/discover</span> on Telegram to populate this page.
        </p>
      </div>
    );

  const rawTokens = data.tokens ?? [];
  const wallets = data.wallets ?? [];
  const graph = data.graph;
  const validated = data.validated_tokens ?? [];
  const blockedSet = new Set(blocklist.map((b) => b.address));

  // Which chains actually appear in this run — used to build the filter row
  // (we never show a chip for a chain that has zero tokens, to avoid clicking
  // into an empty state).
  const availableChains: ChainKey[] = Array.from(
    new Set(rawTokens.map((t) => normalizeChain(t.chain))),
  );

  const filteredByChain =
    chainFilter === null
      ? rawTokens
      : rawTokens.filter((t) => chainFilter.has(normalizeChain(t.chain)));

  const tokens = [...filteredByChain].sort((a, b) => {
    const getVal = (t: typeof a): number => {
      switch (sortField) {
        case "mcap":
          return t.market_cap || 0;
        case "age":
          return t.token_age_days || 0;
        case "inflow_7d":
          return t.net_flow_7d || 0;
        case "inflow_24h":
          return t.net_flow_24h || 0;
        case "inflow_30d":
          return t.net_flow_30d || 0;
        case "traders":
          return t.trader_count || 0;
      }
    };
    const diff = getVal(a) - getVal(b);
    return sortDir === "desc" ? -diff : diff;
  });

  return (
    <div className="glass-bg min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-10 space-y-10">
        {/* ── Page Header ── */}
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Discovery</h1>
          <p className="text-sm text-foreground/60 mt-1 flex items-center gap-2 flex-wrap">
            <span>Chains</span>
            <span className="inline-flex items-center gap-1">
              {availableChains.map((c) => (
                <ChainIcon key={c} chain={c} size="xs" />
              ))}
            </span>
            <span className="text-foreground/30">·</span>
            <span>{tokens.length} tokens</span>
            <span className="text-foreground/30">·</span>
            <span>{wallets.length} wallets</span>
          </p>
        </div>

        {/* ── Blocklist Alert ── */}
        {blocklist.length > 0 && (
          <div className="glass-card p-4 flex items-start gap-3 border-destructive/30">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-destructive/20 border border-destructive/40 flex-shrink-0">
              <AlertTriangle className="h-4 w-4 text-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                Blocked tokens
                <span className="inline-flex items-center rounded-full bg-destructive/20 border border-destructive/40 px-2 py-0 text-[10px] font-semibold text-foreground">
                  {blocklist.length}
                </span>
                <span className="text-[11px] text-foreground/50 font-normal">3 votes auto-blocks a token</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {blocklist.map((b) => (
                  <div
                    key={b.address}
                    className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-foreground/5 border border-foreground/15"
                  >
                    <span className="text-foreground/80 text-[11px] font-mono">{truncAddr(b.address)}</span>
                    <span className="text-[10px] text-foreground/50 font-mono">{b.votes} votes</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Tokens Section ── */}
        <section>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-foreground tracking-tight">Tokens</h2>
              <span className="inline-flex items-center rounded-full bg-foreground/5 border border-foreground/15 px-2 py-0 text-[10px] font-semibold font-mono text-foreground/70">
                {tokens.length}
              </span>
            </div>
          </div>

          {/* Chain filter chips — default is "All" (chainFilter === null). */}
          {availableChains.length > 1 && (
            <div className="mb-3 flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/45">
                Chain
              </span>
              <button
                type="button"
                onClick={() => setChainFilter(null)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold transition-colors",
                  chainFilter === null
                    ? "bg-primary/25 border-primary/55 text-foreground"
                    : "bg-foreground/5 border-foreground/15 text-foreground/65 hover:bg-foreground/10",
                )}
              >
                All
              </button>
              {availableChains.map((c) => {
                const active = chainFilter === null || chainFilter.has(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      // Build the new Set based on current state. The sentinel
                      // `null` means "all selected", so a click on one chip
                      // should collapse to just that chain (common UX pattern
                      // for chain pickers in portfolio apps).
                      setChainFilter((prev) => {
                        if (prev === null) return new Set<ChainKey>([c]);
                        const next = new Set(prev);
                        if (next.has(c)) {
                          next.delete(c);
                        } else {
                          next.add(c);
                        }
                        // Empty set collapses back to "all" so we never render
                        // an empty table just because the user unticked
                        // everything.
                        if (next.size === 0) return null;
                        return next;
                      });
                    }}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold transition-colors",
                      active
                        ? "bg-primary/25 border-primary/55 text-foreground"
                        : "bg-foreground/5 border-foreground/15 text-foreground/55 hover:bg-foreground/10",
                    )}
                  >
                    <ChainIcon chain={c} size="xs" />
                    {chainLabel(c)}
                  </button>
                );
              })}
            </div>
          )}

          {/* Sort hint sits right above the table, top-right aligned,
              so the user sees it as they reach for the column headers. */}
          <div className="mb-2 flex justify-end">
            <span className="text-[11px] text-foreground/50 italic">
              Click a column header to sort
            </span>
          </div>

          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-foreground/10 text-foreground/50 text-[10px] uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-semibold">Symbol</th>
                  <SortableHeader
                    label="MCap"
                    field="mcap"
                    sortField={sortField}
                    sortDir={sortDir}
                    onClick={toggleSort}
                  />
                  <SortableHeader
                    label="Age"
                    field="age"
                    sortField={sortField}
                    sortDir={sortDir}
                    onClick={toggleSort}
                  />
                  <SortableHeader
                    label="7d inflow"
                    field="inflow_7d"
                    sortField={sortField}
                    sortDir={sortDir}
                    onClick={toggleSort}
                  />
                  <SortableHeader
                    label="24h inflow"
                    field="inflow_24h"
                    sortField={sortField}
                    sortDir={sortDir}
                    onClick={toggleSort}
                  />
                  <SortableHeader
                    label="30d inflow"
                    field="inflow_30d"
                    sortField={sortField}
                    sortDir={sortDir}
                    onClick={toggleSort}
                  />
                  <SortableHeader
                    label="Traders"
                    field="traders"
                    sortField={sortField}
                    sortDir={sortDir}
                    onClick={toggleSort}
                  />
                  <th className="text-center px-3 py-3 font-semibold">
                    <span className="inline-flex items-center gap-1">
                      Accum
                      <span
                        tabIndex={0}
                        title="Accumulation grade (S/A/B/C/D) scored from buy/sell ratio, unique buyers, smart-money presence and volume consistency."
                        aria-label="Accumulation grade explainer"
                        className="inline-flex items-center justify-center h-3.5 w-3.5 rounded-full bg-foreground/10 border border-foreground/20 text-foreground/60 hover:text-foreground hover:bg-foreground/15 cursor-help transition-colors focus:outline-none focus:ring-1 focus:ring-foreground/30"
                      >
                        <Info className="h-2.5 w-2.5" />
                      </span>
                    </span>
                  </th>
                  <th className="text-center px-3 py-3 font-semibold">
                    <span className="inline-flex items-center gap-1">
                      Tier
                      <span
                        tabIndex={0}
                        title="Risk gate (degen / balanced / conservative). ✓ means the token passed your current tier's mcap, age and buyer thresholds."
                        aria-label="Tier explainer"
                        className="inline-flex items-center justify-center h-3.5 w-3.5 rounded-full bg-foreground/10 border border-foreground/20 text-foreground/60 hover:text-foreground hover:bg-foreground/15 cursor-help transition-colors focus:outline-none focus:ring-1 focus:ring-foreground/30"
                      >
                        <Info className="h-2.5 w-2.5" />
                      </span>
                    </span>
                  </th>
                  <th className="text-center px-5 py-3 font-semibold">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {tokens.map((t) => (
                  <Fragment key={t.address}>
                    <tr
                      className="cursor-pointer hover:bg-foreground/[0.06] transition-colors"
                      onClick={() => setExpandedToken(expandedToken === t.address ? null : t.address)}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`https://dd.dexscreener.com/ds-data/tokens/${dsSlug(normalizeChain(t.chain))}/${t.address}.png`}
                            alt=""
                            className="h-7 w-7 rounded-lg bg-foreground/5 border border-foreground/15 flex-shrink-0"
                            onError={(e) => {
                              // Detach then hide — never set src="".
                              const el = e.currentTarget;
                              el.onerror = null;
                              el.style.display = "none";
                            }}
                          />
                          <a
                            href={`https://dexscreener.com/${dsSlug(normalizeChain(t.chain))}/${t.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground font-semibold text-sm hover:underline underline-offset-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {t.symbol}
                          </a>
                          {/* Replace the text chain tag with the real chain logo */}
                          <ChainIcon chain={t.chain} size="xs" />
                          {t.sectors && t.sectors.length > 0 && (
                            <span className="text-[10px] text-foreground/60 bg-foreground/5 border border-foreground/15 rounded-full px-1.5 py-0">
                              {t.sectors[0]}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-[13px] font-bold text-foreground tabular-nums">
                        {fmtUsd(t.market_cap)}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-[13px] font-bold text-foreground/75 tabular-nums">
                        {t.token_age_days
                          ? t.token_age_days >= 30
                            ? `${Math.round(t.token_age_days / 30)}mo`
                            : `${t.token_age_days}d`
                          : "—"}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-[13px] tabular-nums">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md px-1.5 py-0.5 font-bold",
                            t.net_flow_7d >= 0
                              ? "text-profit bg-profit/15"
                              : "text-loss bg-loss/15"
                          )}
                        >
                          {fmtUsd(t.net_flow_7d)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-[13px] tabular-nums">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md px-1.5 py-0.5 font-bold",
                            t.net_flow_24h >= 0
                              ? "text-profit bg-profit/15"
                              : "text-loss bg-loss/15"
                          )}
                        >
                          {fmtUsd(t.net_flow_24h)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-[13px] tabular-nums">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md px-1.5 py-0.5 font-bold",
                            t.net_flow_30d >= 0
                              ? "text-profit bg-profit/15"
                              : "text-loss bg-loss/15"
                          )}
                        >
                          {fmtUsd(t.net_flow_30d)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right text-foreground/60 text-xs tabular-nums">
                        {t.trader_count}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <GradeBadge grade={t.accumulation.grade as Grade} size="sm" />
                          <span className="text-[10px] text-foreground/50 font-mono">{t.accumulation.score}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums",
                            t.tier_filter.passed
                              ? "bg-primary/20 border border-primary/40 text-foreground"
                              : "bg-destructive/20 border border-destructive/40 text-foreground"
                          )}
                        >
                          {t.tier_filter.tier} {t.tier_filter.passed ? "✓" : "✗"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        {blockedSet.has(t.address) ? (
                          <span className="inline-flex items-center rounded-full bg-destructive/20 border border-destructive/40 px-2 py-0.5 text-[10px] font-semibold text-foreground">
                            Blocked
                          </span>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                rateToken(t.address, "up");
                              }}
                              disabled={votingToken === t.address}
                              className={cn(
                                "flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold tabular-nums transition-all disabled:opacity-30",
                                ratings[t.address]?.user_vote === "up"
                                  ? "bg-primary/30 border border-primary/60 text-foreground"
                                  : "bg-foreground/5 border border-foreground/15 text-foreground/70 hover:bg-primary/15 hover:border-primary/30"
                              )}
                            >
                              <ThumbsUp className="h-2.5 w-2.5" />
                              <span>{ratings[t.address]?.upvotes || 0}</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                rateToken(t.address, "down");
                              }}
                              disabled={votingToken === t.address}
                              className={cn(
                                "flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold tabular-nums transition-all disabled:opacity-30",
                                ratings[t.address]?.user_vote === "down"
                                  ? "bg-destructive/30 border border-destructive/60 text-foreground"
                                  : "bg-foreground/5 border border-foreground/15 text-foreground/70 hover:bg-destructive/15 hover:border-destructive/30"
                              )}
                            >
                              <ThumbsDown className="h-2.5 w-2.5" />
                              <span>{ratings[t.address]?.downvotes || 0}</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                    {expandedToken === t.address && (
                      <tr>
                        <td colSpan={10} className="bg-accent/10 px-6 py-5 border-t border-accent/25">
                          <div className="grid gap-6 sm:grid-cols-3">
                            <div className="space-y-3">
                              <h4 className="text-[10px] font-semibold text-foreground/50 uppercase tracking-wider">
                                Token details
                              </h4>
                              <div className="space-y-2 text-xs">
                                <DetailRow
                                  label="Age"
                                  value={t.token_age_days ? `${t.token_age_days} days` : "—"}
                                />
                                <DetailRow label="Market cap" value={fmtUsd(t.market_cap)} />
                                <DetailRow
                                  label="30d SM inflow"
                                  value={fmtUsd(t.net_flow_30d)}
                                  valueClass={t.net_flow_30d >= 0 ? "text-profit" : "text-loss"}
                                />
                                {t.sectors && t.sectors.length > 0 && (
                                  <DetailRow label="Sectors" value={t.sectors.join(", ")} />
                                )}
                                <div className="flex items-center gap-2 pt-1">
                                  <a
                                    href={nansenToken(t.address, t.chain)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 rounded-full bg-primary/20 border border-primary/40 px-2 py-0.5 text-[10px] font-semibold text-foreground hover:bg-primary/30 transition-colors"
                                  >
                                    Nansen <ExternalLink className="h-2.5 w-2.5" />
                                  </a>
                                  <a
                                    href={`https://dexscreener.com/${dsSlug(normalizeChain(t.chain))}/${t.address}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 rounded-full bg-secondary/30 border border-secondary/50 px-2 py-0.5 text-[10px] font-semibold text-foreground hover:bg-secondary/40 transition-colors"
                                  >
                                    DexScreener <ExternalLink className="h-2.5 w-2.5" />
                                  </a>
                                </div>
                                <div className="flex items-center gap-1.5 pt-0.5">
                                  <span className="text-[11px] text-foreground/50 font-mono">
                                    {truncAddr(t.address)}
                                  </span>
                                  <CopyButton text={t.address} />
                                </div>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <h4 className="text-[10px] font-semibold text-foreground/50 uppercase tracking-wider">
                                Accumulation details
                              </h4>
                              <div className="space-y-2 text-xs">
                                <DetailRow
                                  label="Buy/sell ratio"
                                  value={t.accumulation.metrics.buy_sell_ratio.toFixed(2)}
                                />
                                <DetailRow
                                  label="Buyer HHI"
                                  value={t.accumulation.metrics.buyer_concentration_hhi.toFixed(4)}
                                />
                                <DetailRow
                                  label="SM presence"
                                  value={`${t.accumulation.metrics.sm_buyer_count} (${fmtPct(t.accumulation.metrics.sm_buyer_pct)})`}
                                />
                                <DetailRow
                                  label="Buyers / sellers"
                                  value={`${t.accumulation.metrics.n_buyers} / ${t.accumulation.metrics.n_sellers}`}
                                />
                                {t.accumulation.signals.length > 0 && (
                                  <div className="flex flex-wrap gap-1 pt-1">
                                    {t.accumulation.signals.map((s, i) => (
                                      <span
                                        key={i}
                                        className="inline-flex items-center rounded-full bg-primary/20 border border-primary/40 text-foreground px-2 py-0.5 text-[10px] font-semibold"
                                      >
                                        {s}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="space-y-3">
                              <h4 className="text-[10px] font-semibold text-foreground/50 uppercase tracking-wider">
                                Tier filter
                              </h4>
                              <div className="space-y-2 text-xs">
                                <DetailRow label="Tier" value={t.tier_filter.tier} />
                                <DetailRow label="Score" value={String(t.tier_filter.accum_score)} />
                                <div className="flex justify-between items-center">
                                  <span className="text-foreground/50">Grade</span>
                                  <GradeBadge grade={t.accumulation.grade as Grade} size="sm" />
                                </div>
                                {t.tier_filter.reasons.length > 0 && (
                                  <div className="mt-2 space-y-1">
                                    {t.tier_filter.reasons.map((r, i) => (
                                      <div
                                        key={i}
                                        className="text-[11px] text-foreground/70 flex items-start gap-1.5"
                                      >
                                        <AlertTriangle className="h-2.5 w-2.5 mt-0.5 flex-shrink-0 text-accent" />
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-foreground tracking-tight">Wallet leaderboard</h2>
              <span className="inline-flex items-center rounded-full bg-foreground/5 border border-foreground/15 px-2 py-0 text-[10px] font-semibold font-mono text-foreground/70">
                {wallets.length}
              </span>
            </div>
            <span className="text-[11px] text-foreground/50">Click row to expand top tokens</span>
          </div>

          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-foreground/10 text-foreground/50 text-[10px] uppercase tracking-wider">
                  <th className="text-center px-4 py-3 font-semibold">Grade</th>
                  <th className="text-right px-3 py-3 font-semibold">Score</th>
                  <th className="text-left px-4 py-3 font-semibold">Address</th>
                  <th className="text-left px-4 py-3 font-semibold">Label</th>
                  <th className="text-right px-3 py-3 font-semibold">Realized PnL</th>
                  <th className="text-right px-4 py-3 font-semibold">Hot buys</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {wallets.map((w) => (
                  <Fragment key={w.address}>
                    <tr
                      className="cursor-pointer hover:bg-foreground/[0.06] transition-colors"
                      onClick={() => setExpandedWallet(expandedWallet === w.address ? null : w.address)}
                    >
                      <td className="px-4 py-3 text-center">
                        <GradeBadge grade={w.grade as Grade} size="md" />
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-semibold text-foreground tabular-nums">
                        {w.score}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/wallet/${w.address}`}
                            className="font-mono font-semibold text-foreground text-xs hover:underline underline-offset-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {truncAddr(w.address, 6)}
                          </Link>
                          <CopyButton text={w.address} />
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        {w.label ? (
                          <span className="inline-flex items-center rounded-md bg-foreground/[0.06] border border-foreground/15 px-2 py-0.5 text-[11px] font-bold text-foreground truncate max-w-full">
                            {w.label}
                          </span>
                        ) : (
                          <span className="text-foreground/30 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-xs tabular-nums">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md px-1.5 py-0.5 font-bold",
                            w.total_pnl_realized >= 0
                              ? "text-profit bg-profit/15"
                              : "text-loss bg-loss/15",
                          )}
                        >
                          {w.total_pnl_realized >= 0 ? "+" : ""}
                          {fmtUsd(w.total_pnl_realized)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-foreground/60 text-xs tabular-nums">
                        {w.hot_token_buys?.length ?? 0}
                      </td>
                    </tr>
                    {expandedWallet === w.address && w.top_tokens.length > 0 && (
                      <tr>
                        <td colSpan={6} className="bg-accent/10 px-6 py-5 border-t border-accent/25">
                          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mb-4 text-[11px] text-foreground/60">
                            <span>
                              Win rate <span className="text-foreground font-mono font-semibold">{fmtPct(w.win_rate)}</span>
                            </span>
                            <span
                              title="How many of this wallet's recent buys overlap with tokens other top-graded wallets are also buying. Higher = more consensus."
                              className="inline-flex items-center gap-1"
                            >
                              Convergence{" "}
                              <span className="text-foreground font-mono font-semibold">
                                {w.convergence_score}
                              </span>
                              <Info className="h-3 w-3 text-foreground/40" />
                            </span>
                            <span>
                              W/L <span className="text-foreground font-mono font-semibold">{w.wins}W / {w.losses}L</span>
                            </span>
                            <span>
                              Trades <span className="text-foreground font-mono font-semibold">{w.total_trades}</span>
                            </span>
                            <a
                              href={nansenWallet(w.address, w.chain)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary/20 border border-primary/40 px-2 py-0.5 text-[10px] font-semibold text-foreground hover:bg-primary/30 transition-colors"
                            >
                              View on Nansen <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          </div>
                          <h4 className="text-[10px] font-semibold text-foreground/50 uppercase tracking-wider mb-3">
                            Top tokens
                          </h4>
                          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {w.top_tokens.slice(0, 6).map((tok) => (
                              <div
                                key={tok.address}
                                className="glass-card-sm p-3 text-xs"
                              >
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="font-semibold text-foreground">{tok.symbol}</span>
                                  <a
                                    href={`https://dexscreener.com/${dsSlug(normalizeChain(w.chain))}/${tok.address}?maker=${w.address}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Open chart with this wallet's buy/sell markers"
                                    className="text-[10px] text-foreground/60 hover:text-foreground transition-colors flex items-center gap-0.5"
                                  >
                                    Dex <ExternalLink className="h-2.5 w-2.5" />
                                  </a>
                                </div>
                                <div className="space-y-0.5 text-[11px]">
                                  <div className="flex justify-between">
                                    <span className="text-foreground/50">PnL</span>
                                    <span
                                      className={cn(
                                        "font-mono font-semibold tabular-nums",
                                        tok.pnl_realized >= 0 ? "text-profit" : "text-loss"
                                      )}
                                    >
                                      {fmtUsd(tok.pnl_realized)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-foreground/50">ROI</span>
                                    <span className="font-mono text-foreground/80 tabular-nums">
                                      {tok.roi >= 0 ? "+" : ""}
                                      {(tok.roi * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-foreground/50">Buys / sells</span>
                                    <span className="font-mono text-foreground/60 tabular-nums">
                                      {tok.buys} / {tok.sells}
                                    </span>
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

        {/* ── AI Reasoning ── */}
        <section>
          <AIReasoning tokens={tokens} reasoning={reasoning} loading={reasoningLoading} />
        </section>

        {/* ── Wallet Graph (Bubblemap) ── */}
        {graph && graph.nodes.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold text-foreground tracking-tight">Wallet network</h2>
              <span className="inline-flex items-center rounded-full bg-foreground/5 border border-foreground/15 px-2 py-0 text-[10px] font-semibold font-mono text-foreground/70">
                {graph.nodes.length} nodes · {graph.edges.length} edges
              </span>
              <span className="text-[10px] text-foreground/50 ml-2">
                Drag to explore · Hover for details
              </span>
            </div>
            <div className="glass-card p-4 overflow-hidden">
              <WalletGraph nodes={graph.nodes} edges={graph.edges} clusters={graph.clusters || []} />
            </div>
          </section>
        )}

        {/* ── Validated Tokens ── */}
        {validated.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold text-foreground tracking-tight">Validated tokens</h2>
              <span className="inline-flex items-center rounded-full bg-accent/40 border border-accent/60 px-2 py-0 text-[10px] font-semibold text-foreground">
                GoPlus security
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {validated.map((v) => (
                <div key={v.address} className="glass-card-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-foreground text-sm">{v.symbol}</span>
                    <span className="font-mono text-[10px] text-foreground/50">
                      {truncAddr(v.address)}
                    </span>
                  </div>
                  {v.goplus && (
                    <div className="space-y-1 text-[11px]">
                      {Object.entries(v.goplus)
                        .slice(0, 5)
                        .map(([k, val]) => (
                          <div key={k} className="flex justify-between">
                            <span className="text-foreground/50">{k}</span>
                            <span className="text-foreground/80">{String(val)}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Scoring Evolution ── */}
        <section>
          <ScoringEvolution
            status={evolution}
            loading={evolutionLoading}
            onEvaluate={async () => {
              setEvolutionLoading(true);
              try {
                await fetch(`${API}/api/evolution/evaluate`, { method: "POST" });
                const res = await fetch(`${API}/api/evolution/status`);
                const d: EvolutionStatus = await res.json();
                setEvolution(d);
              } catch { /* ignore */ }
              setEvolutionLoading(false);
            }}
          />
        </section>

        {/* ── Pipeline Commands ── */}
        <section>
          <PipelineCommands
            commands={commands}
            creditsUsed={data.credits?.used ?? 0}
            creditsBefore={data.credits?.before ?? 0}
            creditsAfter={data.credits?.after ?? 0}
          />
        </section>
      </div>
    </div>
  );
}

// ── Helpers ──

function SortableHeader({
  label,
  field,
  sortField,
  sortDir,
  onClick,
}: {
  label: string;
  field: TokenSortField;
  sortField: TokenSortField;
  sortDir: SortDirection;
  onClick: (f: TokenSortField) => void;
}) {
  const active = sortField === field;
  return (
    <th className="text-right px-3 py-3 font-semibold">
      <button
        type="button"
        onClick={() => onClick(field)}
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 uppercase tracking-wider transition-colors cursor-pointer",
          active
            ? "text-foreground bg-foreground/[0.08]"
            : "text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05]"
        )}
      >
        <span>{label}</span>
        {active ? (
          sortDir === "desc" ? (
            <ArrowDown className="h-3 w-3" strokeWidth={2.5} />
          ) : (
            <ArrowUp className="h-3 w-3" strokeWidth={2.5} />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-50" strokeWidth={2} />
        )}
      </button>
    </th>
  );
}

function DetailRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-foreground/50">{label}</span>
      <span className={cn("font-mono font-semibold text-foreground tabular-nums", valueClass)}>{value}</span>
    </div>
  );
}
