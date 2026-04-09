"use client";

import { useEffect, useState } from "react";
import { apiFetch, apiPost, READONLY_MODE } from "@/lib/api";
import { fmtUsd, truncAddr, cn } from "@/lib/utils";
import StatCard from "@/components/StatCard";
import GradeBadge from "@/components/GradeBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/components/ConfirmDialog";
import { toast } from "sonner";
import {
  Briefcase,
  Wallet,
  TrendingUp,
  Lock,
  ExternalLink,
  Pencil,
  X as XIcon,
  AlertTriangle,
} from "lucide-react";

interface OpenPosition {
  id: string;
  token: string;
  symbol?: string;
  chain: string;
  side: string;
  entry_price: number;
  size_usdc: number;
  current_price?: number;
  pnl_usd?: number | null;
  pnl_pct?: number | null;
  change_24h?: number | null;
  current_mcap?: number | null;
  stop_loss_pct?: number | null;
  take_profit_pct?: number | null;
  timestamp: string;
  trailing_stop_triggered?: boolean;
  stop_reason?: string;
  tx_hash?: string;
  status: string;
  dry_run?: boolean;
  grade?: string;
  accum_score?: number;
  recommended?: boolean;
}

interface PositionsResponse {
  positions: OpenPosition[];
  count: number;
}

