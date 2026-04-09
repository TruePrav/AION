// Style preview page — shows 5 variants of each key surface side-by-side
// for visual comparison. Not linked from the main nav; navigate directly.

import { HeroV1, HeroV2, HeroV3, HeroV4, HeroV5 } from "./variants/hero";
import { DiscoveryV1, DiscoveryV2, DiscoveryV3, DiscoveryV4, DiscoveryV5 } from "./variants/discovery";
import { PortfolioV1, PortfolioV2, PortfolioV3, PortfolioV4, PortfolioV5 } from "./variants/portfolio";
import { WalletV1, WalletV2, WalletV3, WalletV4, WalletV5 } from "./variants/wallet";
import { STYLE_NAMES } from "./mock";

const HERO_VARIANTS = [HeroV1, HeroV2, HeroV3, HeroV4, HeroV5];
const DISCOVERY_VARIANTS = [DiscoveryV1, DiscoveryV2, DiscoveryV3, DiscoveryV4, DiscoveryV5];
const PORTFOLIO_VARIANTS = [PortfolioV1, PortfolioV2, PortfolioV3, PortfolioV4, PortfolioV5];
const WALLET_VARIANTS = [WalletV1, WalletV2, WalletV3, WalletV4, WalletV5];

export default function StylesPreviewPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Page header */}
      <div className="border-b border-zinc-800 bg-zinc-950 px-8 py-8">
        <div className="max-w-[1280px] mx-auto">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Oracle — Style Variants</h1>
          <p className="text-sm text-zinc-400">
            5 style directions × 4 key surfaces. Pick your favorite per surface (or mix & match).
          </p>
          <div className="mt-5 grid grid-cols-5 gap-3">
            {STYLE_NAMES.map((s, i) => (
              <div key={s.id} className="rounded-md border border-zinc-800 bg-zinc-900/50 p-3">
                <div className="text-[10px] font-mono text-cyan-400 tracking-wider">V{i + 1}</div>
                <div className="text-sm font-medium text-zinc-100 mt-0.5">{s.label}</div>
                <div className="text-[11px] text-zinc-500 mt-0.5">{s.tagline}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── HERO ─── */}
      <Section title="1. Dashboard Hero" surfaceId="hero">
        {HERO_VARIANTS.map((V, i) => (
          <VariantWrap key={i} index={i} surfaceId="hero">
            <V />
          </VariantWrap>
        ))}
      </Section>

      {/* ─── DISCOVERY ─── */}
      <Section title="2. Discovery Token Table" surfaceId="discovery">
        {DISCOVERY_VARIANTS.map((V, i) => (
          <VariantWrap key={i} index={i} surfaceId="discovery">
            <V />
          </VariantWrap>
        ))}
      </Section>

      {/* ─── PORTFOLIO ─── */}
      <Section title="3. Portfolio / Positions" surfaceId="portfolio">
        {PORTFOLIO_VARIANTS.map((V, i) => (
          <VariantWrap key={i} index={i} surfaceId="portfolio">
            <V />
          </VariantWrap>
        ))}
      </Section>

      {/* ─── WALLET HEADER ─── */}
      <Section title="4. Wallet Profile Header" surfaceId="wallet">
        {WALLET_VARIANTS.map((V, i) => (
          <VariantWrap key={i} index={i} surfaceId="wallet">
            <V />
          </VariantWrap>
        ))}
      </Section>

      <div className="px-8 py-10 text-center text-[11px] text-zinc-600">
        — end of variants —
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; surfaceId: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-zinc-800 px-8 py-12">
      <div className="max-w-[1280px] mx-auto">
        <h2 className="text-xl font-semibold tracking-tight mb-6 flex items-center gap-3">
          {title}
          <span className="text-[10px] font-mono text-zinc-500 font-normal">5 variants</span>
        </h2>
        <div className="space-y-10">{children}</div>
      </div>
    </section>
  );
}

function VariantWrap({ index, surfaceId, children }: { index: number; surfaceId: string; children: React.ReactNode }) {
  const style = STYLE_NAMES[index];
  return (
    <div id={`${surfaceId}-v${index + 1}`} data-variant={`${surfaceId}-v${index + 1}`} className="scroll-mt-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="inline-flex items-center gap-1.5 rounded-md border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5">
          <span className="text-[10px] font-mono font-bold text-cyan-400 tracking-wider">V{index + 1}</span>
        </div>
        <div className="text-sm font-medium text-zinc-100">{style.label}</div>
        <div className="text-[11px] text-zinc-500">{style.tagline}</div>
      </div>
      <div>{children}</div>
    </div>
  );
}
