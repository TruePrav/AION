"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Brain, ChevronDown, ChevronUp, Shield, TrendingUp, Target, BarChart3, Lightbulb, Flame, Crown, MessageCircle, Heart, Repeat2, Eye, Clock } from "lucide-react";
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
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

  async function runAnalysis() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/personas/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setResult(data.result);
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
          {!result && !loading && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); runAnalysis(); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-primary/20 border border-primary/40 text-primary hover:bg-primary/30 transition-colors"
            >
              <Brain className="h-3 w-3" />
              Run Panel Analysis
            </button>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center gap-3 py-6 justify-center">
          <div className="h-5 w-5 rounded-full border-2 border-foreground/20 border-t-primary animate-spin" />
          <span className="text-xs text-foreground/60">7 legendary investors are analyzing {token.symbol}...</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-3 py-2 text-xs text-destructive flex items-center gap-2">
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
