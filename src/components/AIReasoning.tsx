"use client";

import { useState } from "react";
import { Brain, ChevronRight, TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import type { DiscoveryToken } from "@/lib/api";
import { cn } from "@/lib/utils";

export interface TokenReasoning {
  address: string;
  symbol: string;
  verdict: "strong_buy" | "buy" | "watch" | "avoid";
  confidence: number;
  summary: string;
  factors: { name: string; signal: "bullish" | "bearish" | "neutral"; detail: string }[];
  risk_flags: string[];
}

interface AIReasoningProps {
  tokens: DiscoveryToken[];
  reasoning: TokenReasoning[] | null;
  loading: boolean;
}

// ── Verdict pill styling (light glass palette) ──
const VERDICT: Record<
  TokenReasoning["verdict"],
  { label: string; pill: string; bar: string }
> = {
  strong_buy: {
    label: "Strong Buy",
    pill: "bg-primary/25 text-[hsl(120_70%_25%)] border-primary/50",
    bar: "bg-primary",
  },
  buy: {
    label: "Buy",
    pill: "bg-primary/15 text-[hsl(120_65%_30%)] border-primary/35",
    bar: "bg-primary/80",
  },
  watch: {
    label: "Watch",
    pill: "bg-accent/40 text-[hsl(38_85%_30%)] border-accent/70",
    bar: "bg-accent",
  },
  avoid: {
    label: "Avoid",
    pill: "bg-destructive/20 text-[hsl(0_75%_40%)] border-destructive/40",
    bar: "bg-destructive",
  },
};

function SignalPill({ signal }: { signal: "bullish" | "bearish" | "neutral" }) {
  if (signal === "bullish") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 border border-primary/40 px-1.5 py-0.5 text-[10px] font-bold text-[hsl(120_70%_28%)]">
        <TrendingUp className="h-2.5 w-2.5" strokeWidth={3} />
        BULL
      </span>
    );
  }
  if (signal === "bearish") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/20 border border-destructive/40 px-1.5 py-0.5 text-[10px] font-bold text-[hsl(0_75%_42%)]">
        <TrendingDown className="h-2.5 w-2.5" strokeWidth={3} />
        BEAR
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-foreground/10 border border-foreground/20 px-1.5 py-0.5 text-[10px] font-bold text-foreground/70">
      <Minus className="h-2.5 w-2.5" strokeWidth={3} />
      NEU
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="glass-card-sm p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-5 w-16 rounded bg-foreground/10" />
        <div className="h-4 w-20 rounded bg-foreground/10" />
        <div className="ml-auto h-2 w-24 rounded-full bg-foreground/10" />
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full rounded bg-foreground/5" />
        <div className="h-3 w-3/4 rounded bg-foreground/5" />
      </div>
    </div>
  );
}

export default function AIReasoning({ reasoning, loading }: AIReasoningProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(addr: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(addr)) next.delete(addr);
      else next.add(addr);
      return next;
    });
  }

  return (
    <section>
      {/* ── Section header ── */}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-primary/25 border border-primary/45">
          <Brain className="h-4 w-4 text-foreground" strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground tracking-tight">
              AION AI Analysis
            </h2>
            {reasoning && (
              <span className="inline-flex items-center rounded-full bg-foreground/5 border border-foreground/10 px-2 py-0 text-[10px] font-semibold font-mono text-foreground/70">
                {reasoning.length}
              </span>
            )}
          </div>
          <p className="text-xs text-foreground/60 mt-0.5">
            Per-token verdict, confidence, and reasoning
          </p>
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-3.5 w-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-foreground/70">
              Analyzing tokens...
            </span>
          </div>
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && !reasoning && (
        <div className="glass-card p-10 flex flex-col items-center justify-center text-center">
          <Brain className="h-8 w-8 text-foreground/25 mb-3" strokeWidth={1.5} />
          <p className="text-sm font-semibold text-foreground/60">
            AI analysis not yet available for this run
          </p>
          <p className="text-xs text-foreground/40 mt-1">
            Reasoning is generated during the next discovery scan
          </p>
        </div>
      )}

      {/* ── Reasoning cards ── */}
      {!loading && reasoning && reasoning.length > 0 && (
        <div className="space-y-2.5">
          {reasoning.map((r) => {
            const v = VERDICT[r.verdict];
            const isOpen = expanded.has(r.address);

            return (
              <div key={r.address} className="glass-card overflow-hidden">
                {/* Header */}
                <button
                  type="button"
                  onClick={() => toggle(r.address)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-foreground/5"
                >
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 text-foreground/50 flex-shrink-0 transition-transform duration-200",
                      isOpen && "rotate-90"
                    )}
                    strokeWidth={2.5}
                  />

                  <span className="text-sm font-bold text-foreground tracking-tight">
                    {r.symbol}
                  </span>

                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                      v.pill
                    )}
                  >
                    {v.label}
                  </span>

                  {r.risk_flags.length > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-destructive/20 border border-destructive/40 px-2 py-0.5 text-[10px] font-bold text-[hsl(0_75%_40%)]">
                      <AlertTriangle className="h-2.5 w-2.5" strokeWidth={3} />
                      {r.risk_flags.length} risk{r.risk_flags.length > 1 ? "s" : ""}
                    </span>
                  )}

                  {/* Confidence bar */}
                  <div className="ml-auto flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-bold font-mono text-foreground tabular-nums">
                      {r.confidence}%
                    </span>
                    <div className="w-24 h-2 rounded-full bg-foreground/10 overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", v.bar)}
                        style={{ width: `${r.confidence}%` }}
                      />
                    </div>
                  </div>
                </button>

                {/* Expanded */}
                {isOpen && (
                  <div className="px-5 pb-5 pt-0 border-t border-foreground/10">
                    {/* Summary */}
                    <p className="text-sm text-foreground/85 font-medium mt-4 mb-5 leading-relaxed">
                      {r.summary}
                    </p>

                    {/* Factors */}
                    {r.factors.length > 0 && (
                      <div className="mb-5">
                        <h4 className="text-[10px] font-bold text-foreground/60 uppercase tracking-wider mb-2">
                          Factors
                        </h4>
                        <div className="space-y-2">
                          {r.factors.map((f, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-2.5 rounded-lg bg-foreground/5 border border-foreground/10 px-3 py-2"
                            >
                              <SignalPill signal={f.signal} />
                              <div className="flex-1 min-w-0">
                                <div className="text-[12px] font-bold text-foreground">
                                  {f.name}
                                </div>
                                <div className="text-[12px] text-foreground/70 mt-0.5 leading-snug">
                                  {f.detail}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Risk flags */}
                    {r.risk_flags.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-bold text-foreground/60 uppercase tracking-wider mb-2">
                          Risk Flags
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {r.risk_flags.map((flag, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 rounded-full bg-destructive/20 border border-destructive/40 px-2.5 py-0.5 text-[11px] font-semibold text-[hsl(0_75%_38%)]"
                            >
                              <AlertTriangle className="h-2.5 w-2.5" strokeWidth={3} />
                              {flag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
