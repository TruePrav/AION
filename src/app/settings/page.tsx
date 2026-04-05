"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface Settings {
  trailing_stop_pct: number;
  take_profit_tiers: number[];
  max_position_pct: number;
  min_convergence_wallets: number;
  scan_interval_minutes: number;
  mode: string;
}

const MODE_CONFIG = {
  live: { label: "Live Trading", desc: "Trades execute automatically with real funds. Use with caution.", color: "emerald" },
  approval: { label: "Approval Mode", desc: "Trades are queued for your approval before execution.", color: "amber" },
  dry_run: { label: "Dry Run", desc: "Trades are simulated — no real funds used.", color: "blue" },
};

const COLOR_MAP: Record<string, { active: string; idle: string }> = {
  emerald: { active: "border-emerald-500 bg-emerald-500/10 text-emerald-400", idle: "border-white/10 bg-white/5 text-gray-400 hover:border-white/20" },
  amber: { active: "border-amber-500 bg-amber-500/10 text-amber-400", idle: "border-white/10 bg-white/5 text-gray-400 hover:border-white/20" },
  blue: { active: "border-blue-500 bg-blue-500/10 text-blue-400", idle: "border-white/10 bg-white/5 text-gray-400 hover:border-white/20" },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [localSettings, setLocalSettings] = useState<Settings | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const data = await apiFetch<Settings>("/api/settings");
      setSettings(data);
      setLocalSettings(data);
    } catch {
      const res = await fetch("http://178.128.253.120:5001/api/settings");
      const data = await res.json();
      setSettings(data);
      setLocalSettings(data);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    if (!localSettings) return;
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("http://178.128.253.120:5001/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(localSettings),
      });
      const result = await res.json();
      if (result.success) {
        setSettings(localSettings);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert(`Save failed: ${JSON.stringify(result)}`);
      }
    } catch (e) {
      alert(`Error: ${e}`);
    } finally {
      setSaving(false);
    }
  }

  function update(key: keyof Settings, value: number | string | number[]) {
    if (!localSettings) return;
    setLocalSettings({ ...localSettings, [key]: value });
    setSaved(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-400">
        <div className="h-10 w-10 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mb-4" />
        <p className="text-sm text-gray-500">Loading settings...</p>
      </div>
    );
  }

  if (!localSettings) return null;

  return (
    <div className="gradient-mesh min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">

        {/* ── Page Header ── */}
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-gray-900/80 to-gray-900/40 p-8 backdrop-blur-sm">
          <div className="absolute right-0 top-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="relative flex items-center gap-3 mb-1">
            <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs font-medium text-purple-400/70 uppercase tracking-wider">Configuration</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Changes apply on next scan cycle</p>
        </div>

        {/* ── Trading Mode ── */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-white mb-1">Trading Mode</h2>
          <p className="text-xs text-gray-500 mb-5">Controls how Oracle executes trades.</p>
          <div className="flex gap-3 flex-wrap">
            {(Object.keys(MODE_CONFIG) as Array<keyof typeof MODE_CONFIG>).map((mode) => {
              const cfg = MODE_CONFIG[mode];
              const colors = COLOR_MAP[cfg.color];
              const active = localSettings.mode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => update("mode", mode)}
                  className={`flex-1 min-w-[140px] px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 text-left ${active ? colors.active : colors.idle}`}
                >
                  <div className="font-semibold text-xs mb-0.5">{cfg.label}</div>
                  <div className={`text-[10px] leading-tight ${active ? "opacity-70" : "text-gray-600"}`}>{cfg.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Position Sizing ── */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-2.25m0 0l-.75 1.5h3.75a1.5 1.5 0 000-3h-3.75a1.5 1.5 0 00-1.5 1.5v3.75m0 0l1.5 1.5m-1.5-1.5l1.5-1.5" />
            </svg>
            <h2 className="text-sm font-semibold text-white">Position Sizing</h2>
          </div>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs text-gray-400 font-medium">Max position size</label>
                <span className="text-sm font-bold text-emerald-400 font-mono">{localSettings.max_position_pct * 100}%</span>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                value={localSettings.max_position_pct * 100}
                onChange={(e) => update("max_position_pct", Number(e.target.value) / 100)}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-gray-600 mt-1.5">
                <span>1%</span>
                <span className="text-gray-500">{localSettings.max_position_pct * 100}% of portfolio</span>
                <span>50%</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Exit Strategy ── */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 3m0 0l6 6m-6-6v12" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h6v6" />
            </svg>
            <h2 className="text-sm font-semibold text-white">Exit Strategy</h2>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs text-gray-400 font-medium">Trailing stop</label>
                <span className="text-sm font-bold text-emerald-400 font-mono">{localSettings.trailing_stop_pct * 100}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={50}
                value={localSettings.trailing_stop_pct * 100}
                onChange={(e) => update("trailing_stop_pct", Number(e.target.value) / 100)}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-gray-600 mt-1.5">
                <span>5%</span>
                <span className="text-gray-500">exit from peak after entry</span>
                <span>50%</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <label className="text-xs text-gray-400 font-medium">Take-profit tiers</label>
                <span className="text-[10px] text-gray-600">(exit 33% at each tier)</span>
              </div>
              <div className="flex gap-4 flex-wrap">
                {localSettings.take_profit_tiers.map((tier, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-800/50 rounded-xl px-3 py-2 border border-white/5">
                    <span className="text-[10px] text-gray-600 font-bold">T{i + 1}</span>
                    <input
                      type="number"
                      min={10}
                      max={500}
                      value={tier * 100}
                      onChange={(e) => {
                        const newTiers = [...localSettings.take_profit_tiers];
                        newTiers[i] = Number(e.target.value) / 100;
                        update("take_profit_tiers", newTiers);
                      }}
                      className="w-16 bg-transparent text-center text-sm font-mono text-white outline-none"
                    />
                    <span className="text-[10px] text-gray-600">%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Scanning ── */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
            <h2 className="text-sm font-semibold text-white">Scanning</h2>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs text-gray-400 font-medium">Min convergence wallets</label>
                <span className="text-sm font-bold text-emerald-400 font-mono">{localSettings.min_convergence_wallets}</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={localSettings.min_convergence_wallets}
                onChange={(e) => update("min_convergence_wallets", Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-gray-600 mt-1.5">
                <span>1 (sensitive)</span>
                <span className="text-gray-500">wallets needed for signal</span>
                <span>10 (strict)</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs text-gray-400 font-medium">Scan interval</label>
                <span className="text-sm font-bold text-emerald-400 font-mono">{localSettings.scan_interval_minutes} min</span>
              </div>
              <input
                type="range"
                min={5}
                max={60}
                step={5}
                value={localSettings.scan_interval_minutes}
                onChange={(e) => update("scan_interval_minutes", Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-gray-600 mt-1.5">
                <span>5 min</span>
                <span className="text-gray-500">time between scans</span>
                <span>60 min</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Save Button ── */}
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="inline-flex items-center gap-2.5 px-7 py-3 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-black transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 hover:shadow-emerald-400/30 hover:scale-[1.01] active:scale-[0.99]"
          >
            {saving ? (
              <>
                <span className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Saved!
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save Settings
              </>
            )}
          </button>
          {saved && (
            <span className="text-sm text-emerald-400/70">Settings updated — next scan cycle will use new values</span>
          )}
        </div>
      </div>
    </div>
  );
}