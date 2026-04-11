import { NextRequest, NextResponse } from "next/server";

/**
 * Persona panel analysis proxy.
 * Forwards the request to the VPS backend which has the Anthropic API key.
 */

const BACKEND =
  process.env.AION_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();

    const res = await fetch(`${BACKEND}/api/personas/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
