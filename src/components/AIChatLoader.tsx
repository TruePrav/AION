"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { API, type DiscoveryToken } from "@/lib/api";

const AIChatPanel = dynamic(() => import("./AIChatPanel"), { ssr: false });

/** Builds a compact text summary of discovery data for the LLM context window. */
function buildContext(tokens: DiscoveryToken[]): string {
  if (!tokens.length) return "";

  const lines = tokens.map((t) => {
    const accum = t.accumulation || {};
    const tier = t.tier_filter || {};
    return [
      `${t.symbol} (${t.chain})`,
      `MCap=$${(t.market_cap / 1e6).toFixed(1)}M`,
      `7dInflow=$${(t.net_flow_7d / 1e3).toFixed(1)}K`,
      `24hInflow=$${(t.net_flow_24h / 1e3).toFixed(1)}K`,
      `SM_Traders=${t.trader_count}`,
      `Age=${t.token_age_days}d`,
      `Accum=${accum.grade || "?"}(${accum.score || 0}/100)`,
      `RiskTier=${tier.tier || "?"}`,
      tier.passed ? "PASSED" : `FILTERED(${(tier.reasons || []).join("; ")})`,
    ].join(" | ");
  });

  return `Latest discovery (${tokens.length} tokens):\n${lines.join("\n")}`;
}

export default function AIChatLoader() {
  const [context, setContext] = useState<string>("");

  useEffect(() => {
    fetch(`${API}/api/discovery/latest`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.tokens) setContext(buildContext(d.tokens));
      })
      .catch(() => {});
  }, []);

  return <AIChatPanel context={context} />;
}
