export default function HowItWorksPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-24">
      {/* ── Hero ── */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          How Oracle Works
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          From discovery to execution &mdash; a fully automated smart money
          pipeline
        </p>
      </section>

      {/* ── Pipeline ── */}
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold text-center">The Pipeline</h2>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-6 items-start">
          {/* Step 1 */}
          <PipelineCard
            step={1}
            title="Discovery"
            icon={<MagnifyingGlassIcon />}
            bullets={[
              "Scans 500+ tokens across Solana, Ethereum, and Base",
              "Identifies tokens with unusual smart money activity",
              "Runs every 15 minutes",
            ]}
          />

          <Arrow />

          {/* Step 2 */}
          <PipelineCard
            step={2}
            title="Grading"
            icon={<StarIcon />}
            bullets={[
              "Scores wallets on PnL, win rate, timing, sizing, consistency",
              "Assigns S/A/B/C/D grades",
              "Updates grades daily based on rolling 90-day window",
            ]}
          />

          <Arrow />

          {/* Step 3 */}
          <PipelineCard
            step={3}
            title="Validation"
            icon={<ShieldCheckIcon />}
            bullets={[
              "Cross-references multiple signals: convergence, volume, holders",
              "Calculates accumulation score and risk tier",
              "Filters out tokens that don\u2019t meet minimum thresholds",
            ]}
          />

          <Arrow />

          {/* Step 4 */}
          <PipelineCard
            step={4}
            title="Execution"
            icon={<LightningBoltIcon />}
            bullets={[
              "Executes trades based on validated discoveries",
              "Position sizing based on risk tier and conviction score",
              "Automated stop-loss and take-profit levels",
            ]}
          />
        </div>
      </section>

      {/* ── Credit Costs ── */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-center">Credit Costs</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border border-gray-800 rounded-lg overflow-hidden">
            <thead className="bg-gray-900 text-gray-300 text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Operation</th>
                <th className="px-6 py-3 text-right">Credits</th>
                <th className="px-6 py-3 text-right">Frequency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {[
                ["Discovery Scan", "50", "Every 15 min"],
                ["Wallet Grading", "10", "Per wallet"],
                ["Token Lookup", "5", "Per query"],
                ["Scout Query", "20", "Per query"],
                ["Trade Execution", "15", "Per trade"],
              ].map(([op, credits, freq]) => (
                <tr key={op} className="bg-gray-950 hover:bg-gray-900/60 transition-colors">
                  <td className="px-6 py-4 font-medium">{op}</td>
                  <td className="px-6 py-4 text-right tabular-nums">{credits}</td>
                  <td className="px-6 py-4 text-right text-gray-400">{freq}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-center text-gray-400 text-sm">
          Estimated daily usage: <span className="text-white font-semibold">~850 credits/day</span>
        </p>
      </section>

      {/* ── Competitor Comparison ── */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-center">
          Competitor Comparison
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border border-gray-800 rounded-lg overflow-hidden text-sm">
            <thead className="bg-gray-900 text-gray-300 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Feature</th>
                <th className="px-5 py-3 text-center text-emerald-400">Oracle&nbsp;v3</th>
                <th className="px-5 py-3 text-center">Nansen</th>
                <th className="px-5 py-3 text-center">Arkham</th>
                <th className="px-5 py-3 text-center">Cielo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {([
                ["Wallet Grading", "Yes (5 factors)", "Basic", "No", "No"],
                ["Accumulation Detection", "5-signal system", "Limited", "Manual", "Limited"],
                ["Auto-Execution", "Yes", "No", "No", "No"],
                ["Multi-chain", "Sol/ETH/Base", "ETH only", "Multi", "Multi"],
                ["Real-time Alerts", "Yes", "Yes", "Yes", "Yes"],
                ["Price", "Credits-based", "$150/mo", "$50/mo", "Free"],
              ] as const).map(([feature, oracle, nansen, arkham, cielo]) => (
                <tr key={feature} className="bg-gray-950 hover:bg-gray-900/60 transition-colors">
                  <td className="px-5 py-3 font-medium">{feature}</td>
                  <td className="px-5 py-3 text-center">
                    <ComparisonCell value={oracle} highlight />
                  </td>
                  <td className="px-5 py-3 text-center">
                    <ComparisonCell value={nansen} />
                  </td>
                  <td className="px-5 py-3 text-center">
                    <ComparisonCell value={arkham} />
                  </td>
                  <td className="px-5 py-3 text-center">
                    <ComparisonCell value={cielo} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function PipelineCard({
  step,
  title,
  icon,
  bullets,
}: {
  step: number;
  title: string;
  icon: React.ReactNode;
  bullets: string[];
}) {
  return (
    <div className="md:col-span-1 bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4 flex flex-col items-center text-center">
      <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
        Step {step}
      </span>
      <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <ul className="text-sm text-gray-400 space-y-2 text-left list-disc list-inside">
        {bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </div>
  );
}

function Arrow() {
  return (
    <div className="md:col-span-1 flex items-center justify-center py-4 md:py-0">
      {/* Down arrow on mobile */}
      <svg
        className="w-6 h-6 text-gray-600 md:hidden"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
      {/* Right arrow on desktop */}
      <svg
        className="hidden md:block w-6 h-6 text-gray-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
}

function ComparisonCell({
  value,
  highlight = false,
}: {
  value: string;
  highlight?: boolean;
}) {
  const isYes = value === "Yes" || value.startsWith("Yes ");
  const isNo = value === "No";

  if (isYes) {
    return (
      <span className={highlight ? "text-emerald-400 font-semibold" : "text-emerald-400"}>
        <CheckMark /> {value !== "Yes" ? value.replace("Yes ", "") : ""}
      </span>
    );
  }

  if (isNo) {
    return <span className="text-gray-600"><XMark /></span>;
  }

  // Textual values like "Limited", "$150/mo", etc.
  const negative = ["Limited", "Manual", "Basic", "ETH only"].includes(value);
  return (
    <span className={highlight ? "text-emerald-400 font-semibold" : negative ? "text-gray-500" : "text-gray-300"}>
      {value}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  SVG Icons                                                          */
/* ------------------------------------------------------------------ */

function MagnifyingGlassIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.075 10.1c-.783-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.518-4.674z"
      />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  );
}

function LightningBoltIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function CheckMark() {
  return (
    <svg className="w-4 h-4 inline-block -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XMark() {
  return (
    <svg className="w-4 h-4 inline-block -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
