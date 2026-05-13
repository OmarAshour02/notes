import { useRef, useState } from "react";

type Mode = "string" | "i32";
type Slot =
  | { kind: "uninit" }
  | { kind: "owns" }
  | { kind: "moved" }
  | { kind: "i32"; v: number };

type Status = { tone: "ok" | "err" | "info"; text: string };

export default function OwnershipDemo() {
  const [mode, setMode] = useState<Mode>("string");
  const [a, setA] = useState<Slot>({ kind: "uninit" });
  const [b, setB] = useState<Slot>({ kind: "uninit" });
  const [status, setStatus] = useState<Status>({
    tone: "info",
    text: "click let a = … to begin.",
  });
  const [running, setRunning] = useState(false);
  const [pressed, setPressed] = useState<string | null>(null);
  const cancelRef = useRef(false);

  function reset(next: Mode = mode) {
    cancelRef.current = true;
    setRunning(false);
    setPressed(null);
    setMode(next);
    setA({ kind: "uninit" });
    setB({ kind: "uninit" });
    setStatus({
      tone: "info",
      text:
        next === "string"
          ? "String mode. assignment moves ownership."
          : "i32 mode. i32 is Copy, assignment duplicates.",
    });
  }

  function bindA() {
    if (mode === "string") {
      setA({ kind: "owns" });
      setStatus({ tone: "ok", text: `a now owns the heap "hello".` });
    } else {
      setA({ kind: "i32", v: 42 });
      setStatus({ tone: "ok", text: `a = 42 (lives on the stack).` });
    }
  }

  function assignBfromA() {
    if (a.kind === "uninit") {
      setStatus({
        tone: "err",
        text: `error: cannot find value \`a\` in this scope.`,
      });
      return;
    }
    if (a.kind === "moved") {
      setStatus({
        tone: "err",
        text: `error[E0382]: use of moved value: \`a\`.`,
      });
      return;
    }
    if (mode === "string" && a.kind === "owns") {
      setA({ kind: "moved" });
      setB({ kind: "owns" });
      setStatus({
        tone: "ok",
        text: `move: ownership of "hello" passes from a to b. a is no longer valid.`,
      });
    } else if (mode === "i32" && a.kind === "i32") {
      setB({ kind: "i32", v: a.v });
      setStatus({
        tone: "ok",
        text: `copy: a stays valid; b gets its own 42.`,
      });
    }
  }

  function use(name: "a" | "b") {
    const s = name === "a" ? a : b;
    if (s.kind === "uninit") {
      setStatus({
        tone: "err",
        text: `error: cannot find value \`${name}\` in this scope.`,
      });
      return;
    }
    if (s.kind === "moved") {
      setStatus({
        tone: "err",
        text: `error[E0382]: borrow of moved value: \`${name}\`.`,
      });
      return;
    }
    if (s.kind === "owns") {
      setStatus({ tone: "ok", text: `prints  hello` });
    } else {
      setStatus({ tone: "ok", text: `prints  ${s.v}` });
    }
  }

  function sleep(ms: number) {
    return new Promise<void>((r) => setTimeout(r, ms));
  }

  async function runScripted() {
    if (running) {
      cancelRef.current = true;
      return;
    }
    cancelRef.current = false;
    setRunning(true);
    setPressed(null);
    setA({ kind: "uninit" });
    setB({ kind: "uninit" });
    await sleep(400);

    const narrate = async (text: string, ms = 1800) => {
      if (cancelRef.current) throw new Error("cancelled");
      setStatus({ tone: "info", text });
      await sleep(ms);
    };

    const press = async (id: string, fn: () => void, ms = 1800) => {
      if (cancelRef.current) throw new Error("cancelled");
      setPressed(id);
      await sleep(550);
      fn();
      await sleep(ms);
      setPressed(null);
      await sleep(250);
    };

    try {
      if (mode === "string") {
        await narrate(`first, give a a fresh String. watch the heap appear.`, 1500);
        await press("bind", () => {
          setA({ kind: "owns" });
          setStatus({ tone: "ok", text: `a now owns the heap "hello".` });
        });
        await narrate(`now read a. it owns the value, so this works.`, 1500);
        await press("useA", () => {
          setStatus({ tone: "ok", text: `prints  hello` });
        });
        await narrate(
          `next: let b = a. for String this is a move, not a copy.`,
          2200,
        );
        await press(
          "assign",
          () => {
            setA({ kind: "moved" });
            setB({ kind: "owns" });
            setStatus({
              tone: "ok",
              text: `move: ownership of "hello" passes from a to b. a is no longer valid.`,
            });
          },
          2200,
        );
        await narrate(
          `now try to read a. it was moved, so the compiler stops us.`,
          2200,
        );
        await press(
          "useA",
          () => {
            setStatus({
              tone: "err",
              text: `error[E0382]: borrow of moved value: \`a\`.`,
            });
          },
          2000,
        );
        await narrate(`but b is the new owner. reading b works.`, 1500);
        await press("useB", () => {
          setStatus({ tone: "ok", text: `prints  hello` });
        });
        await narrate(
          `one allocation, one owner. when b goes out of scope, "hello" is freed.`,
          400,
        );
      } else {
        await narrate(`first, let a = 42. i32 lives on the stack.`, 1500);
        await press("bind", () => {
          setA({ kind: "i32", v: 42 });
          setStatus({ tone: "ok", text: `a = 42 (lives on the stack).` });
        });
        await narrate(
          `i32 is a Copy type. let b = a duplicates the bits, so a stays valid.`,
          2200,
        );
        await press(
          "assign",
          () => {
            setB({ kind: "i32", v: 42 });
            setStatus({
              tone: "ok",
              text: `copy: a stays valid; b gets its own 42.`,
            });
          },
          2000,
        );
        await narrate(`read a. it is still here.`, 1500);
        await press("useA", () => {
          setStatus({ tone: "ok", text: `prints  42` });
        });
        await narrate(`read b. its own copy of 42.`, 1500);
        await press("useB", () => {
          setStatus({ tone: "ok", text: `prints  42` });
        });
        await narrate(
          `no heap, no move, no error. small things just copy.`,
          400,
        );
      }
    } catch {
      setStatus({ tone: "info", text: `demo cancelled.` });
    } finally {
      setPressed(null);
      setRunning(false);
    }
  }

  const showHeap = mode === "string";
  const aOwns = a.kind === "owns";
  const bOwns = b.kind === "owns";

  return (
    <div className="own">
      <div className="own-modes">
        <span className="own-modes-label">type:</span>
        <button
          className={`own-pill ${mode === "string" ? "active" : ""}`}
          onClick={() => reset("string")}
        >
          String
        </button>
        <button
          className={`own-pill ${mode === "i32" ? "active" : ""}`}
          onClick={() => reset("i32")}
        >
          i32
        </button>
        <span className="own-modes-hint">
          {mode === "string"
            ? "assignment moves; old name becomes invalid."
            : "i32 is Copy; assignment duplicates."}
        </span>
      </div>

      <div className={`own-board ${showHeap ? "has-heap" : ""}`}>
        <div className="own-row-label own-area-stacklbl">stack</div>
        <div className="own-area-slotA">
          <SlotBox name="a" state={a} />
        </div>
        <div className="own-area-slotB">
          <SlotBox name="b" state={b} />
        </div>

        {showHeap && (
          <>
            <div className="own-area-arrowA">{aOwns && <Arrow />}</div>
            <div className="own-area-arrowB">{bOwns && <Arrow />}</div>
            <div className="own-row-label heap own-area-heaplbl">heap</div>
            <div className="own-area-heapA">
              {aOwns && <HeapBlock />}
            </div>
            <div className="own-area-heapB">
              {bOwns && <HeapBlock />}
            </div>
          </>
        )}
      </div>

      <div className="own-actions">
        <button
          className={`own-btn own-btn-primary ${pressed === "bind" ? "is-pressed" : ""}`}
          onClick={bindA}
        >
          let a = {mode === "string" ? `String::from("hello")` : "42"}
        </button>
        <button
          className={`own-btn ${pressed === "assign" ? "is-pressed" : ""}`}
          onClick={assignBfromA}
        >
          let b = a
        </button>
        <button
          className={`own-btn own-btn-aqua ${pressed === "useA" ? "is-pressed" : ""}`}
          onClick={() => use("a")}
        >
          use a
        </button>
        <button
          className={`own-btn own-btn-aqua ${pressed === "useB" ? "is-pressed" : ""}`}
          onClick={() => use("b")}
        >
          use b
        </button>
        <button
          className={`own-btn ${running ? "own-btn-running" : "own-btn-demo"}`}
          onClick={runScripted}
        >
          {running ? "■ stop" : "▶ run demo"}
        </button>
        <button className="own-btn own-btn-ghost" onClick={() => reset()}>
          reset
        </button>
      </div>

      <div className={`own-status tone-${status.tone}`}>
        <span className="own-status-tag">{status.tone}</span>
        <span>{status.text}</span>
      </div>

      <DemoStyles />
    </div>
  );
}

