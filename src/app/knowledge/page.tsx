"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { API } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Search,
  Folder,
  FolderOpen,
  FileText,
  RefreshCw,
  Clock,
  Layers,
  Hash,
  ChevronRight,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface TreeNode {
  name: string;
  type: "dir" | "file";
  path: string;
  size?: number;
  children?: TreeNode[];
}

interface KnowledgeTree {
  root: TreeNode[];
  count: number;
}

interface KnowledgeStats {
  total_pages: number;
  by_type: Record<string, number>;
  last_action?: {
    timestamp?: string;
    action?: string;
    summary?: string;
  } | null;
}

interface PageResponse {
  path: string;
  content: string;
  size: number;
}

interface SearchHit {
  path: string;
  snippet: string;
  match_count: number;
}

interface SearchResponse {
  results: SearchHit[];
  query: string;
  count: number;
}

// ─────────────────────────────────────────────────────────────
// Minimal, safe markdown → React renderer
// Supports: # headings, bold, italic, inline code, code blocks,
// lists, tables, blockquotes, links, [[wiki-links]], frontmatter.
// No HTML passthrough — everything is rendered as React nodes so
// we never call dangerouslySetInnerHTML on untrusted content.
// ─────────────────────────────────────────────────────────────
function stripFrontmatter(src: string): { body: string; fm: Record<string, string> } {
  const fm: Record<string, string> = {};
  if (!src.startsWith("---")) return { body: src, fm };
  const end = src.indexOf("\n---", 3);
  if (end < 0) return { body: src, fm };
  const block = src.slice(3, end).trim();
  for (const line of block.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_]+)\s*:\s*(.*)$/);
    if (m) fm[m[1]] = m[2];
  }
  return { body: src.slice(end + 4).replace(/^\r?\n/, ""), fm };
}

