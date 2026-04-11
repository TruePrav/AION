import Link from "next/link";
import Image from "next/image";

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/discovery", label: "Discovery" },
  { href: "/wallets", label: "Wallets" },
  { href: "/polymarket", label: "Polymarket" },
  { href: "/positions", label: "Positions" },
  { href: "/trades", label: "Trades" },
  { href: "/knowledge", label: "Wiki" },
  { href: "/settings", label: "Settings" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/roadmap", label: "Roadmap" },
];

const CHAINS = [
  { name: "Solana", status: "live", tone: "bg-primary" },
  { name: "Base", status: "live", tone: "bg-accent" },
  { name: "Ethereum", status: "live", tone: "bg-secondary" },
];

export default function Footer() {
  return (
    <footer className="border-t border-foreground/10 mt-auto bg-background/80">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div className="space-y-4">
            <Image
              src="/aion-logo-sm.png"
              alt="AION"
              width={929}
              height={304}
              className="h-9 w-auto dark:[filter:invert(1)_hue-rotate(80deg)] transition-[filter] duration-200"
            />
            <p className="text-xs text-foreground/70 leading-relaxed max-w-xs">
              Smart money intelligence. Tracks the wallets that move markets, grades them, surfaces alpha before the crowd.
            </p>
            <a
              href="https://t.me/AIONSignalBot"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-btn text-xs"
            >
              Telegram Bot →
            </a>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-[11px] font-semibold text-foreground/50 uppercase tracking-wider mb-4">
              Navigation
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-xs font-medium text-foreground/80 hover:text-foreground transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Chains */}
          <div>
            <h4 className="text-[11px] font-semibold text-foreground/50 uppercase tracking-wider mb-4">
              Supported Chains
            </h4>
            <div className="space-y-2.5">
              {CHAINS.map((c) => (
                <div key={c.name} className="flex items-center gap-2">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full border border-foreground/20 ${c.tone}`} />
                  <span className="text-xs font-medium text-foreground">{c.name}</span>
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-foreground/50 border border-foreground/15 rounded-full px-1.5 py-0">
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-foreground/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] font-medium text-foreground/60">
            AION — Smart Money Intelligence
          </p>
          <p className="text-[11px] font-medium text-foreground/60">
            Built for Nansen CLI
          </p>
        </div>
      </div>
    </footer>
  );
}
