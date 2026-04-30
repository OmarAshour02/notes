import { useMemo, useRef, useState } from "react";

type BNode = {
  id: number;
  keys: string[];
  children: BNode[];
};

type Trace = { kind: "search"; key: string; path: number[]; found: boolean } | null;

let _id = 0;
function newNode(keys: string[] = [], children: BNode[] = []): BNode {
  return { id: ++_id, keys, children };
}

function isLeaf(n: BNode) {
  return n.children.length === 0;
}

function cloneNode(n: BNode): BNode {
  return { id: n.id, keys: n.keys.slice(), children: n.children.slice() };
}

function cmp(a: string, b: string) {
  return a.localeCompare(b);
}

type Split = { promoted: string; right: BNode };

function splitNode(n: BNode, maxKeys: number): { left: BNode; promoted: string; right: BNode } {
  const mid = Math.floor(n.keys.length / 2);
  const promoted = n.keys[mid];
  const leftKeys = n.keys.slice(0, mid);
  const rightKeys = n.keys.slice(mid + 1);
  let leftChildren: BNode[] = [];
  let rightChildren: BNode[] = [];
  if (!isLeaf(n)) {
    leftChildren = n.children.slice(0, mid + 1);
    rightChildren = n.children.slice(mid + 1);
  }
  return {
    left: { id: n.id, keys: leftKeys, children: leftChildren },
    promoted,
    right: newNode(rightKeys, rightChildren),
  };
}

function insertInto(n: BNode, key: string, maxKeys: number): { node: BNode; split: Split | null } {
  const node = cloneNode(n);

  if (node.keys.includes(key)) {
    return { node, split: null };
  }

  if (isLeaf(node)) {
    const ks = [...node.keys, key].sort(cmp);
    node.keys = ks;
    if (node.keys.length > maxKeys) {
      const { left, promoted, right } = splitNode(node, maxKeys);
      return { node: left, split: { promoted, right } };
    }
    return { node, split: null };
  }

  let i = 0;
  while (i < node.keys.length && cmp(key, node.keys[i]) > 0) i++;

  const childResult = insertInto(node.children[i], key, maxKeys);
  node.children = node.children.slice();
  node.children[i] = childResult.node;

  if (childResult.split) {
    const newKeys = node.keys.slice();
    newKeys.splice(i, 0, childResult.split.promoted);
    const newChildren = node.children.slice();
    newChildren.splice(i + 1, 0, childResult.split.right);
    node.keys = newKeys;
    node.children = newChildren;
    if (node.keys.length > maxKeys) {
      const { left, promoted, right } = splitNode(node, maxKeys);
      return { node: left, split: { promoted, right } };
    }
  }

  return { node, split: null };
}

function insertRoot(root: BNode, key: string, maxKeys: number): BNode {
  const { node, split } = insertInto(root, key, maxKeys);
  if (!split) return node;
  return newNode([split.promoted], [node, split.right]);
}

function searchPath(root: BNode, key: string): { path: number[]; found: boolean } {
  const path: number[] = [];
  let node: BNode | undefined = root;
  while (node) {
    path.push(node.id);
    if (node.keys.includes(key)) return { path, found: true };
    if (isLeaf(node)) return { path, found: false };
    let i = 0;
    while (i < node.keys.length && cmp(key, node.keys[i]) > 0) i++;
    node = node.children[i];
  }
  return { path, found: false };
}

const KEY_W = 52;
const KEY_H = 28;
const NODE_PAD = 6;
const LEVEL_GAP = 64;
const NODE_GAP = 18;

type Layout = {
  positions: Map<number, { x: number; y: number; w: number }>;
  width: number;
  height: number;
};

function nodeWidth(n: BNode) {
  return Math.max(KEY_W, n.keys.length * KEY_W) + NODE_PAD * 2;
}

