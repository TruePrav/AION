import GradeBadge from "@/components/GradeBadge";

const gradeThresholds = [
  { grade: "S" as const, range: "90-100", description: "Elite smart money — top 1% of tracked wallets", accent: "amber" },
  { grade: "A" as const, range: "75-89", description: "High conviction — consistently profitable", accent: "emerald" },
  { grade: "B" as const, range: "60-74", description: "Above average — shows strong patterns", accent: "yellow" },
  { grade: "C" as const, range: "40-59", description: "Average — mixed results", accent: "orange" },
  { grade: "D" as const, range: "0-39", description: "Below average — inconsistent or unprofitable", accent: "red" },
];

const gradeColorMap: Record<string, { text: string; bg: string; glow: string }> = {
  S: { text: "text-amber-400", bg: "bg-amber-500/15", glow: "shadow-[0_0_20px_rgba(245,158,11,0.25)]" },
  A: { text: "text-emerald-400", bg: "bg-emerald-500/15", glow: "shadow-[0_0_16px_rgba(16,185,129,0.2)]" },
  B: { text: "text-yellow-400", bg: "bg-yellow-500/15", glow: "" },
  C: { text: "text-orange-400", bg: "bg-orange-500/15", glow: "" },
  D: { text: "text-red-400", bg: "bg-red-500/15", glow: "" },
};

const pipelineSteps = [
  {
    step: 1,
    title: "Discovery",
    tagline: "Scan & detect",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
      </svg>
    ),
    bullets: [
      "Scans 500+ tokens across Solana, Ethereum, and Base",
      "Identifies tokens with unusual smart money activity",
      "Runs every 15 minutes automatically",
    ],
    color: "emerald",
  },
  {
    step: 2,
    title: "Grading",
    tagline: "Score & rank",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.075 10.1c-.783-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.518-4.674z" />
      </svg>
    ),
    bullets: [
      "Scores wallets on PnL, win rate, timing, sizing, consistency",
      "Assigns S/A/B/C/D grades updated daily",
      "Rolling 90-day performance window",
    ],
    color: "blue",
  },
  {
    step: 3,
    title: "Validation",
    tagline: "Cross-check signals",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    bullets: [
      "Cross-references multiple signals: convergence, volume, holders",
      "Calculates accumulation score and risk tier",
      "Filters tokens that don\u2019t meet minimum thresholds",
    ],
    color: "purple",
  },
  {
    step: 4,
    title: "Execution",
    tagline: "Trade & manage",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    bullets: [
      "Executes trades based on validated discoveries",
      "Automated position sizing and stop-loss",
      "Take-profit tiers with partial exits",
    ],
    color: "orange",
  },
];

const CREDIT_COSTS = [
  { op: "Discovery Scan", credits: 50, freq: "Every 15 min" },
  { op: "Wallet Grading", credits: 10, freq: "Per wallet" },
  { op: "Token Lookup", credits: 5, freq: "Per query" },
  { op: "Scout Query", credits: 20, freq: "Per query" },
  { op: "Trade Execution", credits: 15, freq: "Per trade" },
];

const COMPETITORS = [
  ["Wallet Grading", "Yes (5 factors)", "Basic", "No", "No"],
  ["Accumulation Detection", "5-signal system", "Limited", "Manual", "Limited"],
  ["Auto-Execution", "Yes", "No", "No", "No"],
  ["Multi-chain", "Sol/ETH/Base", "ETH only", "Multi", "Multi"],
  ["Real-time Alerts", "Yes", "Yes", "Yes", "Yes"],
  ["Price", "Credits-based", "$150/mo", "$50/mo", "Free"],
];