function renderInline(text: string, keyPrefix: string, onWikiLink: (p: string) => void): React.ReactNode[] {
  // Order matters: code spans first, then bold, italic, links, wiki-links.
  const nodes: React.ReactNode[] = [];
  let rest = text;
  let i = 0;
  const pattern =
    /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*|_[^_]+_)|(\[\[[^\]]+\]\])|(\[[^\]]+\]\([^)]+\))/;
  while (rest.length) {
    const m = rest.match(pattern);
    if (!m || m.index === undefined) {
      nodes.push(rest);
      break;
    }
    if (m.index > 0) nodes.push(rest.slice(0, m.index));
    const tok = m[0];
    const key = `${keyPrefix}-${i++}`;
    if (tok.startsWith("`")) {
      nodes.push(
        <code
          key={key}
          className="px-1.5 py-0.5 rounded bg-foreground/10 text-[0.85em] font-mono text-foreground/90"
        >
          {tok.slice(1, -1)}
        </code>,
      );
    } else if (tok.startsWith("**")) {
      nodes.push(
        <strong key={key} className="font-semibold text-foreground">
          {tok.slice(2, -2)}
        </strong>,
      );
    } else if (tok.startsWith("*") || tok.startsWith("_")) {
      nodes.push(
        <em key={key} className="italic">
          {tok.slice(1, -1)}
        </em>,
      );
    } else if (tok.startsWith("[[")) {
      const target = tok.slice(2, -2);
      nodes.push(
        <button
          key={key}
          type="button"
          onClick={() => onWikiLink(target)}
          className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 underline underline-offset-2 decoration-dotted"
        >
          {target}
        </button>,
      );
    } else if (tok.startsWith("[")) {
      const linkMatch = tok.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const [, label, url] = linkMatch;
        const isInternal = url.endsWith(".md") || url.startsWith("./") || url.startsWith("../");
        if (isInternal) {
          nodes.push(
            <button
              key={key}
              type="button"
              onClick={() => onWikiLink(url.replace(/^\.?\.?\//, ""))}
              className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 underline underline-offset-2"
            >
              {label}
            </button>,
          );
        } else {
          nodes.push(
            <a
              key={key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 underline underline-offset-2"
            >
              {label}
            </a>,
          );
        }
      } else {
        nodes.push(tok);
      }
    }
    rest = rest.slice(m.index + tok.length);
  }
  return nodes;
}

function renderMarkdown(src: string, onWikiLink: (p: string) => void): React.ReactNode {
  const { body, fm } = stripFrontmatter(src);
  const lines = body.split(/\r?\n/);
  const out: React.ReactNode[] = [];
  let i = 0;
  let k = 0;

  const flush = (node: React.ReactNode) => out.push(<div key={`n-${k++}`}>{node}</div>);

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        buf.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      out.push(
        <pre
          key={`code-${k++}`}
          className="my-4 overflow-x-auto rounded-lg border border-foreground/10 bg-foreground/[0.04] p-4 text-[12px] leading-relaxed"
        >
          <code className="font-mono text-foreground/85">{buf.join("\n")}</code>
          {lang ? (
            <span className="float-right text-[10px] uppercase tracking-wider text-foreground/40">
              {lang}
            </span>
          ) : null}
        </pre>,
      );
      continue;
    }

    // HTML-style comments — skip entirely (auto/manual markers)
    if (/^\s*<!--.*-->\s*$/.test(line)) {
      i++;
      continue;
    }

    // Table detection: line with pipes followed by separator row
    if (line.includes("|") && i + 1 < lines.length && /^\s*\|?[\s:\-|]+\|?\s*$/.test(lines[i + 1])) {
      const headerCells = line.split("|").map((c) => c.trim()).filter((c, idx, arr) => !(idx === 0 && c === "") && !(idx === arr.length - 1 && c === ""));
      i += 2; // skip header + separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|")) {
        const cells = lines[i].split("|").map((c) => c.trim()).filter((c, idx, arr) => !(idx === 0 && c === "") && !(idx === arr.length - 1 && c === ""));
        rows.push(cells);
        i++;
      }
      out.push(
        <div key={`tbl-${k++}`} className="my-4 overflow-x-auto rounded-lg border border-foreground/10">
          <table className="w-full text-[12px]">
            <thead className="bg-foreground/[0.04] text-foreground/70">
              <tr>
                {headerCells.map((h, idx) => (
                  <th key={idx} className="px-3 py-2 text-left font-semibold">
                    {renderInline(h, `th-${k}-${idx}`, onWikiLink)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri} className="border-t border-foreground/5">
                  {r.map((c, ci) => (
                    <td key={ci} className="px-3 py-2 text-foreground/80">
                      {renderInline(c, `td-${k}-${ri}-${ci}`, onWikiLink)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    // Headings
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const content = h[2];
      const sizes = [
        "text-2xl font-bold mt-6 mb-3",
        "text-xl font-bold mt-6 mb-2",
        "text-lg font-semibold mt-5 mb-2",
        "text-base font-semibold mt-4 mb-1.5",
        "text-sm font-semibold mt-3 mb-1",
        "text-xs font-semibold mt-2 mb-1 uppercase tracking-wide",
      ];
      const cls = sizes[level - 1];
      const Tag = (`h${level}` as unknown) as keyof JSX.IntrinsicElements;
      out.push(
        <Tag key={`h-${k++}`} className={cn(cls, "text-foreground")}>
          {renderInline(content, `h-${k}`, onWikiLink)}
        </Tag>,
      );
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith(">")) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        buf.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      out.push(
        <blockquote
          key={`bq-${k++}`}
          className="my-3 border-l-2 border-emerald-500/60 bg-foreground/[0.03] pl-4 py-2 text-foreground/75 italic"
        >
          {renderInline(buf.join(" "), `bq-${k}`, onWikiLink)}
        </blockquote>,
      );
      continue;
    }

    // Unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
        // allow continuation lines indented
        while (i < lines.length && /^\s{2,}\S/.test(lines[i])) {
          items[items.length - 1] += " " + lines[i].trim();
          i++;
        }
      }
      out.push(
        <ul key={`ul-${k++}`} className="my-3 space-y-1.5 pl-5 list-disc marker:text-foreground/40 text-foreground/80">
          {items.map((it, idx) => (
            <li key={idx} className="text-[13.5px] leading-relaxed">
              {renderInline(it, `li-${k}-${idx}`, onWikiLink)}
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
        while (i < lines.length && /^\s{2,}\S/.test(lines[i])) {
          items[items.length - 1] += " " + lines[i].trim();
          i++;
        }
      }
      out.push(
        <ol key={`ol-${k++}`} className="my-3 space-y-1.5 pl-5 list-decimal marker:text-foreground/40 text-foreground/80">
          {items.map((it, idx) => (
            <li key={idx} className="text-[13.5px] leading-relaxed">
              {renderInline(it, `oli-${k}-${idx}`, onWikiLink)}
            </li>
          ))}
        </ol>,
      );
      continue;
    }

    // Horizontal rule
    if (/^-{3,}$/.test(line.trim())) {
      out.push(<hr key={`hr-${k++}`} className="my-6 border-foreground/10" />);
      i++;
      continue;
    }

    // Blank line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph — accumulate until blank line / other block
    const paraBuf: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith(">") &&
      !lines[i].startsWith("```") &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !(lines[i].includes("|") && i + 1 < lines.length && /^\s*\|?[\s:\-|]+\|?\s*$/.test(lines[i + 1]))
    ) {
      paraBuf.push(lines[i]);
      i++;
    }
    out.push(
      <p key={`p-${k++}`} className="my-3 text-[13.5px] leading-relaxed text-foreground/80">
        {renderInline(paraBuf.join(" "), `p-${k}`, onWikiLink)}
      </p>,
    );
  }

  return (
    <div>
      {Object.keys(fm).length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {Object.entries(fm)
            .filter(([key]) => !["tags"].includes(key))
            .slice(0, 6)
            .map(([key, val]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1 rounded-full border border-foreground/10 bg-foreground/[0.04] px-2.5 py-1 text-[10px] font-medium text-foreground/60"
              >
                <span className="text-foreground/40">{key}:</span>
                <span className="text-foreground/80 font-mono">{String(val).slice(0, 40)}</span>
              </span>
            ))}
        </div>
      )}
      {out}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tree rendering
// ─────────────────────────────────────────────────────────────
function TreeView({
  nodes,
  selectedPath,
  onSelect,
  depth = 0,
}: {
  nodes: TreeNode[];
  selectedPath: string | null;
  onSelect: (path: string) => void;
  depth?: number;
}) {
  return (
    <ul className={cn("space-y-0.5", depth === 0 && "px-1")}>
      {nodes.map((n) => (
        <TreeNodeRow key={n.path} node={n} selectedPath={selectedPath} onSelect={onSelect} depth={depth} />
      ))}
    </ul>
  );
}

function TreeNodeRow({
  node,
  selectedPath,
  onSelect,
  depth,
}: {
  node: TreeNode;
  selectedPath: string | null;
  onSelect: (path: string) => void;
  depth: number;
}) {
  const [open, setOpen] = useState(depth < 1);

  if (node.type === "dir") {
    const count = node.children?.length ?? 0;
    return (
      <li>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-[12px] text-foreground/70 hover:bg-foreground/[0.05] hover:text-foreground"
          style={{ paddingLeft: `${depth * 12 + 6}px` }}
        >
          <ChevronRight
            className={cn("h-3 w-3 flex-shrink-0 transition-transform text-foreground/40", open && "rotate-90")}
            strokeWidth={2.5}
          />
          {open ? (
            <FolderOpen className="h-3.5 w-3.5 flex-shrink-0 text-emerald-700 dark:text-emerald-500/90" strokeWidth={2} />
          ) : (
            <Folder className="h-3.5 w-3.5 flex-shrink-0 text-foreground/50" strokeWidth={2} />
          )}
          <span className="truncate font-semibold">{node.name}</span>
          <span className="ml-auto text-[10px] text-foreground/40">{count}</span>
        </button>
        {open && node.children && node.children.length > 0 && (
          <TreeView
            nodes={node.children}
            selectedPath={selectedPath}
            onSelect={onSelect}
            depth={depth + 1}
          />
        )}
      </li>
    );
  }

  const active = selectedPath === node.path;
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(node.path)}
        className={cn(
          "flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-[12px] transition-colors",
          active
            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-semibold"
            : "text-foreground/65 hover:bg-foreground/[0.05] hover:text-foreground",
        )}
        style={{ paddingLeft: `${depth * 12 + 22}px` }}
      >
        <FileText className="h-3 w-3 flex-shrink-0 opacity-60" strokeWidth={2} />
        <span className="truncate">{node.name.replace(/\.md$/, "")}</span>
      </button>
    </li>
  );
}

// ─────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────
export default function KnowledgePage() {
  const [tree, setTree] = useState<KnowledgeTree | null>(null);
  const [stats, setStats] = useState<KnowledgeStats | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [page, setPage] = useState<PageResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [searching, setSearching] = useState(false);
  const [treeLoading, setTreeLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTree = useCallback(async () => {
    setTreeLoading(true);
    setError(null);
    try {
      const [treeRes, statsRes] = await Promise.all([
        fetch(`${API}/api/knowledge/tree`, { cache: "no-store" }),
        fetch(`${API}/api/knowledge/stats`, { cache: "no-store" }),
      ]);
      if (!treeRes.ok) throw new Error(`tree: ${treeRes.status}`);
      const treeData = (await treeRes.json()) as KnowledgeTree;
      setTree(treeData);
      if (statsRes.ok) setStats((await statsRes.json()) as KnowledgeStats);
      // Auto-select index.md or first file
      if (!selected) {
        const firstFile = findFirstFile(treeData.root, "index.md") || findFirstFile(treeData.root);
        if (firstFile) setSelected(firstFile);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed to load");
    } finally {
      setTreeLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  // Load page content when selection changes
  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    setLoading(true);
    setPage(null);
    fetch(`${API}/api/knowledge/page?path=${encodeURIComponent(selected)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setPage(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "page load failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selected]);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setSearchResults(null);
      return;
    }
    const handle = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`${API}/api/knowledge/search?q=${encodeURIComponent(query)}`, { cache: "no-store" });
        if (res.ok) setSearchResults((await res.json()) as SearchResponse);
      } catch {
        /* swallow */
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  const handleWikiLink = useCallback(
    (target: string) => {
      if (!tree) return;
      // Try exact match first
      const normalised = target.replace(/^\//, "").replace(/\.md$/, "");
      const candidates = collectFiles(tree.root);
      const hit =
        candidates.find((p) => p === `${normalised}.md`) ||
        candidates.find((p) => p.endsWith(`/${normalised}.md`)) ||
        candidates.find((p) => p.toLowerCase().includes(normalised.toLowerCase()));
      if (hit) setSelected(hit);
    },
    [tree],
  );

  const typeBadges = useMemo(() => {
    if (!stats?.by_type) return [];
    return Object.entries(stats.by_type)
      .sort(([, a], [, b]) => b - a)
      .filter(([, n]) => n > 0);
  }, [stats]);

  // Memoize markdown rendering so it doesn't rerun on every state change
  // (the tree state, search state, etc. trigger re-renders). Also cap the
  // render at a sane size so a pathological file can never pin the CPU.
  const renderedBody = useMemo(() => {
    if (!page) return null;
    const MAX_CHARS = 200_000; // ~200KB — far larger than any real wiki page
    const content = page.content.length > MAX_CHARS
      ? page.content.slice(0, MAX_CHARS) + "\n\n> ⚠ Page truncated at 200KB for rendering safety."
      : page.content;
    try {
      return renderMarkdown(content, handleWikiLink);
    } catch (e) {
      return (
        <div className="text-[12px] text-red-500">
          Failed to render markdown: {e instanceof Error ? e.message : String(e)}
        </div>
      );
    }
  }, [page, handleWikiLink]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* ── Header ── */}
      <div className="mb-6 flex flex-col gap-4 border-b border-foreground/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground/50">
            <BookOpen className="h-3.5 w-3.5" strokeWidth={2.5} />
            Knowledge Wiki
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">What AION has learned</h1>
          <p className="mt-1 max-w-2xl text-[13px] text-foreground/60">
            A self-maintained wiki. The curator compiles what the system has seen into entity pages,
            concept notes, and weekly digests. Hand-edits are preserved across regenerations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/how-it-works"
            className="text-[11px] font-semibold uppercase tracking-wide text-foreground/50 hover:text-foreground"
          >
            How it works →
          </Link>
          <button
            type="button"
            onClick={loadTree}
            className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 bg-foreground/[0.04] px-3 py-1.5 text-[11px] font-semibold text-foreground/75 hover:bg-foreground/[0.08]"
          >
            <RefreshCw className={cn("h-3 w-3", treeLoading && "animate-spin")} strokeWidth={2.5} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Stats strip ── */}
      {stats && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <StatPill icon={<Layers className="h-3 w-3" />} label="Pages" value={String(stats.total_pages)} />
          {typeBadges.map(([type, count]) => (
            <StatPill key={type} icon={<Hash className="h-3 w-3" />} label={type} value={String(count)} />
          ))}
          {stats.last_action?.timestamp && (
            <StatPill
              icon={<Clock className="h-3 w-3" />}
              label="last curated"
              value={timeAgo(stats.last_action.timestamp)}
            />
          )}
        </div>
      )}

      {/* ── Layout: sidebar + content ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside className="flex flex-col gap-3 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)]">
          {/* Search */}
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground/40"
              strokeWidth={2.5}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search wiki…"
              className="w-full rounded-md border border-foreground/15 bg-foreground/[0.03] py-1.5 pl-8 pr-3 text-[12px] text-foreground placeholder:text-foreground/40 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
            />
          </div>

          {/* Search results OR tree */}
          <div className="flex-1 overflow-y-auto rounded-lg border border-foreground/10 bg-foreground/[0.02]">
            {query.trim().length >= 2 ? (
              <div className="p-2">
                <div className="mb-2 px-1.5 text-[10px] font-semibold uppercase tracking-wider text-foreground/40">
                  {searching ? "Searching…" : `${searchResults?.count ?? 0} result${searchResults?.count === 1 ? "" : "s"}`}
                </div>
                <ul className="space-y-1.5">
                  {searchResults?.results.map((hit) => (
                    <li key={hit.path}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(hit.path);
                          setQuery("");
                        }}
                        className={cn(
                          "block w-full rounded px-2 py-1.5 text-left hover:bg-foreground/[0.05]",
                          selected === hit.path && "bg-emerald-500/10",
                        )}
                      >
                        <div className="truncate text-[11px] font-semibold text-foreground">
                          {hit.path.replace(/\.md$/, "")}
                        </div>
                        <div className="mt-0.5 truncate text-[10px] text-foreground/55">{hit.snippet}</div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : treeLoading ? (
              <div className="p-4 text-[11px] text-foreground/50">loading tree…</div>
            ) : error ? (
              <div className="p-4 text-[11px] text-red-500">error: {error}</div>
            ) : tree ? (
              <div className="p-1.5">
                <TreeView nodes={tree.root} selectedPath={selected} onSelect={setSelected} />
              </div>
            ) : null}
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0">
          <article className="rounded-lg border border-foreground/10 bg-background/50 p-6 md:p-8">
            {loading ? (
              <div className="text-[12px] text-foreground/50">loading page…</div>
            ) : page ? (
              <>
                <div className="mb-4 flex items-center justify-between border-b border-foreground/5 pb-3">
                  <div className="flex items-center gap-2 text-[11px] text-foreground/45">
                    <FileText className="h-3 w-3" strokeWidth={2.5} />
                    <span className="font-mono">{page.path}</span>
                  </div>
                  <span className="text-[10px] text-foreground/40">{page.size.toLocaleString()} chars</span>
                </div>
                <div className="prose-like">{renderedBody}</div>
              </>
            ) : (
              <div className="py-12 text-center text-[12px] text-foreground/40">
                Select a page from the tree to read.
              </div>
            )}
          </article>
        </main>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function StatPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-foreground/10 bg-foreground/[0.04] px-2.5 py-1 text-[10px] font-semibold text-foreground/70">
      <span className="text-foreground/50">{icon}</span>
      <span className="text-foreground/50 uppercase tracking-wider">{label}</span>
      <span className="text-foreground">{value}</span>
    </span>
  );
}

function findFirstFile(nodes: TreeNode[], nameMatch?: string): string | null {
  for (const n of nodes) {
    if (n.type === "file" && (!nameMatch || n.name === nameMatch)) return n.path;
    if (n.type === "dir" && n.children) {
      const hit = findFirstFile(n.children, nameMatch);
      if (hit) return hit;
    }
  }
  return null;
}

function collectFiles(nodes: TreeNode[]): string[] {
  const out: string[] = [];
  for (const n of nodes) {
    if (n.type === "file") out.push(n.path);
    else if (n.children) out.push(...collectFiles(n.children));
  }
  return out;
}

function timeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  if (isNaN(t)) return "—";
  const diff = Date.now() - t;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
