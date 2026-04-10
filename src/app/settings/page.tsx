"use client";

import { useEffect, useState } from "react";
import { apiFetch, apiPost, READONLY_MODE } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Lock, Save, AlertTriangle, Sliders, Target, Search, Check } from "lucide-react";

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

  useEffect(() => {
    loadSettings();
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
