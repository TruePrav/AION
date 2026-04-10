import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fmtUsd(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function fmtPct(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return "—";
  return `${(value * 100).toFixed(1)}%`;
}

export function truncAddr(addr: string, chars = 4): string {
  if (!addr) return "";
  return `${addr.slice(0, chars + 2)}...${addr.slice(-chars)}`;
}

export function nansenWallet(address: string, chain = "solana"): string {
  return `https://app.nansen.ai/wallet/${address}?chain=${chain}`;
}

export function nansenToken(address: string, chain = "solana"): string {
  return `https://app.nansen.ai/token/${address}?chain=${chain}`;
}

export type Grade = "S" | "A" | "B" | "C" | "D";
