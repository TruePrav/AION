import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side proxy for AION admin mutations.
 *
 * Security design:
 * - AION_API_KEY is a SERVER-ONLY env var (no NEXT_PUBLIC_ prefix)
 *   so it is NEVER sent to the browser or included in the JS bundle.
 * - Public deployments (Vercel) can omit AION_API_KEY entirely —
 *   mutations will then return 503, giving a read-only showcase.
 * - Local dev / admin deployments set AION_API_KEY in .env.local
 *   so you can still trade, edit targets, etc.
 *
 * Optional: set ADMIN_ALLOW_MUTATIONS=1 to explicitly enable mutations.
 * If omitted, only GET requests are proxied even if the key is present.
 */

const BACKEND = process.env.AION_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
const KEY = process.env.AION_API_KEY || "";
const MUTATIONS_ENABLED = process.env.ADMIN_ALLOW_MUTATIONS === "1";

/**
 * Allowlist of backend paths the proxy is permitted to forward to.
 * Prevents SSRF-style abuse where an attacker uses the authenticated proxy
 * to hit arbitrary backend endpoints. Add new entries here as features land.
 *
 * Matches against the path AFTER `/api/admin/` — so an entry of
 * "trade/copy" matches a client request to `/api/admin/trade/copy`.
 */
const PATH_ALLOWLIST: RegExp[] = [
  /^trade\/copy$/,
  /^settings$/,
  /^positions\/[^/]+\/targets$/,
  /^positions\/[^/]+\/close$/,
  /^alerts\/settings$/,
  /^alerts\/watchlist$/,
  /^discovery\/trigger$/,
];

function isAllowedPath(joined: string): boolean {
  return PATH_ALLOWLIST.some((re) => re.test(joined));
}

async function proxy(req: NextRequest, ctx: { params: Promise<{ slug: string[] }> }) {
  if (!KEY) {
    return NextResponse.json(
      { success: false, error: "Admin mutations disabled on this deployment (read-only mode)" },
      { status: 503 }
    );
  }

  if (req.method !== "GET" && !MUTATIONS_ENABLED) {
    return NextResponse.json(
      { success: false, error: "Mutations disabled. Set ADMIN_ALLOW_MUTATIONS=1 to enable." },
      { status: 403 }
    );
  }

  const { slug } = await ctx.params;
  const joined = slug.join("/");

  // Reject path-traversal attempts and anything not on the allowlist.
  if (joined.includes("..") || !isAllowedPath(joined)) {
    return NextResponse.json(
      { success: false, error: "Path not allowed" },
      { status: 403 }
    );
  }

  const url = `${BACKEND}/api/${joined}${req.nextUrl.search}`;

  const body = req.method === "GET" || req.method === "HEAD" ? undefined : await req.text();

  try {
    const res = await fetch(url, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        "X-Aion-Key": KEY,
      },
      body,
      cache: "no-store",
    });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("Content-Type") || "application/json" },
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: `Proxy error: ${e instanceof Error ? e.message : String(e)}` },
      { status: 502 }
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
export const PATCH = proxy;
