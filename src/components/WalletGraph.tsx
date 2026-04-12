"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GraphNode, GraphEdge } from "@/lib/api";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const GRADE_COLORS: Record<string, string> = {
  S: "#fbbf24",
  A: "#34d399",
  B: "#facc15",
  C: "#fb923c",
  D: "#ef4444",
};

const GRADE_GLOW: Record<string, string> = {
  S: "rgba(251,191,36,0.45)",
  A: "rgba(52,211,153,0.35)",
  B: "rgba(250,204,21,0.30)",
  C: "rgba(251,146,60,0.30)",
  D: "rgba(239,68,68,0.30)",
};

const FALLBACK_COLOR = "#6b7280";

const MIN_R = 16;
const MAX_R = 48;

function scoreToRadius(score: number): number {
  const t = Math.max(0, Math.min(score, 100)) / 100;
  return MIN_R + t * (MAX_R - MIN_R);
}

function truncAddr(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

/* ------------------------------------------------------------------ */
/*  Simulation node type                                               */
/* ------------------------------------------------------------------ */

interface SimNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  data: GraphNode;
}

/* ------------------------------------------------------------------ */
/*  Force layout                                                       */
/* ------------------------------------------------------------------ */

function runSimulation(
  rawNodes: GraphNode[],
  edges: GraphEdge[],
  width: number,
  height: number,
): SimNode[] {
  const cx = width / 2;
  const cy = height / 2;

  // Init all nodes near center with small random offset
  const nodes: SimNode[] = rawNodes.map((n) => ({
    id: n.address,
    x: cx + (Math.random() - 0.5) * 40,
    y: cy + (Math.random() - 0.5) * 40,
    vx: 0,
    vy: 0,
    r: scoreToRadius(n.score),
    data: n,
  }));

  const idxMap = new Map<string, number>();
  nodes.forEach((n, i) => idxMap.set(n.id, i));

  const edgeIdx = edges
    .map((e) => [idxMap.get(e.from), idxMap.get(e.to)])
    .filter((pair): pair is [number, number] => pair[0] != null && pair[1] != null);

  const REPULSION = 8000;
  const SPRING_K = 0.012;
  const SPRING_REST = 100;
  const CENTER_PULL = 0.003;
  const TARGET_CENTER = 0.008;
  const DAMPING = 0.85;
  const ITERATIONS = 120;

  for (let iter = 0; iter < ITERATIONS; iter++) {
    const decay = 1 - iter / ITERATIONS; // cool down over time

    // Repulsion between all pairs
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1) dist = 1;
        const force = (REPULSION * decay) / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        nodes[i].vx -= fx;
        nodes[i].vy -= fy;
        nodes[j].vx += fx;
        nodes[j].vy += fy;
      }
    }

    // Spring attraction along edges
    for (const [a, b] of edgeIdx) {
      const dx = nodes[b].x - nodes[a].x;
      const dy = nodes[b].y - nodes[a].y;
      let dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 1) dist = 1;
      const displacement = dist - SPRING_REST;
      const force = SPRING_K * displacement * decay;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      nodes[a].vx += fx;
      nodes[a].vy += fy;
      nodes[b].vx -= fx;
      nodes[b].vy -= fy;
    }

    // Center gravity
    for (const n of nodes) {
      const pull = n.data.is_target ? TARGET_CENTER : CENTER_PULL;
      n.vx += (cx - n.x) * pull * decay;
      n.vy += (cy - n.y) * pull * decay;
    }

    // Integrate + damp
    for (const n of nodes) {
      n.vx *= DAMPING;
      n.vy *= DAMPING;
      n.x += n.vx;
      n.y += n.vy;
      // Keep in bounds (with padding)
      n.x = Math.max(n.r + 4, Math.min(width - n.r - 4, n.x));
      n.y = Math.max(n.r + 4, Math.min(height - n.r - 4, n.y));
    }
  }

  return nodes;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface WalletGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  clusters: string[];
}

