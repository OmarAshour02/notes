import { useMemo, useState } from "react";

type Probe = { idx: number; was: 0 | 1 };
type Trace =
  | null
  | {
      kind: "insert";
      key: string;
      probes: Probe[];
    }
  | {
      kind: "query";
      key: string;
      probes: Probe[];
      result: "definitely-not" | "maybe" | "true-positive";
    };

const SEEDS = [0x1f, 0x9e, 0x2c, 0x53, 0xa1, 0x77, 0xb3, 0x44, 0xc8, 0x10];

function hash(key: string, seed: number, m: number): number {
  let h = seed;
  for (let i = 0; i < key.length; i++) {
    h = ((h * 31) ^ key.charCodeAt(i)) >>> 0;
  }
  return h % m;
}

function probeIndices(key: string, k: number, m: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < k; i++) out.push(hash(key, SEEDS[i % SEEDS.length], m));
  return out;
}

export default function BloomFilterDemo() {
  const [m, setM] = useState(48);
  const [k, setK] = useState(3);
  const [bits, setBits] = useState<Uint8Array>(() => new Uint8Array(48));
  const [inserted, setInserted] = useState<string[]>([]);
  const [keyInput, setKeyInput] = useState("");
  const [queryInput, setQueryInput] = useState("");
  const [trace, setTrace] = useState<Trace>(null);

  function resetBits(newM: number) {
    setBits(new Uint8Array(newM));
    setInserted([]);
    setTrace(null);
  }

  function onM(next: number) {
    setM(next);
    resetBits(next);
  }

  function onK(next: number) {
    setK(next);
    setTrace(null);
  }

  function handleInsert(raw?: string) {
    const key = (raw ?? keyInput).trim();
    if (!key) return;
    const idxs = probeIndices(key, k, m);
    const probes: Probe[] = idxs.map((i) => ({
      idx: i,
      was: bits[i] ? 1 : 0,
    }));
    const next = new Uint8Array(bits);
    for (const i of idxs) next[i] = 1;
    setBits(next);
    if (!inserted.includes(key)) setInserted([...inserted, key]);
    setTrace({ kind: "insert", key, probes });
    setKeyInput("");
  }

  function handleQuery(raw?: string) {
    const key = (raw ?? queryInput).trim();
    if (!key) return;
    const idxs = probeIndices(key, k, m);
    const probes: Probe[] = idxs.map((i) => ({
      idx: i,
      was: bits[i] ? 1 : 0,
    }));
    const allSet = probes.every((p) => p.was === 1);
    const result: "definitely-not" | "maybe" | "true-positive" = !allSet
      ? "definitely-not"
      : inserted.includes(key)
        ? "true-positive"
        : "maybe";
    setTrace({ kind: "query", key, probes, result });
    setQueryInput("");
  }

  function handleReset() {
    resetBits(m);
  }

  const setCount = useMemo(() => {
    let s = 0;
    for (let i = 0; i < bits.length; i++) if (bits[i]) s += 1;
    return s;
  }, [bits]);

  const fpRate = useMemo(() => {
    const n = inserted.length;
    if (n === 0) return 0;
    return Math.pow(1 - Math.exp((-k * n) / m), k);
  }, [inserted.length, k, m]);

  const probedSet = useMemo(() => {
    if (!trace) return new Set<number>();
    return new Set(trace.probes.map((p) => p.idx));
  }, [trace]);

  return (
    <div className="bf">
      <div className="bf-controls">
        <div className="bf-row">
          <input
            className="bf-input"
            placeholder="key to insert"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleInsert()}
          />
          <button className="bf-btn bf-btn-primary" onClick={() => handleInsert()}>
            insert
          </button>
        </div>
        <div className="bf-row">
          <input
            className="bf-input"
            placeholder="key to test"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleQuery()}
          />
          <button className="bf-btn" onClick={() => handleQuery()}>
            query
          </button>
          <button className="bf-btn bf-btn-warn" onClick={handleReset}>
            reset
          </button>
        </div>

        <div className="bf-row bf-sliders">
          <label className="bf-slider">
            <span>m (bits): <strong>{m}</strong></span>
            <input
              type="range"
              min={16}
              max={96}
              step={4}
              value={m}
              onChange={(e) => onM(Number(e.target.value))}
            />
          </label>
          <label className="bf-slider">
            <span>k (hashes): <strong>{k}</strong></span>
            <input
              type="range"
              min={1}
              max={6}
              step={1}
              value={k}
              onChange={(e) => onK(Number(e.target.value))}
            />
          </label>
        </div>

        <div className="bf-stats">
          <Stat label="inserted" value={inserted.length} />
          <Stat label="bits set" value={`${setCount} / ${m}`} />
          <Stat
            label="theoretical false-positive"
            value={inserted.length === 0 ? "0%" : `${(fpRate * 100).toFixed(1)}%`}
          />
        </div>
      </div>

      <div className="bf-grid">
        {Array.from({ length: m }).map((_, i) => {
          const set = bits[i] === 1;
          const probed = probedSet.has(i);
          let cls = "bf-cell";
          if (set) cls += " set";
          if (probed) cls += " probed";
          return (
            <div className={cls} key={i} title={`bit ${i}: ${set ? 1 : 0}`}>
              <span className="bf-cell-i">{i}</span>
            </div>
          );
        })}
      </div>

      {trace && (
        <div className={`bf-trace ${trace.kind === "query" ? `q-${trace.result}` : ""}`}>
          {trace.kind === "insert" ? (
            <>
              <strong>insert "{trace.key}"</strong>: set bits{" "}
              {trace.probes.map((p, i) => (
                <span key={i} className="bf-bit">
                  {p.idx}
                  {p.was === 1 ? " (already 1)" : ""}
                  {i < trace.probes.length - 1 ? ", " : ""}
                </span>
              ))}
            </>
          ) : (
            <>
              <strong>query "{trace.key}"</strong>: probed{" "}
              {trace.probes.map((p, i) => (
                <span key={i} className={`bf-bit ${p.was === 0 ? "miss" : "hit"}`}>
                  {p.idx}={p.was}
                  {i < trace.probes.length - 1 ? ", " : ""}
                </span>
              ))}{" "}
              →{" "}
              {trace.result === "definitely-not" && (
                <span className="bf-verdict no">definitely not in set</span>
              )}
              {trace.result === "maybe" && (
                <span className="bf-verdict maybe">
                  maybe in set (false positive, never inserted)
                </span>
              )}
              {trace.result === "true-positive" && (
                <span className="bf-verdict yes">probably in set (true positive)</span>
              )}
            </>
          )}
        </div>
      )}

      <div className="bf-side">
        <header className="bf-side-head">
          <h4>inserted keys</h4>
          <span>ground truth (the filter doesn't store this)</span>
        </header>
        {inserted.length === 0 ? (
          <p className="bf-empty">none yet. try inserting "omar", "mohammed", "fatma".</p>
        ) : (
          <ul className="bf-keys">
            {inserted.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>
        )}
        <div className="bf-quick">
          {["omar", "mohammed", "fatma", "ahmed", "salma"].map((name) => (
            <button
              key={name}
              className="bf-chip"
              onClick={() => handleInsert(name)}
              disabled={inserted.includes(name)}
            >
              + {name}
            </button>
          ))}
        </div>
      </div>

      <DemoStyles />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bf-stat">
      <span className="bf-stat-label">{label}</span>
      <span className="bf-stat-value">{value}</span>
    </div>
  );
}

