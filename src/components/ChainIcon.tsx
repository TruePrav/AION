"use client";

/**
 * ChainIcon — renders the canonical logo for a blockchain.
 *
 * We try a real CDN PNG first (CoinGecko) so users see the actual project
 * logo, then gracefully fall back to a colored circle with the chain's ticker
 * letter. That keeps the UI readable even if the CDN is blocked or offline.
 *
 * Used by the discovery page (chain filter chips + token rows) and by any
 * other surface that wants to show "which chain is this on?" without spelling
 * the name out.
 */

import { useState } from "react";
import { cn } from "@/lib/utils";

export type ChainKey = "solana" | "base" | "ethereum" | "bsc" | "arbitrum" | "polygon";

/** Normalize any raw chain string to a known ChainKey (defaults to solana). */
export function normalizeChain(raw?: string | null): ChainKey {
  const c = (raw || "solana").toLowerCase().trim();
  if (c === "eth" || c === "ethereum") return "ethereum";
  if (c === "bsc" || c === "binance" || c === "bnb") return "bsc";
  if (c === "arb" || c === "arbitrum") return "arbitrum";
  if (c === "matic" || c === "polygon") return "polygon";
  if (c === "base") return "base";
  return "solana";
}

/** Short uppercase ticker label for a chain, used as both fallback glyph and filter label. */
export function chainLabel(key: ChainKey): string {
  switch (key) {
    case "solana": return "SOL";
    case "base": return "BASE";
    case "ethereum": return "ETH";
    case "bsc": return "BNB";
    case "arbitrum": return "ARB";
    case "polygon": return "POL";
  }
}

/** DexScreener-compatible URL slug for a chain. */
export function dsSlug(key: ChainKey): string {
  return key; // matches DexScreener's URL segments 1:1
}

// Reliable public CDN logos. CoinGecko's "small" variant is ~30x30 and cached.
const LOGOS: Record<ChainKey, string> = {
  solana: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  base: "https://assets.coingecko.com/coins/images/32677/small/base.png",
  ethereum: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  bsc: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  arbitrum: "https://assets.coingecko.com/coins/images/16547/small/arb.jpg",
  polygon: "https://assets.coingecko.com/coins/images/4713/small/polygon.png",
};

// Per-chain brand color for the letter fallback (and the filter chip ring).
const CHAIN_COLOR: Record<ChainKey, string> = {
  solana: "bg-[#14F195] text-[#0b1220]",
  base: "bg-[#0052FF] text-white",
  ethereum: "bg-[#627EEA] text-white",
  bsc: "bg-[#F3BA2F] text-[#0b1220]",
  arbitrum: "bg-[#28A0F0] text-white",
  polygon: "bg-[#8247E5] text-white",
};

const SIZE_CLASSES = {
  xs: "h-4 w-4 text-[7px]",
  sm: "h-5 w-5 text-[8px]",
  md: "h-6 w-6 text-[9px]",
  lg: "h-8 w-8 text-[10px]",
} as const;

export default function ChainIcon({
  chain,
  size = "sm",
  className,
}: {
  chain?: string | null;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}) {
  const key = normalizeChain(chain);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        title={chainLabel(key)}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-extrabold leading-none flex-shrink-0 ring-1 ring-foreground/15",
          CHAIN_COLOR[key],
          SIZE_CLASSES[size],
          className,
        )}
      >
        {chainLabel(key).slice(0, 1)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={LOGOS[key]}
      alt={chainLabel(key)}
      title={chainLabel(key)}
      loading="lazy"
      className={cn(
        "inline-block rounded-full bg-foreground/5 ring-1 ring-foreground/15 flex-shrink-0",
        SIZE_CLASSES[size],
        className,
      )}
      onError={(e) => {
        // CRITICAL: detach the handler before setState so the fallback render
        // (which won't mount this <img>) can't re-trigger an infinite loop.
        const el = e.currentTarget;
        el.onerror = null;
        setFailed(true);
      }}
    />
  );
}
