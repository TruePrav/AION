import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon?: ReactNode;
  accent?: boolean;
}

export default function StatCard({ label, value, change, icon, accent = false }: StatCardProps) {
  return (
    <div
      className={`rounded-2xl border p-5 flex flex-col gap-3 transition-all duration-300 ${
        accent
          ? "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/35 hover:bg-emerald-500/8"
          : "bg-gray-900/70 border-white/5 hover:border-white/10 hover:bg-gray-900/90 backdrop-blur-sm"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</span>
        {icon && (
          <span className={`text-gray-600 ${accent ? "text-emerald-500/50" : ""}`}>{icon}</span>
        )}
      </div>

      <div className="flex items-end gap-3">
        <span className="text-2xl font-bold text-white tracking-tight leading-none">
          {value}
        </span>

        {change !== undefined && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-semibold mb-0.5 ${
              change >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {change >= 0 ? (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            )}
            {Math.abs(change)}%
          </span>
        )}
      </div>
    </div>
  );
}