"use client";

import { useEffect, useState } from "react";
import { API } from "@/lib/api";
import { fmtUsd, truncAddr, cn } from "@/lib/utils";
import GradeBadge from "@/components/GradeBadge";
import CopyButton from "@/components/CopyButton";
import { ExternalLink, TrendingUp, Users, Zap, Layers, RefreshCw, Info, Filter } from "lucide-react";

// ─────────────────────────────────────────────
// Category normalization
// ─────────────────────────────────────────────
// Polymarket market tags are messy: "US Election", "Global Elections",
// "World Elections", "Elections" and "Primaries" are all really the
// same bucket. "Trump", "Politics", "Congress", "Midterms" overlap too.
// We fold them into a small set of canonical categories so the filter
// bar stays readable. Anything unrecognised falls into "Other".
const CATEGORY_GROUPS: { key: string; label: string; emoji: string; match: RegExp }[] = [
  { key: "politics",    label: "Politics",      emoji: "🏛️", match: /\b(politic|politics|congress|senate|president|primar|midterm|foreign policy|white house|supreme court|scotus|gop|dnc|democrat|republican|trump|biden|harris|vance|zelensky|khamenei|shelton|powell(?!.+crypto)|fed rates|fomc|fed\b|rbi)\b/i },
  { key: "elections",   label: "Elections",     emoji: "🗳️", match: /\b(election|elections|us election|global election|world election|eu election|hungary election|primaries|vote|voting|macro election)\b/i },
  { key: "geopolitics", label: "Geopolitics",   emoji: "🌐", match: /\b(geopolitic|middle east|iran|israel|ukraine|russia|china|strait of hormuz|kharg|ceasefire|regime|us.?x.?iran|israel.?x.?iran|trump.?zelenskyy|peace deal|oil|military|war|nato|taiwan)\b/i },
  { key: "crypto",      label: "Crypto",        emoji: "🪙", match: /\b(crypto|bitcoin|btc|ethereum|eth|solana|sol|xrp|doge|memecoin|defi|altcoin|etf|coinbase|binance|tether|usdt|usdc|stablecoin|nft|l2|rollup)\b/i },
  { key: "ai_tech",     label: "AI & Tech",     emoji: "🤖", match: /\b(ai|artificial intelligence|gpt|llm|openai|anthropic|claude|gemini|google|apple|meta|microsoft|nvidia|tesla|spacex|tech|technology|startup|ipo)\b/i },
  { key: "sports",      label: "Sports",        emoji: "🏆", match: /\b(sports|nba|nfl|mlb|nhl|mls|ufc|pga|golf|tennis|soccer|football|basketball|hockey|baseball|cricket|rugby|boxing|esports|champions league|premier league|world cup|fifa|augusta|masters|ncaa|olympics|f1|formula)\b/i },
  { key: "culture",     label: "Culture & Fun", emoji: "🎭", match: /\b(pop culture|culture|celeb|celebrities|celebrity|awards|music|movie|movies|film|tv|reality|kardashian|grammy|oscar|emmy|taylor swift|drake|beyonce|travis|kanye|netflix|box office)\b/i },
  { key: "finance",     label: "Finance",       emoji: "💸", match: /\b(finance|economy|economic|gdp|stock|stocks|earnings|inflation|jobs|cpi|hit price|commodities|s&p|nasdaq|dow|macro|recession|mortgage|rate|rates)\b/i },
  { key: "science",     label: "Science",       emoji: "🔬", match: /\b(science|weather|climate|space|nasa|asteroid|hurricane|earthquake|temperature|snow|rain|discovery|vaccine|pandemic|covid|health|medical)\b/i },
];

function normalizeCategory(tag: string): { key: string; label: string; emoji: string } {
  const t = (tag || "").trim();
  if (!t) return { key: "other", label: "Other", emoji: "❓" };
  for (const g of CATEGORY_GROUPS) {
    if (g.match.test(t)) return { key: g.key, label: g.label, emoji: g.emoji };
  }
  return { key: "other", label: "Other", emoji: "❓" };
}