function layoutTree(root: BNode): Layout {
  const positions = new Map<number, { x: number; y: number; w: number }>();
  let nextLeafX = 0;
  const subtreeWidth = new Map<number, number>();

  function measure(n: BNode): number {
    if (isLeaf(n)) {
      subtreeWidth.set(n.id, nodeWidth(n));
      return nodeWidth(n);
    }
    let total = 0;
    for (let i = 0; i < n.children.length; i++) {
      total += measure(n.children[i]);
      if (i < n.children.length - 1) total += NODE_GAP;
    }
    const w = Math.max(nodeWidth(n), total);
    subtreeWidth.set(n.id, w);
    return w;
  }

  function place(n: BNode, x: number, depth: number) {
    const w = nodeWidth(n);
    const subW = subtreeWidth.get(n.id) ?? w;
    const y = depth * (KEY_H + 2 * NODE_PAD + LEVEL_GAP);

    if (isLeaf(n)) {
      const cx = x + subW / 2;
      positions.set(n.id, { x: cx - w / 2, y, w });
      return;
    }

    let cursor = x;
    const childCenters: number[] = [];
    for (const child of n.children) {
      const cw = subtreeWidth.get(child.id) ?? nodeWidth(child);
      place(child, cursor, depth + 1);
      childCenters.push(cursor + cw / 2);
      cursor += cw + NODE_GAP;
    }
    const cx = (childCenters[0] + childCenters[childCenters.length - 1]) / 2;
    positions.set(n.id, { x: cx - w / 2, y, w });
  }

  measure(root);
  place(root, 0, 0);

  let maxX = 0;
  let maxY = 0;
  for (const { x, y, w } of positions.values()) {
    if (x + w > maxX) maxX = x + w;
    if (y + KEY_H + 2 * NODE_PAD > maxY) maxY = y + KEY_H + 2 * NODE_PAD;
  }
  return { positions, width: maxX, height: maxY };
}

