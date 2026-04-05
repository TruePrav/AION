import GradeBadge from "@/components/GradeBadge";

const scoringFactors = [
  {
    name: "Historical PnL",
    weight: 30,
    description: "Cumulative profit/loss across all tracked trades",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
  },
  {
    name: "Win Rate",
    weight: 25,
    description: "Percentage of profitable trades over 90-day window",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    name: "Entry Timing",
    weight: 20,
    description: "How early the wallet enters positions relative to price moves",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    name: "Position Sizing",
    weight: 15,
    description: "Risk management and portfolio allocation patterns",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-2.25m0 0l-.75 1.5h3.75a1.5 1.5 0 000-3h-3.75a1.5 1.5 0 00-1.5 1.5v3.75m0 0l1.5 1.5m-1.5-1.5l1.5-1.5" />
      </svg>
    ),
  },
  {
    name: "Consistency",
    weight: 10,
    description: "Regularity of trading activity and strategy adherence",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
];

const gradeThresholds = [
  {
    grade: "S" as const,
    range: "90 - 100",
    description: "Elite smart money — top 1% of tracked wallets",
    color: "text-amber-400",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.3)]",
  },
  {
    grade: "A" as const,
    range: "75 - 89",
    description: "High conviction — consistently profitable",
    color: "text-emerald-400",
    glow: "shadow-[0_0_16px_rgba(16,185,129,0.25)]",
  },
  {
    grade: "B" as const,
    range: "60 - 74",
    description: "Above average — shows strong patterns",
    color: "text-yellow-400",
    glow: "shadow-[0_0_12px_rgba(234,179,8,0.2)]",
  },
  {
    grade: "C" as const,
    range: "40 - 59",
    description: "Average — mixed results",
    color: "text-orange-400",
    glow: "",
  },
  {
    grade: "D" as const,
    range: "0 - 39",
    description: "Below average — inconsistent or unprofitable",
    color: "text-red-400",
    glow: "",
  },
];

const accumulationSignals = [
  {
    name: "Wallet Convergence",
    description: "Multiple high-grade wallets buying the same token within a short window, signaling coordinated smart money interest.",
    color: "border-emerald-500/30 bg-emerald-500/5",
  },
  {
    name: "Volume Anomaly",
    description: "Unusual volume spike relative to the 30-day average, often preceding significant price movements.",
    color: "border-blue-500/30 bg-blue-500/5",
  },
  {
    name: "Holder Growth",
    description: "Accelerating unique holder count indicates growing organic demand and widening distribution.",
    color: "border-purple-500/30 bg-purple-500/5",
  },
  {
    name: "Whale Accumulation",
    description: "Large wallets increasing positions, suggesting high-conviction bets from major players.",
    color: "border-amber-500/30 bg-amber-500/5",
  },
  {
    name: "Smart Money Consensus",
    description: "3+ S/A-grade wallets aligned on the same token, the strongest confluence signal in Oracle.",
    color: "border-emerald-500/40 bg-emerald-500/8",
  },
];

const riskTiers = [
  {
    tier: "Low",
    range: "1 - 3",
    color: "text-emerald-400",
    dotColor: "bg-emerald-400",
    characteristics: "High liquidity, established project, multiple audits",
  },
  {
    tier: "Medium",
    range: "4 - 6",
    color: "text-yellow-400",
    dotColor: "bg-yellow-400",
    characteristics: "Moderate liquidity, growing community, some risk factors",
  },
  {
    tier: "High",
    range: "7 - 10",
    color: "text-red-400",
    dotColor: "bg-red-400",
    characteristics: "Low liquidity, new/unaudited, high volatility",
  },
];

export default function GradingPage() {
  return (
    <div className="gradient-mesh min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-16 space-y-16">

        {/* ── Hero ── */}
        <section className="relative text-center py-8 space-y-5 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-80 h-40 bg-emerald-500/8 rounded-full blur-3xl" />
          </div>
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
              <span className="text-xs font-medium text-emerald-400">Scoring Methodology</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
              Wallet Grading System
            </h1>
            <p className="mt-4 text-base text-gray-400 max-w-xl mx-auto">
              How Oracle scores and ranks smart money wallets
            </p>
          </div>
        </section>

        {/* ── Scoring Factors ── */}
        <section className="space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
            <h2 className="text-xl font-bold text-white">The 5 Scoring Factors</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {scoringFactors.map((factor) => (
              <div key={factor.name} className="glass-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      {factor.icon}
                    </div>
                    <span className="font-semibold text-white">{factor.name}</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-400 font-mono">{factor.weight}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500/60 to-emerald-400/80" style={{ width: `${factor.weight}%` }} />
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{factor.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Grade Thresholds ── */}
        <section className="space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-1.5 w-1.5 rounded-full bg-amber-400 pulse-dot" style={{animationDelay: "0.5s"}} />
            <h2 className="text-xl font-bold text-white">Grade Thresholds</h2>
          </div>
          <div className="glass-card overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                  <th className="px-6 py-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Score Range</th>
                  <th className="px-6 py-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {gradeThresholds.map((row) => (
                  <tr key={row.grade} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-6 py-5">
                      <GradeBadge grade={row.grade} size="lg" />
                    </td>
                    <td className="px-6 py-5 font-mono text-sm text-gray-300">{row.range}</td>
                    <td className="px-6 py-5 text-sm text-gray-400">{row.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Accumulation Scoring ── */}
        <section className="space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-1.5 w-1.5 rounded-full bg-purple-400 pulse-dot" style={{animationDelay: "1s"}} />
            <h2 className="text-xl font-bold text-white">Accumulation Scoring</h2>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            Oracle detects accumulation patterns by monitoring five key signals. When multiple signals fire simultaneously, the conviction score increases.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {accumulationSignals.map((signal) => (
              <div key={signal.name} className={`rounded-2xl border p-5 space-y-3 transition-all duration-200 hover:-translate-y-0.5 ${signal.color}`}>
                <h3 className="font-semibold text-white">{signal.name}</h3>
                <p className="text-sm leading-relaxed text-gray-400">{signal.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Risk Tiers ── */}
        <section className="space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-1.5 w-1.5 rounded-full bg-red-400 pulse-dot" style={{animationDelay: "1.5s"}} />
            <h2 className="text-xl font-bold text-white">Risk Tiers</h2>
          </div>
          <div className="glass-card overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                  <th className="px-6 py-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Score Range</th>
                  <th className="px-6 py-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Characteristics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {riskTiers.map((row) => (
                  <tr key={row.tier} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2.5">
                        <span className={`inline-block h-3 w-3 rounded-full ${row.dotColor} shadow-[0_0_6px_${row.dotColor.replace("bg-","")}]`} />
                        <span className={`text-sm font-bold ${row.color}`}>{row.tier}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-mono text-sm text-gray-300">{row.range}</td>
                    <td className="px-6 py-5 text-sm text-gray-400">{row.characteristics}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}