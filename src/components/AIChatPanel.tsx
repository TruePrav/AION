"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Brain, X, Send, Loader2, Sparkles, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatPanelProps {
  /** Serialised discovery context string (tokens, wallets summary) */
  context?: string;
}

const SUGGESTED = [
  "Which token has the strongest accumulation right now?",
  "Summarize the top 3 tokens by smart money inflow",
  "What are the biggest risk flags in the current discovery?",
  "Which wallets are most active across multiple tokens?",
];

export default function AIChatPanel({ context }: AIChatPanelProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const send = useCallback(
    async (text?: string) => {
      const msg = (text || input).trim();
      if (!msg || loading) return;

      setInput("");
      setError(null);
      const newMessages: Message[] = [...messages, { role: "user", content: msg }];
      setMessages(newMessages);
      setLoading(true);

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: newMessages,
            context: messages.length === 0 ? context : undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || `Error ${res.status}`);
        } else {
          setMessages([...newMessages, { role: "assistant", content: data.message }]);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Network error");
      } finally {
        setLoading(false);
      }
    },
    [input, loading, messages, context]
  );

  return (
    <>
      {/* ── FAB ── */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-2xl bg-primary text-[hsl(0_0%_8%)] shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          aria-label="Open AI chat"
        >
          <Brain className="h-6 w-6" strokeWidth={2} />
        </button>
      )}

      {/* ── Panel ── */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-3rem)] flex flex-col rounded-2xl border border-foreground/15 bg-background/95 backdrop-blur-2xl shadow-2xl shadow-black/20 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-foreground/10 bg-foreground/[0.03]">
            <div className="h-8 w-8 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-foreground">Ask AION</h3>
              <p className="text-[10px] text-foreground/50">AI-powered smart money analysis</p>
            </div>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={() => { setMessages([]); setError(null); }}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-foreground/40 hover:text-foreground hover:bg-foreground/10 transition-colors"
                aria-label="Clear chat"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-foreground/40 hover:text-foreground hover:bg-foreground/10 transition-colors"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.length === 0 && !loading && (
              <div className="space-y-3 pt-4">
                <p className="text-xs text-foreground/50 text-center mb-4">
                  Ask anything about the latest discovery data
                </p>
                {SUGGESTED.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => send(q)}
                    className="w-full text-left px-4 py-3 rounded-xl border border-foreground/10 bg-foreground/[0.03] hover:bg-foreground/[0.07] transition-colors text-xs text-foreground/80 leading-relaxed"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed",
                  m.role === "user"
                    ? "ml-auto bg-primary/20 border border-primary/30 text-foreground"
                    : "bg-foreground/[0.05] border border-foreground/10 text-foreground/90"
                )}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-foreground/[0.05] border border-foreground/10 max-w-[85%]">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                <span className="text-xs text-foreground/60">Thinking...</span>
              </div>
            )}

            {error && (
              <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30 text-xs text-destructive">
                {error}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-foreground/10 px-4 py-3 bg-foreground/[0.02]">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Ask about tokens, wallets, signals..."
                rows={1}
                className="flex-1 resize-none rounded-xl border border-foreground/15 bg-foreground/[0.04] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
              />
              <button
                type="button"
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="h-10 w-10 flex-shrink-0 rounded-xl bg-primary text-[hsl(0_0%_8%)] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-all"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
