"use client";

import { useState } from "react";

export interface PipelineCommand {
  step: number;
  name: string;
  command: string;
  credits: number;
  duration_ms: number;
  result_summary: string;
}

interface PipelineCommandsProps {
  commands: PipelineCommand[] | null;
  creditsUsed: number;
  creditsBefore: number;
  creditsAfter: number;
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors group"
      title="Copy command"
    >
      {copied ? (
        <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="h-3.5 w-3.5 text-gray-600 group-hover:text-gray-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
}

function fmtDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function PipelineCommands({ commands, creditsUsed, creditsBefore, creditsAfter }: PipelineCommandsProps) {
  const [open, setOpen] = useState(false);

  if (!commands) return null;

  const creditsPct = creditsBefore > 0 ? Math.round((creditsUsed / creditsBefore) * 100) : 0;

  return (
    <section>
      {/* Collapsible header */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="card w-full flex items-center gap-3 px-5 py-4 text-left transition-colors hover:border-emerald-500/20"
      >
        <svg
          className={`h-3.5 w-3.5 text-gray-600 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>

        <h2 className="text-xl font-bold text-white">
          <span className="mr-1.5" aria-hidden="true">&#9889;</span>
          Pipeline Commands
        </h2>

        <span className="text-xs font-mono text-gray-500 bg-gray-800 px-2.5 py-1 rounded-full border border-white/5">
          {commands.length} steps
        </span>

        <span className="ml-auto text-xs font-mono text-emerald-400/80 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          {creditsUsed} credits used
        </span>
      </button>

      {/* Expanded content */}
      {open && (
        <div className="card mt-2 p-5">
          {/* Timeline */}
          <div className="relative">
            {commands.map((cmd, idx) => {
              const isLast = idx === commands.length - 1;

              return (
                <div key={cmd.step} className="flex gap-4 pb-6 last:pb-0">
                  {/* Timeline column */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    {/* Step circle */}
                    <div className="h-7 w-7 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center flex-shrink-0">
                      <span className="text-[11px] font-bold text-emerald-400 font-mono">{cmd.step}</span>
                    </div>
                    {/* Connecting line */}
                    {!isLast && (
                      <div className="w-px flex-1 bg-white/[0.06] mt-1" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 -mt-0.5">
                    {/* Step name + badges */}
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-sm font-semibold text-white">{cmd.name}</span>
                      <span className="text-[10px] font-mono text-amber-400/80 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/15">
                        {cmd.credits} cr
                      </span>
                      <span className="text-[10px] font-mono text-gray-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                        {fmtDuration(cmd.duration_ms)}
                      </span>
                    </div>

                    {/* Command block */}
                    <div className="flex items-start gap-1 rounded-lg bg-[#0a0a0e] border border-white/[0.06] p-3 mb-2">
                      <code className="flex-1 text-xs font-mono text-emerald-300/90 break-all leading-relaxed select-all">
                        {cmd.command}
                      </code>
                      <CopyBtn text={cmd.command} />
                    </div>

                    {/* Result summary */}
                    <p className="text-xs text-gray-600">{cmd.result_summary}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Credit summary bar */}
          <div className="mt-6 pt-5 border-t border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">Credit Usage</span>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-gray-400">{creditsBefore}</span>
                <svg className="h-3 w-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span className="text-white font-semibold">{creditsAfter}</span>
                <span className="text-red-400/70">(-{creditsUsed})</span>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full rounded-full flex">
                {/* Remaining credits */}
                <div
                  className="h-full bg-emerald-500/40 transition-all"
                  style={{ width: `${100 - creditsPct}%` }}
                />
                {/* Used credits */}
                <div
                  className="h-full bg-red-400/40 transition-all"
                  style={{ width: `${creditsPct}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[10px] text-gray-600">Remaining: {creditsAfter}</span>
              <span className="text-[10px] text-gray-600">Used: {creditsUsed} ({creditsPct}%)</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
