"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/discovery", label: "Discovery" },
  { href: "/wallets", label: "Wallets" },
  { href: "/positions", label: "Positions" },
  { href: "/trades", label: "Trades" },
  { href: "/grading", label: "Grading" },
  { href: "/settings", label: "Settings" },
  { href: "/how-it-works", label: "How" },
  { href: "/roadmap", label: "Roadmap" },
];

export default function Navbar() {
  const path = usePathname() || "/";
  const { theme, toggle } = useTheme();

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl border-b bg-background/70 border-foreground/10">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
        {/* ── Brand ── */}
        <Link href="/" className="flex items-center flex-shrink-0 group">
          <Image
            src="/aion-logo-sm.png"
            alt="AION"
            width={120}
            height={36}
            priority
            className="h-8 w-auto dark:[filter:invert(1)_hue-rotate(80deg)] transition-[filter] duration-200"
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

          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggle}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="ml-2 h-8 w-8 inline-flex items-center justify-center rounded-full border border-foreground/15 bg-foreground/[0.06] text-foreground/80 hover:text-foreground hover:bg-foreground/10 transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" strokeWidth={2.25} />
            ) : (
              <Moon className="h-4 w-4" strokeWidth={2.25} />
            )}
          </button>
        </div>

        {/* ── Mobile nav ── */}
        <div className="flex items-center gap-1 md:hidden">
          <div className="flex flex-wrap gap-1">
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
          <button
            type="button"
            onClick={toggle}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="h-7 w-7 inline-flex items-center justify-center rounded-full border border-foreground/15 bg-foreground/[0.06] text-foreground/80"
          >
            {theme === "dark" ? (
              <Sun className="h-3.5 w-3.5" strokeWidth={2.25} />
            ) : (
              <Moon className="h-3.5 w-3.5" strokeWidth={2.25} />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