export default function BTreeDemo() {
  const [maxKeys, setMaxKeys] = useState(3);
  const [root, setRoot] = useState<BNode>(() => newNode([]));
  const [keyInput, setKeyInput] = useState("");
  const [queryInput, setQueryInput] = useState("");
  const [trace, setTrace] = useState<Trace>(null);
  const [allKeys, setAllKeys] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  function handleInsert(raw?: string) {
    const k = (raw ?? keyInput).trim();
    if (!k) return;
    const next = insertRoot(root, k, maxKeys);
    setRoot(next);
    if (!allKeys.includes(k)) setAllKeys([...allKeys, k]);
    setTrace(null);
    setKeyInput("");
  }

  function handleSearch(raw?: string) {
    const k = (raw ?? queryInput).trim();
    if (!k) return;
    const r = searchPath(root, k);
    setTrace({ kind: "search", key: k, path: r.path, found: r.found });
    setQueryInput("");
  }

  function handleReset() {
    setRoot(newNode([]));
    setAllKeys([]);
    setTrace(null);
  }

  function handleSeed() {
    let r = newNode([]);
    const seeds = ["10", "20", "5", "6", "12", "30", "7", "17", "25", "3", "15"];
    for (const s of seeds) r = insertRoot(r, s, maxKeys);
    setRoot(r);
    setAllKeys(seeds);
    setTrace(null);
  }

  const layout = useMemo(() => layoutTree(root), [root]);
  const pathSet = useMemo(
    () => new Set(trace?.path ?? []),
    [trace],
  );
  const foundId = trace?.found
    ? trace.path[trace.path.length - 1]
    : undefined;

  function flatNodes(n: BNode): BNode[] {
    return [n, ...n.children.flatMap(flatNodes)];
  }
  const allNodes = useMemo(() => flatNodes(root), [root]);

  function edgeLines() {
    const lines: { x1: number; y1: number; x2: number; y2: number; on: boolean }[] = [];
    function walk(n: BNode) {
      const p = layout.positions.get(n.id);
      if (!p) return;
      const px = p.x + p.w / 2;
      const py = p.y + KEY_H + 2 * NODE_PAD;
      for (const c of n.children) {
        const cp = layout.positions.get(c.id);
        if (!cp) continue;
        const cx = cp.x + cp.w / 2;
        const cy = cp.y;
        lines.push({
          x1: px,
          y1: py,
          x2: cx,
          y2: cy,
          on: pathSet.has(n.id) && pathSet.has(c.id),
        });
        walk(c);
      }
    }
    walk(root);
    return lines;
  }

  return (
    <div className="bt">
      <div className="bt-controls">
        <div className="bt-row">
          <input
            className="bt-input"
            placeholder="key (e.g. 10)"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleInsert()}
          />
          <button className="bt-btn bt-btn-primary" onClick={() => handleInsert()}>
            insert
          </button>
        </div>
        <div className="bt-row">
          <input
            className="bt-input"
            placeholder="search key"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className="bt-btn" onClick={() => handleSearch()}>
            search
          </button>
          <button className="bt-btn" onClick={handleSeed}>
            seed
          </button>
          <button className="bt-btn bt-btn-warn" onClick={handleReset}>
            reset
          </button>
        </div>
        <div className="bt-row bt-order">
          <span className="bt-order-label">max keys per node:</span>
          {[2, 3, 4].map((n) => (
            <button
              key={n}
              className={`bt-pill ${maxKeys === n ? "active" : ""}`}
              onClick={() => {
                setMaxKeys(n);
                setRoot(newNode([]));
                setAllKeys([]);
                setTrace(null);
              }}
            >
              {n}
            </button>
          ))}
          <span className="bt-order-hint">smaller = splits sooner</span>
        </div>
      </div>

      <div className="bt-viewport" ref={containerRef}>
        {allKeys.length === 0 ? (
          <p className="bt-empty">empty tree. insert a few keys, or click seed.</p>
        ) : (
          <svg
            className="bt-svg"
            viewBox={`-12 -8 ${layout.width + 24} ${layout.height + 16}`}
            width={layout.width + 24}
            height={layout.height + 16}
          >
            {edgeLines().map((l, i) => (
              <line
                key={i}
                x1={l.x1}
                y1={l.y1}
                x2={l.x2}
                y2={l.y2}
                className={`bt-edge ${l.on ? "on" : ""}`}
              />
            ))}
            {allNodes.map((n) => {
              const p = layout.positions.get(n.id);
              if (!p) return null;
              const onPath = pathSet.has(n.id);
              const isFound = n.id === foundId;
              return (
                <g key={n.id} transform={`translate(${p.x}, ${p.y})`}>
                  <rect
                    width={p.w}
                    height={KEY_H + 2 * NODE_PAD}
                    rx={4}
                    className={`bt-node ${onPath ? "on" : ""} ${isFound ? "found" : ""}`}
                  />
                  {n.keys.map((key, i) => {
                    const x =
                      NODE_PAD +
                      i * KEY_W +
                      Math.max(0, (p.w - 2 * NODE_PAD - n.keys.length * KEY_W) / 2);
                    return (
                      <g key={i}>
                        {i > 0 && (
                          <line
                            x1={x}
                            y1={NODE_PAD + 4}
                            x2={x}
                            y2={NODE_PAD + KEY_H - 4}
                            className="bt-sep"
                          />
                        )}
                        <text
                          x={x + KEY_W / 2}
                          y={NODE_PAD + KEY_H / 2 + 4}
                          textAnchor="middle"
                          className="bt-key-text"
                        >
                          {key}
                        </text>
                      </g>
                    );
                  })}
                  {n.keys.length === 0 && (
                    <text
                      x={p.w / 2}
                      y={NODE_PAD + KEY_H / 2 + 4}
                      textAnchor="middle"
                      className="bt-empty-text"
                    >
                      ∅
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {trace && (
        <div className={`bt-trace ${trace.found ? "ok" : "no"}`}>
          <strong>search "{trace.key}"</strong>: walked {trace.path.length} node
          {trace.path.length === 1 ? "" : "s"} →{" "}
          {trace.found ? (
            <span className="bt-verdict ok">found</span>
          ) : (
            <span className="bt-verdict no">not found</span>
          )}
        </div>
      )}

      <div className="bt-foot">
        <span>height: {treeHeight(root)}</span>
        <span>keys: {allKeys.length}</span>
        <span>nodes: {allNodes.length}</span>
      </div>

      <DemoStyles />
    </div>
  );
}

function treeHeight(n: BNode): number {
  if (n.keys.length === 0) return 0;
  if (isLeaf(n)) return 1;
  return 1 + Math.max(...n.children.map(treeHeight));
}

function DemoStyles() {
  return (
    <style>{`
      .bt {
        font-family: var(--mono);
        font-size: 0.92rem;
        background: var(--bg-soft);
        border: 1px solid var(--bg2);
        border-radius: 8px;
        padding: 1.25rem;
        margin: 2rem 0;
        color: var(--fg);
      }
      .bt-controls { display: flex; flex-direction: column; gap: 0.55rem; }
      .bt-row { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
      .bt-input {
        flex: 1 1 8rem;
        background: var(--bg);
        border: 1px solid var(--bg2);
        color: var(--fg);
        padding: 0.45rem 0.7rem;
        border-radius: 4px;
        font-family: var(--mono);
        font-size: 0.9rem;
      }
      .bt-input:focus { outline: 1px solid var(--aqua); border-color: var(--aqua); }
      .bt-btn {
        background: var(--bg); color: var(--fg-dim);
        border: 1px solid var(--bg2);
        padding: 0.45rem 0.85rem; border-radius: 4px;
        cursor: pointer; font-family: var(--mono); font-size: 0.85rem;
        transition: background 100ms, color 100ms, border-color 100ms;
      }
      .bt-btn:hover { background: var(--bg2); color: var(--yellow); border-color: var(--yellow); }
      .bt-btn-primary { color: var(--green); border-color: color-mix(in srgb, var(--green) 50%, transparent); }
      .bt-btn-primary:hover { color: var(--bg); background: var(--green); border-color: var(--green); }
      .bt-btn-warn { color: var(--orange); border-color: color-mix(in srgb, var(--orange) 50%, transparent); }
      .bt-btn-warn:hover { color: var(--bg); background: var(--orange); border-color: var(--orange); }

      .bt-order-label { color: var(--gray); font-size: 0.78rem; }
      .bt-pill {
        background: var(--bg); color: var(--fg-soft);
        border: 1px solid var(--bg2); border-radius: 999px;
        padding: 0.22rem 0.7rem; font-family: var(--mono); font-size: 0.78rem;
        cursor: pointer; transition: color 100ms, border-color 100ms, background 100ms;
      }
      .bt-pill:hover { color: var(--yellow); border-color: var(--yellow); }
      .bt-pill.active { color: var(--bg); background: var(--aqua); border-color: var(--aqua); }
      .bt-order-hint { color: var(--gray); font-size: 0.74rem; font-style: italic; margin-left: 0.4rem; }

      .bt-viewport {
        margin-top: 1rem;
        background: var(--bg);
        border: 1px solid var(--bg2);
        border-radius: 6px;
        padding: 1rem;
        overflow-x: auto;
        min-height: 8rem;
      }
      .bt-empty {
        color: var(--gray); font-style: italic; margin: 0;
        font-size: 0.85rem; text-align: center; padding: 1.5rem 0;
      }
      .bt-svg { display: block; margin: 0 auto; }

      .bt-node {
        fill: var(--bg-soft);
        stroke: var(--bg3);
        stroke-width: 1;
        transition: fill 150ms, stroke 150ms;
      }
      .bt-node.on {
        stroke: var(--aqua);
        stroke-width: 2;
        fill: color-mix(in srgb, var(--aqua) 14%, var(--bg-soft));
      }
      .bt-node.found {
        stroke: var(--green);
        stroke-width: 2;
        fill: color-mix(in srgb, var(--green) 22%, var(--bg-soft));
      }
      .bt-key-text {
        fill: var(--fg);
        font-family: var(--mono);
        font-size: 13px;
      }
      .bt-empty-text {
        fill: var(--gray);
        font-family: var(--mono);
        font-size: 14px;
      }
      .bt-sep {
        stroke: var(--bg3);
        stroke-width: 1;
      }
      .bt-edge {
        stroke: var(--bg3);
        stroke-width: 1;
        fill: none;
      }
      .bt-edge.on {
        stroke: var(--aqua);
        stroke-width: 2;
      }

      .bt-trace {
        margin-top: 0.7rem;
        background: var(--bg);
        border: 1px dashed var(--bg2);
        border-radius: 4px;
        padding: 0.55rem 0.85rem;
        color: var(--fg-soft);
        font-size: 0.85rem;
      }
      .bt-trace strong { color: var(--yellow); font-weight: 600; }
      .bt-verdict.ok { color: var(--green); font-weight: 600; }
      .bt-verdict.no { color: var(--red); font-weight: 600; }

      .bt-foot {
        margin-top: 0.55rem;
        display: flex;
        gap: 1rem;
        font-size: 0.74rem;
        color: var(--gray);
        font-family: var(--mono);
        letter-spacing: 0.06em;
      }
    `}</style>
  );
}