function SlotBox({ name, state }: { name: "a" | "b"; state: Slot }) {
  let body: React.ReactNode;
  let cls = "own-slot";
  if (state.kind === "uninit") {
    cls += " own-slot-uninit";
    body = <span className="own-slot-sub">uninit</span>;
  } else if (state.kind === "moved") {
    cls += " own-slot-moved";
    body = <span className="own-slot-sub">moved</span>;
  } else if (state.kind === "owns") {
    cls += " own-slot-owns";
    body = <span className="own-slot-ptr">ptr</span>;
  } else {
    cls += " own-slot-i32";
    body = <span className="own-slot-val">{state.v}</span>;
  }
  return (
    <div className={cls}>
      <div className="own-slot-name">{name}</div>
      <div className="own-slot-body">{body}</div>
    </div>
  );
}

function Arrow() {
  return (
    <svg
      className="own-arrow-svg"
      viewBox="0 0 16 36"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <line x1="8" y1="2" x2="8" y2="28" stroke="currentColor" strokeWidth="2" />
      <polygon points="8,34 3,26 13,26" fill="currentColor" />
    </svg>
  );
}

function HeapBlock() {
  return (
    <div className="own-heap-block">
      <div className="own-heap-tag">heap</div>
      <div className="own-heap-val">"hello"</div>
    </div>
  );
}

