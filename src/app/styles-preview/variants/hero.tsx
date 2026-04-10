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
        <pre className="text-[10px] leading-tight text-emerald-500/60 mb-4">{`> aion --track smart-money --chain solana`}</pre>
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

// ═══════════════════════════════════════════════════════
// V6 — OBSIDIAN PRO  (Linear / Stripe inspired)
// Deep charcoal, emerald accent, soft inner-shadow cards, generous padding
// ═══════════════════════════════════════════════════════
export function HeroV6() {
  return (
    <div className="rounded-3xl border border-white/[0.07] bg-[#0b0d10] p-10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
      <div className="flex items-center gap-2 mb-7">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/[0.08] px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Live intelligence
        </span>
        <span className="text-[11px] text-zinc-500">· mainnet-beta · 02:14 UTC</span>
      </div>
      <h1 className="text-[44px] font-semibold tracking-[-0.025em] leading-[1.05] text-white mb-3">
        Smart money,<br />
        <span className="text-zinc-400">fully decoded.</span>
      </h1>
      <p className="text-[13px] text-zinc-400 leading-relaxed max-w-xl mb-9">
        AION tracks {s.wallets.toLocaleString()} top-tier wallets across Solana, Base, Ethereum and Polymarket. Alpha signals drop as they happen — no delay, no human filter.
      </p>
      <div className="grid grid-cols-5 gap-0 rounded-xl border border-white/[0.06] bg-[#0e1115] divide-x divide-white/[0.05] overflow-hidden">
        {[
          ["Tokens", s.tokens_tracked, null],
          ["Wallets", s.wallets.toLocaleString(), null],
          ["Trades", s.trades, null],
          ["Win rate", fmtPct(s.win_rate), "text-emerald-400"],
          ["P/L", `+${fmtUsd(s.total_pnl)}`, "text-emerald-400"],
        ].map(([k, v, c]) => (
          <div key={k as string} className="px-5 py-4">
            <div className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mb-1">{k}</div>
            <div className={`text-xl font-semibold tabular-nums ${c || "text-white"}`}>{v}</div>
          </div>
        ))}
      </div>
      <div className="mt-7 flex items-center gap-3">
        <button className="rounded-lg bg-white text-[#0b0d10] px-4 py-2 text-xs font-semibold hover:bg-zinc-100 transition-colors inline-flex items-center gap-1.5">
          View discovery <ArrowRight className="h-3.5 w-3.5" />
        </button>
        <button className="rounded-lg border border-white/[0.09] bg-white/[0.02] px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/[0.05]">
          Connect wallet
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// V7 — TANGERINE  (CoinMarketCap-inspired)
// Warm orange accents, dark neutral, dense tabular data
// ═══════════════════════════════════════════════════════
export function HeroV7() {
  return (
    <div className="rounded-2xl border border-[#1d2025] bg-[#0d1014] overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#1d2025] px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-[#f7931a] to-[#ff6b1a] flex items-center justify-center">
            <Zap className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-semibold text-white">AION</span>
          <span className="text-[10px] font-mono text-zinc-500 px-1.5 py-0.5 rounded bg-[#1a1d22]">PRO</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-zinc-500">
          <span>Cryptocurrencies: <span className="text-white">{s.tokens_tracked}</span></span>
          <span>Smart wallets: <span className="text-white">{s.wallets.toLocaleString()}</span></span>
          <span className="text-[#4ade80]">● Market is bullish</span>
        </div>
      </div>
      <div className="px-6 pt-7 pb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
          Today&apos;s <span className="text-[#f7931a]">smart money</span> moves
        </h1>
        <p className="text-xs text-zinc-400 mb-6">
          The global crypto intelligence feed. Live updates on whale accumulation, grades, and win rates.
        </p>
        <div className="grid grid-cols-5 gap-px bg-[#1a1d22] rounded-lg overflow-hidden border border-[#1d2025]">
          {[
            ["Tokens Tracked", s.tokens_tracked, "#f7931a"],
            ["Smart Wallets", s.wallets.toLocaleString(), "#f7931a"],
            ["Live Trades", s.trades, "#4ade80"],
            ["Win Rate", fmtPct(s.win_rate), "#4ade80"],
            ["Total P/L", `+${fmtUsd(s.total_pnl)}`, "#4ade80"],
          ].map(([k, v, c]) => (
            <div key={k as string} className="bg-[#0d1014] px-4 py-3">
              <div className="text-[9px] text-zinc-500 font-semibold uppercase tracking-[0.08em] mb-1">{k}</div>
              <div className="text-lg font-bold tabular-nums" style={{ color: c as string }}>{v}</div>
              <div className="text-[9px] text-zinc-500 mt-0.5">+2.34% (24h)</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// V8 — OCEAN  (Deep navy premium trading platform)
// Electric cyan rim-lights, gradient fills, subtle shimmer
// ═══════════════════════════════════════════════════════
export function HeroV8() {
  return (
    <div className="relative rounded-[28px] p-[1px] overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.4), rgba(6,182,212,0.15) 40%, rgba(59,130,246,0.05) 70%, rgba(59,130,246,0.3))" }}>
      <div className="relative rounded-[27px] bg-[#030814] p-10 overflow-hidden">
        <div className="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-br from-cyan-500/[0.06] via-blue-500/[0.03] to-transparent pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-cyan-400/[0.06] blur-3xl pointer-events-none" />
        <div className="absolute top-6 right-6 h-px w-32 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/[0.08] px-3 py-1 mb-6">
            <Activity className="h-3 w-3 text-cyan-300" />
            <span className="text-[11px] font-semibold text-cyan-200">Real-time signals</span>
          </div>
          <h1 className="text-5xl font-bold tracking-[-0.02em] leading-[1.05] mb-4">
            <span className="bg-gradient-to-br from-white via-white to-cyan-200 bg-clip-text text-transparent">The smart money</span>
            <br />
            <span className="bg-gradient-to-br from-cyan-300 via-blue-400 to-cyan-500 bg-clip-text text-transparent">never sleeps.</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-xl leading-relaxed mb-8">
            AION surfaces convergence patterns from {s.wallets.toLocaleString()} wallets. See who&apos;s accumulating before the chart moves.
          </p>
          <div className="grid grid-cols-5 gap-3">
            {[
              ["TOKENS", s.tokens_tracked],
              ["WALLETS", s.wallets.toLocaleString()],
              ["TRADES", s.trades],
              ["WIN", fmtPct(s.win_rate)],
              ["P/L", `+${fmtUsd(s.total_pnl)}`],
            ].map(([k, v]) => (
              <div key={k as string} className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-4 backdrop-blur-sm">
                <div className="text-[9px] text-cyan-300/60 font-bold tracking-[0.15em] mb-1.5">{k}</div>
                <div className="text-lg font-bold text-white tabular-nums">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// V9 — IVORY  (Luxury editorial — Hermès / Vogue feel)
// Cream, deep forest green, serif display, generous whitespace
// ═══════════════════════════════════════════════════════
export function HeroV9() {
  return (
    <div className="rounded-[4px] border border-stone-300 bg-[#faf8f3] p-12">
      <div className="flex items-center justify-between mb-10 pb-4 border-b border-stone-200">
        <div className="flex items-baseline gap-3">
          <span className="text-[10px] tracking-[0.3em] text-stone-500 uppercase">EST · 2024</span>
          <span className="text-[10px] tracking-[0.3em] text-stone-400">·</span>
          <span className="text-[10px] tracking-[0.3em] text-stone-500 uppercase">Vol. IV · Issue 12</span>
        </div>
        <span className="text-[10px] tracking-[0.25em] text-stone-500 uppercase">Smart Money Weekly</span>
      </div>
      <h1 className="text-[56px] leading-[0.98] tracking-[-0.01em] text-stone-900 mb-4 font-serif">
        The quiet art of
        <br />
        <em className="text-[#14532d] not-italic font-medium">smart money</em>
      </h1>
      <div className="flex items-start gap-12 mt-10">
        <div className="flex-1 max-w-md">
          <p className="text-sm text-stone-600 leading-[1.7] font-light">
            For years, only a handful of wallets moved the market before it moved. AION makes that signal public — a curated intelligence feed for the discerning trader.
          </p>
          <button className="mt-8 inline-flex items-center gap-2 border-b border-stone-900 pb-1 text-xs font-semibold tracking-wider text-stone-900 uppercase hover:text-[#14532d] hover:border-[#14532d] transition-colors">
            Read the brief <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-8 text-stone-800">
          {[
            ["Tokens", s.tokens_tracked],
            ["Wallets", s.wallets.toLocaleString()],
            ["Trades", s.trades],
            ["P/L", `+${fmtUsd(s.total_pnl)}`],
          ].map(([k, v]) => (
            <div key={k as string}>
              <div className="text-[9px] tracking-[0.25em] text-stone-500 uppercase mb-1">{k}</div>
              <div className="text-3xl font-serif tabular-nums">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// V10 — VOID  (Bybit / Binance dense pro)
// Pure black, yellow primary, dense data, monospace numbers
// ═══════════════════════════════════════════════════════
export function HeroV10() {
  return (
    <div className="rounded-lg border border-zinc-800 bg-black overflow-hidden">
      <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-2.5 bg-zinc-950">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-sm bg-[#facc15] flex items-center justify-center">
            <BarChart3 className="h-3 w-3 text-black" strokeWidth={3} />
          </div>
          <span className="text-xs font-bold text-white tracking-wide">AION·PRO</span>
          <span className="text-[9px] font-mono text-zinc-500 ml-2">v3.2.1</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono">
          <span className="text-zinc-500">BTC <span className="text-[#4ade80]">$67,420</span> <span className="text-[#4ade80]">+2.4%</span></span>
          <span className="text-zinc-500">ETH <span className="text-[#4ade80]">$3,412</span> <span className="text-[#ef4444]">-0.8%</span></span>
          <span className="text-zinc-500">SOL <span className="text-[#4ade80]">$198</span> <span className="text-[#4ade80]">+5.1%</span></span>
        </div>
      </div>
      <div className="px-5 py-6">
        <div className="flex items-start justify-between gap-8 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-1">
              Smart Money <span className="text-[#facc15]">Intelligence</span>
            </h1>
            <p className="text-[11px] text-zinc-500">Tracking {s.wallets.toLocaleString()} wallets · Updated 14s ago</p>
          </div>
          <div className="flex gap-2">
            <button className="rounded bg-[#facc15] text-black px-3 py-1.5 text-[11px] font-bold hover:bg-[#fde047]">
              TRADE NOW
            </button>
            <button className="rounded border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-[11px] font-bold text-zinc-300 hover:bg-zinc-900">
              SIGNALS
            </button>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-0 border-y border-zinc-800 divide-x divide-zinc-800">
          {[
            ["Tokens Tracked", s.tokens_tracked, null, "+12"],
            ["Smart Wallets", s.wallets.toLocaleString(), null, "+248"],
            ["Trades Today", s.trades, null, "+45"],
            ["Win Rate", fmtPct(s.win_rate), "text-[#4ade80]", "+1.2%"],
            ["Unrealized P/L", `+${fmtUsd(s.total_pnl)}`, "text-[#4ade80]", "+5.8%"],
          ].map(([k, v, c, ch]) => (
            <div key={k as string} className="px-4 py-3">
              <div className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider mb-0.5">{k}</div>
              <div className={`text-lg font-mono font-bold tabular-nums ${c || "text-white"}`}>{v}</div>
              <div className="text-[9px] font-mono text-[#4ade80] mt-0.5">{ch}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
