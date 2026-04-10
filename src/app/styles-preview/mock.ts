// Shared mock data for style preview variants — keeps screenshots consistent.

export const MOCK_STATS = {
  tokens_tracked: 534,
  wallets: 12840,
  trades: 287,
  win_rate: 0.683,
  total_pnl: 48213.44,
};

export const MOCK_TOKENS = [
  { symbol: "BONK", address: "DezX...4Rkh", mcap: 2_100_000_000, age: "14mo", flow7d: 4_820_000, flow24h: 612_000, flow30d: 11_400_000, traders: 82, accum: { grade: "S" as const, score: 94 }, tier: "P1" },
  { symbol: "JITO", address: "jitoS...R7W", mcap: 420_000_000, age: "9mo", flow7d: 2_140_000, flow24h: 215_000, flow30d: 6_900_000, traders: 61, accum: { grade: "A" as const, score: 82 }, tier: "P1" },
  { symbol: "WIF",  address: "EKpQ...8xj", mcap: 1_830_000_000, age: "8mo", flow7d: 1_680_000, flow24h: -94_000, flow30d: 4_230_000, traders: 47, accum: { grade: "A" as const, score: 78 }, tier: "P1" },
  { symbol: "PYTH", address: "HZ1J...2N3", mcap: 760_000_000, age: "11mo", flow7d: 940_000, flow24h: 108_000, flow30d: 2_180_000, traders: 38, accum: { grade: "B" as const, score: 66 }, tier: "P2" },
  { symbol: "JUP",  address: "JUPyi...mdM", mcap: 1_200_000_000, age: "6mo", flow7d: 720_000, flow24h: -42_000, flow30d: 1_420_000, traders: 29, accum: { grade: "B" as const, score: 61 }, tier: "P2" },
  { symbol: "POPCAT", address: "7GCih...k9A", mcap: 180_000_000, age: "3mo", flow7d: -320_000, flow24h: -88_000, flow30d: 410_000, traders: 18, accum: { grade: "C" as const, score: 43 }, tier: "P3" },
];

export const MOCK_POSITIONS = [
  { symbol: "JITO", address: "jitoSo...R7W", entry: 2.84, now: 3.42, size: 1200, pnl_usd: 244.80, pnl_pct: 20.4, sl: -25, tp: 50, grade: "S" as const, accum: 94 },
  { symbol: "BONK", address: "DezX...4Rkh", entry: 0.0000184, now: 0.0000201, size: 800, pnl_usd: 73.91, pnl_pct: 9.2, sl: -20, tp: 60, grade: "A" as const, accum: 82 },
  { symbol: "WIF",  address: "EKpQ...8xj", entry: 2.31, now: 2.08, size: 600, pnl_usd: -59.74, pnl_pct: -9.96, sl: -15, tp: 40, grade: "A" as const, accum: 78 },
];

export const MOCK_WALLET = {
  address: "BpkA...U7xGmJ4qhLZt3WxvKyQ8E2fD9s",
  label: "Solana Whale · Phantom Team",
  grade: "S" as const,
  score: 94,
  win_rate: 0.742,
  realized: 184_220,
  unrealized: 42_910,
  trades: 287,
  tokens: 34,
  wins: 213,
  losses: 74,
  volume: 12_400_000,
};

export function fmtUsd(n: number) {
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

export function fmtPct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

export const STYLE_NAMES = [
  { id: "v1", label: "Terminal", tagline: "Bloomberg-inspired · monospace everywhere" },
  { id: "v2", label: "Glassmorphic", tagline: "Frosted blur · gradient borders · subtle glow" },
  { id: "v3", label: "Premium Minimal", tagline: "Linear/Stripe-style · whitespace heavy" },
  { id: "v4", label: "Brutalist", tagline: "Thick borders · hard shadows · flat fills" },
  { id: "v5", label: "Neo-Data", tagline: "Dense Nansen-style · cyan accents · tight grid" },
  // ── NEW PREMIUM VARIANTS (inspired by OpenSea / CoinMarketCap / Linear / Bybit) ──
  { id: "v6", label: "Obsidian Pro", tagline: "Deep charcoal · emerald · soft inner-shadow cards" },
  { id: "v7", label: "Tangerine", tagline: "CMC-inspired · warm orange accents · dense tabular" },
  { id: "v8", label: "Ocean", tagline: "Deep navy · electric cyan rim lights · premium trading" },
  { id: "v9", label: "Ivory", tagline: "Luxury editorial · serif display · cream + forest green" },
  { id: "v10", label: "Void", tagline: "Pure black · yellow accents · Bybit-dense pro" },
];
