// 5 style variants for the Dashboard Hero surface.
import { ArrowRight, Send, Activity, Wallet, BarChart3, Trophy, TrendingUp, Circle, Zap } from "lucide-react";
import { MOCK_STATS, fmtUsd, fmtPct } from "../mock";

const s = MOCK_STATS;

// ═══════════════════════════════════════════════════════
// V1 — TERMINAL
// ═══════════════════════════════════════════════════════
export function HeroV1() {
  return (
    <div className="rounded-sm border border-emerald-500/30 bg-black font-mono">
      <div className="flex items-center justify-between border-b border-emerald-500/20 px-4 py-1.5 text-[10px] text-emerald-400/70">
        <div className="flex items-center gap-3">
          <span>ORACLE v3.2.1</span>
          <span>·</span>
          <span>MAINNET-BETA</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </span>
          <span>{new Date().toISOString().slice(11, 19)}Z</span>
        </div>
      </div>
      <div className="p-8">
        <pre className="text-[10px] leading-tight text-emerald-500/60 mb-4">{`> oracle --track smart-money --chain solana`}</pre>
        <h1 className="text-4xl font-bold text-emerald-400 tracking-tight mb-2">
          SMART_MONEY.INTELLIGENCE
        </h1>
        <p className="text-xs text-emerald-400/60 mb-6 leading-relaxed">
          {`// tracking ${s.wallets.toLocaleString()} wallets · grading ${s.tokens_tracked} tokens · ${s.trades} trades executed`}
        </p>
        <div className="grid grid-cols-5 gap-0 border border-emerald-500/20 divide-x divide-emerald-500/20">
          {[
            ["TOKENS", s.tokens_tracked],
            ["WALLETS", s.wallets.toLocaleString()],
            ["TRADES", s.trades],
            ["WIN_RATE", fmtPct(s.win_rate)],
            ["PNL_USD", `+${fmtUsd(s.total_pnl)}`],
          ].map(([k, v]) => (
            <div key={k} className="px-3 py-2.5">
              <div className="text-[9px] text-emerald-500/50 tracking-wider">{k}</div>
              <div className="text-sm font-bold text-emerald-300 tabular-nums">{v}</div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex gap-2">
          <button className="border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-[11px] text-emerald-400 hover:bg-emerald-500/20">
            [ENTER] view_discovery
          </button>
          <button className="border border-emerald-500/20 px-3 py-1.5 text-[11px] text-emerald-400/70 hover:border-emerald-500/40">
            [T] telegram_bot
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// V2 — GLASSMORPHIC
// ═══════════════════════════════════════════════════════
export function HeroV2() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.03] via-white/[0.01] to-transparent backdrop-blur-2xl">
      <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-purple-500/15 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.08),transparent_60%)]" />
      <div className="relative p-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-cyan-300 backdrop-blur-md mb-6">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
          </span>
          Live intelligence stream
        </div>
        <h1 className="text-5xl font-semibold tracking-tight leading-[1.05] mb-3">
          <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">Smart money</span>
          <br />
          <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-sky-400 bg-clip-text text-transparent">intelligence</span>
        </h1>
        <p className="text-sm text-white/50 max-w-md mx-auto leading-relaxed mb-7">
          AION tracks labeled wallets, grades performance, surfaces real alpha before the crowd catches on.
        </p>
        <div className="flex justify-center gap-3 mb-8">
          <button className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-2.5 text-sm font-medium text-cyan-300 backdrop-blur-md hover:bg-cyan-400/20 transition">
            View discovery <ArrowRight className="h-4 w-4" />
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/80 backdrop-blur-md hover:bg-white/10 transition">
            <Send className="h-4 w-4" /> Telegram bot
          </button>
        </div>
        <div className="grid grid-cols-5 gap-3 max-w-3xl mx-auto">
          {[
            { l: "Tokens", v: s.tokens_tracked, i: Activity },
            { l: "Wallets", v: s.wallets.toLocaleString(), i: Wallet },
            { l: "Trades", v: s.trades, i: BarChart3 },
            { l: "Win rate", v: fmtPct(s.win_rate), i: Trophy },
            { l: "PnL", v: `+${fmtUsd(s.total_pnl)}`, i: TrendingUp },
          ].map(({ l, v, i: I }) => (
            <div key={l} className="rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-md p-3 text-left">
              <I className="h-3 w-3 text-white/40 mb-1.5" />
              <div className="text-[9px] text-white/40 uppercase tracking-wider">{l}</div>
              <div className="text-sm font-semibold text-white tabular-nums mt-0.5">{v}</div>
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
export function HeroV3() {
  return (
    <div className="bg-[#0a0a0a] px-10 py-16">
      <div className="max-w-4xl">
        <div className="flex items-center gap-2 text-[11px] text-neutral-500 mb-8">
          <Circle className="h-1.5 w-1.5 fill-emerald-500 text-emerald-500" />
          <span>System operational · All signals live</span>
        </div>
        <h1 className="text-6xl font-medium tracking-[-0.04em] text-neutral-100 leading-[0.95] mb-6">
          Smart money,<br />
          <span className="text-neutral-500">decoded.</span>
        </h1>
        <p className="text-lg text-neutral-400 max-w-xl leading-relaxed mb-10">
          AION tracks the wallets that move markets, grades their performance, and surfaces real alpha — so you stop guessing and start following.
        </p>
        <div className="flex items-center gap-4 mb-16">
          <button className="group inline-flex items-center gap-2 rounded-lg bg-neutral-100 px-5 py-2.5 text-sm font-medium text-neutral-900 hover:bg-white transition">
            View discovery
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <button className="inline-flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-neutral-100 transition">
            Read the docs →
          </button>
        </div>
        <div className="grid grid-cols-5 gap-0 border-t border-neutral-800 pt-8">
          {[
            { l: "Tokens tracked", v: s.tokens_tracked },
            { l: "Wallets graded", v: s.wallets.toLocaleString() },
            { l: "Trades executed", v: s.trades },
            { l: "Win rate", v: fmtPct(s.win_rate) },
            { l: "Total P&L", v: `+${fmtUsd(s.total_pnl)}` },
          ].map((k) => (
            <div key={k.l}>
              <div className="text-[10px] text-neutral-500 uppercase tracking-[0.12em] mb-2">{k.l}</div>
              <div className="text-2xl font-medium text-neutral-100 tracking-tight tabular-nums">{k.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// V4 — BRUTALIST
// ═══════════════════════════════════════════════════════
export function HeroV4() {
  return (
    <div className="bg-[#f5f0e8] p-10 border-[3px] border-black shadow-[8px_8px_0_0_#000]">
      <div className="flex items-center gap-2 mb-6">
        <div className="inline-flex items-center gap-1.5 border-2 border-black bg-lime-400 px-2.5 py-1 text-[10px] font-bold uppercase">
          <Zap className="h-3 w-3" /> LIVE
        </div>
        <div className="inline-flex items-center gap-1.5 border-2 border-black bg-white px-2.5 py-1 text-[10px] font-bold uppercase">
          v3.2.1
        </div>
      </div>
      <h1 className="text-7xl font-black text-black tracking-tighter leading-[0.9] mb-5 uppercase">
        Smart<br />
        <span className="inline-block bg-black text-lime-400 px-2">Money.</span>
      </h1>
      <p className="text-base text-black font-medium max-w-lg leading-snug mb-8">
        AION hunts the wallets the market follows. We grade them. We track them. You eat.
      </p>
      <div className="flex gap-3 mb-8">
        <button className="inline-flex items-center gap-2 border-[3px] border-black bg-lime-400 px-5 py-3 text-sm font-black text-black uppercase shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] transition">
          View Discovery →
        </button>
        <button className="inline-flex items-center gap-2 border-[3px] border-black bg-white px-5 py-3 text-sm font-black text-black uppercase shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] transition">
          <Send className="h-4 w-4" /> TG Bot
        </button>
      </div>
      <div className="grid grid-cols-5 gap-0 border-[3px] border-black bg-white">
        {[
          ["TOKENS", s.tokens_tracked, "bg-white"],
          ["WALLETS", s.wallets.toLocaleString(), "bg-pink-200"],
          ["TRADES", s.trades, "bg-white"],
          ["WINS", fmtPct(s.win_rate), "bg-yellow-200"],
          ["PNL", `+${fmtUsd(s.total_pnl)}`, "bg-lime-300"],
        ].map(([k, v, bg]) => (
          <div key={k as string} className={`px-3 py-3 border-r-[3px] border-black last:border-r-0 ${bg}`}>
            <div className="text-[9px] font-black uppercase text-black">{k}</div>
            <div className="text-lg font-black text-black tabular-nums">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// V5 — NEO-DATA (evolved current direction)
// ═══════════════════════════════════════════════════════
export function HeroV5() {
  return (
    <div className="rounded-xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/50 to-zinc-950 p-6">
      <div className="flex items-start justify-between mb-5 pb-5 border-b border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-400/10 border border-cyan-400/20 px-1.5 py-0.5 rounded tracking-widest">ORACLE</span>
            <span className="text-[10px] font-mono text-zinc-500">{"// v3.2.1"}</span>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
              <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
              streaming
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-zinc-100 tracking-tight leading-tight">
            Smart money intelligence<span className="text-cyan-400">.</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1.5 max-w-md">
            Labeled wallet tracking · real-time grading · pre-crowd alpha surfacing
          </p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-md bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-cyan-300 transition">
            Discovery <ArrowRight className="h-3 w-3" />
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition">
            <Send className="h-3 w-3" /> Bot
          </button>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-px bg-zinc-800/50 rounded-md overflow-hidden">
        {[
          { l: "Tokens", v: s.tokens_tracked, i: Activity, d: "+12" },
          { l: "Wallets", v: s.wallets.toLocaleString(), i: Wallet, d: "+84" },
          { l: "Trades", v: s.trades, i: BarChart3, d: "+6" },
          { l: "Win rate", v: fmtPct(s.win_rate), i: Trophy, d: "+2.1%" },
          { l: "Total PnL", v: `+${fmtUsd(s.total_pnl)}`, i: TrendingUp, d: "+$1.2K", accent: true },
        ].map(({ l, v, i: I, d, accent }) => (
          <div key={l} className="bg-zinc-950 px-3 py-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <I className="h-3 w-3 text-zinc-500" />
              <span className="text-[9px] text-zinc-500 uppercase tracking-wider">{l}</span>
            </div>
            <div className={`text-base font-semibold tabular-nums ${accent ? "text-emerald-400" : "text-zinc-100"}`}>{v}</div>
            <div className="text-[9px] font-mono text-emerald-400/70 mt-0.5">{d} 24h</div>
          </div>
        ))}
      </div>
    </div>
  );
}
