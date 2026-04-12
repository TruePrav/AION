import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || "";

/** Rate limiter: max 3 requests per 60 seconds across all users */
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 3;
const recentRequests: number[] = [];

function checkRateLimit(): boolean {
  const now = Date.now();
  // Prune old entries
  while (recentRequests.length > 0 && now - recentRequests[0] > RATE_WINDOW_MS) {
    recentRequests.shift();
  }
  if (recentRequests.length >= RATE_MAX) return false;
  recentRequests.push(now);
  return true;
}

const SYSTEM_PROMPT = `You are AION, a smart money intelligence AI assistant. You analyze on-chain data from Nansen to help traders understand token movements, wallet behavior, and market signals.

You have access to the latest discovery data provided in the user's message context. Use it to give specific, data-backed answers. Be concise but thorough. Format numbers nicely ($1.2M, not $1200000). Use short paragraphs.

Key concepts you understand:
- SM (Smart Money) wallets: wallets flagged by Nansen as historically profitable traders
- Accumulation scoring: measures buy/sell ratio, buyer concentration, SM buyer %, and volume patterns
- Risk tiers: degen (high risk, low mcap), balanced (established tokens), conservative (blue chips)
- Grades: S (elite) > A (strong) > B (decent) > C (weak) > D (poor)
- Net flow: positive = more SM buying than selling

When asked about specific tokens, reference their actual data (mcap, inflow, accumulation grade, risk score, SM trader count). When asked general questions, synthesize across the dataset.

Never make up data. If you don't have info on something, say so. Keep responses under 300 words unless the user asks for detail.

Note: You are running in demo mode using Claude Haiku. For the full experience with Claude Sonnet, users can clone the AION repo and add their own API key.`;

export async function POST(req: NextRequest) {
  if (!ANTHROPIC_KEY) {
    return NextResponse.json(
      {
        error: "demo_credits_exhausted",
        message: "Demo AI credits temporarily exhausted. Clone the repo and add your own Anthropic API key to chat with AION!",
      },
      { status: 503 }
    );
  }

  if (!checkRateLimit()) {
    return NextResponse.json(
      {
        error: "demo_rate_limit",
        message: "Demo rate limit reached (3 messages/min). Please wait a moment and try again.",
      },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { messages, context } = body as {
      messages: { role: "user" | "assistant"; content: string }[];
      context?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array required" }, { status: 400 });
    }

    // Prepend discovery context to the first user message if provided
    const enrichedMessages = messages.map((m, i) => {
      if (i === 0 && m.role === "user" && context) {
        return {
          ...m,
          content: `[Discovery Data Context]\n${context}\n\n[User Question]\n${m.content}`,
        };
      }
      return m;
    });

    const client = new Anthropic({ apiKey: ANTHROPIC_KEY });

    const response = await client.messages.create({
      model: "claude-haiku-4-20250414",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: enrichedMessages,
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    return NextResponse.json({
      message: text,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[AI Chat Error]", msg);
    const lower = msg.toLowerCase();
    if (lower.includes("credit") || lower.includes("insufficient") || lower.includes("billing") || lower.includes("rate_limit") || lower.includes("overloaded")) {
      return NextResponse.json(
        {
          error: "demo_credits_exhausted",
          message: "Demo AI credits temporarily exhausted. Clone the repo and add your own Anthropic API key to chat with AION!",
        },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
