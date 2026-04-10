

# ══════════════════════════════════════════════════════
# KNOWLEDGE WIKI (Karpathy-style)
# ══════════════════════════════════════════════════════

import os as _os_kw
from pathlib import Path as _Path_kw

_KNOWLEDGE_DIR = _Path_kw(_os_kw.environ.get("AION_KNOWLEDGE_DIR", "/root/oracle/v3/knowledge"))


def _kw_safe_path(relpath: str) -> _Path_kw | None:
    """Resolve a relative path inside the knowledge dir, refusing traversal."""
    if not relpath:
        return None
    # Strip leading slashes and reject .. segments
    relpath = relpath.lstrip("/\\")
    if ".." in relpath.split("/") or ".." in relpath.split("\\"):
        return None
    full = (_KNOWLEDGE_DIR / relpath).resolve()
    try:
        full.relative_to(_KNOWLEDGE_DIR.resolve())
    except ValueError:
        return None
    return full


@app.route("/api/knowledge/tree", methods=["GET"])
def api_knowledge_tree():
    """Return the entire wiki folder structure as a nested tree."""
    if not _KNOWLEDGE_DIR.exists():
        return jsonify({"error": "knowledge dir missing"}), 404

    def walk(d: _Path_kw) -> list:
        items = []
        for child in sorted(d.iterdir()):
            if child.name.startswith(".") or child.name == "CLAUDE.md" and False:
                continue
            if child.is_dir():
                items.append({
                    "name": child.name,
                    "type": "dir",
                    "path": str(child.relative_to(_KNOWLEDGE_DIR)).replace("\\", "/"),
                    "children": walk(child),
                })
            elif child.suffix == ".md":
                items.append({
                    "name": child.name,
                    "type": "file",
                    "path": str(child.relative_to(_KNOWLEDGE_DIR)).replace("\\", "/"),
                    "size": child.stat().st_size,
                })
        return items

    return jsonify({
        "root": walk(_KNOWLEDGE_DIR),
        "count": sum(1 for _ in _KNOWLEDGE_DIR.rglob("*.md")),
    })


@app.route("/api/knowledge/page", methods=["GET"])
def api_knowledge_page():
    """Return the raw markdown of a single wiki page."""
    relpath = request.args.get("path", "")
    safe = _kw_safe_path(relpath)
    if not safe or not safe.exists() or not safe.is_file():
        return jsonify({"error": "not found", "path": relpath}), 404
    if safe.suffix != ".md":
        return jsonify({"error": "only .md files"}), 400
    try:
        content = safe.read_text(encoding="utf-8")
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    return jsonify({
        "path": relpath,
        "content": content,
        "size": len(content),
    })


@app.route("/api/knowledge/search", methods=["GET"])
def api_knowledge_search():
    """Naive full-text search across all .md files. Good enough for ~200 pages."""
    q = (request.args.get("q") or "").strip().lower()
    if not q or len(q) < 2:
        return jsonify({"results": [], "query": q})
    results = []
    for md in _KNOWLEDGE_DIR.rglob("*.md"):
        try:
            text = md.read_text(encoding="utf-8")
        except Exception:
            continue
        if q in text.lower():
            # Find first occurrence + surrounding snippet
            idx = text.lower().find(q)
            start = max(0, idx - 60)
            end = min(len(text), idx + len(q) + 60)
            snippet = text[start:end].replace("\n", " ")
            results.append({
                "path": str(md.relative_to(_KNOWLEDGE_DIR)).replace("\\", "/"),
                "snippet": snippet,
                "match_count": text.lower().count(q),
            })
        if len(results) >= 50:
            break
    results.sort(key=lambda r: -r["match_count"])
    return jsonify({"results": results, "query": q, "count": len(results)})


@app.route("/api/knowledge/stats", methods=["GET"])
def api_knowledge_stats():
    """Counts of pages by type, for the /knowledge page header."""
    stats: dict[str, int] = {}
    total = 0
    for md in _KNOWLEDGE_DIR.rglob("*.md"):
        rel = str(md.relative_to(_KNOWLEDGE_DIR)).replace("\\", "/")
        top = rel.split("/")[0] if "/" in rel else "root"
        stats[top] = stats.get(top, 0) + 1
        total += 1
    # Grab last curator log entry for "last curated" timestamp
    try:
        from db import get_curator_log
        log = get_curator_log(limit=1)
        last_action = log[0] if log else None
    except Exception:
        last_action = None
    return jsonify({
        "total_pages": total,
        "by_type": stats,
        "last_action": last_action,
    })


# ══════════════════════════════════════════════════════
# EVOLUTION v2 (SQLite-backed, replaces JSON version)
# ══════════════════════════════════════════════════════

@app.route("/api/evolution/v2/status", methods=["GET"])
def api_evolution_v2_status():
    """SQLite-backed evolution status."""
    try:
        from db import get_evolution_status
        return jsonify(get_evolution_status())
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/evolution/v2/run", methods=["POST"])
def api_evolution_v2_run():
    """Trigger a fresh evaluation run against current forward prices."""
    try:
        from db import run_evaluation
        return jsonify(run_evaluation())
    except Exception as e:
        return jsonify({"error": str(e)}), 500
