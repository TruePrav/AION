"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Brain, ChevronDown, ChevronUp, Shield, TrendingUp, Target, BarChart3, Lightbulb, Flame, Crown, MessageCircle, Heart, Repeat2, Eye, Clock, Terminal, CheckCircle2, Loader2 } from "lucide-react";
import type { PanelResult, PersonaSignal } from "@/lib/personas";

/** Format ISO timestamp to relative time (e.g. "2h ago") */
function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/** Map persona name to icon + color theme */
const PERSONA_META: Record<string, { icon: typeof Brain; color: string; initials: string }> = {
  "Warren Buffett":       { icon: Shield,      color: "text-blue-400",    initials: "WB" },
  "Michael Burry":        { icon: Target,      color: "text-red-400",     initials: "MB" },
  "Stanley Druckenmiller": { icon: TrendingUp, color: "text-emerald-400", initials: "SD" },
  "Aswath Damodaran":     { icon: BarChart3,   color: "text-purple-400",  initials: "AD" },
  "Cathie Wood":          { icon: Lightbulb,   color: "text-pink-400",    initials: "CW" },
  "Bill Ackman":          { icon: Flame,        color: "text-orange-400",  initials: "BA" },
  "Rakesh Jhunjhunwala":  { icon: Crown,        color: "text-yellow-400",  initials: "RJ" },
};

function SignalBadge({ signal }: { signal: "BUY" | "HOLD" | "PASS" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        signal === "BUY"  && "bg-profit/20 border border-profit/40 text-profit",
        signal === "HOLD" && "bg-accent/20 border border-accent/40 text-accent",
        signal === "PASS" && "bg-destructive/20 border border-destructive/40 text-destructive",
      )}
    >
      {signal}
    </span>
  );
}

function ConvictionBar({ value }: { value: number }) {
  const pct = Math.min(value, 10) * 10;
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1.5 w-16 rounded-full bg-foreground/10 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            value >= 7 ? "bg-profit" : value >= 4 ? "bg-accent" : "bg-destructive",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] font-mono font-bold text-foreground/60 tabular-nums">{value}/10</span>
    </div>
  );
}

/** Terminal-style loading steps */
const LOADING_STEPS = [
  { label: "Connecting to AION research pipeline", delay: 600 },
  { label: "Fetching on-chain accumulation data (Nansen)", delay: 1200 },
  { label: "Pulling smart money wallet profiles", delay: 900 },
  { label: "Loading market data from CoinGecko", delay: 1100 },
  { label: "Scanning contract security via GoPlus", delay: 1000 },
  { label: "Checking DEX liquidity on DexScreener", delay: 800 },
  { label: "Fetching protocol TVL from DefiLlama", delay: 900 },
  { label: "Checking GitHub developer activity", delay: 800 },
  { label: "Scanning X/Twitter sentiment (1 recent post — demo limit)", delay: 1100 },
  { label: "Mapping converging smart money wallets", delay: 700 },
  { label: "Building investor briefing document", delay: 600 },
  { label: "Running 7 investor personas via Claude Haiku (demo)", delay: 1200 },
  { label: "Panel deliberating final verdict", delay: 1500 },
];