export default function WalletGraph({ nodes, edges }: WalletGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const dragStartRef = useRef<{ mx: number; my: number; nx: number; ny: number } | null>(null);

  // Layout dimensions (viewBox-based)
  const W = 900;
  const H = 600;

  // Run simulation once
  const [simNodes, setSimNodes] = useState<SimNode[]>([]);

  useEffect(() => {
    if (nodes.length === 0) return;
    const result = runSimulation(nodes, edges, W, H);
    setSimNodes(result);
  }, [nodes, edges]);

  // Build lookup maps
  const nodeMap = useMemo(() => {
    const m = new Map<string, SimNode>();
    simNodes.forEach((n) => m.set(n.id, n));
    return m;
  }, [simNodes]);

  const connectedEdges = useMemo(() => {
    if (!hoveredId) return new Set<number>();
    const s = new Set<number>();
    edges.forEach((e, i) => {
      if (e.from === hoveredId || e.to === hoveredId) s.add(i);
    });
    return s;
  }, [hoveredId, edges]);

  const connectedLabels = useMemo(() => {
    if (!hoveredId) return [] as string[];
    return edges
      .filter((e) => e.from === hoveredId || e.to === hoveredId)
      .map((e) => e.label || e.relationship)
      .filter(Boolean);
  }, [hoveredId, edges]);

  // Drag handlers (convert screen coords to viewBox coords)
  const toSvg = useCallback(
    (clientX: number, clientY: number) => {
      try {
        const svg = svgRef.current;
        if (!svg) return { x: 0, y: 0 };
        const pt = svg.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        const ctm = svg.getScreenCTM();
        if (!ctm) return { x: 0, y: 0 };
        const svgPt = pt.matrixTransform(ctm.inverse());
        return { x: svgPt.x, y: svgPt.y };
      } catch {
        return { x: 0, y: 0 };
      }
    },
    [],
  );

  const onPointerDown = useCallback(
    (id: string, e: React.PointerEvent) => {
      e.preventDefault();
      // Capture on the SVG root — SVG child elements can throw on setPointerCapture
      try {
        svgRef.current?.setPointerCapture(e.pointerId);
      } catch { /* ignore — drag still works via onPointerMove on svg */ }
      const pt = toSvg(e.clientX, e.clientY);
      const node = nodeMap.get(id);
      if (!node) return;
      dragStartRef.current = { mx: pt.x, my: pt.y, nx: node.x, ny: node.y };
      setDragId(id);
    },
    [toSvg, nodeMap],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragId || !dragStartRef.current) return;
      const pt = toSvg(e.clientX, e.clientY);
      const dx = pt.x - dragStartRef.current.mx;
      const dy = pt.y - dragStartRef.current.my;
      setSimNodes((prev) =>
        prev.map((n) =>
          n.id === dragId
            ? {
                ...n,
                x: Math.max(n.r, Math.min(W - n.r, dragStartRef.current!.nx + dx)),
                y: Math.max(n.r, Math.min(H - n.r, dragStartRef.current!.ny + dy)),
              }
            : n,
        ),
      );
    },
    [dragId, toSvg],
  );

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    try {
      svgRef.current?.releasePointerCapture(e.pointerId);
    } catch { /* ignore */ }
    setDragId(null);
    dragStartRef.current = null;
  }, []);

  // Hovered node for tooltip
  const hoveredNode = hoveredId ? nodeMap.get(hoveredId) : null;

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center text-foreground/50 text-sm" style={{ minHeight: 400 }}>
        No graph data available
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ minHeight: 400 }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ minHeight: 400 }}
        className="select-none"
        onPointerMove={onPointerMove}
        onPointerUp={(e) => onPointerUp(e)}
        onPointerLeave={(e) => onPointerUp(e)}
      >
        {/* Defs: radial gradients per grade + pulse animation */}
        <defs>
          {Object.entries(GRADE_COLORS).map(([grade, color]) => (
            <radialGradient key={grade} id={`grad-${grade}`} cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
              <stop offset="40%" stopColor={color} stopOpacity="0.9" />
              <stop offset="100%" stopColor={color} stopOpacity="1" />
            </radialGradient>
          ))}
          <radialGradient id="grad-fallback" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
            <stop offset="100%" stopColor={FALLBACK_COLOR} stopOpacity="1" />
          </radialGradient>

          {/* Glow filters per grade */}
          {Object.entries(GRADE_GLOW).map(([grade, glowColor]) => (
            <filter key={grade} id={`glow-${grade}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
              <feFlood floodColor={glowColor} result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}

          {/* Pulse animation for target nodes */}
          <style>{`
            @keyframes pulse-ring {
              0% { opacity: 0.6; r: inherit; }
              50% { opacity: 0; }
              100% { opacity: 0.6; }
            }
            .pulse-ring { animation: pulse-ring 2s ease-in-out infinite; }
          `}</style>
        </defs>

        {/* Edges */}
        {edges.map((edge, i) => {
          const from = nodeMap.get(edge.from);
          const to = nodeMap.get(edge.to);
          if (!from || !to) return null;
          const isHighlighted = connectedEdges.has(i);
          return (
            <line
              key={`e-${i}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={isHighlighted ? "hsl(var(--foreground) / 0.35)" : "hsl(var(--foreground) / 0.12)"}
              strokeWidth={isHighlighted ? 2 : 1}
              style={{ transition: "stroke 0.2s, stroke-width 0.2s" }}
            />
          );
        })}

        {/* Nodes */}
        {simNodes.map((node) => {
          const color = GRADE_COLORS[node.data.grade] || FALLBACK_COLOR;
          const gradId = GRADE_COLORS[node.data.grade] ? `grad-${node.data.grade}` : "grad-fallback";
          const isHovered = hoveredId === node.id;
          const isTarget = node.data.is_target;

          return (
            <g
              key={node.id}
              style={{ cursor: dragId === node.id ? "grabbing" : "grab" }}
              onPointerDown={(e) => onPointerDown(node.id, e)}
              onPointerEnter={() => { if (!dragId) setHoveredId(node.id); }}
              onPointerLeave={() => { if (!dragId) setHoveredId(null); }}
            >
              {/* Target pulse ring */}
              {isTarget && (
                <>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.r + 8}
                    fill="none"
                    stroke={color}
                    strokeWidth={2}
                    opacity={0.5}
                    className="pulse-ring"
                  />
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.r + 14}
                    fill="none"
                    stroke={color}
                    strokeWidth={1}
                    opacity={0.25}
                    className="pulse-ring"
                    style={{ animationDelay: "0.5s" }}
                  />
                </>
              )}

              {/* Hover glow */}
              {isHovered && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.r + 6}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  opacity={0.6}
                />
              )}

              {/* Main bubble */}
              <circle
                cx={node.x}
                cy={node.y}
                r={node.r}
                fill={`url(#${gradId})`}
                stroke={isHovered ? "#ffffff" : color}
                strokeWidth={isHovered ? 2 : 1}
                strokeOpacity={isHovered ? 0.8 : 0.3}
                filter={isTarget ? `url(#glow-${node.data.grade})` : undefined}
                style={{ transition: "stroke 0.15s, stroke-width 0.15s" }}
              />

              {/* Grade letter inside bubble */}
              <text
                x={node.x}
                y={node.y - 2}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#ffffff"
                fontWeight="bold"
                fontSize={node.r > 24 ? 14 : 11}
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                {node.data.grade}
              </text>

              {/* Score below grade */}
              {node.r > 22 && (
                <text
                  x={node.x}
                  y={node.y + 12}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="rgba(255,255,255,0.6)"
                  fontSize={9}
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {node.data.score}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredNode && !dragId && (
        <Tooltip node={hoveredNode} connectedLabels={connectedLabels} viewW={W} viewH={H} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tooltip sub-component                                              */
/* ------------------------------------------------------------------ */

function Tooltip({
  node,
  connectedLabels,
  viewW,
  viewH,
}: {
  node: SimNode;
  connectedLabels: string[];
  viewW: number;
  viewH: number;
}) {
  // Convert viewBox coords to % position
  const leftPct = (node.x / viewW) * 100;
  const topPct = (node.y / viewH) * 100;

  const color = GRADE_COLORS[node.data.grade] || FALLBACK_COLOR;
  const label = node.data.label || truncAddr(node.data.address);
  const uniqueLabels = Array.from(new Set(connectedLabels)).slice(0, 4);

  // Position tooltip to the right of the node, or left if near right edge
  const goLeft = leftPct > 65;

  return (
    <div
      className="absolute pointer-events-none z-50"
      style={{
        left: `${leftPct}%`,
        top: `${topPct}%`,
        transform: goLeft
          ? "translate(calc(-100% - 20px), -50%)"
          : "translate(20px, -50%)",
      }}
    >
      <div
        className="rounded-xl border border-foreground/15 bg-background/95 px-4 py-3 shadow-2xl backdrop-blur-md"
        style={{
          minWidth: 180,
          maxWidth: 260,
        }}
      >
        {/* Label / address */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className="inline-flex items-center justify-center rounded-full text-xs font-bold px-2 py-0.5"
            style={{
              background: `${color}22`,
              color,
              border: `1px solid ${color}44`,
            }}
          >
            {node.data.grade}
          </span>
          <span className="text-sm font-semibold text-foreground truncate">
            {label}
          </span>
        </div>

        {/* Address */}
        {node.data.label && (
          <div className="text-xs text-foreground/50 font-mono mb-1.5">
            {truncAddr(node.data.address)}
          </div>
        )}

        {/* Score bar */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs text-foreground/60">Score</span>
          <div className="flex-1 h-1.5 rounded-full bg-foreground/10 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${node.data.score}%`,
                background: color,
              }}
            />
          </div>
          <span className="text-xs font-semibold" style={{ color }}>
            {node.data.score}
          </span>
        </div>

        {/* Depth */}
        <div className="flex items-center justify-between text-xs text-foreground/50 mb-1">
          <span>Depth</span>
          <span className="text-foreground/80">{node.data.depth}</span>
        </div>

        {/* Target badge */}
        {node.data.is_target && (
          <div className="text-xs text-amber-700 dark:text-amber-400/90 font-medium mt-1">
            Target wallet
          </div>
        )}

        {/* Connected edge labels */}
        {uniqueLabels.length > 0 && (
          <div className="mt-2 pt-2 border-t border-foreground/10">
            <div className="text-[10px] text-foreground/50 uppercase tracking-wider mb-1">
              Connections
            </div>
            {uniqueLabels.map((lbl, i) => (
              <div key={i} className="text-xs text-foreground/70 truncate">
                {lbl}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
