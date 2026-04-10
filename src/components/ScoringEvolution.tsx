"use client";

export interface EvolutionStatus {
  weights: {
    buy_sell_ratio: number;
    buyer_diversity: number;
    sm_presence: number;
    volume_consistency: number;
    buyer_count: number;
    version: number;
    updated_at: string | null;
    update_reason: string | null;
  };
  total_snapshots: number;
  total_tracked_tokens: number;
  latest_evaluation: {
    status: string;
    total_tracked: number;
    winners: number;
    losers: number;
    high_score_avg_return: number;
    low_score_avg_return: number;
    tier_passed_avg_return: number;
    tier_failed_avg_return: number;
    winner_avg_accum_score: number;
    loser_avg_accum_score: number;
    scoring_effective: boolean;
    tier_filter_effective: boolean;
    recommendation: string | null;
  } | null;
  history: object[];
}

interface ScoringEvolutionProps {
  status: EvolutionStatus | null;
  loading: boolean;
  onEvaluate?: () => void;
}

const WEIGHT_LABELS: Record<string, string> = {
  buy_sell_ratio: "Buy/Sell Ratio",
  buyer_diversity: "Buyer Diversity",
  sm_presence: "SM Presence",
  volume_consistency: "Volume Consistency",
  buyer_count: "Buyer Count",
};

const WEIGHT_KEYS = [
  "buy_sell_ratio",
  "buyer_diversity",
  "sm_presence",
  "volume_consistency",
  "buyer_count",
] as const;

function SkeletonBar({ width = "100%" }: { width?: string }) {
  return (
    <div
      className="h-4 rounded bg-foreground/10 animate-pulse"
      style={{ width }}
    />
  );
}

function SkeletonBlock() {
  return (
    <div className="card p-5 space-y-4">
      <SkeletonBar width="40%" />
      <SkeletonBar />
      <SkeletonBar width="75%" />
      <SkeletonBar width="60%" />
      <SkeletonBar width="85%" />
    </div>
  );
}

