// 10 style variants for the Wallet Profile Header surface.
import { ArrowLeft, Copy, ExternalLink, Trophy, TrendingUp, Activity, Coins, Zap, Sparkles, Shield, CheckCircle2 } from "lucide-react";
import { MOCK_WALLET, fmtUsd, fmtPct } from "../mock";

const w = MOCK_WALLET;

// ═══════════════════════════════════════════════════════
// V1 — TERMINAL
// ═══════════════════════════════════════════════════════
export function WalletV1() {
  return (
    <div className="rounded-sm border border-emerald-500/30 bg-black font-mono">
      <div className="border-b border-emerald-500/20 px-4 py-1.5 text-[10px] text-emerald-400/70">
        {`// wallet.detail --address ${w.address.slice(0, 10)}... --grade S`}
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 border-2 border-amber-400/60 bg-amber-400/10 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400">{w.grade}</div>
                <div className="text-[8px] text-amber-400/70 font-mono tracking-wider">ELITE</div>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-emerald-500/50 mb-1">WALLET_LABEL</div>
              <div className="text-xl font-bold text-emerald-300 mb-1">{w.label}</div>
              <div className="text-[10px] text-emerald-400/60 font-mono">{w.address}</div>
              <div className="flex gap-2 mt-3">
                <button className="border border-emerald-500/30 px-2 py-1 text-[10px] text-emerald-400 hover:bg-emerald-500/10">[C]opy</button>
                <button className="border border-emerald-500/30 px-2 py-1 text-[10px] text-emerald-400 hover:bg-emerald-500/10">[N]ansen</button>
                <button className="border border-emerald-500/30 px-2 py-1 text-[10px] text-emerald-400 hover:bg-emerald-500/10">[D]exScreener</button>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-emerald-500/50 tracking-wider">OVERALL_SCORE</div>
            <div className="text-5xl font-bold text-emerald-300 tabular-nums leading-none">{w.score}</div>
            <div className="text-[10px] text-emerald-500/60 tabular-nums">/ 100</div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-0 border border-emerald-500/20 divide-x divide-emerald-500/20">
          {[
            ["WIN_RATE", fmtPct(w.win_rate)],
            ["REALIZED", `+${fmtUsd(w.realized)}`],
            ["TRADES", w.trades],
            ["VOLUME", fmtUsd(w.volume)],
          ].map(([k, v]) => (
            <div key={k as string} className="px-3 py-2">
              <div className="text-[9px] text-emerald-500/50 tracking-wider">{k}</div>
              <div className="text-sm font-bold text-emerald-300 tabular-nums">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// V2 — GLASSMORPHIC
// ═══════════════════════════════════════════════════════
export function WalletV2() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-2xl p-8">
      <div className="absolute top-0 left-1/3 h-64 w-64 rounded-full bg-amber-400/15 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/40 to-amber-600/20 blur-xl" />
              <div className="relative h-20 w-20 rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-400/20 to-amber-500/5 backdrop-blur-md flex items-center justify-center">
                <Sparkles className="absolute top-1.5 right-1.5 h-3 w-3 text-amber-400/80" />
                <div className="text-4xl font-bold bg-gradient-to-b from-amber-200 to-amber-500 bg-clip-text text-transparent">{w.grade}</div>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 backdrop-blur-md px-2.5 py-0.5 text-[10px] text-amber-300 mb-2">
                <Sparkles className="h-2.5 w-2.5" /> Elite smart money
              </div>
              <h1 className="text-2xl font-semibold text-white tracking-tight mb-1">{w.label}</h1>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md px-3 py-1">
                <span className="text-[11px] text-white/60 font-mono">{w.address.slice(0, 20)}...{w.address.slice(-6)}</span>
                <Copy className="h-3 w-3 text-white/40 hover:text-white cursor-pointer" />
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-white/50 uppercase tracking-wider">Overall score</div>
            <div className="text-6xl font-semibold bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent tabular-nums leading-none mt-1">
              {w.score}
            </div>
            <div className="text-[11px] text-white/40 tabular-nums">of 100</div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { l: "Win rate", v: fmtPct(w.win_rate), i: Trophy },
            { l: "Realized P&L", v: `+${fmtUsd(w.realized)}`, i: TrendingUp, accent: true },
            { l: "Trades", v: w.trades, i: Activity },
            { l: "Volume", v: fmtUsd(w.volume), i: Coins },
          ].map(({ l, v, i: I, accent }) => (
            <div key={l} className="rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-md p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-white/40 uppercase tracking-wider">{l}</span>
                <I className="h-3 w-3 text-white/40" />
              </div>
              <div className={`text-lg font-semibold tabular-nums ${accent ? "text-emerald-300" : "text-white"}`}>{v}</div>
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
export function WalletV3() {
  return (
    <div className="bg-[#0a0a0a]">
      <button className="inline-flex items-center gap-1.5 text-[11px] text-neutral-500 hover:text-neutral-100 transition mb-8">
        <ArrowLeft className="h-3 w-3" /> Back to wallets
      </button>
      <div className="flex items-start justify-between mb-10 gap-6">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 text-[11px] text-neutral-500 mb-4">
            <span className="inline-block h-1 w-1 rounded-full bg-amber-400" />
            Elite tier · Top 1% of tracked wallets
          </div>
          <h1 className="text-4xl font-medium text-neutral-100 tracking-tight mb-3">{w.label}</h1>
          <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-500">
            <span>{w.address.slice(0, 14)}...{w.address.slice(-8)}</span>
            <span className="text-neutral-700">·</span>
            <button className="hover:text-neutral-100 transition inline-flex items-center gap-1">Copy <Copy className="h-3 w-3" /></button>
            <span className="text-neutral-700">·</span>
            <button className="hover:text-neutral-100 transition inline-flex items-center gap-1">Nansen <ExternalLink className="h-3 w-3" /></button>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-baseline gap-2 justify-end">
            <span className="text-7xl font-medium text-neutral-100 tracking-tight tabular-nums leading-none">{w.score}</span>
            <span className="text-2xl text-neutral-600 font-light tabular-nums">/100</span>
          </div>
          <div className="text-[11px] text-neutral-500 uppercase tracking-[0.12em] mt-2">Grade {w.grade} · Elite</div>
        </div>
      </div>
      <div className="grid grid-cols-4 border-t border-neutral-900 pt-8">
        {[
          { l: "Win rate", v: fmtPct(w.win_rate) },
          { l: "Realized P&L", v: `+${fmtUsd(w.realized)}`, profit: true },
          { l: "Trades", v: w.trades.toString() },
          { l: "Volume traded", v: fmtUsd(w.volume) },
        ].map((s) => (
          <div key={s.l}>
            <div className="text-[10px] text-neutral-500 uppercase tracking-[0.12em] mb-2">{s.l}</div>
            <div className={`text-2xl font-medium tracking-tight tabular-nums ${s.profit ? "text-emerald-400" : "text-neutral-100"}`}>
              {s.v}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// V4 — BRUTALIST
// ═══════════════════════════════════════════════════════
export function WalletV4() {
  return (
    <div className="bg-[#f5f0e8] border-[3px] border-black shadow-[8px_8px_0_0_#000] p-6">
      <div className="flex items-center gap-1.5 text-[10px] font-black text-black uppercase mb-5">
        <ArrowLeft className="h-3 w-3 stroke-[3]" /> BACK
      </div>
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="relative h-24 w-24 border-[3px] border-black bg-lime-400 flex items-center justify-center shadow-[4px_4px_0_0_#000]">
            <div className="absolute -top-2 -right-2 border-2 border-black bg-black text-lime-400 px-1 text-[8px] font-black">TOP 1%</div>
            <div className="text-5xl font-black text-black">{w.grade}</div>
          </div>
          <div>
            <div className="inline-flex items-center border-2 border-black bg-yellow-300 px-2 py-0.5 text-[10px] font-black text-black uppercase mb-2">
              <Zap className="h-3 w-3 mr-1" /> ELITE WALLET
            </div>
            <h1 className="text-3xl font-black text-black uppercase tracking-tight mb-2 max-w-sm leading-none">{w.label}</h1>
            <div className="inline-flex items-center gap-2 border-2 border-black bg-white px-2 py-1">
              <span className="text-[10px] font-mono font-bold text-black">{w.address.slice(0, 16)}...{w.address.slice(-4)}</span>
              <Copy className="h-3 w-3 text-black stroke-[2.5]" />
            </div>
          </div>
        </div>
        <div className="border-[3px] border-black bg-lime-400 p-4 shadow-[4px_4px_0_0_#000]">
          <div className="text-[10px] font-black text-black uppercase">Score</div>
          <div className="text-5xl font-black text-black tabular-nums leading-none">{w.score}</div>
          <div className="text-[10px] font-black text-black">/ 100</div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-0 border-[3px] border-black bg-white">
        {[
          { l: "WIN RATE", v: fmtPct(w.win_rate), bg: "bg-white" },
          { l: "REALIZED", v: `+${fmtUsd(w.realized)}`, bg: "bg-lime-300" },
          { l: "TRADES", v: w.trades, bg: "bg-pink-200" },
          { l: "VOLUME", v: fmtUsd(w.volume), bg: "bg-yellow-200" },
        ].map((s, i) => (
          <div key={s.l} className={`${s.bg} ${i < 3 ? "border-r-[3px] border-black" : ""} p-3`}>
            <div className="text-[9px] font-black text-black uppercase">{s.l}</div>
            <div className="text-lg font-black text-black tabular-nums mt-1">{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// V5 — NEO-DATA
// ═══════════════════════════════════════════════════════
export function WalletV5() {
  return (
    <div className="rounded-xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/50 to-zinc-950 p-5">
      <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mb-4">
        <ArrowLeft className="h-3 w-3" />
        <span>Discovery</span>
        <span className="text-zinc-700">/</span>
        <span>Wallet</span>
        <span className="text-zinc-700">/</span>
        <span className="text-zinc-300 font-mono">{w.address.slice(0, 8)}</span>
      </div>
      <div className="flex items-start justify-between mb-5 pb-5 border-b border-zinc-800/60 gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-xl border border-amber-400/40 bg-gradient-to-br from-amber-400/20 to-amber-500/5 flex items-center justify-center">
              <div className="text-3xl font-bold text-amber-400">{w.grade}</div>
            </div>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-zinc-950 flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[9px] font-mono text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded tracking-wider">ELITE</span>
              <span className="text-[9px] font-mono text-zinc-500">verified · top 1%</span>
            </div>
            <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">{w.label}</h1>
            <div className="flex items-center gap-1 mt-1.5">
              <span className="text-[10px] font-mono text-zinc-500">{w.address.slice(0, 12)}...{w.address.slice(-6)}</span>
              <button className="text-zinc-500 hover:text-zinc-300"><Copy className="h-2.5 w-2.5" /></button>
              <span className="text-zinc-700 mx-1">·</span>
              <button className="text-[10px] text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-0.5">Nansen <ExternalLink className="h-2.5 w-2.5" /></button>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[9px] text-zinc-500 uppercase tracking-wider">Score</div>
          <div className="flex items-baseline gap-1 justify-end">
            <span className="text-4xl font-semibold text-zinc-100 tabular-nums leading-none">{w.score}</span>
            <span className="text-xs text-zinc-600 tabular-nums">/100</span>
          </div>
          <div className="h-1 w-20 rounded-full bg-zinc-800 overflow-hidden mt-2">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400" style={{ width: `${w.score}%` }} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-px bg-zinc-800/50 rounded-md overflow-hidden">
        {[
          { l: "Win rate", v: fmtPct(w.win_rate), d: `${w.wins}W / ${w.losses}L`, i: Trophy },
          { l: "Realized", v: `+${fmtUsd(w.realized)}`, d: "+12.4% 30d", i: TrendingUp, accent: true },
          { l: "Trades", v: w.trades, d: `${w.tokens} tokens`, i: Activity },
          { l: "Volume", v: fmtUsd(w.volume), d: "90d window", i: Coins },
        ].map(({ l, v, d, i: I, accent }) => (
          <div key={l} className="bg-zinc-950 px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <I className="h-2.5 w-2.5 text-zinc-500" />
              <span className="text-[9px] text-zinc-500 uppercase tracking-wider">{l}</span>
            </div>
            <div className={`text-base font-semibold tabular-nums ${accent ? "text-emerald-400" : "text-zinc-100"}`}>{v}</div>
            <div className="text-[9px] font-mono text-zinc-500 mt-0.5">{d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// V6 — OBSIDIAN PRO (Linear/Stripe · emerald · soft shadow)
// ═══════════════════════════════════════════════════════
export function WalletV6() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0b0d10] p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_20px_60px_-20px_rgba(0,0,0,0.8)]">
      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mb-5">
        <ArrowLeft className="h-3 w-3" />
        <span>Back to wallets</span>
      </div>
      <div className="flex items-start justify-between mb-7 gap-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-emerald-400/10 blur-xl" />
            <div className="relative h-16 w-16 rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-400/15 to-emerald-400/[0.03] flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <span className="text-2xl font-semibold text-emerald-300">{w.grade}</span>
            </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-medium text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2 py-0.5 mb-2">
              <CheckCircle2 className="h-2.5 w-2.5" /> Elite · Verified
            </div>
            <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight mb-1">{w.label}</h1>
            <div className="inline-flex items-center gap-2 text-[11px] font-mono text-zinc-500">
              <span>{w.address.slice(0, 14)}...{w.address.slice(-6)}</span>
              <Copy className="h-3 w-3 hover:text-zinc-200 cursor-pointer" />
              <span className="text-zinc-700">·</span>
              <ExternalLink className="h-3 w-3 hover:text-zinc-200 cursor-pointer" />
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Overall Score</div>
          <div className="flex items-baseline gap-1 justify-end">
            <span className="text-5xl font-semibold text-zinc-100 tabular-nums leading-none">{w.score}</span>
            <span className="text-lg text-zinc-600 tabular-nums">/100</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {[
          { l: "Win rate", v: fmtPct(w.win_rate), i: Trophy },
          { l: "Realized P&L", v: `+${fmtUsd(w.realized)}`, i: TrendingUp, accent: true },
          { l: "Trades", v: w.trades, i: Activity },
          { l: "Volume", v: fmtUsd(w.volume), i: Coins },
        ].map(({ l, v, i: I, accent }) => (
          <div key={l} className="rounded-xl border border-white/[0.05] bg-gradient-to-b from-white/[0.02] to-transparent p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{l}</span>
              <I className="h-3 w-3 text-zinc-600" />
            </div>
            <div className={`text-lg font-semibold tabular-nums ${accent ? "text-emerald-400" : "text-zinc-100"}`}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// V7 — TANGERINE (CMC · orange accents · dense)
// ═══════════════════════════════════════════════════════
export function WalletV7() {
  return (
    <div className="rounded-lg border border-zinc-800 bg-[#0d1014] overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-2.5 border-b border-zinc-800 bg-[#12161c] text-[11px] text-zinc-500">
        <ArrowLeft className="h-3 w-3" />
        <span>Wallets</span>
        <span className="text-zinc-700">/</span>
        <span className="text-zinc-300 font-mono">{w.address.slice(0, 10)}...</span>
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-[#f7931a]/10 border-2 border-[#f7931a]/40 flex items-center justify-center">
              <span className="text-xl font-bold text-[#f7931a]">{w.grade}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-zinc-100">{w.label}</h1>
                <span className="text-[10px] font-bold text-[#f7931a] bg-[#f7931a]/10 border border-[#f7931a]/40 rounded px-1.5 py-0.5 uppercase tracking-wider">Top 1%</span>
              </div>
              <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-1.5">
                <span>{w.address.slice(0, 16)}...{w.address.slice(-4)}</span>
                <Copy className="h-3 w-3 hover:text-[#f7931a] cursor-pointer" />
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Rank Score</div>
            <div className="text-4xl font-bold text-[#f7931a] tabular-nums leading-none mt-1">{w.score}</div>
            <div className="h-1 w-24 rounded-full bg-zinc-800 overflow-hidden mt-2">
              <div className="h-full bg-[#f7931a]" style={{ width: `${w.score}%` }} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-0 border-t border-zinc-800/60 divide-x divide-zinc-800/60">
          {[
            { l: "Win Rate", v: fmtPct(w.win_rate) },
            { l: "Realized P&L", v: `+${fmtUsd(w.realized)}`, accent: true },
            { l: "Unreal P&L", v: `+${fmtUsd(w.unrealized)}`, accent: true },
            { l: "Trades", v: w.trades.toString() },
            { l: "Volume", v: fmtUsd(w.volume) },
          ].map((s, i) => (
            <div key={i} className="px-4 py-3 first:pl-0">
              <div className="text-[9px] text-zinc-500 uppercase tracking-wider">{s.l}</div>
              <div className={`text-base font-bold tabular-nums mt-1 ${s.accent ? "text-[#16c784]" : "text-zinc-100"}`}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// V8 — OCEAN (Navy gradient · cyan rim-light)
// ═══════════════════════════════════════════════════════
export function WalletV8() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-cyan-400/10 bg-gradient-to-br from-[#041024] via-[#030814] to-[#050b1a] p-8">
      <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute bottom-0 right-1/3 h-48 w-48 rounded-full bg-emerald-400/5 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-1.5 text-[11px] text-cyan-300/50 mb-6">
          <ArrowLeft className="h-3 w-3" />
          <span className="uppercase tracking-[0.15em]">Back</span>
        </div>
        <div className="flex items-start justify-between mb-8 gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-cyan-400/30 blur-xl animate-pulse" />
              <div className="relative h-20 w-20 rounded-full border border-cyan-400/40 bg-[#071a34] flex items-center justify-center">
                <div className="absolute inset-1 rounded-full border border-cyan-400/20" />
                <span className="text-3xl font-light bg-gradient-to-b from-cyan-200 to-cyan-400 bg-clip-text text-transparent">{w.grade}</span>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] text-cyan-300 border border-cyan-400/30 bg-cyan-400/5 rounded-full px-2.5 py-0.5 mb-3 uppercase tracking-[0.15em]">
                <Sparkles className="h-2.5 w-2.5" /> Elite Smart Money
              </div>
              <h1 className="text-3xl font-light text-white tracking-tight mb-2">{w.label}</h1>
              <div className="inline-flex items-center gap-2 text-[11px] font-mono text-cyan-200/50 border border-cyan-400/10 rounded-full px-3 py-1 bg-cyan-400/[0.03]">
                <span>{w.address.slice(0, 18)}...{w.address.slice(-6)}</span>
                <Copy className="h-3 w-3 hover:text-cyan-300 cursor-pointer" />
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-cyan-300/50 uppercase tracking-[0.15em]">Score</div>
            <div className="text-7xl font-light bg-gradient-to-b from-cyan-200 to-cyan-400 bg-clip-text text-transparent tabular-nums leading-none mt-1">
              {w.score}
            </div>
            <div className="text-[11px] text-cyan-300/40 tabular-nums mt-1">of 100</div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { l: "Win rate", v: fmtPct(w.win_rate), i: Trophy },
            { l: "Realized P&L", v: `+${fmtUsd(w.realized)}`, i: TrendingUp, accent: true },
            { l: "Trades", v: w.trades, i: Activity },
            { l: "Volume", v: fmtUsd(w.volume), i: Coins },
          ].map(({ l, v, i: I, accent }) => (
            <div key={l} className="rounded-xl border border-cyan-400/[0.08] bg-gradient-to-b from-cyan-400/[0.03] to-transparent p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-cyan-300/40 uppercase tracking-[0.1em]">{l}</span>
                <I className="h-3 w-3 text-cyan-300/40" />
              </div>
              <div className={`text-xl font-light tabular-nums ${accent ? "bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent" : "text-white"}`}>
                {v}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// V9 — IVORY (Luxury editorial · serif · cream + forest)
// ═══════════════════════════════════════════════════════
export function WalletV9() {
  return (
    <div className="bg-[#faf8f3] border border-[#14532d]/15 p-10">
      <div className="flex items-center gap-1.5 text-[11px] text-[#14532d]/50 mb-6 italic">
        <ArrowLeft className="h-3 w-3" />
        <span>Return to archive</span>
      </div>
      <div className="flex items-start justify-between pb-8 mb-8 border-b border-[#14532d]/15 gap-6">
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#14532d]/60 mb-3">Wallet Profile · Grade {w.grade}</div>
          <h1 className="text-5xl text-[#14532d] tracking-tight mb-3 leading-tight" style={{ fontFamily: "Georgia, serif" }}>
            {w.label}
          </h1>
          <div className="text-[11px] text-[#14532d]/50 italic font-mono">
            {w.address}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#14532d]/50 mb-2">Composite</div>
          <div className="flex items-baseline gap-1 justify-end">
            <span className="text-7xl text-[#14532d] tracking-tight tabular-nums leading-none" style={{ fontFamily: "Georgia, serif" }}>
              {w.score}
            </span>
            <span className="text-xl text-[#14532d]/40 tabular-nums italic">/100</span>
          </div>
          <div className="text-[11px] text-[#14532d]/60 italic mt-2">Top 1% · Elite tier</div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-8">
        {[
          { l: "Win rate", v: fmtPct(w.win_rate), d: `${w.wins} wins / ${w.losses} losses` },
          { l: "Realized", v: `+${fmtUsd(w.realized)}`, d: "net profit · 90d", accent: true },
          { l: "Activity", v: w.trades.toString(), d: `${w.tokens} tokens traded` },
          { l: "Volume", v: fmtUsd(w.volume), d: "total throughput" },
        ].map((s, i) => (
          <div key={i}>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#14532d]/50 mb-2">{s.l}</div>
            <div className={`text-3xl tabular-nums ${s.accent ? "text-[#14532d]" : "text-[#14532d]"}`} style={{ fontFamily: "Georgia, serif" }}>
              {s.v}
            </div>
            <div className="text-[11px] italic text-[#14532d]/50 mt-1">{s.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// V10 — VOID (Pure black · yellow · Bybit pro dense)
// ═══════════════════════════════════════════════════════
export function WalletV10() {
  return (
    <div className="bg-black border border-zinc-900 font-mono">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-900 bg-zinc-950 text-[9px] uppercase tracking-wider text-zinc-600">
        <div className="flex items-center gap-3">
          <ArrowLeft className="h-3 w-3" />
          <span>Wallets</span>
          <span className="text-zinc-700">/</span>
          <span className="text-white">{w.address.slice(0, 8)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-[#facc15] animate-pulse" />
          <span>LIVE · 42ms</span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between mb-5 gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 border-2 border-[#facc15] bg-[#facc15]/5 flex items-center justify-center">
              <span className="text-2xl font-bold text-[#facc15]">{w.grade}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-bold text-white tracking-tight">{w.label}</span>
                <span className="text-[9px] font-bold text-[#facc15] bg-[#facc15]/10 border border-[#facc15]/40 px-1.5 py-0.5 uppercase tracking-wider">VIP · TIER S</span>
              </div>
              <div className="text-[10px] text-zinc-500 flex items-center gap-1.5">
                <span>{w.address}</span>
                <Copy className="h-3 w-3 hover:text-[#facc15] cursor-pointer" />
              </div>
            </div>
          </div>
          <div className="text-right border border-zinc-900 bg-zinc-950 px-4 py-2">
            <div className="text-[9px] text-zinc-600 uppercase tracking-wider">SCORE</div>
            <div className="text-3xl font-bold text-[#facc15] tabular-nums leading-none">{w.score}</div>
            <div className="text-[9px] text-zinc-600 tabular-nums">/100</div>
          </div>
        </div>
        <div className="grid grid-cols-6 gap-0 border border-zinc-900 divide-x divide-zinc-900 bg-zinc-950">
          {[
            { l: "WIN%", v: fmtPct(w.win_rate), i: Trophy },
            { l: "REAL_PNL", v: `+${fmtUsd(w.realized)}`, i: TrendingUp, accent: true },
            { l: "UNREAL", v: `+${fmtUsd(w.unrealized)}`, i: TrendingUp, accent: true },
            { l: "TRADES", v: w.trades.toString(), i: Activity },
            { l: "TOKENS", v: w.tokens.toString(), i: Coins },
            { l: "VOL", v: fmtUsd(w.volume), i: Shield },
          ].map(({ l, v, i: I, accent }) => (
            <div key={l} className="px-3 py-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <I className="h-2.5 w-2.5 text-zinc-600" />
                <span className="text-[9px] text-zinc-600 uppercase tracking-wider">{l}</span>
              </div>
              <div className={`text-sm font-bold tabular-nums ${accent ? "text-[#facc15]" : "text-white"}`}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