function TerminalLoader({ symbol }: { symbol: string }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentStep >= LOADING_STEPS.length) return;

    const timer = setTimeout(() => {
      setCompletedSteps((prev) => [...prev, currentStep]);
      setCurrentStep((prev) => prev + 1);
    }, LOADING_STEPS[currentStep].delay);

    return () => clearTimeout(timer);
  }, [currentStep]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentStep]);

  return (
    <div className="rounded-lg bg-[#0a0a0f] border border-foreground/10 overflow-hidden">
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-foreground/[0.04] border-b border-foreground/10">
        <Terminal className="h-3 w-3 text-primary" />
        <span className="text-[10px] font-mono font-semibold text-foreground/50">
          aion research — {symbol}
        </span>
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-red-500/60" />
          <div className="h-2 w-2 rounded-full bg-yellow-500/60" />
          <div className="h-2 w-2 rounded-full bg-green-500/60" />
        </div>
      </div>

      {/* Terminal body */}
      <div ref={scrollRef} className="px-3 py-2.5 max-h-[260px] overflow-y-auto space-y-0.5 scrollbar-thin">
        {LOADING_STEPS.map((step, i) => {
          const isCompleted = completedSteps.includes(i);
          const isActive = i === currentStep;
          const isVisible = i <= currentStep;

          if (!isVisible) return null;

          return (
            <div
              key={i}
              className={cn(
                "flex items-center gap-2 font-mono text-[11px] leading-relaxed transition-opacity duration-200",
                isCompleted ? "opacity-60" : "opacity-100",
              )}
            >
              {isCompleted ? (
                <CheckCircle2 className="h-3 w-3 text-profit flex-shrink-0" />
              ) : isActive ? (
                <Loader2 className="h-3 w-3 text-primary flex-shrink-0 animate-spin" />
              ) : null}
              <span className={cn(
                isCompleted ? "text-foreground/40" : "text-foreground/80",
              )}>
                <span className="text-primary/60">$</span> {step.label}
              </span>
              {isCompleted && (
                <span className="text-profit/60 text-[9px]">done</span>
              )}
            </div>
          );
        })}

        {/* Blinking cursor at the end */}
        {currentStep < LOADING_STEPS.length && (
          <div className="h-3 flex items-center">
            <span className="inline-block w-1.5 h-3 bg-primary/70 animate-pulse" />
          </div>
        )}

        {/* All done — waiting for response */}
        {currentStep >= LOADING_STEPS.length && (
          <div className="flex items-center gap-2 font-mono text-[11px] text-primary pt-1">
            <div className="h-3 w-3 rounded-full border border-primary/40 border-t-primary animate-spin flex-shrink-0" />
            <span>Generating panel verdict...</span>
            <span className="inline-block w-1.5 h-3 bg-primary/70 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}

function PersonaCard({ signal }: { signal: PersonaSignal }) {
  const [cardExpanded, setCardExpanded] = useState(false);
  const meta = PERSONA_META[signal.persona] ?? { icon: Brain, color: "text-foreground/60", initials: "??" };
  const Icon = meta.icon;

  return (
    <div
      className="flex items-start gap-2.5 rounded-lg bg-foreground/[0.03] border border-foreground/10 px-3 py-2.5 hover:bg-foreground/[0.06] transition-colors cursor-pointer"
      onClick={(e) => { e.stopPropagation(); setCardExpanded(!cardExpanded); }}
    >
      {/* Avatar */}
      <div className={cn("flex items-center justify-center h-8 w-8 rounded-lg bg-foreground/5 border border-foreground/15 flex-shrink-0", meta.color)}>
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-foreground truncate">{signal.persona}</span>
          <div className="flex items-center gap-1.5">
            <SignalBadge signal={signal.signal} />
            {cardExpanded ? <ChevronUp className="h-3 w-3 text-foreground/40" /> : <ChevronDown className="h-3 w-3 text-foreground/40" />}
          </div>
        </div>
        <ConvictionBar value={signal.conviction} />
        <p className={cn("text-[11px] text-foreground/65 leading-relaxed", !cardExpanded && "line-clamp-2")}>{signal.reason}</p>
      </div>
    </div>
  );
}

interface PersonaPanelProps {
  token: {
    symbol: string;
    address?: string;
    chain: string;
    market_cap: number;
    token_age_days: number;
    trader_count: number;
    net_flow_7d: number;
    net_flow_24h?: number;
    net_flow_30d?: number;
    accumulation_grade: string;
    accumulation_score: number;
    tier: string;
    sectors?: string[];
  };
}

export default function PersonaPanel({ token }: PersonaPanelProps) {
  const [result, setResult] = useState<PanelResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingCache, setCheckingCache] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [cachedAt, setCachedAt] = useState<string | null>(null);

  // Auto-check for cached results on mount / token change
  useEffect(() => {
    let cancelled = false;
    setResult(null);
    setCachedAt(null);
    setCheckingCache(true);
    setError(null);

    async function checkCache() {
      try {
        const res = await fetch("/api/personas/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, cacheOnly: true }),
        });
        if (!res.ok) { setCheckingCache(false); return; }
        const data = await res.json();
        if (!cancelled && data.cached && data.result) {
          setResult(data.result);
          setCachedAt(data.cached_at || null);
        }
      } catch {
        // Silently fail — just show the button
      } finally {
        if (!cancelled) setCheckingCache(false);
      }
    }

    checkCache();
    return () => { cancelled = true; };
  }, [token.symbol, token.chain]);

  async function runAnalysis() {
    setLoading(true);
    setError(null);
    setCachedAt(null);
    try {
      const res = await fetch("/api/personas/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Use friendly message from backend if available
        throw new Error(data.message || data.error || "Analysis failed");
      }
      setResult(data.result);
      if (data.cached) setCachedAt(data.cached_at || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sm:col-span-3 pt-4 mt-2 border-t border-foreground/10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-semibold text-foreground/50 uppercase tracking-wider">
            Investor Persona Panel
          </span>
          {result && (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
                result.approved
                  ? "bg-profit/20 border border-profit/40 text-profit"
                  : "bg-destructive/20 border border-destructive/40 text-destructive",
              )}
            >
              {result.approved ? "APPROVED" : "REJECTED"} ({result.buyVotes}/7 BUY)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {result && cachedAt && (
            <span className="text-[9px] text-foreground/30 font-mono">
              cached {timeAgo(cachedAt)}
            </span>
          )}
          {result && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
              className="inline-flex items-center gap-1 text-[10px] text-foreground/50 hover:text-foreground transition-colors"
            >
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {expanded ? "Collapse" : "Expand"}
            </button>
          )}
        </div>
      </div>

      {/* Checking cache indicator */}
      {checkingCache && !result && !loading && (
        <div className="flex items-center justify-center gap-2 py-4">
          <div className="h-3 w-3 rounded-full border-2 border-foreground/20 border-t-primary animate-spin" />
          <span className="text-[11px] text-foreground/40 font-mono">checking for recent analysis...</span>
        </div>
      )}

      {/* Run Analysis CTA */}
      {!result && !loading && !checkingCache && (
        <div className="flex flex-col items-center gap-3 py-5">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); runAnalysis(); }}
            className="group relative inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <div className="absolute inset-0 rounded-xl bg-primary/20 blur-xl group-hover:blur-2xl transition-all duration-300" />
            <Brain className="h-5 w-5 relative z-10" />
            <span className="relative z-10">Run Panel Analysis</span>
            <span className="relative z-10 text-[10px] font-medium opacity-70 bg-primary-foreground/15 rounded-full px-2 py-0.5">7 investors</span>
          </button>
          <p className="text-[10px] text-foreground/35 text-center max-w-xs">
            Demo mode: Claude Haiku + 1 X/Twitter post. Clone repo for full Sonnet + unlimited X.
          </p>
        </div>
      )}

      {/* Loading state — terminal-style step-by-step */}
      {loading && <TerminalLoader symbol={token.symbol} />}

      {/* Error state */}
      {error && (
        <div className={cn(
          "rounded-lg border px-4 py-3 text-xs",
          error.includes("credits") || error.includes("exhausted")
            ? "bg-accent/10 border-accent/30 text-foreground/70"
            : error.includes("rate limit") || error.includes("wait")
              ? "bg-primary/10 border-primary/30 text-foreground/70"
              : "bg-destructive/10 border-destructive/30 text-destructive"
        )}>
          {error.includes("credits") || error.includes("exhausted") ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-base">🔋</span>
                <span className="font-semibold text-foreground">Demo AI credits temporarily exhausted</span>
              </div>
              <p className="text-foreground/50">
                Clone the repo and add your own Anthropic API key to run unlimited analyses!
              </p>
              <a
                href="https://github.com/TruePrav/AION"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
                onClick={(e) => e.stopPropagation()}
              >
                github.com/TruePrav/AION →
              </a>
            </div>
          ) : error.includes("rate limit") || error.includes("wait") ? (
            <div className="flex items-center gap-2">
              <span className="text-base">⏳</span>
              <span>Demo rate limit reached (3/min). Please wait a moment and try again.</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>Error: {error}</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); runAnalysis(); }}
                className="underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {result && expanded && (
        <div className="space-y-3">
          {/* Vote summary */}
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-profit" />
              <span className="text-foreground/60">BUY</span>
              <span className="font-bold text-foreground tabular-nums">{result.buyVotes}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <span className="text-foreground/60">HOLD</span>
              <span className="font-bold text-foreground tabular-nums">{result.holdVotes}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-destructive" />
              <span className="text-foreground/60">PASS</span>
              <span className="font-bold text-foreground tabular-nums">{result.passVotes}</span>
            </span>
          </div>

          {/* X/Twitter sentiment */}
          {result.xSentiment && result.xSentiment.raw_count > 0 && (
            <div className="rounded-lg bg-foreground/[0.03] border border-foreground/10 px-3 py-2.5">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="h-3.5 w-3.5 text-sky-400" />
                <span className="text-[10px] font-semibold text-foreground/50 uppercase tracking-wider">X/Twitter Sentiment</span>
                <span className="text-[10px] text-foreground/40">{result.xSentiment.raw_count} recent mentions</span>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-foreground/60 mb-2">
                <span className="flex items-center gap-1"><Heart className="h-3 w-3 text-pink-400" /> {result.xSentiment.total_likes.toLocaleString()}</span>
                <span className="flex items-center gap-1"><Repeat2 className="h-3 w-3 text-emerald-400" /> {result.xSentiment.total_retweets.toLocaleString()}</span>
                <span className="flex items-center gap-1"><Eye className="h-3 w-3 text-foreground/40" /> {result.xSentiment.total_views.toLocaleString()}</span>
              </div>
              {result.xSentiment.tweets.slice(0, 3).map((tw, i) => (
                <div key={i} className="text-[11px] text-foreground/60 leading-relaxed py-1.5 border-t border-foreground/5 first:border-t-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-semibold text-foreground/80">@{tw.author}</span>
                    {tw.created_at && (
                      <span className="flex items-center gap-0.5 text-foreground/30 text-[10px]">
                        <Clock className="h-2.5 w-2.5" />
                        {timeAgo(tw.created_at)}
                      </span>
                    )}
                    <span className="text-foreground/30 text-[10px]">{tw.likes} likes · {tw.retweets} RTs</span>
                  </div>
                  <span>{tw.text.length > 200 ? tw.text.slice(0, 200) + "..." : tw.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* Persona cards grid */}
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {result.signals.map((s) => (
              <PersonaCard key={s.persona} signal={s} />
            ))}
          </div>

          {/* Summary */}
          {result.summary && (
            <div className="rounded-lg bg-foreground/[0.03] border border-foreground/10 px-3 py-2.5">
              <span className="text-[10px] font-semibold text-foreground/50 uppercase tracking-wider">Panel Summary</span>
              <p className="text-xs text-foreground/75 leading-relaxed mt-1">{result.summary}</p>
            </div>
          )}

          {/* Attribution */}
          <div className="flex items-center gap-3 text-[10px] text-foreground/30 pt-1">
            <a href="https://www.coingecko.com?utm_source=aion&utm_medium=referral" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-foreground/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/coingecko-logo.svg" alt="CoinGecko" className="h-4 w-auto inline-block" />
              <span className="underline">Data powered by CoinGecko</span>
            </a>
            <span className="text-foreground/15">|</span>
            <span>Security by{" "}
              <a href="https://gopluslabs.io" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground/50">GoPlus</a>
            </span>
            <span className="text-foreground/15">|</span>
            <span>TVL by{" "}
              <a href="https://defillama.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground/50">DefiLlama</a>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
