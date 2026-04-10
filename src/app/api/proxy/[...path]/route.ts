import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side read proxy — forwards GET requests to the backend so the
 * VPS IP never appears in client-side code.
 *
 * Set AION_BACKEND_URL (server-only, no NEXT_PUBLIC_ prefix) in Vercel
 * env vars to keep the VPS address private.
 *
 * Requests to /api/proxy/discovery/wallets → BACKEND/api/discovery/wallets
 */

const BACKEND =
  process.env.AION_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001";

/** Paths the read proxy is allowed to forward. */
const READ_ALLOWLIST: RegExp[] = [
  /^discovery\//,
  /^polymarket\//,
  /^wallet\//,
  /^positions/,
  /^trades/,
  /^settings$/,
  /^alerts\//,
  /^knowledge\//,
  /^health$/,
];

function isAllowed(path: string): boolean {
  return READ_ALLOWLIST.some((re) => re.test(path));
}

async function handler(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path } = await ctx.params;
  const joined = path.join("/");

  if (joined.includes("..") || !isAllowed(joined)) {
    return NextResponse.json({ error: "Path not allowed" }, { status: 403 });
  }

  const url = `${BACKEND}/api/${joined}${req.nextUrl.search}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: `Proxy error: ${e instanceof Error ? e.message : String(e)}` },
      { status: 502 }
    );
  }
}

export const GET = handler;
