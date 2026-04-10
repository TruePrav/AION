export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

/**
 * When true, read requests route through /api/proxy/* instead of hitting
 * NEXT_PUBLIC_API_URL directly. This keeps the VPS IP off the client.
 *
 * Enabled automatically when NEXT_PUBLIC_API_URL is NOT set (production
 * deploys that use AION_BACKEND_URL server-side only).
 */
export const USE_PROXY = !process.env.NEXT_PUBLIC_API_URL;

/**
 * True on public/read-only deployments — hides admin controls (edit SL/TP,
 * close position, copy trade, settings writes). Set NEXT_PUBLIC_READONLY_MODE=1
 * in Vercel env to enable. Unset locally so you keep full admin access.
 */
export const READONLY_MODE = process.env.NEXT_PUBLIC_READONLY_MODE === "1";

/**
 * Resolve an API path to a full URL. Handles proxy routing automatically.
 * Input: "/api/discovery/wallets" or "/api/polymarket/positions/0x..."
 * Output: proxy URL on production, direct VPS URL on local dev.
 */
export function apiUrl(path: string): string {
  return USE_PROXY
    ? path.replace(/^\/api\//, "/api/proxy/")
    : `${API}${path}`;
}

export async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(apiUrl(path), { cache: "no-store" });
  if (!res.ok) throw new Error(`API ${path}: ${res.status}`);
  return res.json();
}

/**
 * Authenticated POST — routes through the server-side proxy at /api/admin/*
 * so the Oracle API key stays on the server and never reaches the browser.
 *
 * - Local dev with AION_API_KEY + ADMIN_ALLOW_MUTATIONS=1 in .env.local → works
 * - Public Vercel deploy without those envs → returns 503 (read-only mode)
 */
