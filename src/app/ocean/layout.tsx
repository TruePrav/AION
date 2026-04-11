"use client";

// Ocean preview layout. Toggles the `ocean-theme` class on <html> while
// the user is browsing /ocean/* routes, which swaps every semantic CSS
// token (bg-card, text-foreground, border-border, glass-*, brutal-*…)
// to the deep-navy / electric-cyan palette from variant V8.
//
// Each /ocean/* page re-exports the real page component — no duplication,
// no changes to main pages, and any future main-page update shows up in
// the ocean preview automatically.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft, Waves } from "lucide-react";

const OCEAN_NAV: { href: string; label: string }[] = [
  { href: "/ocean", label: "Dashboard" },
  { href: "/ocean/discovery", label: "Discovery" },
  { href: "/ocean/wallets", label: "Wallets" },
  { href: "/ocean/polymarket", label: "Polymarket" },
  { href: "/ocean/positions", label: "Positions" },
  { href: "/ocean/trades", label: "Trades" },
  { href: "/ocean/knowledge", label: "Wiki" },
];

export default function OceanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = usePathname() || "/ocean";

  // Add the ocean-theme class to <html> while mounted. When the user
  // navigates away (e.g. clicks the real navbar) the class is removed
  // and the site returns to its normal appearance.
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("ocean-theme");
    return () => {
      html.classList.remove("ocean-theme");
    };
  }, []);

  return (
    <div className="ocean-bg min-h-screen">
      {/* Ocean subnav bar — sits right under the main app navbar */}
      <div className="sticky top-[61px] z-40 border-b border-cyan-400/10 bg-[#030814]/85 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-2.5 flex items-center gap-3 flex-wrap">
          <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-cyan-300/80">
            <Waves className="h-3 w-3" strokeWidth={2.25} />
            <span>Ocean Preview</span>
          </div>
          <div className="h-3 w-px bg-cyan-400/20" />
          <div className="flex items-center gap-0.5 flex-wrap">
            {OCEAN_NAV.map((n) => {
              const active =
                path === n.href ||
                (n.href !== "/ocean" && path.startsWith(n.href));
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={
                    "px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide transition " +
                    (active
                      ? "bg-cyan-400/15 text-cyan-100 border border-cyan-400/30"
                      : "text-cyan-200/60 hover:text-cyan-100 hover:bg-cyan-400/5 border border-transparent")
                  }
                >
                  {n.label}
                </Link>
              );
            })}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden sm:inline text-[10px] text-cyan-300/40 italic">
              Same data, themed for preview
            </span>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1 text-[11px] text-cyan-200 hover:bg-cyan-400/10 hover:border-cyan-400/40 transition"
            >
              <ArrowLeft className="h-3 w-3" strokeWidth={2.25} />
              Back to main site
            </Link>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}
