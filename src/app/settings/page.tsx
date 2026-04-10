"use client";

import { useEffect, useState } from "react";
import { apiFetch, apiPost, READONLY_MODE } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Lock, Save, AlertTriangle, Sliders, Target, Search, Check, Bell, Eye, Plus, X, Waves, Power } from "lucide-react";

interface AlertSettings {
  alerts_enabled: boolean;
  alert_min_win_rate: number;
  alert_min_grade: string;
  alert_watchlist: string[];
  alert_types_enabled: string[];
  alert_max_per_hour: number;
  telegram_enabled: boolean;
  telegram_chat_id: string;
  telegram_bot_token: string;
}

const ALERT_TYPES = [
  { key: "SM_NEW_POSITION", label: "Crypto SM Alerts", desc: "When high-WR wallets buy tokens" },
  { key: "PM_NEW_POSITION", label: "PM Whale Alerts", desc: "When proven whales enter markets" },
  { key: "CONTRARIAN_EDGE", label: "Contrarian Edge", desc: "Whales disagree with market price" },
  { key: "EARLY_MOVER", label: "Early Mover", desc: "Big positions in low-volume markets" },
  { key: "CROSS_CORRELATION", label: "Cross-Chain", desc: "Same wallet on crypto + PM" },
];

const DEFAULT_ALERT_SETTINGS: AlertSettings = {
  alerts_enabled: true,
  alert_min_win_rate: 0.60,
  alert_min_grade: "B",
  alert_watchlist: [],
  alert_types_enabled: ALERT_TYPES.map(t => t.key),
  alert_max_per_hour: 20,
  telegram_enabled: true,
  telegram_chat_id: "",
  telegram_bot_token: "",
};

interface RiskTierSettings {
  preset: "degen" | "balanced" | "conservative" | "custom";
  min_mcap: number;
  min_age_days: number;
  min_sm_traders: number;
  min_accum_score: number;
  min_sm_buyers: number;
}

interface Settings {
  trailing_stop_pct: number;
  take_profit_tiers: number[];
  max_position_pct: number;
  min_convergence_wallets: number;
  scan_interval_minutes: number;
  mode: string;
  risk_tier: RiskTierSettings;
}

const MODES = [
  { key: "live", label: "Live trading", desc: "Trades execute automatically with real funds." },
  { key: "approval", label: "Approval mode", desc: "Trades queued for manual approval before execution." },
  { key: "dry_run", label: "Dry run", desc: "Trades simulated — no real funds used." },
];

const TIER_PRESETS: Record<string, Omit<RiskTierSettings, "preset">> = {
  degen: { min_mcap: 10_000, min_age_days: 0, min_sm_traders: 0, min_accum_score: 0, min_sm_buyers: 0 },
  balanced: { min_mcap: 1_000_000, min_age_days: 7, min_sm_traders: 3, min_accum_score: 40, min_sm_buyers: 0 },
  conservative: { min_mcap: 10_000_000, min_age_days: 30, min_sm_traders: 5, min_accum_score: 60, min_sm_buyers: 3 },
};

const TIERS = [
  { key: "degen" as const, label: "Degen", desc: "Minimal filters. New launches, any mcap." },
  { key: "balanced" as const, label: "Balanced", desc: "Age 7d+, mcap $1M+, 3+ SM traders." },
  { key: "conservative" as const, label: "Conservative", desc: "Age 30d+, mcap $10M+, 5+ SM." },
  { key: "custom" as const, label: "Custom", desc: "Set your own thresholds below." },
];

// Coming soon: save multiple named custom tiers
const CUSTOM_TIERS_COMING_SOON = true;

const DEFAULT_SETTINGS: Settings = {
  trailing_stop_pct: 0.15,
  take_profit_tiers: [0.5, 1.0, 2.0],
  max_position_pct: 0.1,
  min_convergence_wallets: 3,
  scan_interval_minutes: 360, // 6 hours
  mode: "dry_run",
  risk_tier: { preset: "balanced", ...TIER_PRESETS.balanced },
};