function formatReturn(val: number): string {
  const sign = val >= 0 ? "+" : "";
  return `${sign}${(val * 100).toFixed(1)}%`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ScoringEvolution({
  status,
  loading,
  onEvaluate,
}: ScoringEvolutionProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonBlock />
        <SkeletonBlock />
        <SkeletonBlock />
      </div>
    );
  }

  if (!status) {
    return (
      <div className="card p-8 flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-10 h-10 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
        <p className="text-foreground/60 text-sm">
          Evolution system initializing...
        </p>
        <p className="text-foreground/40 text-xs">
          Waiting for scoring engine to come online
        </p>
      </div>
    );
  }

  const { weights, total_snapshots, total_tracked_tokens, latest_evaluation, history } = status;
  const maxWeight = Math.max(
    ...WEIGHT_KEYS.map((k) => weights[k]),
    0.01
  );

  return (
    <div className="space-y-4">
      {/* Section 1: Scoring Weights */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground tracking-wide uppercase">
            Scoring Weights
          </h3>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-400/25">
              v{weights.version}
            </span>
            <span className="text-[10px] text-foreground/40">
              {formatDate(weights.updated_at)}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {WEIGHT_KEYS.map((key) => {
            const value = weights[key];
            const pct = (value / maxWeight) * 100;
            return (
              <div key={key} className="flex items-center gap-3">
                <span className="text-xs text-foreground/60 w-[130px] shrink-0 text-right tabular-nums">
                  {WEIGHT_LABELS[key]}
                </span>
                <div className="flex-1 h-[18px] rounded-full bg-foreground/8 overflow-hidden relative">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${pct}%`,
                      background:
                        "linear-gradient(90deg, #22d3ee 0%, #10b981 100%)",
                    }}
                  />
                </div>
                <span className="text-xs text-foreground/80 font-mono w-[48px] text-right tabular-nums">
                  {value.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>

        {weights.update_reason && (
          <p className="mt-3 text-[11px] text-foreground/40 italic leading-relaxed">
            Last update: {weights.update_reason}
          </p>
        )}
      </div>

      {/* Section 2: Performance */}
      {latest_evaluation && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground tracking-wide uppercase">
              Performance
            </h3>
            <div className="flex items-center gap-2">
              {latest_evaluation.scoring_effective ? (
                <span className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Scoring Effective
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] text-red-700 dark:text-red-400">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Scoring Ineffective
                </span>
              )}
            </div>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* High vs Low Score */}
            <div className="rounded-lg bg-foreground/5 border border-foreground/10 p-3">
              <p className="text-[10px] text-foreground/50 uppercase tracking-wider mb-2">
                High Score (&ge;60) vs Low Score (&lt;60)
              </p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] text-foreground/50 mb-0.5">High</p>
                  <p
                    className={`text-lg font-bold tabular-nums ${
                      latest_evaluation.high_score_avg_return >= 0
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-red-700 dark:text-red-400"
                    }`}
                  >
                    {formatReturn(latest_evaluation.high_score_avg_return)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-foreground/50 mb-0.5">Low</p>
                  <p
                    className={`text-lg font-bold tabular-nums ${
                      latest_evaluation.low_score_avg_return >= 0
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-red-700 dark:text-red-400"
                    }`}
                  >
                    {formatReturn(latest_evaluation.low_score_avg_return)}
                  </p>
                </div>
              </div>
            </div>

            {/* Tier Passed vs Failed */}
            <div className="rounded-lg bg-foreground/5 border border-foreground/10 p-3">
              <p className="text-[10px] text-foreground/50 uppercase tracking-wider mb-2">
                Tier Passed vs Tier Failed
              </p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] text-foreground/50 mb-0.5">Passed</p>
                  <p
                    className={`text-lg font-bold tabular-nums ${
                      latest_evaluation.tier_passed_avg_return >= 0
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-red-700 dark:text-red-400"
                    }`}
                  >
                    {formatReturn(latest_evaluation.tier_passed_avg_return)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-foreground/50 mb-0.5">Failed</p>
                  <p
                    className={`text-lg font-bold tabular-nums ${
                      latest_evaluation.tier_failed_avg_return >= 0
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-red-700 dark:text-red-400"
                    }`}
                  >
                    {formatReturn(latest_evaluation.tier_failed_avg_return)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Win/Loss Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-[10px] text-foreground/50 mb-1">
              <span>
                Winners{" "}
                <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                  {latest_evaluation.winners}
                </span>
              </span>
              <span>
                Losers{" "}
                <span className="text-red-700 dark:text-red-400 font-medium">
                  {latest_evaluation.losers}
                </span>
              </span>
            </div>
            <div className="h-2 rounded-full bg-foreground/8 overflow-hidden flex">
              {(latest_evaluation.winners + latest_evaluation.losers > 0) && (
                <>
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{
                      width: `${
                        (latest_evaluation.winners /
                          (latest_evaluation.winners +
                            latest_evaluation.losers)) *
                        100
                      }%`,
                    }}
                  />
                  <div
                    className="h-full bg-red-500 transition-all duration-500"
                    style={{
                      width: `${
                        (latest_evaluation.losers /
                          (latest_evaluation.winners +
                            latest_evaluation.losers)) *
                        100
                      }%`,
                    }}
                  />
                </>
              )}
            </div>
          </div>

          {/* Avg Accum Scores */}
          <div className="flex items-center gap-4 mb-4 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-foreground/50">Winner Avg Score</span>
              <span className="text-foreground/80 font-mono">
                {latest_evaluation.winner_avg_accum_score.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-foreground/50">Loser Avg Score</span>
              <span className="text-foreground/80 font-mono">
                {latest_evaluation.loser_avg_accum_score.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Recommendation */}
          {latest_evaluation.recommendation && (
            <div className="rounded-lg bg-cyan-500/5 border border-cyan-500/15 px-4 py-3">
              <p className="text-[10px] text-cyan-700 dark:text-cyan-400/80 uppercase tracking-wider mb-1 font-semibold">
                Recommendation
              </p>
              <p className="text-xs text-foreground/80 leading-relaxed">
                {latest_evaluation.recommendation}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Section 3: Tracking */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-foreground tracking-wide uppercase mb-4">
          Tracking
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-foreground/5 border border-foreground/10 p-3 text-center">
            <p className="text-xl font-bold text-foreground tabular-nums">
              {total_snapshots.toLocaleString()}
            </p>
            <p className="text-[10px] text-foreground/50 mt-0.5">
              Discovery Runs
            </p>
          </div>
          <div className="rounded-lg bg-foreground/5 border border-foreground/10 p-3 text-center">
            <p className="text-xl font-bold text-foreground tabular-nums">
              {total_tracked_tokens.toLocaleString()}
            </p>
            <p className="text-[10px] text-foreground/50 mt-0.5">
              Tracked Tokens
            </p>
          </div>
          <div className="rounded-lg bg-foreground/5 border border-foreground/10 p-3 text-center">
            <p className="text-xl font-bold text-foreground tabular-nums">
              {history.length.toLocaleString()}
            </p>
            <p className="text-[10px] text-foreground/50 mt-0.5">
              Evaluations Run
            </p>
          </div>
        </div>

        {!latest_evaluation && (
          <div className="mt-4 rounded-lg bg-foreground/5 border border-foreground/10 px-4 py-3 text-center">
            <p className="text-xs text-foreground/50">
              Run an evaluation after tracking enough tokens
            </p>
          </div>
        )}
      </div>

      {/* Section 4: Evaluate Button */}
      {onEvaluate && (
        <button
          onClick={onEvaluate}
          disabled={total_tracked_tokens < 5}
          className={`w-full py-3 rounded-lg text-sm font-semibold tracking-wide transition-all duration-200 ${
            total_tracked_tokens >= 5
              ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_28px_rgba(16,185,129,0.35)] cursor-pointer"
              : "bg-foreground/10 text-foreground/40 cursor-not-allowed"
          }`}
        >
          Run Evaluation
        </button>
      )}
    </div>
  );
}