function CheckIcon() {
  return (
    <svg className="h-4 w-4 inline-block -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="h-4 w-4 inline-block -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="gradient-mesh min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-16 space-y-20">

        {/* ── Hero ── */}
        <section className="relative text-center py-8 space-y-5 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-96 h-40 bg-emerald-500/8 rounded-full blur-3xl" />
          </div>
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
              <span className="text-xs font-medium text-emerald-400">How It Works</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
              The Oracle Pipeline
            </h1>
            <p className="mt-4 text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
              From discovery to execution &mdash; a fully automated smart money intelligence pipeline that runs 24/7.
            </p>
          </div>
        </section>

        {/* ── Pipeline Steps ── */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
            <h2 className="text-xl font-bold text-white">The 4-Step Pipeline</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            {pipelineSteps.map((step, idx) => (
              <div key={step.step} className="relative">
                <div className="glass-card p-6 space-y-4 h-full">
                  {/* Step header */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Step {step.step}</span>
                      <span className="text-[10px] text-gray-600">·</span>
                      <span className="text-[10px] font-medium text-gray-600">{step.tagline}</span>
                    </div>
                    <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl border ${
                      step.color === "emerald" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                      step.color === "blue" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                      step.color === "purple" ? "bg-purple-500/10 border-purple-500/20 text-purple-400" :
                      "bg-orange-500/10 border-orange-500/20 text-orange-400"
                    }`}>
                      {step.icon}
                    </div>
                    <h3 className="text-lg font-bold text-white">{step.title}</h3>
                  </div>
                  <ul className="space-y-2 text-xs text-gray-400">
                    {step.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2">
                        <span className="text-emerald-500/50 mt-0.5 flex-shrink-0">▸</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Arrow between steps */}
                {idx < pipelineSteps.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                    <div className="w-6 h-6 rounded-full bg-gray-900 border border-white/10 flex items-center justify-center">
                      <svg className="h-3 w-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Credit Costs ── */}
        <section className="space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-400 pulse-dot" style={{animationDelay: "0.5s"}} />
            <h2 className="text-xl font-bold text-white">Nansen API Credit Costs</h2>
          </div>
          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Operation</th>
                  <th className="text-right px-6 py-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                  <th className="text-right px-6 py-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {CREDIT_COSTS.map((row) => (
                  <tr key={row.op} className="table-row-stripe">
                    <td className="px-6 py-4 font-medium text-white text-sm">{row.op}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-mono font-bold text-emerald-400 text-sm">{row.credits}</span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-500 text-xs">{row.freq}</td>
                  </tr>
                ))}
                <tr className="bg-emerald-500/3">
                  <td className="px-6 py-4 font-semibold text-white text-sm">Estimated Daily Usage</td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-mono font-bold text-emerald-400 text-sm">~850 credits/day</span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500 text-xs" />
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Competitor Comparison ── */}
        <section className="space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1.5 w-1.5 rounded-full bg-amber-400 pulse-dot" style={{animationDelay: "1s"}} />
            <h2 className="text-xl font-bold text-white">How We Compare</h2>
          </div>
          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Feature</th>
                  <th className="text-center px-4 py-4 text-[11px] font-medium text-emerald-400 uppercase tracking-wider">Oracle v3</th>
                  <th className="text-center px-4 py-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Nansen</th>
                  <th className="text-center px-4 py-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Arkham</th>
                  <th className="text-center px-4 py-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Cielo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {COMPETITORS.map(([feature, oracle, nansen, arkham, cielo]) => {
                  const renderCell = (val: string, highlight: boolean) => {
                    if (val.startsWith("Yes")) {
                      return <span className={highlight ? "text-emerald-400 font-bold" : "text-emerald-400"}><CheckIcon /> {val.replace("Yes ", "")}</span>;
                    }
                    if (val === "No") return <span className="text-gray-700"><XIcon /></span>;
                    const negative = ["Limited", "Manual", "Basic", "ETH only"].includes(val);
                    return <span className={highlight ? "text-emerald-400 font-semibold" : negative ? "text-gray-500" : "text-gray-300"}>{val}</span>;
                  };
                  return (
                    <tr key={feature} className="table-row-stripe">
                      <td className="px-6 py-4 font-medium text-white text-sm">{feature}</td>
                      <td className="px-4 py-4 text-center text-sm">{renderCell(oracle, true)}</td>
                      <td className="px-4 py-4 text-center text-sm">{renderCell(nansen, false)}</td>
                      <td className="px-4 py-4 text-center text-sm">{renderCell(arkham, false)}</td>
                      <td className="px-4 py-4 text-center text-sm">{renderCell(cielo, false)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="relative overflow-hidden rounded-2xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/5 to-transparent p-10 text-center">
          <div className="relative">
            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Ready to get started?</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
              Add the Oracle bot to Telegram and start tracking smart money in minutes.
            </p>
            <a
              href="https://t.me/OracleAITradingBot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-7 py-3 text-sm font-bold text-black transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:scale-[1.02]"
            >
              Open Telegram Bot
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}