function DemoStyles() {
  return (
    <style>{`
      .bf {
        font-family: var(--mono);
        font-size: 0.92rem;
        background: var(--bg-soft);
        border: 1px solid var(--bg2);
        border-radius: 8px;
        padding: 1.25rem;
        margin: 2rem 0;
        color: var(--fg);
        display: grid;
        grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
        gap: 1rem;
      }
      @media (max-width: 720px) { .bf { grid-template-columns: 1fr; } }

      .bf-controls { display: flex; flex-direction: column; gap: 0.55rem; }
      .bf-row { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
      .bf-input {
        flex: 1 1 9rem;
        background: var(--bg);
        border: 1px solid var(--bg2);
        color: var(--fg);
        padding: 0.45rem 0.7rem;
        border-radius: 4px;
        font-family: var(--mono);
        font-size: 0.9rem;
      }
      .bf-input:focus { outline: 1px solid var(--aqua); border-color: var(--aqua); }
      .bf-btn {
        background: var(--bg); color: var(--fg-dim);
        border: 1px solid var(--bg2);
        padding: 0.45rem 0.85rem; border-radius: 4px;
        cursor: pointer; font-family: var(--mono); font-size: 0.85rem;
        transition: background 100ms, color 100ms, border-color 100ms;
      }
      .bf-btn:hover:not(:disabled) { background: var(--bg2); color: var(--yellow); border-color: var(--yellow); }
      .bf-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      .bf-btn-primary { color: var(--green); border-color: color-mix(in srgb, var(--green) 50%, transparent); }
      .bf-btn-primary:hover:not(:disabled) { color: var(--bg); background: var(--green); border-color: var(--green); }
      .bf-btn-warn { color: var(--orange); border-color: color-mix(in srgb, var(--orange) 50%, transparent); }
      .bf-btn-warn:hover:not(:disabled) { color: var(--bg); background: var(--orange); border-color: var(--orange); }

      .bf-sliders { gap: 1rem; }
      .bf-slider { display: flex; flex-direction: column; gap: 0.3rem; flex: 1 1 12rem; font-size: 0.78rem; color: var(--fg-soft); }
      .bf-slider strong { color: var(--yellow); font-weight: 600; }
      .bf-slider input[type="range"] { accent-color: var(--aqua); width: 100%; }

      .bf-stats { display: flex; flex-wrap: wrap; gap: 0.6rem; margin-top: 0.2rem; }
      .bf-stat {
        background: var(--bg);
        border: 1px dashed var(--bg2);
        border-radius: 4px;
        padding: 0.4rem 0.7rem;
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
      }
      .bf-stat-label { font-size: 0.68rem; color: var(--gray); letter-spacing: 0.08em; text-transform: uppercase; }
      .bf-stat-value { font-size: 0.9rem; color: var(--fg); }

      .bf-grid {
        grid-column: 1 / -1;
        margin-top: 0.6rem;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(2rem, 1fr));
        gap: 0.25rem;
        background: var(--bg);
        border: 1px solid var(--bg2);
        border-radius: 6px;
        padding: 0.7rem;
      }
      .bf-cell {
        position: relative;
        aspect-ratio: 1;
        display: grid;
        place-items: center;
        background: var(--bg-soft);
        border: 1px solid var(--bg2);
        border-radius: 3px;
        color: var(--gray);
        font-size: 0.62rem;
        transition: background 120ms, color 120ms, border-color 120ms;
      }
      .bf-cell-i { font-family: var(--mono); }
      .bf-cell.set {
        background: color-mix(in srgb, var(--yellow) 28%, var(--bg));
        border-color: var(--yellow);
        color: var(--fg-dim);
      }
      .bf-cell.probed {
        outline: 2px solid var(--aqua);
        outline-offset: -2px;
      }
      .bf-cell.set.probed {
        outline-color: var(--green);
      }

      .bf-trace {
        grid-column: 1 / -1;
        margin-top: 0.5rem;
        background: var(--bg);
        border: 1px dashed var(--bg2);
        border-radius: 4px;
        padding: 0.6rem 0.85rem;
        color: var(--fg-soft);
        font-size: 0.85rem;
        line-height: 1.55;
      }
      .bf-trace strong { color: var(--yellow); font-weight: 600; }
      .bf-bit { color: var(--fg); }
      .bf-bit.hit { color: var(--green); }
      .bf-bit.miss { color: var(--red); }

      .bf-verdict { font-weight: 600; }
      .bf-verdict.no { color: var(--red); }
      .bf-verdict.maybe { color: var(--orange); }
      .bf-verdict.yes { color: var(--green); }

      .bf-side {
        background: var(--bg);
        border: 1px solid var(--bg2);
        border-radius: 6px;
        padding: 0.85rem 0.95rem;
        display: flex;
        flex-direction: column;
        gap: 0.55rem;
      }
      .bf-side-head { display: flex; flex-direction: column; gap: 0.1rem; }
      .bf-side-head h4 { margin: 0; font-size: 0.82rem; color: var(--yellow); letter-spacing: 0.05em; }
      .bf-side-head span { font-size: 0.7rem; color: var(--gray); font-style: italic; }
      .bf-keys { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.18rem; max-height: 10rem; overflow-y: auto; font-size: 0.85rem; color: var(--blue); }
      .bf-keys li { padding: 0.1rem 0; border-bottom: 1px dashed var(--bg2); }
      .bf-empty { color: var(--gray); font-style: italic; margin: 0; font-size: 0.82rem; }
      .bf-quick { display: flex; flex-wrap: wrap; gap: 0.3rem; margin-top: auto; padding-top: 0.5rem; border-top: 1px solid var(--bg2); }
      .bf-chip {
        background: var(--bg-soft); color: var(--fg-soft);
        border: 1px solid var(--bg2); border-radius: 999px;
        padding: 0.22rem 0.6rem; font-family: var(--mono); font-size: 0.74rem;
        cursor: pointer; transition: color 100ms, border-color 100ms;
      }
      .bf-chip:hover:not(:disabled) { color: var(--yellow); border-color: var(--yellow); }
      .bf-chip:disabled { opacity: 0.35; cursor: not-allowed; }
    `}</style>
  );
}
