import { NextRequest, NextResponse } from "next/server";

/**
 * Persona panel analysis proxy.
 * Forwards the request to the VPS backend which has the Anthropic API key.
 * Requires AION_API_KEY + ADMIN_ALLOW_MUTATIONS to prevent public credit burn.
 */

const BACKEND =
  process.env.AION_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001";

const KEY = process.env.AION_API_KEY || "";
const MUTATIONS_ENABLED = process.env.ADMIN_ALLOW_MUTATIONS === "1";

export async function POST(req: NextRequest) {
  if (!KEY || !MUTATIONS_ENABLED) {
    return NextResponse.json(
      { error: "Persona analysis disabled on public deployment" },
      { status: 503 }
    );
  }

  try {
    const body = await req.text();

    const res = await fetch(`${BACKEND}/api/personas/analyze`, {
      method: "POST",
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
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[Persona Proxy Error]", msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