export default function PositionsPage() {
  const [positions, setPositions] = useState<OpenPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [editingTargets, setEditingTargets] = useState<string | null>(null);
  const [tempSL, setTempSL] = useState<string>("");
  const [tempTP, setTempTP] = useState<string>("");
  const [savingTargets, setSavingTargets] = useState(false);
  const confirm = useConfirm();

  useEffect(() => {
    loadPositions();
    const interval = setInterval(loadPositions, 10000);
    return () => clearInterval(interval);
  }, []);

  async function loadPositions() {
    try {
      const data = await apiFetch<PositionsResponse>("/api/positions");
      setPositions(data.positions || []);
      setLastUpdate(new Date());
    } catch {
      /* keep state */
    } finally {
      setLoading(false);
    }
  }

  async function saveTargets(token: string) {
    setSavingTargets(true);
    try {
      const sl = tempSL === "" ? null : Number(tempSL);
      const tp = tempTP === "" ? null : Number(tempTP);
      const result = await apiPost<{ success: boolean; error?: string }>(`/api/positions/${token}/targets`, {
        stop_loss_pct: sl,
        take_profit_pct: tp,
      });
      if (result.success) {
        setPositions((prev) => prev.map((p) =>
          p.token === token ? { ...p, stop_loss_pct: sl, take_profit_pct: tp } : p
        ));
        setEditingTargets(null);
        toast.success("Targets updated", {
          description: `Stop loss ${sl ?? "—"}% · Take profit +${tp ?? "—"}%`,
        });
      } else {
        toast.error("Save failed", { description: result.error });
      }
    } catch (e) {
      toast.error("Save failed", { description: e instanceof Error ? e.message : String(e) });
    } finally {
      setSavingTargets(false);
    }
  }

  function startEditTargets(pos: OpenPosition) {
    setEditingTargets(pos.token);
    setTempSL(pos.stop_loss_pct != null ? String(pos.stop_loss_pct) : "");
    setTempTP(pos.take_profit_pct != null ? String(pos.take_profit_pct) : "");
  }

  async function closePosition(pos: OpenPosition, reason: string) {
    const ok = await confirm({
      title: `Close ${pos.symbol || truncAddr(pos.token, 4)}?`,
      description: (
        <span>
          This will exit your <span className="text-foreground font-semibold">{fmtUsd(pos.size_usdc)}</span> position
          {pos.pnl_pct != null && (
            <>
              {" at "}
              <span className={cn("font-semibold", pos.pnl_pct >= 0 ? "text-profit" : "text-loss")}>
                {pos.pnl_pct >= 0 ? "+" : ""}{pos.pnl_pct.toFixed(2)}%
              </span>
            </>
          )}
          . Reason: <span className="text-foreground font-semibold">{reason}</span>
        </span>
      ),
      confirmLabel: "Close position",
      variant: "destructive",
    });
    if (!ok) return;

    setClosing(pos.token);
    try {
      const result = await apiPost<{ success: boolean; error?: string }>(`/api/positions/${pos.token}/close`, { reason });
      if (result.success) {
        setPositions((prev) => prev.filter((p) => p.token !== pos.token));
        toast.success("Position closed", { description: pos.symbol || truncAddr(pos.token) });
      } else {
        toast.error("Close failed", { description: result.error });
      }
    } catch (e) {
      toast.error("Close failed", { description: e instanceof Error ? e.message : String(e) });
    } finally {
      setClosing(null);
    }
  }

  const totalPnl = positions.reduce((s, p) => s + (p.pnl_usd || 0), 0);
  const totalValue = positions.reduce((s, p) => s + (p.size_usdc || 0), 0);
  const totalPnlPct = totalValue > 0 ? (totalPnl / totalValue) * 100 : 0;

  if (loading) {
    return (
      <div className="glass-bg min-h-screen flex flex-col items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-foreground/20 border-t-primary animate-spin mb-4" />
        <p className="text-sm text-foreground/60">Loading positions...</p>
      </div>
    );
  }

  return (
    <div className="glass-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* ── Header ── */}
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Positions</h1>
            <p className="text-sm text-foreground/60 mt-1">
              Auto-refresh 10s · Updated {lastUpdate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {READONLY_MODE && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/40 border border-accent/60 px-2.5 py-1 text-[11px] font-semibold text-foreground">
                <Lock className="h-3 w-3" />
                View only
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 border border-primary/40 px-2.5 py-1 text-[11px] font-semibold text-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" />
              Live
            </span>
          </div>
        </div>

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
label="Open positions"
            value={String(positions.length)}
            icon={<Briefcase className="h-4 w-4" />}
            tone="white"
          />
          <StatCard
label="Total invested"
            value={fmtUsd(totalValue)}
            icon={<Wallet className="h-4 w-4" />}
            tone="pink"
          />
          <StatCard
label="Unrealized P&L"
            value={totalPnl >= 0 ? `+${fmtUsd(totalPnl)}` : fmtUsd(totalPnl)}
            change={Number(totalPnlPct.toFixed(2))}
            accent={totalPnl >= 0}
            icon={<TrendingUp className="h-4 w-4" />}
            tone={totalPnl >= 0 ? "lime" : "red"}
          />
        </div>

        {/* ── Empty State ── */}
        {positions.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/40 border border-accent/60">
              <Briefcase className="h-6 w-6 text-foreground/70" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No open positions</h3>
            <p className="text-sm text-foreground/60 mb-1">Discovery signals will appear here when Oracle finds convergence.</p>
            <p className="text-xs text-foreground/50">
              Run <span className="inline-block bg-primary/20 border border-primary/40 rounded px-1.5 py-0.5 font-mono text-foreground">/discover</span> on Telegram to start.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {positions.map((pos) => (
              <PositionCard
                key={pos.id}
                pos={pos}
                isEditing={editingTargets === pos.token}
                tempSL={tempSL}
                tempTP={tempTP}
                onTempSL={setTempSL}
                onTempTP={setTempTP}
                onStartEdit={() => startEditTargets(pos)}
                onSave={() => saveTargets(pos.token)}
                onCancel={() => setEditingTargets(null)}
                onClose={(reason) => closePosition(pos, reason)}
                saving={savingTargets}
                closing={closing === pos.token}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// Position Card
// ════════════════════════════════════════════════════════════════

interface CardProps {
  pos: OpenPosition;
  isEditing: boolean;
  tempSL: string;
  tempTP: string;
  onTempSL: (v: string) => void;
  onTempTP: (v: string) => void;
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onClose: (reason: string) => void;
  saving: boolean;
  closing: boolean;
}

function PositionCard({ pos, isEditing, tempSL, tempTP, onTempSL, onTempTP, onStartEdit, onSave, onCancel, onClose, saving, closing }: CardProps) {
  const pnlPct = pos.pnl_pct ?? null;
  const pnlUsd = pos.pnl_usd ?? null;
  const hasPnl = pnlPct !== null && !isNaN(pnlPct);
  const isProfit = hasPnl && pnlPct! >= 0;
  const sl = pos.stop_loss_pct ?? -25;
  const tp = pos.take_profit_pct ?? 50;
  const range = tp - sl;
  const pct = hasPnl ? pnlPct! : 0;
  const barPos = range > 0 ? Math.max(0, Math.min(100, ((pct - sl) / range) * 100)) : 50;
  const zeroPos = range > 0 ? Math.max(0, Math.min(100, ((0 - sl) / range) * 100)) : 50;

  return (
    <div className="glass-card p-6">
      {pos.trailing_stop_triggered && (
        <div className="flex items-center gap-2 mb-5 text-xs font-semibold rounded-xl bg-destructive/15 border border-destructive/40 text-foreground px-3 py-2">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
          {pos.stop_reason || "Target triggered"}
        </div>
      )}

      {/* ── Top Row: Token + P/L ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://dd.dexscreener.com/ds-data/tokens/solana/${pos.token}.png`}
              alt=""
              className="h-10 w-10 rounded-xl bg-foreground/5 flex-shrink-0 border border-foreground/10"
              onError={(e) => { (e.target as HTMLImageElement).style.visibility = "hidden"; }}
            />
            <span className="font-bold text-foreground text-xl tracking-tight">
              {pos.symbol || truncAddr(pos.token, 6)}
            </span>
            {pos.grade && <GradeBadge grade={pos.grade} size="md" />}
            {pos.accum_score != null && (
              <span className="inline-flex items-center rounded-full bg-foreground/5 border border-foreground/15 px-2 py-0.5 text-[10px] font-semibold font-mono text-foreground/70">
                score {pos.accum_score}
              </span>
            )}
            {pos.dry_run && (
              <span className="inline-flex items-center rounded-full bg-accent/40 border border-accent/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground">
                DRY RUN
              </span>
            )}
          </div>
          <div className="flex items-center gap-x-4 gap-y-1 text-xs text-foreground/60 flex-wrap">
            <PriceField label="Entry" value={pos.entry_price} />
            <PriceField label="Now" value={pos.current_price} />
            <span>
              Size <span className="text-foreground font-mono font-semibold">{fmtUsd(pos.size_usdc)}</span>
            </span>
            {pos.change_24h != null && (
              <span>
                24h{" "}
                <span className={cn("font-mono font-semibold", pos.change_24h >= 0 ? "text-profit" : "text-loss")}>
                  {pos.change_24h >= 0 ? "+" : ""}{pos.change_24h.toFixed(2)}%
                </span>
              </span>
            )}
            <a
              href={`https://dexscreener.com/solana/${pos.token}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-foreground/5 border border-foreground/15 px-2 py-0.5 text-[10px] font-semibold text-foreground hover:bg-foreground/10 transition-colors"
            >
              Chart
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>

        {/* Big P&L */}
        <div
          className={cn(
            "flex-shrink-0 rounded-2xl px-5 py-3 text-right border backdrop-blur-md",
            hasPnl
              ? isProfit
                ? "bg-primary/20 border-primary/40 shadow-[0_4px_16px_-4px_hsl(var(--primary)/0.35)]"
                : "bg-destructive/20 border-destructive/40 shadow-[0_4px_16px_-4px_hsl(var(--destructive)/0.35)]"
              : "bg-foreground/5 border-foreground/15"
          )}
        >
          <div
            className={cn(
              "text-3xl font-bold font-mono tracking-tight tabular-nums leading-none",
              hasPnl ? (isProfit ? "text-profit" : "text-loss") : "text-foreground/50"
            )}
          >
            {hasPnl ? `${isProfit ? "+" : ""}${pnlPct!.toFixed(2)}%` : "—"}
          </div>
          <div
            className={cn(
              "text-sm font-mono font-semibold mt-1 tabular-nums",
              hasPnl ? (isProfit ? "text-profit/80" : "text-loss/80") : "text-foreground/40"
            )}
          >
            {hasPnl ? `${isProfit ? "+" : ""}${fmtUsd(pnlUsd!)}` : "—"}
          </div>
        </div>
      </div>

      {/* ── Progress Bar ── */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-[10px] font-semibold mb-2">
          <span className="text-loss">SL {sl}%</span>
          <span className="text-foreground/50">Entry 0%</span>
          <span className="text-profit">TP +{tp}%</span>
        </div>
        <div className="relative h-2 rounded-full bg-foreground/8 overflow-hidden border border-foreground/15">
          <div
            className="absolute top-0 bottom-0 bg-loss/30"
            style={{ left: 0, width: `${zeroPos}%` }}
          />
          <div
            className="absolute top-0 bottom-0 bg-profit/30"
            style={{ left: `${zeroPos}%`, width: `${100 - zeroPos}%` }}
          />
          <div
            className="absolute top-0 bottom-0 w-px bg-foreground/40"
            style={{ left: `${zeroPos}%` }}
          />
          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full border-2 border-foreground/30 shadow-md",
              isProfit ? "bg-profit" : hasPnl ? "bg-loss" : "bg-foreground/40"
            )}
            style={{ left: `calc(${barPos}% - 7px)` }}
          />
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-foreground/10 flex-wrap">
        {isEditing && !READONLY_MODE ? (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-foreground font-semibold uppercase tracking-wider rounded-md bg-loss/15 border border-loss/40 px-1.5 py-0.5">SL</span>
              <Input
                type="number"
                value={tempSL}
                onChange={(e) => onTempSL(e.target.value)}
                className="h-8 w-20 text-xs font-mono text-right rounded-lg border-foreground/15"
                placeholder="-25"
              />
              <span className="text-[10px] text-foreground/60">%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-foreground font-semibold uppercase tracking-wider rounded-md bg-profit/15 border border-profit/40 px-1.5 py-0.5">TP</span>
              <Input
                type="number"
                value={tempTP}
                onChange={(e) => onTempTP(e.target.value)}
                className="h-8 w-20 text-xs font-mono text-right rounded-lg border-foreground/15"
                placeholder="50"
              />
              <span className="text-[10px] text-foreground/60">%</span>
            </div>
            <Button size="sm" onClick={onSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-loss/15 border border-loss/40 px-2.5 py-1">
              <span className="text-[10px] text-foreground/70 font-semibold uppercase tracking-wider">SL</span>
              <span className="text-xs font-mono font-semibold text-foreground tabular-nums">{sl}%</span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-profit/15 border border-profit/40 px-2.5 py-1">
              <span className="text-[10px] text-foreground/70 font-semibold uppercase tracking-wider">TP</span>
              <span className="text-xs font-mono font-semibold text-foreground tabular-nums">+{tp}%</span>
            </div>
            {!READONLY_MODE && (
              <Button size="xs" variant="ghost" onClick={onStartEdit} className="gap-1">
                <Pencil className="h-3 w-3" />
                Edit
              </Button>
            )}
          </div>
        )}

        {!READONLY_MODE && (
          <div className="flex items-center gap-2 ml-auto">
            <Button size="sm" variant="outline" onClick={() => onClose("manual")} disabled={closing}>
              {closing ? "Closing..." : (
                <>
                  <XIcon className="h-3 w-3" />
                  Close
                </>
              )}
            </Button>
            {pos.trailing_stop_triggered && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onClose(pos.stop_reason || "target_hit")}
              >
                Exit Now
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Helpers ──

function PriceField({ label, value }: { label: string; value: number | undefined }) {
  return (
    <span>
      {label}{" "}
      <span className="text-foreground font-mono font-semibold tabular-nums">
        {value && value > 0 ? `$${value.toFixed(value > 1 ? 4 : 8)}` : "—"}
      </span>
    </span>
  );
}
