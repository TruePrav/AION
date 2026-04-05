import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon?: ReactNode;
}

export default function StatCard({ label, value, change, icon }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">{label}</span>
        {icon && (
          <span className="text-gray-500">{icon}</span>
        )}
      </div>

      <div className="flex items-end gap-3">
        <span className="text-2xl font-semibold text-white tracking-tight">
          {value}
        </span>

        {change !== undefined && (
          <span
            className={`inline-flex items-center gap-0.5 text-sm font-medium ${
              change >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {change >= 0 ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
