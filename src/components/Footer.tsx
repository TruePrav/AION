import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-gray-950/50 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 mb-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/20">
                <span className="text-sm font-bold text-emerald-400">O</span>
              </div>
              <span className="text-sm font-bold text-white">Oracle v3</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
              Smart money intelligence for the Nansen Synthesis 2026 hackathon.
              Tracks, grades, and surfaces real alpha before the crowd catches on.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/TruePrav/oracle-synthesis"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-emerald-400 transition-colors flex items-center gap-1"
              >
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                GitHub
              </a>
              <span className="text-gray-700">·</span>
              <a
                href="https://t.me/OracleAITradingBot"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-emerald-400 transition-colors flex items-center gap-1"
              >
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                Telegram Bot
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Navigation</h4>
            <div className="grid grid-cols-2 gap-1">
              {[
                { href: "/", label: "Dashboard" },
                { href: "/discovery", label: "Discovery" },
                { href: "/wallets", label: "Wallets" },
                { href: "/positions", label: "Positions" },
                { href: "/trades", label: "Trades" },
                { href: "/grading", label: "Grading" },
                { href: "/settings", label: "Settings" },
                { href: "/how-it-works", label: "How It Works" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="text-xs text-gray-500 hover:text-emerald-400 transition-colors py-0.5">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Built for */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Built For</h4>
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400/60" />
                <span>The Synthesis 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-400/60" />
                <span>Nansen CLI Challenge</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-purple-400/60" />
                <span>Solana · Ethereum · Base</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            Oracle v3 — Smart Money Intelligence
          </p>
          <p className="text-xs text-gray-600">
            Powered by Nansen API · Built with Next.js
          </p>
        </div>
      </div>
    </footer>
  );
}