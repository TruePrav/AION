// 5 style variants for the Discovery token table surface.
import { ArrowUpRight, Flame, TrendingUp, TrendingDown, Zap, ExternalLink } from "lucide-react";
import { MOCK_TOKENS, fmtUsd } from "../mock";

const GRADE_STYLES_DARK: Record<string, string> = {
  S: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  A: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  B: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  C: "text-zinc-400 bg-zinc-400/10 border-zinc-400/30",
  D: "text-zinc-500 bg-zinc-500/5 border-zinc-500/20",
};

// ═══════════════════════════════════════════════════════
// V1 — TERMINAL
// ═══════════════════════════════════════════════════════
export function DiscoveryV1() {
  return (
    <div className="rounded-sm border border-emerald-500/30 bg-black font-mono text-[11px]">
      <div className="border-b border-emerald-500/20 px-4 py-1.5 flex items-center justify-between">
        <div className="text-emerald-400/70 text-[10px]">{`// DISCOVERY.TOKENS — sorted by sm_inflow_7d desc`}</div>
        <div className="text-emerald-400/50 text-[10px]">{MOCK_TOKENS.length} rows</div>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-emerald-500/20 text-emerald-500/50 text-[9px] uppercase">
            <th className="text-left px-4 py-1.5">symbol</th>
            <th className="text-right px-3 py-1.5">mcap</th>
            <th className="text-right px-3 py-1.5">age</th>
            <th className="text-right px-3 py-1.5">flow_7d</th>
            <th className="text-right px-3 py-1.5">flow_24h</th>
            <th className="text-right px-3 py-1.5">traders</th>
            <th className="text-center px-3 py-1.5">grade</th>
            <th className="text-center px-3 py-1.5">tier</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-emerald-500/10">
          {MOCK_TOKENS.map((t, i) => (
            <tr key={t.symbol} className="hover:bg-emerald-500/5">
              <td className="px-4 py-1.5">
                <span className="text-emerald-500/50 mr-2">{String(i).padStart(2, "0")}</span>
                <span className="text-emerald-300 font-bold">{t.symbol.padEnd(7)}</span>
              </td>
              <td className="px-3 py-1.5 text-right text-emerald-400/80 tabular-nums">{fmtUsd(t.mcap)}</td>
              <td className="px-3 py-1.5 text-right text-emerald-500/60 tabular-nums">{t.age}</td>
              <td className={`px-3 py-1.5 text-right tabular-nums ${t.flow7d >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {t.flow7d >= 0 ? "+" : ""}{fmtUsd(t.flow7d)}
              </td>
              <td className={`px-3 py-1.5 text-right tabular-nums ${t.flow24h >= 0 ? "text-emerald-400/60" : "text-red-400/60"}`}>
                {t.flow24h >= 0 ? "+" : ""}{fmtUsd(t.flow24h)}
              </td>
              <td className="px-3 py-1.5 text-right text-emerald-400/70 tabular-nums">{t.traders}</td>
              <td className="px-3 py-1.5 text-center">
                <span className="text-emerald-300 font-bold">[{t.accum.grade}:{t.accum.score}]</span>
              </td>
              <td className="px-3 py-1.5 text-center text-emerald-500/70">{t.tier}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t border-emerald-500/20 px-4 py-1.5 text-[9px] text-emerald-500/50">
        {`> _`}<span className="animate-pulse">▊</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// V2 — GLASSMORPHIC
// ═══════════════════════════════════════════════════════
export function DiscoveryV2() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-xl">
      <div className="absolute -top-20 left-1/3 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-cyan-300" />
            <h3 className="text-sm font-medium text-white">Smart money inflow</h3>
            <span className="text-[10px] rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-white/50">{MOCK_TOKENS.length} tokens</span>
          </div>
          <span className="text-[10px] text-white/40">Sorted by 7d inflow</span>
        </div>
        <div className="divide-y divide-white/[0.03]">
          {MOCK_TOKENS.map((t) => (
            <div key={t.symbol} className="px-6 py-3.5 flex items-center gap-4 hover:bg-white/[0.02] transition">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-cyan-400/20 to-purple-400/20 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/80 backdrop-blur-md">
                  {t.symbol.slice(0, 2)}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{t.symbol}</div>
                  <div className="text-[10px] text-white/40">{fmtUsd(t.mcap)} · {t.age}</div>
                </div>
              </div>
              <div className={`px-2.5 py-1 rounded-full border text-[10px] font-semibold ${GRADE_STYLES_DARK[t.accum.grade]}`}>
                {t.accum.grade} · {t.accum.score}
              </div>
              <div className="text-right w-24">
                <div className={`text-sm font-semibold tabular-nums ${t.flow7d >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                  {t.flow7d >= 0 ? "+" : ""}{fmtUsd(t.flow7d)}
                </div>
                <div className="text-[9px] text-white/40">7d inflow</div>
              </div>
              <div className="w-20">
                <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400" style={{ width: `${t.accum.score}%` }} />
                </div>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-white/30" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// V3 — PREMIUM MINIMAL
// ═══════════════════════════════════════════════════════
export function DiscoveryV3() {
  return (
    <div className="bg-[#0a0a0a]">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-xl font-medium text-neutral-100 tracking-tight">Discovery</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Tokens moved by labeled wallets, ranked by 7-day net inflow.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-[11px] text-neutral-500 hover:text-neutral-100 transition">All</button>
          <span className="text-neutral-700">·</span>
          <button className="text-[11px] text-neutral-100 font-medium">7D</button>
          <span className="text-neutral-700">·</span>
          <button className="text-[11px] text-neutral-500 hover:text-neutral-100 transition">24H</button>
        </div>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-900 text-[10px] text-neutral-500 uppercase tracking-wider">
            <th className="text-left pb-3 font-normal">Token</th>
            <th className="text-right pb-3 font-normal">Market cap</th>
            <th className="text-right pb-3 font-normal">7D inflow</th>
            <th className="text-right pb-3 font-normal">Traders</th>
            <th className="text-right pb-3 font-normal">Grade</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_TOKENS.map((t) => (
            <tr key={t.symbol} className="border-b border-neutral-900 hover:bg-neutral-900/30 transition group">
              <td className="py-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[10px] font-medium text-neutral-300">
                    {t.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-100">{t.symbol}</div>
                    <div className="text-[10px] text-neutral-500">{t.age} old</div>
                  </div>
                </div>
              </td>
              <td className="py-4 text-right text-sm text-neutral-300 tabular-nums">{fmtUsd(t.mcap)}</td>
              <td className={`py-4 text-right text-sm font-medium tabular-nums ${t.flow7d >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {t.flow7d >= 0 ? "+" : ""}{fmtUsd(t.flow7d)}
              </td>
              <td className="py-4 text-right text-sm text-neutral-400 tabular-nums">{t.traders}</td>
              <td className="py-4 text-right">
                <span className="text-sm text-neutral-300 tabular-nums">{t.accum.score}</span>
                <span className="text-[10px] text-neutral-600 ml-1">/ 100</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// V4 — BRUTALIST
// ═══════════════════════════════════════════════════════
export function DiscoveryV4() {
  return (
    <div className="bg-[#f5f0e8] border-[3px] border-black shadow-[8px_8px_0_0_#000]">
      <div className="flex items-center justify-between px-5 py-3 border-b-[3px] border-black bg-lime-300">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-black text-black uppercase">DISCOVERY.LOG</h3>
          <span className="border-2 border-black bg-white px-1.5 py-0.5 text-[9px] font-black">{MOCK_TOKENS.length}</span>
        </div>
        <Zap className="h-4 w-4 text-black" />
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b-[3px] border-black bg-white">
            <th className="text-left px-4 py-2.5 text-[10px] font-black text-black uppercase">Token</th>
            <th className="text-right px-3 py-2.5 text-[10px] font-black text-black uppercase">MCap</th>
            <th className="text-right px-3 py-2.5 text-[10px] font-black text-black uppercase">Flow 7D</th>
            <th className="text-right px-3 py-2.5 text-[10px] font-black text-black uppercase">Traders</th>
            <th className="text-center px-3 py-2.5 text-[10px] font-black text-black uppercase">Grade</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_TOKENS.map((t, i) => {
            const bg = i % 2 === 0 ? "bg-[#f5f0e8]" : "bg-white";
            return (
              <tr key={t.symbol} className={`border-b-2 border-black ${bg} hover:bg-yellow-200`}>
                <td className="px-4 py-2.5">
                  <div className="inline-flex items-center gap-2">
                    <div className="h-7 w-7 border-2 border-black bg-pink-300 flex items-center justify-center text-[9px] font-black text-black">
                      {t.symbol.slice(0, 2)}
                    </div>
                    <span className="text-sm font-black text-black">{t.symbol}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-right text-sm font-bold text-black tabular-nums">{fmtUsd(t.mcap)}</td>
                <td className="px-3 py-2.5 text-right">
                  <span className={`inline-block border-2 border-black px-1.5 py-0.5 text-[11px] font-black tabular-nums ${t.flow7d >= 0 ? "bg-lime-400" : "bg-red-300"}`}>
                    {t.flow7d >= 0 ? "+" : ""}{fmtUsd(t.flow7d)}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right text-sm font-bold text-black tabular-nums">{t.traders}</td>
                <td className="px-3 py-2.5 text-center">
                  <span className="inline-block border-2 border-black bg-yellow-300 px-2 py-0.5 text-[11px] font-black text-black">{t.accum.grade}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// V5 — NEO-DATA
// ═══════════════════════════════════════════════════════
export function DiscoveryV5() {
  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-950 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-cyan-400" />
            <h3 className="text-sm font-semibold text-zinc-100">Hot tokens</h3>
          </div>
          <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-400/5 border border-cyan-400/20 px-1.5 py-0.5 rounded">{MOCK_TOKENS.length}</span>
          <span className="text-[10px] text-zinc-500">· updated 3m ago</span>
        </div>
        <div className="flex items-center gap-1">
          {["1H", "24H", "7D", "30D"].map((l, i) => (
            <button key={l} className={`text-[10px] font-mono px-2 py-1 rounded ${i === 2 ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/20" : "text-zinc-500 hover:text-zinc-300"}`}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <table className="w-full text-[11px]">
        <thead>
          <tr className="border-b border-zinc-800/60 text-[9px] text-zinc-500 uppercase tracking-wider">
            <th className="text-left px-4 py-2 font-medium">#</th>
            <th className="text-left px-3 py-2 font-medium">Symbol</th>
            <th className="text-right px-3 py-2 font-medium">MCap</th>
            <th className="text-right px-3 py-2 font-medium">7D Flow</th>
            <th className="text-right px-3 py-2 font-medium">24H</th>
            <th className="text-right px-3 py-2 font-medium">SM</th>
            <th className="text-center px-3 py-2 font-medium">Grade</th>
            <th className="text-center px-3 py-2 font-medium">Score</th>
            <th className="text-center px-3 py-2 font-medium">Tier</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-900">
          {MOCK_TOKENS.map((t, i) => (
            <tr key={t.symbol} className="hover:bg-zinc-900/50 transition group">
              <td className="px-4 py-2.5 text-zinc-600 font-mono tabular-nums">{String(i + 1).padStart(2, "0")}</td>
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-gradient-to-br from-cyan-500/30 to-zinc-700 border border-zinc-700 flex items-center justify-center text-[8px] font-bold text-zinc-200">
                    {t.symbol.slice(0, 1)}
                  </div>
                  <span className="font-semibold text-zinc-100">{t.symbol}</span>
                  <ExternalLink className="h-2.5 w-2.5 text-zinc-600 opacity-0 group-hover:opacity-100 transition" />
                </div>
              </td>
              <td className="px-3 py-2.5 text-right font-mono text-zinc-300 tabular-nums">{fmtUsd(t.mcap)}</td>
              <td className={`px-3 py-2.5 text-right font-mono font-semibold tabular-nums ${t.flow7d >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                <span className="inline-flex items-center gap-1">
                  {t.flow7d >= 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                  {t.flow7d >= 0 ? "+" : ""}{fmtUsd(t.flow7d)}
                </span>
              </td>
              <td className={`px-3 py-2.5 text-right font-mono tabular-nums ${t.flow24h >= 0 ? "text-emerald-400/70" : "text-red-400/70"}`}>
                {t.flow24h >= 0 ? "+" : ""}{fmtUsd(t.flow24h)}
              </td>
              <td className="px-3 py-2.5 text-right font-mono text-zinc-400 tabular-nums">{t.traders}</td>
              <td className="px-3 py-2.5 text-center">
                <span className={`inline-block px-1.5 py-0.5 rounded border text-[10px] font-bold font-mono ${GRADE_STYLES_DARK[t.accum.grade]}`}>
                  {t.accum.grade}
                </span>
              </td>
              <td className="px-3 py-2.5 text-center">
                <div className="inline-flex items-center gap-1.5">
                  <div className="w-10 h-1 rounded-full bg-zinc-800 overflow-hidden">
                    <div className="h-full bg-cyan-400" style={{ width: `${t.accum.score}%` }} />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 tabular-nums">{t.accum.score}</span>
                </div>
              </td>
              <td className="px-3 py-2.5 text-center">
                <span className="text-[9px] font-mono text-zinc-400 bg-zinc-800/60 border border-zinc-700 px-1 py-0.5 rounded">{t.tier}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
