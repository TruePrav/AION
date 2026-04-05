"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/discovery", label: "Discovery" },
  { href: "/wallets", label: "Wallets" },
  { href: "/positions", label: "Positions" },
  { href: "/trades", label: "Trades" },
  { href: "/grading", label: "Grading" },
  { href: "/settings", label: "Settings" },
  { href: "/how-it-works", label: "How It Works" },
];

export default function Navbar() {
  const path = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-xl navbar-glow">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 group-hover:border-emerald-500/40 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all duration-300">
            <span className="text-lg font-black text-emerald-400">O</span>
            <div className="absolute inset-0 rounded-xl bg-emerald-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Oracle <span className="gradient-text">v3</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => {
            const active = path === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`relative rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "text-emerald-400 bg-emerald-500/10"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/60"
                }`}
              >
                {n.label}
                {active && (
                  <span className="absolute -bottom-px left-3 right-3 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Mobile menu */}
        <div className="flex flex-wrap gap-1 md:hidden">
          {NAV.map((n) => {
            const active = path === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  active ? "bg-emerald-500/15 text-emerald-400" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}