export default function SettingsPage() {
  const [, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [localSettings, setLocalSettings] = useState<Settings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [alertSettings, setAlertSettings] = useState<AlertSettings>(DEFAULT_ALERT_SETTINGS);
  const [savingAlerts, setSavingAlerts] = useState(false);
  const [watchlistInput, setWatchlistInput] = useState("");

  useEffect(() => {
    loadSettings();
    loadAlertSettings();
  }, []);

  async function loadSettings() {
    try {
      const data = await apiFetch<Settings>("/api/settings");
      setSettings(data);
      setLocalSettings(data);
    } catch {
      setError("Could not load settings from API — showing defaults. Save to push to backend.");
      setLocalSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }

  async function loadAlertSettings() {
    try {
      const data = await apiFetch<AlertSettings>("/api/alerts/settings");
      setAlertSettings({ ...DEFAULT_ALERT_SETTINGS, ...data });
    } catch {
      // Silent — use defaults
    }
  }

  async function saveAlertSettings() {
    setSavingAlerts(true);
    try {
      await apiPost<{ success: boolean }>("/api/alerts/settings", alertSettings);
      toast.success("Alert settings saved");
    } catch (e) {
      toast.error("Failed to save alert settings", { description: e instanceof Error ? e.message : String(e) });
    } finally {
      setSavingAlerts(false);
    }
  }

  function addToWatchlist() {
    const addr = watchlistInput.trim().toLowerCase();
    if (!addr || alertSettings.alert_watchlist.includes(addr)) return;
    setAlertSettings(prev => ({
      ...prev,
      alert_watchlist: [...prev.alert_watchlist, addr],
    }));
    setWatchlistInput("");
  }

  function removeFromWatchlist(addr: string) {
    setAlertSettings(prev => ({
      ...prev,
      alert_watchlist: prev.alert_watchlist.filter(a => a !== addr),
    }));
  }

  function toggleAlertType(type: string) {
    setAlertSettings(prev => ({
      ...prev,
      alert_types_enabled: prev.alert_types_enabled.includes(type)
        ? prev.alert_types_enabled.filter(t => t !== type)
        : [...prev.alert_types_enabled, type],
    }));
  }

  async function saveSettings() {
    if (!localSettings) return;
    setSaving(true);
    try {
      const result = await apiPost<{ success: boolean }>("/api/settings", localSettings);
      if (result.success) {
        setSettings(localSettings);
        toast.success("Settings saved", { description: "Next scan cycle will use new values" });
      } else {
        toast.error("Save failed");
      }
    } catch (e) {
      toast.error("Save failed", { description: e instanceof Error ? e.message : String(e) });
    } finally {
      setSaving(false);
    }
  }

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    if (!localSettings) return;
    setLocalSettings({ ...localSettings, [key]: value });
  }

  if (loading) {
    return (
      <div className="glass-bg min-h-screen flex flex-col items-center justify-center">
        <div className="h-10 w-10 border-2 border-foreground/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-sm text-foreground/60">Loading settings...</p>
      </div>
    );
  }
  if (!localSettings) return null;

  return (
    <div className="glass-bg min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        {/* ── Header ── */}
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-foreground tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {READONLY_MODE ? "View-only on public deployment — edits disabled" : "Changes apply on next scan cycle"}
            </p>
          </div>
          {READONLY_MODE && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/60 bg-accent/25 px-2.5 py-1 text-[11px] font-semibold text-foreground">
              <Lock className="h-3 w-3" />
              View only
            </span>
          )}
        </div>

        {error && (
          <div className="glass-card border-accent/40 bg-accent/10 px-4 py-3 text-sm text-foreground flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* ── Trading Mode ── */}
        <Section title="Trading mode" description="Controls how AION executes trades.">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {MODES.map((mode) => {
              const active = localSettings.mode === mode.key;
              return (
                <button
                  key={mode.key}
                  onClick={() => update("mode", mode.key)}
                  disabled={READONLY_MODE}
                  className={cn(
                    "relative px-4 py-3.5 rounded-xl text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                    // Match the risk-tier active style so both selections use
                    // the same secondary-tinted look.
                    active
                      ? "bg-secondary/60 border-2 border-foreground ring-2 ring-secondary/40 ring-offset-2 ring-offset-background shadow-[0_8px_24px_-8px_hsl(var(--secondary)/0.55)]"
                      : "bg-foreground/[0.05] border border-foreground/15 hover:bg-foreground/[0.1] hover:border-foreground/25"
                  )}
                >
                  {active && (
                    <span className="absolute top-2 right-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-foreground text-background">
                      <Check className="h-3 w-3" strokeWidth={4} />
                    </span>
                  )}
                  <div className={cn("font-bold text-xs mb-0.5 uppercase tracking-wider pr-6", active ? "text-foreground" : "text-foreground/80")}>
                    {mode.label}
                  </div>
                  <div className={cn("text-[11px] leading-tight", active ? "text-foreground/75 font-medium" : "text-foreground/55")}>{mode.desc}</div>
                </button>
              );
            })}
          </div>
        </Section>

        {/* ── Risk Tier ── */}
        <Section
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Risk tier"
          description="Controls which tokens pass the discovery filter."
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
            {TIERS.map((tier) => {
              const active = localSettings.risk_tier?.preset === tier.key;
              return (
                <button
                  key={tier.key}
                  onClick={() => {
                    const preset = TIER_PRESETS[tier.key] || localSettings.risk_tier;
                    update("risk_tier", { ...preset, preset: tier.key } as RiskTierSettings);
                  }}
                  disabled={READONLY_MODE}
                  className={cn(
                    "relative px-3 py-3 rounded-xl text-left transition-all disabled:opacity-50",
                    active
                      ? "bg-secondary/60 border-2 border-foreground ring-2 ring-secondary/40 ring-offset-2 ring-offset-background shadow-[0_8px_24px_-8px_hsl(var(--secondary)/0.55)]"
                      : "bg-foreground/[0.05] border border-foreground/15 hover:bg-foreground/[0.1] hover:border-foreground/25"
                  )}
                >
                  {active && (
                    <span className="absolute top-1.5 right-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-foreground text-background">
                      <Check className="h-2.5 w-2.5" strokeWidth={4} />
                    </span>
                  )}
                  <div className={cn("font-bold text-xs mb-0.5 uppercase tracking-wider pr-5", active ? "text-foreground" : "text-foreground/80")}>
                    {tier.label}
                  </div>
                  <div className={cn("text-[10px] leading-tight", active ? "text-foreground/75 font-medium" : "text-foreground/55")}>{tier.desc}</div>
                </button>
              );
            })}
          </div>

          <div
            className={cn(
              "rounded-xl border p-4 transition-colors",
              localSettings.risk_tier?.preset === "custom"
                ? "border-primary/40 bg-primary/[0.08]"
                : "border-foreground/15 bg-foreground/[0.04]"
            )}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold text-foreground/60 uppercase tracking-[0.08em]">
                Filter parameters
              </span>
              {localSettings.risk_tier?.preset !== "custom" && (
                <span className="text-[10px] text-foreground/45">
                  switch to Custom to edit
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { key: "min_mcap" as const, label: "Min market cap", prefix: "$", step: 10000, min: 0, max: 100_000_000 },
                { key: "min_age_days" as const, label: "Min token age", suffix: "days", step: 1, min: 0, max: 90 },
                { key: "min_sm_traders" as const, label: "Min SM traders", step: 1, min: 0, max: 20 },
                { key: "min_accum_score" as const, label: "Min accum score", step: 5, min: 0, max: 100 },
                { key: "min_sm_buyers" as const, label: "Min SM buyers", step: 1, min: 0, max: 10 },
              ].map((param) => {
                const editable = localSettings.risk_tier?.preset === "custom" && !READONLY_MODE;
                const raw = localSettings.risk_tier?.[param.key] ?? 0;
                // Format the read-only display so it's still legible in dark
                // mode (the shadcn Input's disabled state washes the value
                // almost to invisible). When the preset is locked we render
                // a static chip instead of a disabled <input>.
                const display =
                  param.key === "min_mcap"
                    ? raw >= 1_000_000
                      ? `${(raw / 1_000_000).toFixed(raw % 1_000_000 === 0 ? 0 : 1)}M`
                      : raw >= 1_000
                        ? `${(raw / 1_000).toFixed(0)}K`
                        : String(raw)
                    : String(raw);
                return (
                  <div key={param.key}>
                    <label className="text-[10px] text-foreground/60 font-semibold block mb-1.5">
                      {param.label}
                    </label>
                    <div className="flex items-center gap-1.5">
                      {param.prefix && <span className="text-xs font-bold text-foreground/75">{param.prefix}</span>}
                      {editable ? (
                        <Input
                          type="number"
                          min={param.min}
                          max={param.max}
                          step={param.step}
                          value={raw}
                          onChange={(e) => {
                            const rt = { ...(localSettings.risk_tier || DEFAULT_SETTINGS.risk_tier) };
                            rt[param.key] = Number(e.target.value);
                            rt.preset = "custom";
                            update("risk_tier", rt);
                          }}
                          className="h-7 text-xs font-mono"
                        />
                      ) : (
                        <div
                          className="h-7 flex-1 rounded-lg border border-foreground/15 bg-foreground/[0.06] px-2.5 flex items-center text-xs font-mono font-semibold text-foreground tabular-nums"
                          aria-label={`${param.label} (locked)`}
                          title="Switch tier to Custom to edit"
                        >
                          {display}
                        </div>
                      )}
                      {param.suffix && <span className="text-xs text-foreground/60">{param.suffix}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coming soon: multiple custom tiers */}
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-foreground/15 bg-foreground/[0.02] px-4 py-3">
            <span className="inline-flex items-center rounded-full bg-primary/20 border border-primary/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
              Coming Soon
            </span>
            <span className="text-[11px] text-foreground/60">
              Save multiple named custom tiers — switch between your own presets instantly.
            </span>
          </div>
        </Section>

        {/* ── Position Sizing ── */}
        <Section icon={<Sliders className="h-4 w-4" />} title="Position sizing">
          <SliderRow
            label="Max position size"
            value={localSettings.max_position_pct * 100}
            min={1}
            max={50}
            unit="%"
            footer="of portfolio"
            onChange={(v) => update("max_position_pct", v / 100)}
            disabled={READONLY_MODE}
          />
        </Section>

        {/* ── Exit Strategy ── */}
        <Section icon={<Target className="h-4 w-4" />} title="Exit strategy">
          <div className="space-y-6">
            <SliderRow
              label="Trailing stop"
              value={localSettings.trailing_stop_pct * 100}
              min={5}
              max={50}
              unit="%"
              footer="exit from peak after entry"
              onChange={(v) => update("trailing_stop_pct", v / 100)}
              disabled={READONLY_MODE}
            />
            <div>
              <div className="flex items-center gap-2 mb-3">
                <label className="text-xs text-foreground font-medium">Take-profit tiers</label>
                <span className="text-[10px] text-muted-foreground">exit 33% at each tier</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {localSettings.take_profit_tiers.map((tier, i) => (
                  <div key={i} className="flex items-center gap-1.5 rounded-xl border border-foreground/15 bg-foreground/[0.05] px-2.5 py-1.5">
                    <span className="text-[10px] text-foreground/60 font-bold">T{i + 1}</span>
                    <Input
                      type="number"
                      min={10}
                      max={500}
                      value={tier * 100}
                      disabled={READONLY_MODE}
                      onChange={(e) => {
                        const newTiers = [...localSettings.take_profit_tiers];
                        newTiers[i] = Number(e.target.value) / 100;
                        update("take_profit_tiers", newTiers);
                      }}
                      className="h-6 w-14 text-xs font-mono text-center px-1"
                    />
                    <span className="text-[10px] text-foreground/60">%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ── Scanning ── */}
        <Section icon={<Search className="h-4 w-4" />} title="Scanning">
          <div className="space-y-6">
            <SliderRow
              label="Min convergence wallets"
              value={localSettings.min_convergence_wallets}
              min={1}
              max={10}
              unit=""
              footer="wallets needed for signal"
              onChange={(v) => update("min_convergence_wallets", v)}
              disabled={READONLY_MODE}
            />
            <SliderRow
              label="Scan interval"
              value={localSettings.scan_interval_minutes}
              min={60}
              max={720}
              step={30}
              unit=" min"
              footer="time between scans (default 6h)"
              onChange={(v) => update("scan_interval_minutes", v)}
              disabled={READONLY_MODE}
            />
          </div>
        </Section>

        {/* ── Smart Money Alerts ── */}
        <Section icon={<Bell className="h-4 w-4" />} title="Smart money alerts" description="Get notified when proven wallets make moves. Works for both crypto and Polymarket.">
          {/* Master toggle */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-foreground/15 bg-foreground/[0.03]">
              <div className="flex items-center gap-3">
                <Power className="h-4 w-4 text-foreground/60" />
                <div>
                  <div className="text-xs font-semibold text-foreground">Enable alerts</div>
                  <div className="text-[10px] text-muted-foreground">Master switch — disables all alerts when off</div>
                </div>
              </div>
              <button
                onClick={() => setAlertSettings(prev => ({ ...prev, alerts_enabled: !prev.alerts_enabled }))}
                disabled={READONLY_MODE}
                className={cn(
                  "relative h-6 w-11 rounded-full transition-all duration-200 disabled:opacity-50",
                  alertSettings.alerts_enabled
                    ? "bg-primary"
                    : "bg-foreground/20"
                )}
              >
                <span className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200",
                  alertSettings.alerts_enabled ? "left-[22px]" : "left-0.5"
                )} />
              </button>
            </div>

            {/* Quick actions: enable all / disable all types */}
            <div className={cn("transition-opacity", !alertSettings.alerts_enabled && "opacity-40 pointer-events-none")}>
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setAlertSettings(prev => ({ ...prev, alert_types_enabled: ALERT_TYPES.map(t => t.key) }))}
                  disabled={READONLY_MODE}
                  className="text-[10px] font-semibold text-primary hover:text-primary/80 transition disabled:opacity-50"
                >
                  Enable all types
                </button>
                <span className="text-foreground/20">|</span>
                <button
                  onClick={() => setAlertSettings(prev => ({ ...prev, alert_types_enabled: [] }))}
                  disabled={READONLY_MODE}
                  className="text-[10px] font-semibold text-muted-foreground hover:text-foreground/60 transition disabled:opacity-50"
                >
                  Disable all types
                </button>
              </div>
            </div>

            <div className={cn("space-y-6 transition-opacity", !alertSettings.alerts_enabled && "opacity-40 pointer-events-none")}>
            <SliderRow
              label="Min win rate for alerts"
              value={Math.round(alertSettings.alert_min_win_rate * 100)}
              min={30}
              max={95}
              step={5}
              unit="%"
              footer="only alert on wallets with this win rate or higher"
              onChange={(v) => setAlertSettings(prev => ({ ...prev, alert_min_win_rate: v / 100 }))}
              disabled={READONLY_MODE}
            />

            {/* Min grade */}
            <div>
              <label className="text-xs text-foreground/80 font-semibold mb-2.5 block">Minimum wallet grade</label>
              <div className="flex gap-2">
                {["S", "A", "B", "C", "D"].map((g) => {
                  const active = alertSettings.alert_min_grade === g;
                  return (
                    <button
                      key={g}
                      onClick={() => setAlertSettings(prev => ({ ...prev, alert_min_grade: g }))}
                      disabled={READONLY_MODE}
                      className={cn(
                        "h-9 w-9 rounded-lg text-sm font-bold transition-all disabled:opacity-50",
                        active
                          ? "bg-primary text-primary-foreground ring-2 ring-primary/40 ring-offset-2 ring-offset-background"
                          : "bg-foreground/[0.05] border border-foreground/15 text-foreground/70 hover:bg-foreground/[0.1]"
                      )}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5">Alerts fire for this grade and above (e.g. B = B, A, S)</p>
            </div>

            {/* Alert types */}
            <div>
              <label className="text-xs text-foreground/80 font-semibold mb-2.5 block">Alert types</label>
              <div className="space-y-1.5">
                {ALERT_TYPES.map((type) => {
                  const enabled = alertSettings.alert_types_enabled.includes(type.key);
                  return (
                    <button
                      key={type.key}
                      onClick={() => toggleAlertType(type.key)}
                      disabled={READONLY_MODE}
                      className={cn(
                        "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all disabled:opacity-50",
                        enabled
                          ? "bg-primary/10 border border-primary/30"
                          : "bg-foreground/[0.03] border border-foreground/10 opacity-60"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={cn(
                          "h-5 w-5 rounded-md flex items-center justify-center transition-all",
                          enabled ? "bg-primary text-primary-foreground" : "bg-foreground/10 text-foreground/30"
                        )}>
                          {enabled && <Check className="h-3 w-3" strokeWidth={3} />}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-foreground">{type.label}</div>
                          <div className="text-[10px] text-muted-foreground">{type.desc}</div>
                        </div>
                      </div>
                      {type.key === "CONTRARIAN_EDGE" && <Waves className="h-3.5 w-3.5 text-muted-foreground" />}
                      {type.key === "EARLY_MOVER" && <Eye className="h-3.5 w-3.5 text-muted-foreground" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Wallet watchlist */}
            <div>
              <label className="text-xs text-foreground/80 font-semibold mb-2.5 block">
                Wallet watchlist
                <span className="text-[10px] text-muted-foreground font-normal ml-2">
                  Always alert on these wallets, regardless of grade/win rate
                </span>
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  type="text"
                  placeholder="0x... wallet address"
                  value={watchlistInput}
                  onChange={(e) => setWatchlistInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addToWatchlist()}
                  disabled={READONLY_MODE}
                  className="h-8 text-xs font-mono flex-1"
                />
                <Button
                  onClick={addToWatchlist}
                  disabled={READONLY_MODE || !watchlistInput.trim()}
                  size="sm"
                  variant="outline"
                  className="h-8 px-3"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              {alertSettings.alert_watchlist.length > 0 && (
                <div className="space-y-1">
                  {alertSettings.alert_watchlist.map((addr) => (
                    <div key={addr} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-foreground/[0.03] border border-foreground/10">
                      <span className="text-[11px] font-mono text-foreground/80">{addr.slice(0, 14)}...{addr.slice(-6)}</span>
                      <button
                        onClick={() => removeFromWatchlist(addr)}
                        disabled={READONLY_MODE}
                        className="text-foreground/40 hover:text-destructive transition"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            </div>{/* end opacity wrapper */}

            {!READONLY_MODE && (
              <Button onClick={saveAlertSettings} disabled={savingAlerts} size="sm" variant="outline">
                {savingAlerts ? (
                  <>
                    <span className="h-3 w-3 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Bell className="h-3 w-3" />
                    Save alert settings
                  </>
                )}
              </Button>
            )}
          </div>
        </Section>

        {!READONLY_MODE && (
          <div className="flex items-center gap-3 pt-2">
            <Button onClick={saveSettings} disabled={saving} size="lg">
              {saving ? (
                <>
                  <span className="h-3 w-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Save settings
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Helpers ──

function Section({
  icon,
  title,
  description,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass-card p-6">
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-foreground/60">{icon}</span>}
        <h2 className="text-sm font-bold text-foreground tracking-tight">{title}</h2>
      </div>
      {description && <p className="text-xs text-foreground/60 mb-5">{description}</p>}
      {!description && <div className="mb-5" />}
      {children}
    </section>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  footer,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  footer?: string;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2.5">
        <label className="text-xs text-foreground/80 font-semibold">{label}</label>
        <span className="inline-flex items-center rounded-md bg-foreground/[0.06] border border-foreground/15 px-2 py-0.5 text-sm font-bold text-foreground font-mono tabular-nums">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full disabled:opacity-50"
      />
      <div className="flex justify-between text-[10px] text-muted-foreground/70 mt-1.5">
        <span>{min}{unit}</span>
        {footer && <span>{footer}</span>}
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}
