"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/discovery", label: "Discovery" },
  { href: "/wallets", label: "Wallets" },
  { href: "/trades", label: "Trades" },
  { href: "/grading", label: "Grading" },
  { href: "/how-it-works", label: "How It Works" },
];

export default function Navbar() {
  const path = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
            <span className="text-lg font-bold text-emerald-400">O</span>
          </div>
          <span className="text-lg font-bold text-white">Oracle <span className="text-emerald-400">v3</span></span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                path === n.href
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </div>

        {/* Mobile menu */}
        <div className="flex flex-wrap gap-1 md:hidden">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`rounded px-2 py-1 text-xs font-medium ${
                path === n.href ? "bg-emerald-500/15 text-emerald-400" : "text-gray-400"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
