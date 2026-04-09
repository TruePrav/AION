import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side proxy for Oracle admin mutations.
 *
 * Security design:
 * - ORACLE_API_KEY is a SERVER-ONLY env var (no NEXT_PUBLIC_ prefix)
 *   so it is NEVER sent to the browser or included in the JS bundle.
 * - Public deployments (Vercel) can omit ORACLE_API_KEY entirely —
 *   mutations will then return 503, giving a read-only showcase.
 * - Local dev / admin deployments set ORACLE_API_KEY in .env.local
 *   so you can still trade, edit targets, etc.
 *
 * Optional: set ADMIN_ALLOW_MUTATIONS=1 to explicitly enable mutations.
 * If omitted, only GET requests are proxied even if the key is present.
 */

const BACKEND = process.env.ORACLE_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
const KEY = process.env.ORACLE_API_KEY || "";
const MUTATIONS_ENABLED = process.env.ADMIN_ALLOW_MUTATIONS === "1";

async function proxy(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
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

  const { path } = await ctx.params;
  const url = `${BACKEND}/api/${path.join("/")}${req.nextUrl.search}`;

  const body = req.method === "GET" || req.method === "HEAD" ? undefined : await req.text();

  try {
    const res = await fetch(url, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        "X-Oracle-Key": KEY,
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
