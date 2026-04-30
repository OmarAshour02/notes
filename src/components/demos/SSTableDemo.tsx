import { useEffect, useMemo, useRef, useState } from "react";

type Op = { key: string; value: string | null };
type SSTable = { id: number; level: number; entries: Op[] };
type Strategy = "tiered" | "leveled";
type Event = { id: number; tone: "wal" | "flush" | "compact" | "read" | "info"; text: string };

const TOMBSTONE = "⌀";
const TIER_TRIGGER = 3;
const L0_TRIGGER = 3;

export default function SSTableDemo() {
  const [memtable, setMemtable] = useState<Op[]>([
    { key: "omar", value: "engineer" },
    { key: "mohammed", value: "musician" },
  ]);
  const [wal, setWal] = useState<Op[]>([
    { key: "omar", value: "engineer" },
    { key: "mohammed", value: "musician" },
  ]);
  const [tables, setTables] = useState<SSTable[]>([]);
  const [nextId, setNextId] = useState(1);
  const [nextEventId, setNextEventId] = useState(1);
  const [strategy, setStrategy] = useState<Strategy>("tiered");
  const [keyInput, setKeyInput] = useState("");
  const [valueInput, setValueInput] = useState("");
  const [lookupKey, setLookupKey] = useState("");
  const [events, setEvents] = useState<Event[]>([
    { id: 0, tone: "info", text: "ready. memtable preloaded with 2 entries." },
  ]);
  const [running, setRunning] = useState(false);
  const eventRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef(false);

  useEffect(() => {
    if (eventRef.current) {
      eventRef.current.scrollTop = eventRef.current.scrollHeight;
    }
  }, [events]);

  const apiRef = useRef<{
    upsertMemtable: (op: Op) => void;
    handleFlush: () => void;
    handleCompact: () => void;
    lookup: (k: string) => void;
  } | null>(null);

  function log(tone: Event["tone"], text: string) {
    setEvents((prev) => {
      const next = [...prev, { id: nextEventId, tone, text }];
      setNextEventId((n) => n + 1);
      return next.slice(-40);
    });
  }

  function upsertMemtable(op: Op) {
    setMemtable((prev) => {
      const idx = prev.findIndex((e) => e.key === op.key);
      if (idx === -1) return [...prev, op];
      const next = prev.slice();
      next[idx] = op;
      return next;
    });
    setWal((prev) => [...prev, op]);
  }

  function handleAdd() {
    const k = keyInput.trim();
    const v = valueInput.trim();
    if (!k || !v) return;
    upsertMemtable({ key: k, value: v });
    log("wal", `append "${k}=${v}" to WAL, then memtable`);
    setKeyInput("");
    setValueInput("");
  }

  function handleDelete(key: string) {
    upsertMemtable({ key, value: null });
    log("wal", `append tombstone for "${key}" to WAL, then memtable`);
  }

  function handleFlush() {
    if (memtable.length === 0) {
      log("info", "memtable is empty, nothing to flush");
      return;
    }
    const sorted = [...memtable].sort((a, b) => a.key.localeCompare(b.key));
    const id = nextId;
    setTables((prev) => [{ id, level: 0, entries: sorted }, ...prev]);
    setNextId((n) => n + 1);
    setMemtable([]);
    setWal([]);
    log("flush", `flush memtable → sstable-${id} at L0; WAL truncated`);
  }

  function mergeEntries(entries: Op[][]): Op[] {
    const merged = new Map<string, Op>();
    for (let i = entries.length - 1; i >= 0; i--) {
      for (const e of entries[i]) merged.set(e.key, e);
    }
    return Array.from(merged.values());
  }

  function handleCompact() {
    if (strategy === "tiered") return compactTiered();
    return compactLeveled();
  }

  function compactTiered() {
    const byLevel = new Map<number, SSTable[]>();
    for (const t of tables) {
      const arr = byLevel.get(t.level) ?? [];
      arr.push(t);
      byLevel.set(t.level, arr);
    }
    const ripe = [...byLevel.entries()]
      .filter(([, arr]) => arr.length >= TIER_TRIGGER)
      .sort((a, b) => a[0] - b[0]);
    if (ripe.length === 0) {
      log("info", `no tier has ≥ ${TIER_TRIGGER} sstables yet`);
      return;
    }
    const [level, arr] = ripe[0];
    const ids = arr.map((t) => t.id);
    const merged = mergeEntries(arr.map((t) => t.entries))
      .filter((e) => e.value !== null || level > 0 ? true : e.value !== null)
      .sort((a, b) => a.key.localeCompare(b.key));
    const newId = nextId;
    setTables((prev) => [
      { id: newId, level: level + 1, entries: merged },
      ...prev.filter((t) => !ids.includes(t.id)),
    ]);
    setNextId((n) => n + 1);
    log(
      "compact",
      `tiered: merged sstables ${ids.map((i) => `sstable-${i}`).join(", ")} → sstable-${newId} at L${level + 1}`,
    );
  }

  function compactLeveled() {
    const l0 = tables.filter((t) => t.level === 0);
    if (l0.length < L0_TRIGGER) {
      log(
        "info",
        `leveled: L0 has ${l0.length} sstable${l0.length === 1 ? "" : "s"}, need ≥ ${L0_TRIGGER}`,
      );
      return;
    }
    const l1 = tables.find((t) => t.level === 1);
    const inputs = l1 ? [...l0, l1] : l0;
    const merged = mergeEntries(inputs.map((t) => t.entries))
      .filter((e) => e.value !== null)
      .sort((a, b) => a.key.localeCompare(b.key));
    const newId = nextId;
    const inputIds = inputs.map((t) => t.id);
    setTables((prev) => [
      { id: newId, level: 1, entries: merged },
      ...prev.filter((t) => !inputIds.includes(t.id)),
    ]);
    setNextId((n) => n + 1);
    log(
      "compact",
      `leveled: merged ${inputs.map((t) => `sstable-${t.id}`).join(", ")} → one sstable-${newId} at L1`,
    );
  }

  function handleLookup() {
    const k = lookupKey.trim();
    if (!k) return;

    const inMem = memtable.find((e) => e.key === k);
    if (inMem) {
      log(
        "read",
        `get("${k}") → memtable hit: ${inMem.value === null ? "tombstone" : `"${inMem.value}"`}`,
      );
      return;
    }
    log("read", `get("${k}") → memtable miss, walking sstables newest-first`);

    const sorted = [...tables].sort((a, b) =>
      a.level !== b.level ? a.level - b.level : b.id - a.id,
    );
    for (const t of sorted) {
      const hit = t.entries.find((e) => e.key === k);
      if (hit) {
        log(
          "read",
          `  sstable-${t.id} (L${t.level}) → ${hit.value === null ? "tombstone (deleted)" : `"${hit.value}"`}`,
        );
        return;
      }
      log("read", `  sstable-${t.id} (L${t.level}) → miss`);
    }
    log("read", `  not found`);
  }

  function handleReset() {
    cancelRef.current = true;
    setRunning(false);
    setMemtable([]);
    setWal([]);
    setTables([]);
    setNextId(1);
    setEvents([{ id: 0, tone: "info", text: "reset." }]);
    setNextEventId(1);
  }

  function sleep(ms: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
  }

  apiRef.current = {
    upsertMemtable,
    handleFlush,
    handleCompact,
    lookup: (k: string) => {
      setLookupKey(k);
      handleLookup();
    },
  };

  async function handleRunDemo() {
    if (running) {
      cancelRef.current = true;
      return;
    }
    cancelRef.current = false;
    setRunning(true);

    setMemtable([]);
    setWal([]);
    setTables([]);
    setNextId(1);
    setEvents([{ id: 0, tone: "info", text: "▶ running scripted demo" }]);
    setNextEventId(1);

    const step = async (fn: () => void, ms = 700) => {
      if (cancelRef.current) throw new Error("cancelled");
      fn();
      await sleep(ms);
    };

    const put = (key: string, value: string | null, note?: string) => {
      apiRef.current?.upsertMemtable({ key, value });
      const human =
        value === null
          ? `tombstone "${key}"`
          : `append "${key}=${value}" to WAL, then memtable`;
      log("wal", note ?? human);
    };

    try {
      await step(() => put("omar", "engineer"));
      await step(() => put("mohammed", "musician"));
      await step(() => put("fatma", "baker"), 900);

      await step(() => apiRef.current?.handleFlush(), 1100);

      await step(() =>
        put(
          "omar",
          "architect",
          `overwrite "omar" with "architect" (old value still in sstable-1)`,
        ),
      );
      await step(() => put("ahmed", "barista"), 900);

      await step(
        () =>
          log(
            "info",
            `now let's delete "mohammed". since sstables are immutable, we can't go back and erase the old line. we write a tombstone instead.`,
          ),
        1100,
      );
      await step(
        () =>
          put(
            "mohammed",
            null,
            `tombstone "mohammed" → memtable now has the deletion marker (⌀)`,
          ),
        1300,
      );

      await step(() => put("salma", "pilot"), 900);

      await step(
        () =>
          log(
            "info",
            `flush carries the tombstone into sstable-2. the original "mohammed=musician" still lives in sstable-1, but the newer tombstone shadows it on reads.`,
          ),
        1300,
      );
      await step(() => apiRef.current?.handleFlush(), 1300);

      await step(() => put("noor", "teacher"), 900);
      await step(() => put("youssef", "doctor"), 900);

      await step(() => apiRef.current?.handleFlush(), 1100);

      await step(
        () =>
          log(
            "info",
            `L0 now has 3 sstables. time to compact. watch "mohammed" disappear: the tombstone meets the live row in sstable-1, both are dropped.`,
          ),
        1500,
      );
      await step(() => apiRef.current?.handleCompact(), 1500);

      await step(
        () =>
          log(
            "info",
            `read "mohammed": the merged file no longer contains it.`,
          ),
        700,
      );
      await step(() => apiRef.current?.lookup("mohammed"), 1100);

      await step(
        () =>
          log("info", `read "omar": the newer overwrite "architect" wins.`),
        700,
      );
      await step(() => apiRef.current?.lookup("omar"), 1100);

      await step(() => log("info", `done. play around, or hit reset.`), 400);
    } catch (e) {
      log("info", `demo cancelled.`);
    } finally {
      setRunning(false);
    }
  }

  const sortedMemtable = useMemo(
    () => [...memtable].sort((a, b) => a.key.localeCompare(b.key)),
    [memtable],
  );

  const levels = useMemo(() => {
    const map = new Map<number, SSTable[]>();
    for (const t of tables) {
      const arr = map.get(t.level) ?? [];
      arr.push(t);
      map.set(t.level, arr);
    }
    for (const arr of map.values()) arr.sort((a, b) => b.id - a.id);
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [tables]);

  return (
    <div className="sst">
      <div className="sst-controls">
        <div className="sst-row">
          <input
            className="sst-input"
            placeholder="key"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <input
            className="sst-input"
            placeholder="value"
            value={valueInput}
            onChange={(e) => setValueInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button className="sst-btn sst-btn-primary" onClick={handleAdd}>
            put
          </button>
        </div>

        <div className="sst-row">
          <input
            className="sst-input"
            placeholder="lookup key"
            value={lookupKey}
            onChange={(e) => setLookupKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
          />
          <button className="sst-btn" onClick={handleLookup}>
            get
          </button>
        </div>

        <div className="sst-row">
          <button className="sst-btn sst-btn-warn" onClick={handleFlush}>
            flush memtable
          </button>
          <button className="sst-btn sst-btn-ghost" onClick={handleCompact}>
            compact
          </button>
          <button
            className={`sst-btn ${running ? "sst-btn-running" : "sst-btn-demo"}`}
            onClick={handleRunDemo}
          >
            {running ? "■ stop demo" : "▶ run demo"}
          </button>
          <button className="sst-btn" onClick={handleReset}>
            reset
          </button>
        </div>

        <div className="sst-row sst-strategy">
          <span className="sst-strategy-label">compaction:</span>
          <button
            className={`sst-pill ${strategy === "tiered" ? "active" : ""}`}
            onClick={() => {
              setStrategy("tiered");
              log("info", `compaction strategy → size-tiered`);
            }}
          >
            size-tiered
          </button>
          <button
            className={`sst-pill ${strategy === "leveled" ? "active" : ""}`}
            onClick={() => {
              setStrategy("leveled");
              log("info", `compaction strategy → leveled`);
            }}
          >
            leveled
          </button>
          <span className="sst-strategy-hint">
            {strategy === "tiered"
              ? `merge ≥ ${TIER_TRIGGER} sstables of same level into the next level`
              : `when L0 has ≥ ${L0_TRIGGER} sstables, merge them into the single L1 file`}
          </span>
        </div>
      </div>

      <div className="sst-grid">
        <section className="sst-panel">
          <header className="sst-panel-head">
            <h4>WAL</h4>
            <span>{wal.length} entr{wal.length === 1 ? "y" : "ies"} · append-only</span>
          </header>
          {wal.length === 0 ? (
            <p className="sst-empty">truncated. write to refill.</p>
          ) : (
            <ol className="sst-wal">
              {wal.map((e, i) => (
                <li key={i}>
                  <span className="sst-ln">{i + 1}</span>
                  <span className="sst-key">{e.key}</span>
                  <span className="sst-arrow">→</span>
                  <span className={`sst-val ${e.value === null ? "tomb" : ""}`}>
                    {e.value === null ? TOMBSTONE : e.value}
                  </span>
                </li>
              ))}
            </ol>
          )}
          <p className="sst-foot">crash-safe replay source for the memtable.</p>
        </section>

        <section className="sst-panel">
          <header className="sst-panel-head">
            <h4>event log</h4>
            <span>most recent at the bottom</span>
          </header>
          <div className="sst-events" ref={eventRef}>
            {events.map((ev) => (
              <div key={ev.id} className={`sst-event tone-${ev.tone}`}>
                <span className="sst-event-tag">{ev.tone}</span>
                <span>{ev.text}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="sst-board">
        <Section title="memtable" subtitle="mutable · in-memory">
          {sortedMemtable.length === 0 ? (
            <Empty>flushed</Empty>
          ) : (
            <Table entries={sortedMemtable} onDelete={handleDelete} mutable />
          )}
        </Section>

        {levels.map(([level, arr]) => (
          <div key={level} className="sst-level">
            <div className="sst-level-label">L{level}</div>
            <div className="sst-level-stack">
              {arr.map((t) => (
                <Section
                  key={t.id}
                  title={`sstable-${t.id}`}
                  subtitle={`L${t.level} · ${t.entries.length} keys`}
                >
                  <Table entries={t.entries} />
                </Section>
              ))}
            </div>
          </div>
        ))}

        {tables.length === 0 && (
          <p className="sst-hint">
            put some entries, then flush to materialize an sstable at L0.
          </p>
        )}
      </div>

      <DemoStyles />
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="sst-section">
      <header className="sst-section-head">
        <h4>{title}</h4>
        <span>{subtitle}</span>
      </header>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="sst-empty">{children}</p>;
}

function Table({
  entries,
  onDelete,
  mutable = false,
}: {
  entries: Op[];
  onDelete?: (k: string) => void;
  mutable?: boolean;
}) {
  return (
    <ul className="sst-list">
      {entries.map((e) => (
        <li key={e.key} className={e.value === null ? "tombstone" : ""}>
          <span className="sst-key">{e.key}</span>
          <span className="sst-arrow">→</span>
          <span className="sst-val">
            {e.value === null ? TOMBSTONE : e.value}
          </span>
          {mutable && onDelete && e.value !== null && (
            <button
              className="sst-x"
              onClick={() => onDelete(e.key)}
              aria-label={`delete ${e.key}`}
              title="write tombstone"
            >
              ×
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

function DemoStyles() {
  return (
    <style>{`
      .sst {
        font-family: var(--mono);
        font-size: 0.92rem;
        background: var(--bg-soft);
        border: 1px solid var(--bg2);
        border-radius: 8px;
        padding: 1.25rem;
        margin: 2rem 0;
        color: var(--fg);
      }
      .sst-controls { display: flex; flex-direction: column; gap: 0.6rem; }
      .sst-row { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
      .sst-input {
        flex: 1 1 8rem;
        background: var(--bg);
        border: 1px solid var(--bg2);
        color: var(--fg);
        padding: 0.45rem 0.7rem;
        border-radius: 4px;
        font-family: var(--mono);
        font-size: 0.9rem;
      }
      .sst-input:focus { outline: 1px solid var(--aqua); border-color: var(--aqua); }
      .sst-btn {
        background: var(--bg);
        color: var(--fg-dim);
        border: 1px solid var(--bg2);
        padding: 0.45rem 0.85rem;
        border-radius: 4px;
        cursor: pointer;
        font-family: var(--mono);
        font-size: 0.85rem;
        transition: background 100ms, color 100ms, border-color 100ms;
      }
      .sst-btn:hover:not(:disabled) { background: var(--bg2); color: var(--yellow); border-color: var(--yellow); }
      .sst-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      .sst-btn-primary { color: var(--green); border-color: color-mix(in srgb, var(--green) 50%, transparent); }
      .sst-btn-primary:hover:not(:disabled) { color: var(--bg); background: var(--green); border-color: var(--green); }
      .sst-btn-warn { color: var(--orange); border-color: color-mix(in srgb, var(--orange) 50%, transparent); }
      .sst-btn-warn:hover:not(:disabled) { color: var(--bg); background: var(--orange); border-color: var(--orange); }
      .sst-btn-ghost { color: var(--purple); border-color: color-mix(in srgb, var(--purple) 50%, transparent); }
      .sst-btn-ghost:hover:not(:disabled) { color: var(--bg); background: var(--purple); border-color: var(--purple); }
      .sst-btn-demo { color: var(--aqua); border-color: color-mix(in srgb, var(--aqua) 50%, transparent); }
      .sst-btn-demo:hover:not(:disabled) { color: var(--bg); background: var(--aqua); border-color: var(--aqua); }
      .sst-btn-running { color: var(--bg); background: var(--red); border-color: var(--red); }

      .sst-strategy { gap: 0.4rem; }
      .sst-strategy-label { color: var(--gray); font-size: 0.78rem; }
      .sst-pill {
        background: var(--bg);
        color: var(--fg-soft);
        border: 1px solid var(--bg2);
        border-radius: 999px;
        padding: 0.25rem 0.7rem;
        font-family: var(--mono);
        font-size: 0.78rem;
        cursor: pointer;
        transition: color 100ms, border-color 100ms, background 100ms;
      }
      .sst-pill:hover { color: var(--yellow); border-color: var(--yellow); }
      .sst-pill.active { color: var(--bg); background: var(--aqua); border-color: var(--aqua); }
      .sst-strategy-hint {
        color: var(--gray);
        font-size: 0.74rem;
        font-style: italic;
        margin-left: 0.4rem;
      }

      .sst-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
        gap: 0.85rem;
        margin-top: 1rem;
      }
      @media (max-width: 720px) {
        .sst-grid { grid-template-columns: 1fr; }
      }

      .sst-panel {
        background: var(--bg);
        border: 1px solid var(--bg2);
        border-radius: 6px;
        padding: 0.8rem 0.9rem;
        display: flex;
        flex-direction: column;
        min-height: 12rem;
      }
      .sst-panel-head {
        display: flex; justify-content: space-between; align-items: baseline;
        margin-bottom: 0.55rem; gap: 0.5rem;
      }
      .sst-panel-head h4 {
        margin: 0; font-size: 0.82rem; color: var(--yellow); letter-spacing: 0.05em;
      }
      .sst-panel-head span { font-size: 0.7rem; color: var(--gray); }

      .sst-wal {
        list-style: none; padding: 0; margin: 0;
        font-size: 0.82rem;
        flex: 1;
        overflow-y: auto;
        max-height: 14rem;
      }
      .sst-wal li {
        display: grid;
        grid-template-columns: 1.6em 1fr auto 1fr;
        align-items: center;
        gap: 0.4rem;
        padding: 0.18rem 0;
        border-bottom: 1px dashed var(--bg2);
      }
      .sst-ln { color: var(--gray); font-size: 0.72rem; text-align: right; }

      .sst-foot {
        margin: 0.5rem 0 0;
        padding-top: 0.5rem;
        border-top: 1px solid var(--bg2);
        color: var(--gray);
        font-size: 0.74rem;
        font-style: italic;
      }

      .sst-events {
        flex: 1;
        overflow-y: auto;
        max-height: 14rem;
        font-size: 0.78rem;
        line-height: 1.5;
        font-family: var(--mono);
      }
      .sst-event {
        display: grid;
        grid-template-columns: 5em 1fr;
        gap: 0.5rem;
        padding: 0.18rem 0;
        border-bottom: 1px dashed var(--bg2);
        color: var(--fg-soft);
      }
      .sst-event-tag {
        font-size: 0.68rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--gray);
      }
      .tone-wal .sst-event-tag { color: var(--blue); }
      .tone-flush .sst-event-tag { color: var(--orange); }
      .tone-compact .sst-event-tag { color: var(--purple); }
      .tone-read .sst-event-tag { color: var(--aqua); }
      .tone-info .sst-event-tag { color: var(--gray); }

      .sst-board {
        display: flex;
        gap: 0.85rem;
        overflow-x: auto;
        padding: 1.5rem 0 0.5rem;
        align-items: flex-start;
      }
      .sst-level {
        display: flex; flex-direction: column; gap: 0.4rem; flex: 0 0 auto;
      }
      .sst-level-label {
        font-size: 0.72rem; color: var(--yellow);
        letter-spacing: 0.1em; padding-left: 0.2rem;
      }
      .sst-level-stack { display: flex; gap: 0.6rem; }

      .sst-section {
        background: var(--bg);
        border: 1px solid var(--bg2);
        border-radius: 6px;
        padding: 0.8rem 0.9rem;
        min-width: 14rem;
        flex: 0 0 auto;
      }
      .sst-section-head {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 0.6rem;
        gap: 0.5rem;
      }
      .sst-section-head h4 { margin: 0; font-size: 0.85rem; color: var(--yellow); letter-spacing: 0.04em; }
      .sst-section-head span { font-size: 0.7rem; color: var(--gray); }

      .sst-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.25rem; }
      .sst-list li {
        display: grid;
        grid-template-columns: 1fr auto 1fr auto;
        align-items: center;
        gap: 0.4rem;
        padding: 0.3rem 0.4rem;
        border-radius: 3px;
        background: var(--bg-soft);
      }
      .sst-list li.tombstone { color: var(--gray); text-decoration: line-through; opacity: 0.7; }
      .sst-key { color: var(--blue); }
      .sst-arrow { color: var(--gray); }
      .sst-val { color: var(--fg); }
      .sst-val.tomb { color: var(--red); text-decoration: line-through; }
      .sst-list li.tombstone .sst-val { color: var(--red); text-decoration: none; }
      .sst-x {
        background: transparent; border: none; color: var(--gray);
        cursor: pointer; font-size: 1rem; line-height: 1; padding: 0 0.2rem;
      }
      .sst-x:hover { color: var(--red); }

      .sst-empty { color: var(--gray); font-style: italic; margin: 0; font-size: 0.85rem; }
      .sst-hint { color: var(--gray); font-style: italic; align-self: center; padding: 1rem; margin: 0; }
    `}</style>
  );
}
