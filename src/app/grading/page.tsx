import GradeBadge from "@/components/GradeBadge";

const scoringFactors = [
  {
    name: "Historical PnL",
    weight: 30,
    description: "Cumulative profit/loss across all tracked trades",
  },
  {
    name: "Win Rate",
    weight: 25,
    description: "Percentage of profitable trades over 90-day window",
  },
  {
    name: "Entry Timing",
    weight: 20,
    description: "How early the wallet enters positions relative to price moves",
  },
  {
    name: "Position Sizing",
    weight: 15,
    description: "Risk management and portfolio allocation patterns",
  },
  {
    name: "Consistency",
    weight: 10,
    description: "Regularity of trading activity and strategy adherence",
  },
];

const gradeThresholds = [
  {
    grade: "S" as const,
    range: "90 - 100",
    description: "Elite smart money \u2014 top 1% of tracked wallets",
  },
  {
    grade: "A" as const,
    range: "75 - 89",
    description: "High conviction \u2014 consistently profitable",
  },
  {
    grade: "B" as const,
    range: "60 - 74",
    description: "Above average \u2014 shows strong patterns",
  },
  {
    grade: "C" as const,
    range: "40 - 59",
    description: "Average \u2014 mixed results",
  },
  {
    grade: "D" as const,
    range: "0 - 39",
    description: "Below average \u2014 inconsistent or unprofitable",
  },
];

const accumulationSignals = [
  {
    icon: "\u29BF",
    name: "Wallet Convergence",
    description:
      "Multiple high-grade wallets buying the same token within a short window, signaling coordinated smart money interest.",
  },
  {
    icon: "\u2191",
    name: "Volume Anomaly",
    description:
      "Unusual volume spike relative to the 30-day average, often preceding significant price movements.",
  },
  {
    icon: "\u002B",
    name: "Holder Growth",
    description:
      "Accelerating unique holder count indicates growing organic demand and widening distribution.",
  },
  {
    icon: "\u25C6",
    name: "Whale Accumulation",
    description:
      "Large wallets increasing positions, suggesting high-conviction bets from major players.",
  },
  {
    icon: "\u2713",
    name: "Smart Money Consensus",
    description:
      "3+ S/A-grade wallets aligned on the same token, the strongest confluence signal in Oracle.",
  },
];

const riskTiers = [
  {
    tier: "Low",
    range: "1 - 3",
    color: "text-emerald-400",
    dotColor: "bg-emerald-400",
    characteristics:
      "High liquidity, established project, multiple audits",
  },
  {
    tier: "Medium",
    range: "4 - 6",
    color: "text-yellow-400",
    dotColor: "bg-yellow-400",
    characteristics:
      "Moderate liquidity, growing community, some risk factors",
  },
  {
    tier: "High",
    range: "7 - 10",
    color: "text-red-400",
    dotColor: "bg-red-400",
    characteristics:
      "Low liquidity, new/unaudited, high volatility",
  },
];

export default function GradingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Hero */}
        <section className="mb-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Wallet Grading System
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            How Oracle scores and ranks smart money wallets
          </p>
        </section>

        {/* Section 2: Scoring Factors */}
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold text-white">
            The 5 Scoring Factors
          </h2>
          <div className="space-y-4">
            {scoringFactors.map((factor) => (
              <div
                key={factor.name}
                className="rounded-xl border border-gray-800 bg-gray-900 p-5"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-white">{factor.name}</span>
                  <span className="text-sm font-semibold text-emerald-400">
                    {factor.weight}%
                  </span>
                </div>
                <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-gray-800">
                  <div
                    className="h-full rounded-full bg-emerald-500/80"
                    style={{ width: `${factor.weight}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400">{factor.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Grade Thresholds */}
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold text-white">
            Grade Thresholds
          </h2>
          <div className="overflow-hidden rounded-xl border border-gray-800">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/60">
                  <th className="px-5 py-3 text-sm font-medium text-gray-400">
                    Grade
                  </th>
                  <th className="px-5 py-3 text-sm font-medium text-gray-400">
                    Score Range
                  </th>
                  <th className="px-5 py-3 text-sm font-medium text-gray-400">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 bg-gray-900">
                {gradeThresholds.map((row) => (
                  <tr key={row.grade}>
                    <td className="px-5 py-4">
                      <GradeBadge grade={row.grade} size="lg" />
                    </td>
                    <td className="px-5 py-4 text-sm font-mono text-gray-300">
                      {row.range}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-400">
                      {row.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4: Accumulation Scoring */}
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold text-white">
            Accumulation Scoring
          </h2>
          <p className="mb-6 text-gray-400">
            Oracle detects accumulation patterns by monitoring five key signals.
            When multiple signals fire simultaneously, the conviction score
            increases.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {accumulationSignals.map((signal) => (
              <div
                key={signal.name}
                className="rounded-xl border border-gray-800 bg-gray-900 p-5"
              >
                <div className="mb-2 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-lg font-bold text-emerald-400">
                    {signal.icon}
                  </span>
                  <h3 className="font-medium text-white">{signal.name}</h3>
                </div>
                <p className="text-sm leading-relaxed text-gray-400">
                  {signal.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Risk Tiers */}
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold text-white">
            Risk Tiers
          </h2>
          <div className="overflow-hidden rounded-xl border border-gray-800">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/60">
                  <th className="px-5 py-3 text-sm font-medium text-gray-400">
                    Tier
                  </th>
                  <th className="px-5 py-3 text-sm font-medium text-gray-400">
                    Score Range
                  </th>
                  <th className="px-5 py-3 text-sm font-medium text-gray-400">
                    Characteristics
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 bg-gray-900">
                {riskTiers.map((row) => (
                  <tr key={row.tier}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block h-2.5 w-2.5 rounded-full ${row.dotColor}`}
                        />
                        <span className={`text-sm font-semibold ${row.color}`}>
                          {row.tier}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-mono text-gray-300">
                      {row.range}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-400">
                      {row.characteristics}
                    </td>
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
