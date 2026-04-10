// 10 style variants for the Portfolio/Positions page (summary cards + position rows).
import { Briefcase, Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, Shield, Target } from "lucide-react";
import { MOCK_POSITIONS, fmtUsd } from "../mock";

const totalPnl = MOCK_POSITIONS.reduce((s, p) => s + p.pnl_usd, 0);
const totalSize = MOCK_POSITIONS.reduce((s, p) => s + p.size, 0);
const totalPct = (totalPnl / totalSize) * 100;

// ═══════════════════════════════════════════════════════
// V1 — TERMINAL
// ═══════════════════════════════════════════════════════
export function PortfolioV1() {
  return (
    <div className="rounded-sm border border-emerald-500/30 bg-black font-mono text-[11px] p-4">
      <div className="text-[10px] text-emerald-400/70 mb-3">{`// portfolio.open_positions · auto-refresh 10s`}</div>
      <div className="grid grid-cols-3 gap-0 border border-emerald-500/20 mb-4 divide-x divide-emerald-500/20">
        <div className="px-3 py-2">
          <div className="text-[9px] text-emerald-500/50 tracking-wider">POSITIONS</div>
          <div className="text-base font-bold text-emerald-300 tabular-nums">{MOCK_POSITIONS.length}</div>
        </div>
        <div className="px-3 py-2">
          <div className="text-[9px] text-emerald-500/50 tracking-wider">INVESTED</div>
          <div className="text-base font-bold text-emerald-300 tabular-nums">{fmtUsd(totalSize)}</div>
        </div>
        <div className="px-3 py-2">
          <div className="text-[9px] text-emerald-500/50 tracking-wider">UNREAL_PNL</div>
          <div className={`text-base font-bold tabular-nums ${totalPnl >= 0 ? "text-emerald-300" : "text-red-400"}`}>
            {totalPnl >= 0 ? "+" : ""}{fmtUsd(totalPnl)} ({totalPct.toFixed(2)}%)
          </div>
        </div>
      </div>
      <div className="space-y-1">
        {MOCK_POSITIONS.map((p, i) => {
          const profit = p.pnl_pct >= 0;
          return (
            <div key={i} className="border border-emerald-500/20 bg-emerald-500/[0.02] px-3 py-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-emerald-300 font-bold text-sm">
                    [{String(i + 1).padStart(2, "0")}] {p.symbol}
                    <span className="text-emerald-500/50 font-normal ml-2">/ SOL</span>
                  </div>
                  <div className="text-[10px] text-emerald-400/60 mt-1 space-x-3">
                    <span>entry=${p.entry}</span>
                    <span>now=${p.now}</span>
                    <span>size={fmtUsd(p.size)}</span>
                    <span>grade=[{p.grade}:{p.accum}]</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold tabular-nums ${profit ? "text-emerald-300" : "text-red-400"}`}>
                    {profit ? "+" : ""}{p.pnl_pct.toFixed(2)}%
                  </div>
                  <div className={`text-[10px] tabular-nums ${profit ? "text-emerald-400/70" : "text-red-400/70"}`}>
                    {profit ? "+" : ""}{fmtUsd(p.pnl_usd)}
                  </div>
                </div>
              </div>
              <div className="mt-2 text-[9px] text-emerald-500/50">
                <span>SL {p.sl}%</span>
                <span className="mx-2">━━━━━━━━━━━━━━━━━━━━</span>
                <span>TP +{p.tp}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// V2 — GLASSMORPHIC
// ═══════════════════════════════════════════════════════
export function PortfolioV2() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { l: "Open positions", v: MOCK_POSITIONS.length, i: Briefcase },
          { l: "Total invested", v: fmtUsd(totalSize), i: Wallet },
          { l: "Unrealized P&L", v: `${totalPnl >= 0 ? "+" : ""}${fmtUsd(totalPnl)}`, sub: `${totalPct.toFixed(2)}%`, i: TrendingUp, accent: true },
        ].map(({ l, v, sub, i: I, accent }) => (
          <div key={l} className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-xl p-5">
            {accent && <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/20 blur-3xl" />}
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-white/50 uppercase tracking-wider">{l}</span>
                <I className="h-3.5 w-3.5 text-white/40" />
              </div>
              <div className={`text-2xl font-semibold tabular-nums ${accent ? "text-emerald-300" : "text-white"}`}>{v}</div>
              {sub && <div className="text-[11px] text-emerald-400/70 mt-0.5">{sub}</div>}
            </div>
          </div>
        ))}
      </div>
      {MOCK_POSITIONS.map((p, i) => {
        const profit = p.pnl_pct >= 0;
        return (
          <div key={i} className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.03] via-white/[0.01] to-transparent backdrop-blur-xl p-5">
            <div className={`absolute -right-20 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full blur-3xl ${profit ? "bg-emerald-400/10" : "bg-red-400/10"}`} />
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-cyan-400/20 to-purple-400/20 border border-white/10 backdrop-blur-md flex items-center justify-center text-xs font-bold text-white">
                  {p.symbol.slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-white">{p.symbol}</span>
                    <span className="text-[10px] rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-amber-300 font-semibold">{p.grade}</span>
                  </div>
                  <div className="text-[11px] text-white/50 mt-0.5 space-x-3">
                    <span>Entry <span className="text-white/80 font-mono">${p.entry}</span></span>
                    <span>Size <span className="text-white/80 font-mono">{fmtUsd(p.size)}</span></span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-semibold tabular-nums ${profit ? "text-emerald-300" : "text-red-300"}`}>
                  {profit ? "+" : ""}{p.pnl_pct.toFixed(2)}%
                </div>
                <div className={`text-xs tabular-nums ${profit ? "text-emerald-400/60" : "text-red-400/60"}`}>
                  {profit ? "+" : ""}{fmtUsd(p.pnl_usd)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// V3 — PREMIUM MINIMAL
// ═══════════════════════════════════════════════════════
export function PortfolioV3() {
  return (
    <div className="bg-[#0a0a0a]">
      <div className="flex items-baseline justify-between mb-10">
        <div>
          <div className="text-[11px] text-neutral-500 uppercase tracking-[0.12em] mb-2">Unrealized P&L</div>
          <div className="flex items-baseline gap-3">
            <span className={`text-5xl font-medium tracking-tight tabular-nums ${totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {totalPnl >= 0 ? "+" : ""}{fmtUsd(totalPnl)}
            </span>
            <span className="text-base text-neutral-500 tabular-nums">{totalPct >= 0 ? "+" : ""}{totalPct.toFixed(2)}%</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-neutral-500 uppercase tracking-[0.12em] mb-2">Invested</div>
          <div className="text-2xl font-medium text-neutral-100 tabular-nums">{fmtUsd(totalSize)}</div>
        </div>
      </div>
      <div className="border-t border-neutral-900">
        {MOCK_POSITIONS.map((p, i) => {
          const profit = p.pnl_pct >= 0;
          return (
            <div key={i} className="flex items-center justify-between py-5 border-b border-neutral-900 hover:bg-neutral-900/30 transition px-4 -mx-4">
              <div className="flex items-center gap-4">
                <div className="text-[10px] text-neutral-600 tabular-nums">{String(i + 1).padStart(2, "0")}</div>
                <div>
                  <div className="text-base text-neutral-100 font-medium">{p.symbol}</div>
                  <div className="text-[11px] text-neutral-500 tabular-nums mt-0.5">
                    {fmtUsd(p.size)} · Entry ${p.entry}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <div className="h-0.5 w-24 bg-neutral-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${profit ? "bg-emerald-400" : "bg-red-400"}`}
                      style={{ width: `${Math.min(100, Math.abs(p.pnl_pct) * 2)}%` }}
                    />
                  </div>
                </div>
                <div className="text-right w-24">
                  <div className={`text-base font-medium tabular-nums ${profit ? "text-emerald-400" : "text-red-400"}`}>
                    {profit ? "+" : ""}{p.pnl_pct.toFixed(2)}%
                  </div>
                  <div className="text-[11px] text-neutral-500 tabular-nums">
                    {profit ? "+" : ""}{fmtUsd(p.pnl_usd)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// V4 — BRUTALIST
// ═══════════════════════════════════════════════════════
export function PortfolioV4() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-0 border-[3px] border-black shadow-[6px_6px_0_0_#000]">
        <div className="bg-white border-r-[3px] border-black p-4">
          <div className="text-[10px] font-black text-black uppercase">Positions</div>
          <div className="text-3xl font-black text-black tabular-nums mt-1">{MOCK_POSITIONS.length}</div>
        </div>
        <div className="bg-pink-200 border-r-[3px] border-black p-4">
          <div className="text-[10px] font-black text-black uppercase">Invested</div>
          <div className="text-3xl font-black text-black tabular-nums mt-1">{fmtUsd(totalSize)}</div>
        </div>
        <div className={`p-4 ${totalPnl >= 0 ? "bg-lime-300" : "bg-red-300"}`}>
          <div className="text-[10px] font-black text-black uppercase">Unreal P&L</div>
          <div className="text-3xl font-black text-black tabular-nums mt-1">
            {totalPnl >= 0 ? "+" : ""}{fmtUsd(totalPnl)}
          </div>
        </div>
      </div>
      {MOCK_POSITIONS.map((p, i) => {
        const profit = p.pnl_pct >= 0;
        return (
          <div key={i} className="border-[3px] border-black bg-[#f5f0e8] shadow-[6px_6px_0_0_#000] p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 border-[3px] border-black bg-yellow-300 flex items-center justify-center font-black text-black text-xs">
                  {p.symbol.slice(0, 3)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-black uppercase">{p.symbol}</span>
                    <span className="border-2 border-black bg-white px-1.5 py-0.5 text-[9px] font-black">{p.grade}·{p.accum}</span>
                  </div>
                  <div className="text-[11px] font-bold text-black mt-1">
                    ENTRY <span className="font-mono">${p.entry}</span> · SIZE <span className="font-mono">{fmtUsd(p.size)}</span>
                  </div>
                </div>
              </div>
              <div className={`border-[3px] border-black px-4 py-2 ${profit ? "bg-lime-400" : "bg-red-400"}`}>
                <div className="text-3xl font-black text-black tabular-nums">
                  {profit ? "+" : ""}{p.pnl_pct.toFixed(2)}%
                </div>
                <div className="text-[11px] font-black text-black tabular-nums">
                  {profit ? "+" : ""}{fmtUsd(p.pnl_usd)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// V5 — NEO-DATA
// ═══════════════════════════════════════════════════════
export function PortfolioV5() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-px bg-zinc-800/50 rounded-lg overflow-hidden border border-zinc-800/80">
        {[
          { l: "Open", v: MOCK_POSITIONS.length, i: Briefcase },
          { l: "Invested", v: fmtUsd(totalSize), i: Wallet },
          { l: "Unreal P&L", v: `${totalPnl >= 0 ? "+" : ""}${fmtUsd(totalPnl)}`, sub: `${totalPct.toFixed(2)}%`, i: TrendingUp, accent: true },
        ].map(({ l, v, sub, i: I, accent }) => (
          <div key={l} className="bg-zinc-950 px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{l}</span>
              <I className="h-3 w-3 text-zinc-600" />
            </div>
            <div className={`text-xl font-semibold tabular-nums ${accent ? "text-emerald-400" : "text-zinc-100"}`}>{v}</div>
            {sub && <div className="text-[10px] font-mono text-emerald-400/70 mt-0.5">{sub}</div>}
          </div>
        ))}
      </div>
      {MOCK_POSITIONS.map((p, i) => {
        const profit = p.pnl_pct >= 0;
        const range = p.tp - p.sl;
        const barPos = Math.max(0, Math.min(100, ((p.pnl_pct - p.sl) / range) * 100));
        const zeroPos = Math.max(0, Math.min(100, ((0 - p.sl) / range) * 100));
        return (
          <div key={i} className="rounded-lg border border-zinc-800/80 bg-zinc-950 p-4">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3 flex-1">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-cyan-500/20 to-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-200">
                  {p.symbol.slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-100">{p.symbol}</span>
                    <span className="text-[9px] font-bold font-mono border border-amber-400/30 bg-amber-400/10 text-amber-400 px-1.5 py-0.5 rounded">{p.grade}</span>
                    <span className="text-[9px] font-mono text-zinc-500">accum {p.accum}</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5 space-x-2 font-mono">
                    <span>entry <span className="text-zinc-300">${p.entry}</span></span>
                    <span>·</span>
                    <span>now <span className="text-zinc-300">${p.now}</span></span>
                    <span>·</span>
                    <span>size <span className="text-zinc-300">{fmtUsd(p.size)}</span></span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-semibold tabular-nums leading-none ${profit ? "text-emerald-400" : "text-red-400"}`}>
                  {profit ? "+" : ""}{p.pnl_pct.toFixed(2)}%
                </div>
                <div className={`text-[10px] font-mono tabular-nums mt-1 ${profit ? "text-emerald-400/70" : "text-red-400/70"}`}>
                  {profit ? "+" : ""}{fmtUsd(p.pnl_usd)}
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-[9px] font-mono mb-1">
                <span className="text-red-400/70">SL {p.sl}%</span>
                <span className="text-zinc-500">Entry 0%</span>
                <span className="text-emerald-400/70">TP +{p.tp}%</span>
              </div>
              <div className="relative h-1 rounded-full bg-zinc-800/80 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-zinc-700/20 to-emerald-500/20" />
                <div className="absolute top-0 bottom-0 w-px bg-zinc-500" style={{ left: `${zeroPos}%` }} />
                <div className={`absolute top-1/2 -translate-y-1/2 h-2 w-1 rounded-full ${profit ? "bg-emerald-400" : "bg-red-400"}`} style={{ left: `calc(${barPos}% - 2px)` }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// V6 — OBSIDIAN PRO (Linear/Stripe · emerald · soft shadow)
// ═══════════════════════════════════════════════════════
export function PortfolioV6() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0b0d10] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_20px_60px_-20px_rgba(0,0,0,0.8)]">
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="text-[11px] text-zinc-500 tracking-wide uppercase mb-2">Unrealized P&L</div>
          <div className="flex items-baseline gap-3">
            <span className={`text-4xl font-semibold tracking-tight tabular-nums ${totalPnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {totalPnl >= 0 ? "+" : ""}{fmtUsd(totalPnl)}
            </span>
            <span className={`inline-flex items-center gap-1 text-[11px] font-medium rounded-md px-1.5 py-0.5 ${totalPnl >= 0 ? "bg-emerald-400/10 text-emerald-400" : "bg-rose-400/10 text-rose-400"}`}>
              {totalPnl >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {totalPct.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="flex gap-6 text-right">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Positions</div>
            <div className="text-xl font-semibold text-zinc-100 tabular-nums">{MOCK_POSITIONS.length}</div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Invested</div>
            <div className="text-xl font-semibold text-zinc-100 tabular-nums">{fmtUsd(totalSize)}</div>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {MOCK_POSITIONS.map((p, i) => {
          const profit = p.pnl_pct >= 0;
          return (
            <div key={i} className="group rounded-xl border border-white/[0.05] bg-gradient-to-b from-white/[0.02] to-transparent p-4 hover:border-emerald-400/20 transition shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-400/20 to-emerald-600/5 border border-emerald-400/20 flex items-center justify-center text-[11px] font-semibold text-emerald-300">
                    {p.symbol.slice(0, 3)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-100">{p.symbol}</span>
                      <span className="text-[9px] font-medium rounded bg-emerald-400/10 text-emerald-300 border border-emerald-400/20 px-1.5 py-0.5">{p.grade} · {p.accum}</span>
                    </div>
                    <div className="text-[11px] text-zinc-500 tabular-nums mt-0.5 font-mono">
                      {fmtUsd(p.size)} · entry ${p.entry} → ${p.now}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-semibold tabular-nums ${profit ? "text-emerald-400" : "text-rose-400"}`}>
                    {profit ? "+" : ""}{p.pnl_pct.toFixed(2)}%
                  </div>
                  <div className={`text-[11px] tabular-nums ${profit ? "text-emerald-400/60" : "text-rose-400/60"}`}>
                    {profit ? "+" : ""}{fmtUsd(p.pnl_usd)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// V7 — TANGERINE (CMC · orange accents · dense tabular)
// ═══════════════════════════════════════════════════════
export function PortfolioV7() {
  return (
    <div className="rounded-lg border border-zinc-800 bg-[#0d1014]">
      <div className="grid grid-cols-4 border-b border-zinc-800">
        <div className="px-5 py-4 border-r border-zinc-800">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Positions</div>
          <div className="text-2xl font-bold text-zinc-100 tabular-nums mt-1">{MOCK_POSITIONS.length}</div>
        </div>
        <div className="px-5 py-4 border-r border-zinc-800">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Invested</div>
          <div className="text-2xl font-bold text-zinc-100 tabular-nums mt-1">{fmtUsd(totalSize)}</div>
        </div>
        <div className="px-5 py-4 border-r border-zinc-800">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Unreal P&L</div>
          <div className={`text-2xl font-bold tabular-nums mt-1 ${totalPnl >= 0 ? "text-[#16c784]" : "text-[#ea3943]"}`}>
            {totalPnl >= 0 ? "+" : ""}{fmtUsd(totalPnl)}
          </div>
        </div>
        <div className="px-5 py-4">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">% Return</div>
          <div className={`text-2xl font-bold tabular-nums mt-1 ${totalPnl >= 0 ? "text-[#16c784]" : "text-[#ea3943]"}`}>
            {totalPnl >= 0 ? "+" : ""}{totalPct.toFixed(2)}%
          </div>
        </div>
      </div>
      <table className="w-full text-[12px]">
        <thead>
          <tr className="bg-[#12161c] text-zinc-500 text-[10px] uppercase tracking-wider">
            <th className="px-4 py-2 text-left font-medium w-10">#</th>
            <th className="px-4 py-2 text-left font-medium">Token</th>
            <th className="px-4 py-2 text-right font-medium">Entry</th>
            <th className="px-4 py-2 text-right font-medium">Now</th>
            <th className="px-4 py-2 text-right font-medium">Size</th>
            <th className="px-4 py-2 text-right font-medium">P&L %</th>
            <th className="px-4 py-2 text-right font-medium">P&L USD</th>
            <th className="px-4 py-2 text-center font-medium">Grade</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_POSITIONS.map((p, i) => {
            const profit = p.pnl_pct >= 0;
            return (
              <tr key={i} className="border-t border-zinc-800/60 hover:bg-[#12161c] transition">
                <td className="px-4 py-3 text-zinc-500 tabular-nums">{i + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-[#f7931a]/10 border border-[#f7931a]/30 flex items-center justify-center text-[9px] font-bold text-[#f7931a]">
                      {p.symbol.slice(0, 3)}
                    </div>
                    <div className="font-semibold text-zinc-100">{p.symbol}</div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-mono text-zinc-300 tabular-nums">${p.entry}</td>
                <td className="px-4 py-3 text-right font-mono text-zinc-100 tabular-nums">${p.now}</td>
                <td className="px-4 py-3 text-right font-mono text-zinc-300 tabular-nums">{fmtUsd(p.size)}</td>
                <td className={`px-4 py-3 text-right font-semibold tabular-nums ${profit ? "text-[#16c784]" : "text-[#ea3943]"}`}>
                  {profit ? "+" : ""}{p.pnl_pct.toFixed(2)}%
                </td>
                <td className={`px-4 py-3 text-right font-mono tabular-nums ${profit ? "text-[#16c784]" : "text-[#ea3943]"}`}>
                  {profit ? "+" : ""}{fmtUsd(p.pnl_usd)}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-[10px] font-bold text-[#f7931a] bg-[#f7931a]/10 border border-[#f7931a]/30 rounded px-1.5 py-0.5">{p.grade}</span>
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
// V8 — OCEAN (Navy gradient · cyan rim-light · trading)
// ═══════════════════════════════════════════════════════
export function PortfolioV8() {
  return (
    <div className="space-y-4">
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#041024] via-[#030814] to-[#050b1a] border border-cyan-400/10 p-6">
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative grid grid-cols-3 gap-6">
          <div>
            <div className="text-[10px] text-cyan-300/50 uppercase tracking-[0.15em]">Open Positions</div>
            <div className="text-3xl font-light text-white tabular-nums mt-1">{MOCK_POSITIONS.length}</div>
          </div>
          <div>
            <div className="text-[10px] text-cyan-300/50 uppercase tracking-[0.15em]">Invested</div>
            <div className="text-3xl font-light text-white tabular-nums mt-1">{fmtUsd(totalSize)}</div>
          </div>
          <div>
            <div className="text-[10px] text-cyan-300/50 uppercase tracking-[0.15em]">Unrealized P&L</div>
            <div className={`text-3xl font-light tabular-nums mt-1 bg-gradient-to-r ${totalPnl >= 0 ? "from-cyan-300 to-emerald-300" : "from-rose-300 to-orange-300"} bg-clip-text text-transparent`}>
              {totalPnl >= 0 ? "+" : ""}{fmtUsd(totalPnl)}
            </div>
          </div>
        </div>
      </div>
      {MOCK_POSITIONS.map((p, i) => {
        const profit = p.pnl_pct >= 0;
        return (
          <div key={i} className="relative rounded-xl overflow-hidden border border-cyan-400/[0.08] bg-gradient-to-br from-[#061228] to-[#030814] p-5">
            <div className={`absolute inset-y-0 left-0 w-[2px] ${profit ? "bg-gradient-to-b from-cyan-400 to-emerald-400" : "bg-gradient-to-b from-rose-400 to-orange-400"}`} />
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className={`absolute inset-0 rounded-full blur-md ${profit ? "bg-cyan-400/30" : "bg-rose-400/30"}`} />
                  <div className="relative h-12 w-12 rounded-full border border-cyan-400/30 bg-[#071a34] flex items-center justify-center text-[11px] font-semibold text-cyan-100">
                    {p.symbol.slice(0, 3)}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-medium text-white tracking-tight">{p.symbol}</span>
                    <span className="text-[9px] font-mono text-cyan-300/70 bg-cyan-400/10 border border-cyan-400/20 rounded px-1.5 py-0.5 tracking-wider">{p.grade}</span>
                  </div>
                  <div className="text-[11px] text-cyan-200/40 mt-1 tabular-nums font-mono">
                    ${p.entry} → ${p.now} · {fmtUsd(p.size)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-light tabular-nums bg-gradient-to-r bg-clip-text text-transparent ${profit ? "from-cyan-300 to-emerald-300" : "from-rose-300 to-orange-300"}`}>
                  {profit ? "+" : ""}{p.pnl_pct.toFixed(2)}%
                </div>
                <div className={`text-[11px] tabular-nums ${profit ? "text-cyan-300/60" : "text-rose-300/60"}`}>
                  {profit ? "+" : ""}{fmtUsd(p.pnl_usd)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// V9 — IVORY (Luxury editorial · serif · cream + forest)
// ═══════════════════════════════════════════════════════
export function PortfolioV9() {
  return (
    <div className="rounded-sm bg-[#faf8f3] border border-[#14532d]/15 p-8">
      <div className="flex items-end justify-between pb-6 border-b border-[#14532d]/15 mb-6">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#14532d]/60 mb-2">The Ledger</div>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl text-[#14532d] tracking-tight tabular-nums" style={{ fontFamily: "Georgia, serif" }}>
              {totalPnl >= 0 ? "+" : ""}{fmtUsd(totalPnl)}
            </span>
            <span className="text-sm text-[#14532d]/60 italic">unrealized · {totalPct.toFixed(2)}%</span>
          </div>
        </div>
        <div className="flex gap-8 text-right">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#14532d]/50">Holdings</div>
            <div className="text-2xl text-[#14532d] tabular-nums mt-1" style={{ fontFamily: "Georgia, serif" }}>{MOCK_POSITIONS.length}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#14532d]/50">Capital</div>
            <div className="text-2xl text-[#14532d] tabular-nums mt-1" style={{ fontFamily: "Georgia, serif" }}>{fmtUsd(totalSize)}</div>
          </div>
        </div>
      </div>
      <div>
        {MOCK_POSITIONS.map((p, i) => {
          const profit = p.pnl_pct >= 0;
          return (
            <div key={i} className="flex items-center justify-between py-5 border-b border-[#14532d]/10 last:border-0">
              <div className="flex items-center gap-5">
                <span className="text-xs text-[#14532d]/40 tabular-nums italic" style={{ fontFamily: "Georgia, serif" }}>№ {String(i + 1).padStart(2, "0")}</span>
                <div>
                  <div className="text-xl text-[#14532d] tracking-tight" style={{ fontFamily: "Georgia, serif" }}>{p.symbol}</div>
                  <div className="text-[11px] text-[#14532d]/50 italic mt-0.5 tabular-nums">
                    {fmtUsd(p.size)} · entered ${p.entry} · grade {p.grade}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl tabular-nums ${profit ? "text-[#14532d]" : "text-[#8b1a1a]"}`} style={{ fontFamily: "Georgia, serif" }}>
                  {profit ? "+" : ""}{p.pnl_pct.toFixed(2)}%
                </div>
                <div className={`text-[11px] italic ${profit ? "text-[#14532d]/60" : "text-[#8b1a1a]/60"} tabular-nums`}>
                  {profit ? "+" : ""}{fmtUsd(p.pnl_usd)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// V10 — VOID (Pure black · yellow · Bybit dense pro)
// ═══════════════════════════════════════════════════════
export function PortfolioV10() {
  return (
    <div className="bg-black border border-zinc-900">
      <div className="grid grid-cols-5 border-b border-zinc-900 divide-x divide-zinc-900 font-mono">
        <div className="px-4 py-3">
          <div className="text-[9px] text-zinc-600 uppercase tracking-wider">OPEN</div>
          <div className="text-lg font-bold text-white tabular-nums">{MOCK_POSITIONS.length}</div>
        </div>
        <div className="px-4 py-3">
          <div className="text-[9px] text-zinc-600 uppercase tracking-wider">MARGIN</div>
          <div className="text-lg font-bold text-white tabular-nums">{fmtUsd(totalSize)}</div>
        </div>
        <div className="px-4 py-3">
          <div className="text-[9px] text-zinc-600 uppercase tracking-wider">UPL</div>
          <div className={`text-lg font-bold tabular-nums ${totalPnl >= 0 ? "text-[#facc15]" : "text-[#f87171]"}`}>
            {totalPnl >= 0 ? "+" : ""}{fmtUsd(totalPnl)}
          </div>
        </div>
        <div className="px-4 py-3">
          <div className="text-[9px] text-zinc-600 uppercase tracking-wider">ROE%</div>
          <div className={`text-lg font-bold tabular-nums ${totalPnl >= 0 ? "text-[#facc15]" : "text-[#f87171]"}`}>
            {totalPnl >= 0 ? "+" : ""}{totalPct.toFixed(2)}%
          </div>
        </div>
        <div className="px-4 py-3">
          <div className="text-[9px] text-zinc-600 uppercase tracking-wider">RISK</div>
          <div className="text-lg font-bold text-white tabular-nums">0.24</div>
        </div>
      </div>
      <table className="w-full text-[11px] font-mono">
        <thead>
          <tr className="text-zinc-600 text-[9px] uppercase tracking-wider border-b border-zinc-900">
            <th className="px-3 py-2 text-left">Symbol</th>
            <th className="px-3 py-2 text-right">Size</th>
            <th className="px-3 py-2 text-right">Entry</th>
            <th className="px-3 py-2 text-right">Mark</th>
            <th className="px-3 py-2 text-right">UPL</th>
            <th className="px-3 py-2 text-right">ROE%</th>
            <th className="px-3 py-2 text-right">Liq. Est</th>
            <th className="px-3 py-2 text-center">Grade</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_POSITIONS.map((p, i) => {
            const profit = p.pnl_pct >= 0;
            return (
              <tr key={i} className="border-b border-zinc-900/60 hover:bg-zinc-950 transition">
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className={`h-1.5 w-1.5 rounded-full ${profit ? "bg-[#facc15]" : "bg-[#f87171]"}`} />
                    <span className="font-bold text-white">{p.symbol}</span>
                    <span className="text-zinc-600">/USDT</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-right text-zinc-300 tabular-nums">{fmtUsd(p.size)}</td>
                <td className="px-3 py-2.5 text-right text-zinc-400 tabular-nums">{p.entry}</td>
                <td className="px-3 py-2.5 text-right text-white tabular-nums">{p.now}</td>
                <td className={`px-3 py-2.5 text-right tabular-nums ${profit ? "text-[#facc15]" : "text-[#f87171]"}`}>
                  {profit ? "+" : ""}{fmtUsd(p.pnl_usd)}
                </td>
                <td className={`px-3 py-2.5 text-right font-bold tabular-nums ${profit ? "text-[#facc15]" : "text-[#f87171]"}`}>
                  {profit ? "+" : ""}{p.pnl_pct.toFixed(2)}%
                </td>
                <td className="px-3 py-2.5 text-right text-zinc-600 tabular-nums">--</td>
                <td className="px-3 py-2.5 text-center">
                  <span className="text-[9px] font-bold text-[#facc15] bg-[#facc15]/10 border border-[#facc15]/30 px-1.5 py-0.5 rounded-sm">{p.grade}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-950 border-t border-zinc-900 text-[9px] font-mono text-zinc-600 uppercase tracking-wider">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><Shield className="h-2.5 w-2.5" /> Isolated</span>
          <span className="flex items-center gap-1"><Target className="h-2.5 w-2.5" /> Cross: OFF</span>
        </div>
        <div>Latency: 42ms · Engine: LIVE</div>
      </div>
    </div>
  );
}