function DemoStyles() {
  return (
    <style>{`
      .own {
        font-family: var(--mono);
        font-size: 0.92rem;
        background: var(--bg-soft);
        border: 1px solid var(--bg2);
        border-radius: 8px;
        padding: 1.25rem;
        margin: 2rem 0;
        color: var(--fg);
      }

      .own-modes {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;
        margin-bottom: 1rem;
      }
      .own-modes-label { color: var(--gray); font-size: 0.78rem; }
      .own-pill {
        background: var(--bg);
        color: var(--fg-soft);
        border: 1px solid var(--bg2);
        border-radius: 999px;
        padding: 0.25rem 0.8rem;
        font-family: var(--mono);
        font-size: 0.8rem;
        cursor: pointer;
        transition: color 100ms, border-color 100ms, background 100ms;
      }
      .own-pill:hover { color: var(--yellow); border-color: var(--yellow); }
      .own-pill.active { color: var(--bg); background: var(--aqua); border-color: var(--aqua); }
      .own-modes-hint {
        color: var(--gray);
        font-size: 0.74rem;
        font-style: italic;
        margin-left: 0.4rem;
      }

      .own-board {
        display: grid;
        grid-template-columns: auto 1fr 1fr;
        gap: 0.5rem 0.9rem;
        padding: 1.1rem;
        background: var(--bg);
        border: 1px solid var(--bg2);
        border-radius: 6px;
        margin-bottom: 1rem;
      }
      .own-board.has-heap {
        grid-template-areas:
          "stacklbl slotA  slotB"
          ".        arrowA arrowB"
          "heaplbl  heapA  heapB";
      }
      .own-board:not(.has-heap) {
        grid-template-areas: "stacklbl slotA slotB";
      }
      .own-area-stacklbl { grid-area: stacklbl; }
      .own-area-heaplbl  { grid-area: heaplbl; }
      .own-area-slotA    { grid-area: slotA; }
      .own-area-slotB    { grid-area: slotB; }
      .own-area-arrowA   { grid-area: arrowA; }
      .own-area-arrowB   { grid-area: arrowB; }
      .own-area-heapA    { grid-area: heapA; }
      .own-area-heapB    { grid-area: heapB; }

      .own-row-label {
        font-size: 0.7rem;
        color: var(--yellow);
        letter-spacing: 0.14em;
        text-transform: uppercase;
        padding-right: 0.6rem;
        border-right: 1px dashed var(--bg2);
        display: flex;
        align-items: center;
      }
      .own-row-label.heap { color: var(--orange); }

      .own-slot {
        background: var(--bg-soft);
        border: 1px solid var(--bg2);
        border-radius: 6px;
        padding: 0.7rem 0.9rem;
        min-height: 4.6rem;
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        transition: border-color 200ms, background 200ms, opacity 200ms;
      }
      .own-slot-name { font-size: 0.78rem; letter-spacing: 0.06em; color: var(--blue); }
      .own-slot-body { display: flex; align-items: baseline; gap: 0.5rem; }
      .own-slot-ptr { color: var(--green); font-size: 0.95rem; }
      .own-slot-val { color: var(--fg-dim); font-size: 1.15rem; }
      .own-slot-sub { color: var(--gray); font-style: italic; font-size: 0.84rem; }

      .own-slot-uninit { border-style: dashed; }
      .own-slot-uninit .own-slot-name { color: var(--gray); }

      .own-slot-owns { border-color: var(--green); }
      .own-slot-owns .own-slot-name { color: var(--green); }

      .own-slot-i32 { border-color: var(--aqua); }
      .own-slot-i32 .own-slot-name { color: var(--aqua); }

      .own-slot-moved {
        border-color: color-mix(in srgb, var(--red) 40%, transparent);
        background: color-mix(in srgb, var(--red) 7%, transparent);
        opacity: 0.7;
      }
      .own-slot-moved .own-slot-name { color: var(--red); text-decoration: line-through; }

      .own-area-arrowA, .own-area-arrowB {
        display: flex;
        justify-content: center;
        align-items: stretch;
        min-height: 2.2rem;
      }
      .own-arrow-svg {
        width: 16px;
        height: 100%;
        color: var(--green);
      }

      .own-area-heapA, .own-area-heapB {
        min-height: 3.6rem;
        display: flex;
        align-items: stretch;
      }
      .own-heap-block {
        flex: 1;
        background: var(--bg-soft);
        border: 1px solid var(--green);
        border-radius: 6px;
        padding: 0.5rem 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
      }
      .own-heap-tag {
        font-size: 0.62rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--gray);
      }
      .own-heap-val { font-size: 1.05rem; color: var(--orange); }

      .own-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 0.8rem;
      }
      .own-btn {
        background: var(--bg);
        color: var(--fg-dim);
        border: 1px solid var(--bg2);
        padding: 0.45rem 0.8rem;
        border-radius: 4px;
        cursor: pointer;
        font-family: var(--mono);
        font-size: 0.85rem;
        transition: background 100ms, color 100ms, border-color 100ms;
      }
      .own-btn:hover { background: var(--bg2); color: var(--yellow); border-color: var(--yellow); }
      .own-btn-primary { color: var(--green); border-color: color-mix(in srgb, var(--green) 50%, transparent); }
      .own-btn-primary:hover { color: var(--bg); background: var(--green); border-color: var(--green); }
      .own-btn-aqua { color: var(--aqua); border-color: color-mix(in srgb, var(--aqua) 50%, transparent); }
      .own-btn-aqua:hover { color: var(--bg); background: var(--aqua); border-color: var(--aqua); }
      .own-btn-demo { color: var(--purple); border-color: color-mix(in srgb, var(--purple) 50%, transparent); }
      .own-btn-demo:hover { color: var(--bg); background: var(--purple); border-color: var(--purple); }
      .own-btn-running { color: var(--bg); background: var(--red); border-color: var(--red); }
      .own-btn-ghost { color: var(--gray); }

      .own-btn.is-pressed {
        color: var(--bg);
        background: var(--yellow);
        border-color: var(--yellow);
        transform: translateY(1px) scale(0.97);
        box-shadow:
          0 0 0 2px color-mix(in srgb, var(--yellow) 35%, transparent),
          0 0 14px color-mix(in srgb, var(--yellow) 55%, transparent);
        animation: own-press-pulse 550ms ease-out;
      }
      @keyframes own-press-pulse {
        0%   { box-shadow: 0 0 0 0 color-mix(in srgb, var(--yellow) 80%, transparent); }
        70%  { box-shadow: 0 0 0 10px color-mix(in srgb, var(--yellow) 0%,  transparent); }
        100% { box-shadow: 0 0 0 2px color-mix(in srgb, var(--yellow) 35%, transparent); }
      }

      .own-status {
        background: var(--bg);
        border: 1px solid var(--bg2);
        border-left-width: 3px;
        border-radius: 4px;
        padding: 0.55rem 0.85rem;
        font-size: 0.85rem;
        display: flex;
        gap: 0.7rem;
        align-items: baseline;
      }
      .own-status-tag {
        font-size: 0.68rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--gray);
        min-width: 2.6em;
      }
      .own-status.tone-ok { border-left-color: var(--green); }
      .own-status.tone-ok .own-status-tag { color: var(--green); }
      .own-status.tone-err { border-left-color: var(--red); }
      .own-status.tone-err .own-status-tag { color: var(--red); }
      .own-status.tone-info { border-left-color: var(--gray); }
    `}</style>
  );
}
