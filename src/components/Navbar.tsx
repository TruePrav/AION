"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/discovery", label: "Discovery" },
  { href: "/wallets", label: "Wallets" },
  { href: "/polymarket", label: "Polymarket" },
  { href: "/positions", label: "Positions" },
  { href: "/trades", label: "Trades" },
  { href: "/grading", label: "Grading" },
  { href: "/knowledge", label: "Wiki" },
  { href: "/settings", label: "Settings" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/roadmap", label: "Roadmap" },
];

export default function Navbar() {
  const path = usePathname() || "/";

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/90 border-foreground/10">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
        {/* ── Brand ── */}
        <Link href="/" className="flex items-center flex-shrink-0 group">
          <Image
            src="/aion-logo-sm.png"
            alt="AION"
            width={929}
            height={304}
            priority
            className="h-9 w-auto dark:[filter:invert(1)_hue-rotate(80deg)] transition-[filter] duration-200"
          />
        </Link>

        {/* ── Desktop nav ── */}
        <div className="hidden md:flex items-center gap-0.5 flex-1 justify-end">
          {NAV.map((n) => {
            const active = path === n.href || (n.href !== "/" && path.startsWith(n.href));
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "px-3 py-1.5 text-[11px] font-semibold tracking-wide rounded-full transition-all",
                  active
                    ? "bg-foreground text-background shadow-sm"
                    : "text-foreground/70 hover:text-foreground hover:bg-foreground/[0.08]"
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </div>

        {/* ── Mobile nav ── */}
        <div className="flex flex-wrap gap-1 md:hidden">
          {NAV.map((n) => {
            const active = path === n.href || (n.href !== "/" && path.startsWith(n.href));
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "px-2 py-0.5 text-[9px] font-semibold tracking-wide rounded-full",
                  active
                    ? "bg-foreground text-background"
                    : "text-foreground/70"
                )}
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