export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  // path like "/api/positions/XYZ/targets" → proxy "/api/admin/positions/XYZ/targets"
  const proxyPath = path.replace(/^\/api\//, "/api/admin/");
  const res = await fetch(proxyPath, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${path}: ${res.status} ${text}`);
  }
  return res.json();
}

export interface CopyTradeResult {
  success: boolean;
  trade_id?: string;
  amount?: number;
  chain?: string;
  tx_hash?: string;
  dry_run?: boolean;
  error?: string;
}

export async function copyTrade(token: {
  address: string;
  chain: string;
  symbol: string;
  market_cap?: number;
  token_age_days?: number;
}, amountUsd: number): Promise<CopyTradeResult> {
  return apiPost<CopyTradeResult>("/api/trade/copy", {
    token_address: token.address,
    chain: token.chain,
    amount_usd: amountUsd,
    symbol: token.symbol,
    market_cap: token.market_cap,
    token_age_days: token.token_age_days,
  });
}

export interface OpenPosition {
  id: string;
  token: string;
  chain: string;
  side: string;
  entry_price: number;
  size_usdc: number;
  pnl_usd?: number;
  pnl_pct?: number;
  timestamp: string;
  tx_hash?: string;
  trailing_stop_triggered?: boolean;
  stop_reason?: string;
  status: string;
}

export interface PositionsResponse {
  positions: OpenPosition[];
  count: number;
}

export interface Settings {
  trailing_stop_pct: number;
  take_profit_tiers: number[];
  max_position_pct: number;
  min_convergence_wallets: number;
  scan_interval_minutes: number;
  mode: string;
}

export interface BlocklistEntry {
  address: string;
  votes: number;
  voters: string[];
}

export interface BlocklistResponse {
  blocklist: BlocklistEntry[];
  total_listed: number;
}

// ---- Types ----

export interface Status {
  // Public fields only (no internal ops data)
  tokens_in_run: number;
  wallets_graded: number;
  total_trades: number;
  open_positions: number;
  win_rate: number;
  total_pnl: number;
  avg_profit: number;
  avg_loss: number;
  chain: string;
}

export interface TokenAccumulation {
  grade: string;
  score: number;
  signals: string[];
  metrics: {
    buy_sell_ratio: number;
    buyer_concentration_hhi: number;
    n_buyers: number;
    n_sellers: number;
    sm_buyer_count: number;
    sm_buyer_pct: number;
    total_buy_volume: number;
    total_sell_volume: number;
  };
}

export interface TierFilter {
  passed: boolean;
  tier: string;
  accum_grade: string;
  accum_score: number;
  reasons: string[];
}

export interface DiscoveryToken {
  symbol: string;
  address: string;
  chain: string;
  market_cap: number;
  net_flow_7d: number;
  net_flow_24h: number;
  net_flow_1h: number;
  net_flow_30d: number;
  trader_count: number;
  token_age_days: number;
  sectors: string[];
  accumulation: TokenAccumulation;
  tier_filter: TierFilter;
}

export interface WalletTopToken {
  symbol: string;
  address: string;
  bought_usd: number;
  sold_usd: number;
  holding_usd: number;
  pnl_realized: number;
  pnl_unrealized: number;
  roi: number;
  buys: number;
  sells: number;
}

export interface DiscoveryWallet {
  address: string;
  chain: string;
  grade: string;
  score: number;
  label: string;
  win_rate: number;
  wins: number;
  losses: number;
  total_pnl_realized: number;
  total_pnl_unrealized: number;
  total_bought_usd: number;
  total_sold_usd: number;
  total_trades: number;
  token_count: number;
  convergence_score: number;
  hot_token_buys: string[];
  recent_buys: number;
  recent_sells: number;
  top_tokens: WalletTopToken[];
}

export interface GraphNode {
  address: string;
  grade: string;
  score: number;
  label: string;
  is_target: boolean;
  depth: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  label: string;
  relationship: string;
}

export interface Discovery {
  chain: string;
  tokens: DiscoveryToken[];
  wallets: DiscoveryWallet[];
  validated_tokens: ValidatedToken[];
  graph: { nodes: GraphNode[]; edges: GraphEdge[]; clusters: string[]; credits_used: number };
  credits: { before: number; after: number; used: number };
}

export interface ValidatedToken {
  address: string;
  symbol: string;
  chain: string;
  goplus?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ScoutResult {
  wallet: ScoutWallet;
  latest_buy: ScoutBuy;
  recent_buys: ScoutBuy[];
  chain: string;
  mode: string;
  timestamp: string;
  credits: { before: number; after: number; used: number };
}

export interface ScoutWallet {
  address: string;
  chain: string;
  grade: string;
  score: number;
  label: string;
  win_rate: number;
  total_pnl_realized: number;
  total_pnl_unrealized: number;
  total_bought_usd: number;
  total_sold_usd: number;
  total_trades: number;
  total_value: number;
  top_tokens: WalletTopToken[];
  buy_count: number;
  losses: number;
  wins: number;
  token_count: number;
}

export interface ScoutBuy {
  token: string;
  token_address: string;
  chain: string;
  value: number;
  timestamp: string;
}

export interface LookupResult {
  token: { address: string; chain: string; name: string; symbol: string; market_cap: number };
  wallets: LookupWallet[];
  buyers_found: number;
  pnl_entries: number;
  chain: string;
  mode: string;
  timestamp: string;
  credits: { before: number; after: number; used: number };
}

export interface LookupWallet {
  address: string;
  chain: string;
  grade: string;
  score: number;
  label: string;
  is_sm: boolean;
  win_rate: number;
  wins: number;
  losses: number;
  total_pnl_realized: number;
  total_pnl_unrealized: number;
  total_bought_usd: number;
  total_sold_usd: number;
  total_trades: number;
  token_count: number;
  token_buy_volume: number;
  token_pnl: number;
  token_roi: number;
  top_tokens: WalletTopToken[];
}

export interface Trade {
  id: string;
  token: string;
  chain: string;
  side: string;
  size_usdc: number;
  entry_price: number;
  exit_price: number | null;
  pnl_pct: number | null;
  pnl_usd: number | null;
  status: string;
  timestamp: string;
  tx_hash?: string;
  hold_display?: string;
  hold_hours?: number;
  dry_run?: boolean;
  exit_reason?: string | null;
}

export interface TradeStats {
  total: number;
  wins: number;
  losses: number;
  win_rate: number;
  total_pnl: number;
  avg_profit: number;
  avg_loss: number;
}

export interface MethodologyFactor {
  name: string;
  description: string;
  max_points: number;
}

export interface MethodologyGrade {
  grade: string;
  label: string;
  min_score: number;
  color: string;
}

export interface AccumulationSignal {
  name: string;
  description: string;
  max_points: number;
}

export interface RiskTier {
  tier: string;
  label: string;
  description: string;
  color: string;
  min_mcap: number | null;
  min_accum: number | null;
  min_age: number | null;
  min_sm_traders: number | null;
}

export interface CreditCost {
  endpoint: string;
  credits: number;
  usage: string;
}

export interface Methodology {
  wallet_grading: {
    description: string;
    factors: MethodologyFactor[];
    grades: MethodologyGrade[];
  };
  accumulation_scoring: {
    description: string;
    signals: AccumulationSignal[];
  };
  risk_tiers: RiskTier[];
  credit_costs: CreditCost[];
}

export interface WalletDetail {
  address: string;
  chain: string;
  grade: string;
  score: number;
  label: string;
  win_rate: number;
  wins: number;
  losses: number;
  total_pnl_realized: number;
  total_pnl_unrealized: number;
  total_bought_usd: number;
  total_sold_usd: number;
  total_trades: number;
  token_count: number;
  top_tokens: WalletTopToken[];
  [key: string]: unknown;
}