/** Collapse a market's raw tags into the unique set of canonical category keys. */
function marketCategoryKeys(tags: string[] | undefined): Set<string> {
  const out = new Set<string>();
  for (const t of tags || []) out.add(normalizeCategory(t).key);
  if (out.size === 0) out.add("other");
  return out;
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface PMMarket {
  market_id: string;
  question: string;
  event_title: string;
  event_id: string;
  tags: string[];
  end_date: string;
  volume: number;
  volume_24hr: number;
  volume_1wk: number;
  liquidity: number;
  open_interest: number;
  volume_change_pct: number;
  best_bid: number;
  best_ask: number;
  last_trade_price: number;
  one_day_price_change: number;
  implied_prob: number;
  unique_traders_24h: number;
  age_hours: number;
  slug: string;
}

interface PMHolder {
  address: string;
  owner_address: string;
  side: string;
  outcome_index: number;
  position_size: number;
  position_usd: number;
  avg_entry_price: number;
  current_price: number;
  unrealized_pnl_usd: number;
}

interface PMTrade {
  timestamp: string;
  buyer: string;
  seller: string;
  taker_action: string;
  side: string;
  size: number;
  price: number;
  usdc_value: number;
  tx_hash: string;
}

interface PMHotMarket extends PMMarket {
  top_holders: PMHolder[];
  recent_trades: PMTrade[];
}

interface PMWhaleMarket {
  market_id: string;
  question: string;
  side: string;
  position_usd: number;
  unrealized_pnl_usd: number;
}

interface PMFullPositionsResponse {
  owner_address: string;
  position_count: number;
  total_position_usd: number;
  total_unrealized_pnl: number;
  positions: PMWhaleMarket[];
}

interface PMWhale {
  owner_address: string;
  proxy_wallet?: string;
  total_position_usd: number;
  total_unrealized_pnl: number;
  position_count: number;
  markets: PMWhaleMarket[];
  grade: "S" | "A" | "B" | "C" | "D";
}

interface PMFunnel {
  scanned_markets: number;
  hot_markets: number;
  deep_dive_markets: number;
  unique_whales: number;
  graded_whales: number;
  convergence_whales: number;
}

interface PMData {
  timestamp: string;
  funnel: PMFunnel;
  markets: PMMarket[];
  hot_markets: PMHotMarket[];
  whales: PMWhale[];
  convergence: PMWhale[];
  credits: { before: number; after: number; used: number };
}

interface PMBet {
  rank: number;
  market_id: string;
  question: string;
  slug: string;
  end_date: string;
  side: "yes" | "no";
  entry_price: number;
  size_usd: number;
  shares: number;
  reasoning: string;
  volume_24hr: number;
  volume_1wk: number;
  opened_at: string;
  status: string;
  current_price: number;
  pnl_usd: number;
  pnl_pct: number;
}

interface PMBetsResponse {
  bets: PMBet[];
  updated_at: string;
  total_pnl_usd: number;
  total_size_usd: number;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function fmtCompact(n: number): string {
  if (n == null || isNaN(n)) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

/**
 * Robust relative-time formatter. Handles:
 *  - ISO strings ("2025-04-09T...")
 *  - Unix seconds and unix milliseconds (raw numbers or numeric strings)
 *  - Negative deltas (clock skew or future-dated trades) — rendered as "in Xh"
 *
 * The previous version returned `${delta}s ago` when delta was negative, which
 * is what produced the "-12136s ago" garbage the user reported.
 */
function fmtRelTime(input: string | number | undefined | null): string {
  if (input == null || input === "") return "—";

  let ms: number;
  if (typeof input === "number") {
    // Heuristic: numbers under 1e12 are unix seconds, otherwise milliseconds.
    ms = input < 1e12 ? input * 1000 : input;
  } else {
    const trimmed = String(input).trim();
    if (/^\d+$/.test(trimmed)) {
      const n = Number(trimmed);
      ms = n < 1e12 ? n * 1000 : n;
    } else {
      ms = new Date(trimmed).getTime();
    }
  }
  if (!Number.isFinite(ms)) return "—";

  const deltaSec = Math.round((Date.now() - ms) / 1000);
  const future = deltaSec < 0;
  const abs = Math.abs(deltaSec);

  let body: string;
  if (abs < 60) body = `${abs}s`;
  else if (abs < 3600) body = `${Math.floor(abs / 60)}m`;
  else if (abs < 86400) body = `${Math.floor(abs / 3600)}h`;
  else body = `${Math.floor(abs / 86400)}d`;

  return future ? `in ${body}` : `${body} ago`;
}

function polyscanAddr(addr: string): string {
  return `https://polygonscan.com/address/${addr}`;
}

function polymarketUrl(slug: string): string {
  return `https://polymarket.com/event/${slug}`;
}

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────
export default function PolymarketPage() {
  const [data, setData] = useState<PMData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"markets" | "whales" | "convergence" | "bets">("markets");
  const [expandedMarket, setExpandedMarket] = useState<string | null>(null);
  const [expandedWhale, setExpandedWhale] = useState<string | null>(null);
  const [bets, setBets] = useState<PMBetsResponse | null>(null);
  // Tag/category filter — null = "all categories". Selecting one or more
  // chips narrows the markets list to events tagged with any of those tags.
  const [tagFilter, setTagFilter] = useState<Set<string> | null>(null);
  // Cache of fetched full-portfolio data per whale (only fetched on expand
  // so we don't hammer the polymarket API on page load).
  const [fullPositions, setFullPositions] = useState<Record<string, PMFullPositionsResponse | "loading" | "error">>({});

  async function loadFullPositions(addr: string) {
    if (fullPositions[addr]) return; // already cached or in-flight
    setFullPositions((prev) => ({ ...prev, [addr]: "loading" }));
    try {
      const res = await fetch(`${API}/api/polymarket/positions/${addr}`);
      if (!res.ok) throw new Error(`api ${res.status}`);
      const json = (await res.json()) as PMFullPositionsResponse;
      setFullPositions((prev) => ({ ...prev, [addr]: json }));
    } catch {
      setFullPositions((prev) => ({ ...prev, [addr]: "error" }));
    }
  }

  useEffect(() => {
    fetch(`${API}/api/polymarket/discovery/latest`, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(`API ${r.status}`);
        return r.json();
      })
      .then((d: PMData) => setData(d))
      .catch((e) => setError(e.message || "Failed to load Polymarket data"))
      .finally(() => setLoading(false));

    // Load AION paper bets (top 10 dry-run picks). Non-fatal — bets tab
    // just shows empty state if the endpoint is missing or returns nothing.
    fetch(`${API}/api/polymarket/bets`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((b: PMBetsResponse | null) => {
        if (b && b.bets) setBets(b);
      })
      .catch(() => {
        /* silent */
      });
  }, []);

  if (loading) {
    return (
      <div className="glass-bg min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="glass-card p-8 text-center text-foreground/60 text-sm">
            <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-3 text-primary" />
            Loading Polymarket discovery...
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-bg min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="glass-card p-8 text-center text-destructive text-sm">
            {error || "No Polymarket data available yet."}
          </div>
        </div>
      </div>
    );
  }

  const { funnel, markets, hot_markets, whales, convergence, credits, timestamp } = data;

  // Build canonical-category counts across this run. Each market counts
  // once per unique canonical category its raw tags resolve to, so markets
  // don't double-count just because they carry "Politics" AND "Trump".
  const categoryCounts = new Map<string, number>();
  for (const m of markets) {
    // Array.from keeps us compatible with the project's existing
    // downlevelIteration-off setting.
    Array.from(marketCategoryKeys(m.tags)).forEach((key) => {
      categoryCounts.set(key, (categoryCounts.get(key) || 0) + 1);
    });
  }
  // Keep category order stable (matches CATEGORY_GROUPS definition order),
  // then append any stray keys (e.g. "other") at the end.
  const canonicalOrder = [...CATEGORY_GROUPS.map((g) => g.key), "other"];
  const allCategoryKeys = canonicalOrder.filter((k) => categoryCounts.has(k));
  const categoryLabel = (key: string) => {
    const g = CATEGORY_GROUPS.find((x) => x.key === key);
    if (g) return { label: g.label, emoji: g.emoji };
    return { label: "Other", emoji: "❓" };
  };

  // Apply category filter. `tagFilter` now holds canonical keys, not raw tags.
  const visibleMarkets =
    tagFilter === null
      ? markets
      : markets.filter((m) => {
          const keys = Array.from(marketCategoryKeys(m.tags));
          return keys.some((k) => tagFilter.has(k));
        });

  return (
    <div className="glass-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* ── Hero ── */}
        <div className="glass-card p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-[10px] font-mono font-bold tracking-wider text-primary bg-primary/20 border border-primary/40 px-2 py-0.5 rounded">
                POLYMARKET
              </span>
              <span className="text-[10px] font-mono font-bold tracking-wider text-accent bg-accent/20 border border-accent/40 px-2 py-0.5 rounded">
                NEW
              </span>
              <span className="text-[10px] text-foreground/55 font-semibold">
                Updated {fmtRelTime(timestamp)}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3">
              Prediction Market Intelligence
            </h1>
            <p className="text-foreground/70 max-w-2xl leading-relaxed text-sm font-medium mb-5">
              Same smart-money discovery playbook as memecoins — now applied to Polymarket. We scan the
              hottest prediction markets, extract top holders, grade them, and flag wallets appearing across
              multiple bets.
            </p>

            {/* Funnel */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
              <FunnelStep label="Markets scanned" value={funnel.scanned_markets} icon={<Layers className="h-3.5 w-3.5" />} />
              <FunnelStep label="Deep dive" value={funnel.deep_dive_markets} icon={<TrendingUp className="h-3.5 w-3.5" />} />
              <FunnelStep label="Unique whales" value={funnel.unique_whales} icon={<Users className="h-3.5 w-3.5" />} />
              <FunnelStep label="Graded S/A/B" value={funnel.graded_whales} icon={<Zap className="h-3.5 w-3.5" />} />
              <FunnelStep label="Convergence" value={funnel.convergence_whales} icon={<Zap className="h-3.5 w-3.5" />} highlight />
              <FunnelStep label="Credits used" value={credits.used} mono />
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex items-center gap-2 flex-wrap">
          <TabButton active={tab === "markets"} onClick={() => setTab("markets")} label={`Markets (${markets.length})`} />
          <TabButton active={tab === "whales"} onClick={() => setTab("whales")} label={`Whales (${whales.length})`} />
          <TabButton active={tab === "convergence"} onClick={() => setTab("convergence")} label={`Convergence (${convergence.length})`} highlight />
          {bets && bets.bets.length > 0 && (
            <TabButton
              active={tab === "bets"}
              onClick={() => setTab("bets")}
              label={`AION Paper Bets (${bets.bets.length})`}
              highlight
            />
          )}
        </div>

        {/* ── Markets tab ── */}
        {tab === "markets" && (
          <div className="space-y-4">
            {/* Methodology / explainer card */}
            <div className="glass-card p-4 flex items-start gap-3 text-[12px] text-foreground/75 leading-relaxed">
              <Info className="h-4 w-4 text-foreground/55 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-bold text-foreground/85 text-xs mb-1">How markets are scored</div>
                <p>
                  We pull the top live markets from Polymarket sorted by 24h volume,
                  filter out closed/resolved bets, and deep-dive the busiest{" "}
                  <span className="font-bold text-foreground/85">{funnel.deep_dive_markets}</span>{" "}
                  to extract their top holders and recent trade flow. Every other market
                  is shown but only the deep-dives have the holder/trade detail.
                </p>
              </div>
            </div>

            {/* Canonical category filter chips */}
            {allCategoryKeys.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/45 inline-flex items-center gap-1">
                  <Filter className="h-3 w-3" /> Category
                </span>
                <button
                  type="button"
                  onClick={() => setTagFilter(null)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[11px] font-bold transition-colors",
                    tagFilter === null
                      ? "bg-primary/25 border-primary/55 text-foreground"
                      : "bg-foreground/5 border-foreground/15 text-foreground/65 hover:bg-foreground/10",
                  )}
                >
                  All ({markets.length})
                </button>
                {allCategoryKeys.map((key) => {
                  const active = tagFilter !== null && tagFilter.has(key);
                  const { label, emoji } = categoryLabel(key);
                  const count = categoryCounts.get(key) || 0;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setTagFilter((prev) => {
                          if (prev === null) return new Set([key]);
                          const next = new Set(prev);
                          if (next.has(key)) next.delete(key);
                          else next.add(key);
                          return next.size === 0 ? null : next;
                        });
                      }}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[11px] font-bold transition-colors inline-flex items-center gap-1.5",
                        active
                          ? "bg-primary/25 border-primary/55 text-foreground"
                          : "bg-foreground/5 border-foreground/15 text-foreground/65 hover:bg-foreground/10",
                      )}
                    >
                      <span>{emoji}</span>
                      <span>{label}</span>
                      <span className="text-foreground/40">({count})</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="text-[11px] text-foreground/55 font-medium">
              Sorted by 24h volume. Showing{" "}
              <span className="text-foreground/80 font-bold">{visibleMarkets.length}</span>{" "}
              of {markets.length} markets · {hot_markets.length} are deep-dived with whale
              positions + recent trades.
            </div>
            <div className="space-y-3">
              {visibleMarkets.map((m) => {
                const isHot = hot_markets.find((h) => h.market_id === m.market_id);
                const expanded = expandedMarket === m.market_id;
                return (
                  <div key={m.market_id} className="glass-card p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {isHot && (
                            <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full border bg-accent/25 text-accent border-accent/50">
                              DEEP DIVE
                            </span>
                          )}
                          {Array.from(marketCategoryKeys(m.tags)).slice(0, 3).map((key) => {
                            const { label, emoji } = categoryLabel(key);
                            return (
                              <span key={key} className="text-[9px] font-semibold text-foreground/60 bg-foreground/5 border border-foreground/10 px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                                <span>{emoji}</span>
                                <span>{label}</span>
                              </span>
                            );
                          })}
                        </div>
                        <h3 className="text-base font-bold text-foreground leading-tight mb-3">
                          {m.question}
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <Metric label="24h vol" value={fmtCompact(m.volume_24hr)} />
                          <Metric label="Liquidity" value={fmtCompact(m.liquidity)} />
                          <Metric label="Implied prob" value={`${(m.implied_prob * 100).toFixed(1)}%`} />
                          <Metric label="24h traders" value={m.unique_traders_24h.toLocaleString()} />
                        </div>
                      </div>
                      <a
                        href={polymarketUrl(m.slug)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold text-primary hover:text-primary/80 flex items-center gap-1 flex-shrink-0"
                      >
                        Open <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>

                    {isHot && (
                      <>
                        <button
                          onClick={() => setExpandedMarket(expanded ? null : m.market_id)}
                          className="mt-4 text-[11px] font-bold text-primary hover:text-primary/80 transition-colors"
                        >
                          {expanded ? "Hide" : "Show"} top holders + recent trades →
                        </button>
                        {expanded && <HotMarketDetail market={isHot} />}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Whales tab ── */}
        {tab === "whales" && (
          <div className="space-y-3">
            <div className="glass-card p-4 flex items-start gap-3 text-[12px] text-foreground/75 leading-relaxed">
              <Info className="h-4 w-4 text-foreground/55 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-bold text-foreground/85 text-xs mb-1">How whales are found</div>
                <p>
                  Every wallet that shows up as a top holder in any of the{" "}
                  <span className="font-bold text-foreground/85">{funnel.deep_dive_markets}</span>{" "}
                  deep-dived markets is captured. We then grade each one with a 0-100
                  score from three signals: <span className="font-bold text-foreground/85">position size</span>{" "}
                  (how much capital is on the line), <span className="font-bold text-foreground/85">unrealized
                  PnL</span> (how the open positions are performing), and{" "}
                  <span className="font-bold text-foreground/85">breadth</span> (how many
                  markets they&apos;re active in). Grades S/A/B = high conviction; C/D = noise.
                  The expanded list below shows the markets we observed them in <em>this run</em> —
                  not necessarily their entire portfolio.
                </p>
              </div>
            </div>
            <div className="text-[11px] text-foreground/55 font-medium">
              All unique whales found across deep-dived markets, graded by position size + unrealized PnL + breadth.
            </div>
            {whales.map((w) => {
              const expanded = expandedWhale === w.owner_address;
              return (
                <div key={w.owner_address} className="glass-card p-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <GradeBadge grade={w.grade} />
                    <a
                      href={polyscanAddr(w.owner_address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      {truncAddr(w.owner_address, 6)}
                    </a>
                    <CopyButton text={w.owner_address} />
                    <div className="flex-1" />
                    <Metric label="Position" value={fmtCompact(w.total_position_usd)} />
                    <Metric
                      label="Unrealized"
                      value={fmtCompact(w.total_unrealized_pnl)}
                      color={w.total_unrealized_pnl >= 0 ? "text-primary" : "text-destructive"}
                    />
                    <Metric label="Markets" value={String(w.position_count)} />
                    <button
                      onClick={() => {
                        const next = expanded ? null : w.owner_address;
                        setExpandedWhale(next);
                        // Polymarket data-api keys positions by the proxy
                        // wallet, not the EOA owner. Fall back to owner if
                        // proxy wasn't captured (older snapshots).
                        const fetchAddr = w.proxy_wallet || w.owner_address;
                        if (next) loadFullPositions(fetchAddr);
                      }}
                      className="text-[11px] font-bold text-primary hover:text-primary/80 transition-colors"
                    >
                      {expanded ? "Hide" : "Show full book"} →
                    </button>
                  </div>
                  {expanded && (
                    <WhaleExpanded
                      walletAddress={w.owner_address}
                      deepDiveMatches={w.markets}
                      fullState={fullPositions[w.proxy_wallet || w.owner_address]}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Convergence tab ── */}
        {tab === "convergence" && (
          <div className="space-y-3">
            <div className="glass-card p-4 flex items-start gap-3 text-[12px] text-foreground/75 leading-relaxed">
              <Info className="h-4 w-4 text-foreground/55 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-bold text-foreground/85 text-xs mb-1">How convergence works</div>
                <p>
                  Convergence wallets are addresses that appear as top holders in{" "}
                  <span className="font-bold text-foreground/85">two or more</span> of the
                  deep-dived markets in the same run. The reasoning: if a wallet is
                  betting big on multiple separate questions, they&apos;re running a portfolio,
                  not making a one-off gut call — that&apos;s the same insight the token side of
                  AION uses for &quot;smart money consensus&quot;. The more markets they show up in,
                  the stronger the signal.
                </p>
              </div>
            </div>
            <div className="text-[11px] text-foreground/55 font-medium">
              Wallets appearing as top holders in ≥2 hot markets — these are systematic traders, not one-off gamblers.
            </div>
            {convergence.length === 0 ? (
              <div className="glass-card p-8 text-center text-sm text-foreground/60">
                No convergence signals in this run. Run a fresh scan or expand the deep-dive count.
              </div>
            ) : (
              convergence.map((w) => (
                <div key={w.owner_address} className="glass-card p-4 ring-1 ring-accent/30">
                  <div className="flex items-center gap-3 flex-wrap mb-3">
                    <GradeBadge grade={w.grade} />
                    <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full border bg-accent/25 text-accent border-accent/50">
                      CONVERGENCE × {w.position_count}
                    </span>
                    <a
                      href={polyscanAddr(w.owner_address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      {truncAddr(w.owner_address, 6)}
                    </a>
                    <CopyButton text={w.owner_address} />
                    <div className="flex-1" />
                    <Metric label="Total" value={fmtCompact(w.total_position_usd)} />
                    <Metric
                      label="Unrealized"
                      value={fmtCompact(w.total_unrealized_pnl)}
                      color={w.total_unrealized_pnl >= 0 ? "text-primary" : "text-destructive"}
                    />
                  </div>
                  <div className="pt-3 border-t border-foreground/10 space-y-2">
                    {w.markets.map((wm, i) => (
                      <div key={i} className="text-xs text-foreground/75 flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-foreground">{wm.question}</span>
                          <span
                            className={cn(
                              "ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded",
                              wm.side === "Yes"
                                ? "bg-primary/20 text-primary"
                                : "bg-destructive/20 text-destructive"
                            )}
                          >
                            {wm.side.toUpperCase()}
                          </span>
                        </div>
                        <div className="font-mono tabular-nums">{fmtCompact(wm.position_usd)}</div>
                        <div className={cn(
                          "font-mono tabular-nums text-[11px]",
                          wm.unrealized_pnl_usd >= 0 ? "text-primary" : "text-destructive"
                        )}>
                          {wm.unrealized_pnl_usd >= 0 ? "+" : ""}{fmtCompact(wm.unrealized_pnl_usd)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── AION Paper Bets tab ── */}
        {tab === "bets" && bets && (
          <div className="space-y-4">
            <div className="glass-card p-4 flex items-start gap-3 text-[12px] text-foreground/75 leading-relaxed">
              <Info className="h-4 w-4 text-foreground/55 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-bold text-foreground/85 text-xs mb-1">How AION picks bets</div>
                <p>
                  For each deep-dived market, AION splits top holders by YES/NO side and scores each
                  side by position size weighted by unrealized PnL (winning whales = stronger signal),
                  then blends in recent trade flow. The 10 markets with the highest conviction delta
                  get a <span className="font-bold text-foreground/85">$100 dry-run paper bet</span>{" "}
                  on the winning side. Mark-to-market updates on every Polymarket scan.
                </p>
              </div>
            </div>

            {/* Summary tiles */}
            <div className="grid grid-cols-3 gap-3 max-w-md">
              <div className="rounded-xl border border-foreground/15 bg-foreground/[0.05] p-3">
                <div className="text-2xl font-bold text-foreground font-mono tabular-nums">
                  {bets.bets.length}
                </div>
                <div className="text-[10px] text-foreground/60 font-bold tracking-wider">BETS OPEN</div>
              </div>
              <div className="rounded-xl border border-foreground/15 bg-foreground/[0.05] p-3">
                <div className="text-2xl font-bold text-foreground font-mono tabular-nums">
                  ${bets.total_size_usd.toFixed(0)}
                </div>
                <div className="text-[10px] text-foreground/60 font-bold tracking-wider">TOTAL STAKED</div>
              </div>
              <div
                className={cn(
                  "rounded-xl border p-3",
                  bets.total_pnl_usd >= 0
                    ? "border-primary/40 bg-primary/10"
                    : "border-destructive/40 bg-destructive/10"
                )}
              >
                <div
                  className={cn(
                    "text-2xl font-bold font-mono tabular-nums",
                    bets.total_pnl_usd >= 0 ? "text-primary" : "text-destructive"
                  )}
                >
                  {bets.total_pnl_usd >= 0 ? "+" : ""}
                  ${bets.total_pnl_usd.toFixed(2)}
                </div>
                <div className="text-[10px] text-foreground/60 font-bold tracking-wider">UNREALIZED P/L</div>
              </div>
            </div>

            {/* Bets list */}
            <div className="space-y-2">
              {bets.bets.map((b) => (
                <div key={b.market_id} className="glass-card p-4">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-foreground/50">
                      #{b.rank}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full border",
                        b.side === "yes"
                          ? "bg-primary/20 text-primary border-primary/50"
                          : "bg-destructive/20 text-destructive border-destructive/50"
                      )}
                    >
                      {b.side.toUpperCase()} @ {(b.entry_price * 100).toFixed(1)}¢
                    </span>
                    <a
                      href={polymarketUrl(b.slug)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-foreground hover:text-primary transition-colors flex-1 min-w-0 truncate flex items-center gap-1"
                    >
                      {b.question}
                      <ExternalLink className="h-3 w-3 flex-shrink-0 text-foreground/40" />
                    </a>
                    <div className="text-right">
                      <div
                        className={cn(
                          "text-sm font-mono font-bold tabular-nums",
                          b.pnl_usd >= 0 ? "text-primary" : "text-destructive"
                        )}
                      >
                        {b.pnl_usd >= 0 ? "+" : ""}${b.pnl_usd.toFixed(2)}
                      </div>
                      <div
                        className={cn(
                          "text-[10px] font-mono font-medium tabular-nums",
                          b.pnl_pct >= 0 ? "text-primary/70" : "text-destructive/70"
                        )}
                      >
                        {b.pnl_pct >= 0 ? "+" : ""}
                        {b.pnl_pct.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-foreground/10 grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px] text-foreground/60 font-mono">
                    <div>
                      <div className="text-foreground/40 text-[9px] font-bold tracking-wider">ENTRY</div>
                      <div className="text-foreground/80">{(b.entry_price * 100).toFixed(1)}¢</div>
                    </div>
                    <div>
                      <div className="text-foreground/40 text-[9px] font-bold tracking-wider">CURRENT</div>
                      <div className="text-foreground/80">{(b.current_price * 100).toFixed(1)}¢</div>
                    </div>
                    <div>
                      <div className="text-foreground/40 text-[9px] font-bold tracking-wider">SHARES</div>
                      <div className="text-foreground/80">{b.shares.toFixed(0)}</div>
                    </div>
                    <div>
                      <div className="text-foreground/40 text-[9px] font-bold tracking-wider">WEEK VOL</div>
                      <div className="text-foreground/80">${(b.volume_1wk / 1000).toFixed(0)}k</div>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-foreground/10 text-[11px] text-foreground/60 leading-relaxed">
                    <span className="font-bold text-foreground/75">AI reasoning:</span> {b.reasoning}
                  </div>
                </div>
              ))}
            </div>

            {bets.updated_at && (
              <div className="text-[10px] text-foreground/40 font-mono text-right">
                Bets opened {fmtRelTime(bets.updated_at)}
              </div>
            )}
          </div>
        )}

        {/* ── Footer info ── */}
        <div className="glass-card p-5 text-[11px] text-foreground/60 leading-relaxed space-y-2">
          <div className="font-bold text-foreground/80 text-xs mb-1">How this works</div>
          <div>
            1. <span className="font-mono text-primary">nansen research prediction-market market-screener</span> — pulls top markets by 24h volume (1 cr)
          </div>
          <div>
            2. <span className="font-mono text-primary">top-holders</span> × {funnel.deep_dive_markets} deep-dive markets (5 cr each = {funnel.deep_dive_markets * 5} cr)
          </div>
          <div>
            3. <span className="font-mono text-primary">trades-by-market</span> × {funnel.deep_dive_markets} for recent flow (1 cr each = {funnel.deep_dive_markets} cr)
          </div>
          <div>
            4. Local grading + convergence detection (0 cr)
          </div>
          <div className="pt-2 text-foreground/50">
            Total: <span className="font-mono font-bold text-foreground/70">{credits.used}</span> credits per run.
            Default cadence: <span className="font-mono font-bold text-foreground/70">every 6h</span> (on-demand for now).
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Subcomponents
// ─────────────────────────────────────────────
function FunnelStep({
  label,
  value,
  icon,
  highlight,
  mono,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
  highlight?: boolean;
  mono?: boolean;
}) {
  return (
    <div className={cn(
      "rounded-xl border p-3",
      highlight
        ? "border-accent/50 bg-accent/15"
        : "border-foreground/15 bg-foreground/5"
    )}>
      <div className="flex items-center gap-1.5 mb-1">
        {icon && <span className={highlight ? "text-accent" : "text-foreground/50"}>{icon}</span>}
        <div className={cn(
          "text-[9px] font-bold tracking-wider",
          highlight ? "text-accent/90" : "text-foreground/55"
        )}>
          {label.toUpperCase()}
        </div>
      </div>
      <div className={cn(
        "text-xl font-bold tabular-nums",
        mono && "font-mono",
        highlight ? "text-accent" : "text-foreground"
      )}>
        {value}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  highlight,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-xs font-bold tracking-wide rounded-full border transition-colors",
        active
          ? highlight
            ? "bg-accent text-background border-accent"
            : "bg-foreground text-background border-foreground"
          : "bg-foreground/5 text-foreground/70 border-foreground/15 hover:bg-foreground/10 hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}

function Metric({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div>
      <div className="text-[9px] font-bold tracking-wider text-foreground/50 uppercase">{label}</div>
      <div className={cn("text-sm font-bold font-mono tabular-nums", color || "text-foreground")}>
        {value}
      </div>
    </div>
  );
}

/**
 * WhaleExpanded — body that appears under a whale row when expanded.
 * Renders the on-demand full position book if it has loaded, otherwise
 * falls back to the deep-dive matches from the discovery snapshot.
 */
function WhaleExpanded({
  walletAddress,
  deepDiveMatches,
  fullState,
}: {
  walletAddress: string;
  deepDiveMatches: PMWhaleMarket[];
  fullState: PMFullPositionsResponse | "loading" | "error" | undefined;
}) {
  if (fullState === "loading") {
    return (
      <div className="mt-3 pt-3 border-t border-foreground/10 text-[11px] text-foreground/55 flex items-center gap-2">
        <RefreshCw className="h-3 w-3 animate-spin" /> Loading full position book…
      </div>
    );
  }

  const hasFull = fullState && typeof fullState !== "string" && fullState.positions.length > 0;
  const list: PMWhaleMarket[] = hasFull ? fullState.positions : deepDiveMatches;

  return (
    <div className="mt-3 pt-3 border-t border-foreground/10 space-y-2">
      <div className="text-[10px] font-bold uppercase tracking-wider text-foreground/45 flex items-center gap-2">
        {hasFull ? (
          <>Full active book · {list.length} positions</>
        ) : fullState === "error" ? (
          <>Couldn&apos;t load full book — showing deep-dive matches only</>
        ) : (
          <>Deep-dive matches · {list.length} positions (expand to load full book)</>
        )}
      </div>
      {list.map((wm, i) => (
        <div key={`${walletAddress}-${i}`} className="text-xs text-foreground/75 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-foreground">{wm.question || "(unknown market)"}</span>
            {wm.side && (
              <span
                className={cn(
                  "ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded",
                  wm.side.toLowerCase().startsWith("y")
                    ? "bg-primary/20 text-primary"
                    : "bg-destructive/20 text-destructive",
                )}
              >
                {wm.side.toUpperCase()}
              </span>
            )}
          </div>
          <div className="font-mono tabular-nums" title="Position size in USD">
            {fmtCompact(wm.position_usd)}
          </div>
          <div
            className={cn(
              "font-mono tabular-nums text-[11px]",
              wm.unrealized_pnl_usd >= 0 ? "text-primary" : "text-destructive",
            )}
            title="Unrealized PnL"
          >
            {wm.unrealized_pnl_usd >= 0 ? "+" : ""}
            {fmtCompact(wm.unrealized_pnl_usd)}
          </div>
        </div>
      ))}
    </div>
  );
}

function HotMarketDetail({ market }: { market: PMHotMarket }) {
  return (
    <div className="mt-4 pt-4 border-t border-foreground/10 space-y-4">
      {/* Top holders */}
      <div>
        <div className="text-[10px] font-bold tracking-wider text-foreground/60 mb-2">
          TOP HOLDERS ({market.top_holders.length})
        </div>
        {/* Column headers — without these the right-side numbers were
            ambiguous (size? PnL? both?), which is what the user flagged. */}
        <div className="flex items-center gap-3 px-3 pb-1.5 text-[9px] font-bold uppercase tracking-wider text-foreground/40">
          <span className="w-5">#</span>
          <span className="w-[88px]">Wallet</span>
          <span className="w-12">Side</span>
          <div className="flex-1" />
          <span className="text-right">Position size</span>
          <span className="w-20 text-right">Unrealized PnL</span>
        </div>
        <div className="space-y-1.5">
          {market.top_holders.slice(0, 10).map((h, i) => (
            <div key={i} className="flex items-center gap-3 text-xs bg-foreground/5 rounded-lg px-3 py-2">
              <span className="text-foreground/40 font-mono w-5">{i + 1}</span>
              <a
                href={polyscanAddr(h.owner_address)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-foreground hover:text-primary transition-colors w-[88px]"
              >
                {truncAddr(h.owner_address, 5)}
              </a>
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded w-12 text-center",
                h.side === "Yes" ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"
              )}>
                {h.side.toUpperCase()}
              </span>
              <div className="flex-1" />
              <span
                title="Total USD value of this wallet's open position in this market"
                className="font-mono tabular-nums font-semibold"
              >
                {fmtCompact(h.position_usd)}
              </span>
              <span
                title="Mark-to-market PnL on the open position (unrealized)"
                className={cn(
                "font-mono tabular-nums text-[11px] w-20 text-right",
                h.unrealized_pnl_usd >= 0 ? "text-primary" : "text-destructive"
              )}>
                {h.unrealized_pnl_usd >= 0 ? "+" : ""}{fmtCompact(h.unrealized_pnl_usd)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent trades */}
      <div>
        <div className="text-[10px] font-bold tracking-wider text-foreground/60 mb-2">
          RECENT TRADES ({market.recent_trades.length})
        </div>
        <div className="space-y-1.5">
          {market.recent_trades.slice(0, 10).map((t, i) => (
            <div key={i} className="flex items-center gap-3 text-xs bg-foreground/5 rounded-lg px-3 py-2">
              <span className="text-foreground/40 font-mono text-[10px] w-16">{fmtRelTime(t.timestamp)}</span>
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded",
                t.taker_action === "buy" ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"
              )}>
                {t.taker_action.toUpperCase()} {t.side}
              </span>
              <span className="text-foreground/60 font-mono text-[10px]">
                @ {(t.price * 100).toFixed(1)}¢
              </span>
              <div className="flex-1" />
              <span className="font-mono tabular-nums font-semibold">
                {fmtUsd(t.usdc_value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
