import { useEffect, useRef, useState } from "react";

type LogLine = { n: number; key: string; value: string };
type ShellLine =
    | { kind: "input"; text: string }
    | { kind: "output"; text: string; tone?: "ok" | "warn" | "info" };

const PRELOAD: ShellLine[] = [
    { kind: "output", text: "" },
    {
        kind: "output",
        text: `try:\n·db_set 42 cat   \n·db_set 42 dog   \n·db_get 42`,
        tone: "info",
    },
];

export default function BashShellDemo() {
    const [log, setLog] = useState<LogLine[]>([]);
    const [history, setHistory] = useState<ShellLine[]>(PRELOAD);
    const [cmd, setCmd] = useState("");
    const [scanCount, setScanCount] = useState<number | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    function append(lines: ShellLine[]) {
        setHistory((prev) => [...prev, ...lines]);
    }

    function runCommand(raw: string) {
        const trimmed = raw.trim();
        if (!trimmed) return;
        append([{ kind: "input", text: trimmed }]);

        const tokens = trimmed.split(/\s+/);
        const op = tokens[0];

        if (op === "db_set") {
            if (tokens.length < 3) {
                append([
                    { kind: "output", text: "usage: db_set KEY VALUE", tone: "warn" },
                ]);
                return;
            }
            const key = tokens[1];
            const value = tokens.slice(2).join(" ");
            setLog((prev) => [...prev, { n: prev.length + 1, key, value }]);
            setScanCount(null);
            return;
        }

        if (op === "db_get") {
            if (tokens.length !== 2) {
                append([{ kind: "output", text: "usage: db_get KEY", tone: "warn" }]);
                return;
            }
            const key = tokens[1];
            let scanned = 0;
            let last: LogLine | null = null;
            for (const line of log) {
                scanned += 1;
                if (line.key === key) last = line;
            }
            setScanCount(scanned);
            if (last) {
                append([
                    { kind: "output", text: last.value, tone: "ok" },
                    {
                        kind: "output",
                        text: `# scanned ${scanned} line${scanned === 1 ? "" : "s"} to find the latest write`,
                        tone: "info",
                    },
                ]);
            } else {
                append([
                    {
                        kind: "output",
                        text: `# scanned ${scanned} line${scanned === 1 ? "" : "s"}, no match`,
                        tone: "info",
                    },
                ]);
            }
            return;
        }

        if (op === "cat" && tokens[1] === "database") {
            if (log.length === 0) {
                append([{ kind: "output", text: "(empty)", tone: "info" }]);
                return;
            }
            append(
                log.map((l) => ({
                    kind: "output" as const,
                    text: `${l.key},${l.value}`,
                })),
            );
            return;
        }

        if (op === "clear") {
            setHistory(PRELOAD);
            setScanCount(null);
            return;
        }

        if (op === "reset") {
            setLog([]);
            setHistory(PRELOAD);
            setScanCount(null);
            return;
        }

        if (op === "help") {
            append([
                { kind: "output", text: "db_set KEY VALUE", tone: "info" },
                { kind: "output", text: "db_get KEY", tone: "info" },
                { kind: "output", text: "cat database", tone: "info" },
                { kind: "output", text: "clear · reset", tone: "info" },
            ]);
            return;
        }

        append([
            {
                kind: "output",
                text: `${op}: command not found (try help)`,
                tone: "warn",
            },
        ]);
    }

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        runCommand(cmd);
        setCmd("");
    }

    function quick(text: string) {
        runCommand(text);
    }

    return (
        <div className="sh">
            <div className="sh-pane">
                <header className="sh-head">
                    <span className="sh-dot sh-dot-r" />
                    <span className="sh-dot sh-dot-y" />
                    <span className="sh-dot sh-dot-g" />
                    <span className="sh-title">~ / db.sh</span>
                </header>

                <div className="sh-screen" ref={scrollRef}>
                    {history.map((line, i) =>
                        line.kind === "input" ? (
                            <div className="sh-line sh-input" key={i}>
                                <span className="sh-prompt">$</span> {line.text}
                            </div>
                        ) : (
                            <div
                                className={`sh-line sh-out ${line.tone ? `sh-tone-${line.tone}` : ""}`}
                                key={i}
                            >
                                {line.text || " "}
                            </div>
                        ),
                    )}
                </div>

                <form className="sh-form" onSubmit={onSubmit}>
                    <span className="sh-prompt">$</span>
                    <input
                        className="sh-cmd"
                        value={cmd}
                        onChange={(e) => setCmd(e.target.value)}
                        placeholder="db_set 42 cat"
                        autoComplete="off"
                        spellCheck={false}
                    />
                </form>

                <div className="sh-quick">
                    <button
                        type="button"
                        className="sh-chip"
                        onClick={() => quick("db_set 42 cat")}
                    >
                        db_set 42 cat
                    </button>
                    <button
                        type="button"
                        className="sh-chip"
                        onClick={() => quick("db_set 42 dog")}
                    >
                        db_set 42 dog
                    </button>
                    <button
                        type="button"
                        className="sh-chip"
                        onClick={() => quick("db_get 42")}
                    >
                        db_get 42
                    </button>
                    <button
                        type="button"
                        className="sh-chip"
                        onClick={() => quick("cat database")}
                    >
                        cat database
                    </button>
                    <button type="button" className="sh-chip" onClick={() => quick("reset")}>
                        reset
                    </button>
                </div>
            </div>

            <aside className="sh-side">
                <header className="sh-side-head">
                    <h4>database</h4>
                    <span>{log.length} line{log.length === 1 ? "" : "s"}</span>
                </header>
                {log.length === 0 ? (
                    <p className="sh-empty">
                        empty file. run <code>db_set</code> to append a line.
                    </p>
                ) : (
                    <ol className="sh-log">
                        {log.map((l) => (
                            <li key={l.n}>
                                <span className="sh-ln">{l.n}</span>
                                <span className="sh-pair">
                                    <span className="sh-k">{l.key}</span>
                                    <span className="sh-comma">,</span>
                                    <span className="sh-v">{l.value}</span>
                                </span>
                            </li>
                        ))}
                    </ol>
                )}
                {scanCount !== null && log.length > 0 && (
                    <p className="sh-meter">
                        last <code>db_get</code> walked{" "}
                        <strong>
                            {scanCount}/{log.length}
                        </strong>{" "}
                        line{log.length === 1 ? "" : "s"}.
                    </p>
                )}
            </aside>

            <DemoStyles />
        </div>
    );
}

function DemoStyles() {
    return (
        <style>{`
      .sh {
        display: grid;
        grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
        gap: 1rem;
        font-family: var(--mono);
        color: var(--fg);
        background: var(--bg-soft);
        border: 1px solid var(--bg2);
        border-radius: 8px;
        padding: 1rem;
        margin: 2rem 0;
      }
      @media (max-width: 720px) {
        .sh { grid-template-columns: 1fr; }
      }

      .sh-pane {
        background: var(--bg);
        border: 1px solid var(--bg2);
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        min-height: 22rem;
      }
      .sh-head {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.55rem 0.75rem;
        border-bottom: 1px solid var(--bg2);
      }
      .sh-dot {
        width: 10px; height: 10px; border-radius: 50%;
        display: inline-block;
      }
      .sh-dot-r { background: var(--red); }
      .sh-dot-y { background: var(--yellow); }
      .sh-dot-g { background: var(--green); }
      .sh-title {
        margin-left: auto;
        font-size: 0.78rem;
        color: var(--gray);
        letter-spacing: 0.06em;
      }

      .sh-screen {
        flex: 1;
        padding: 0.75rem 0.85rem;
        overflow-y: auto;
        font-size: 0.85rem;
        line-height: 1.55;
        max-height: 22rem;
      }
      .sh-line { white-space: pre-wrap; word-break: break-word; }
      .sh-input { color: var(--fg-dim); }
      .sh-prompt { color: var(--green); margin-right: 0.4em; }
      .sh-out { color: var(--fg-soft); }
      .sh-tone-ok { color: var(--aqua); }
      .sh-tone-warn { color: var(--orange); }
      .sh-tone-info { color: var(--gray); font-style: italic; }

      .sh-form {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.5rem 0.85rem;
        border-top: 1px solid var(--bg2);
      }
      .sh-cmd {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        color: var(--fg);
        font-family: var(--mono);
        font-size: 0.9rem;
        padding: 0.2rem 0;
      }
      .sh-cmd::placeholder { color: var(--bg3); }

      .sh-quick {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
        padding: 0 0.6rem 0.6rem;
      }
      .sh-chip {
        background: var(--bg);
        color: var(--fg-soft);
        border: 1px solid var(--bg2);
        border-radius: 999px;
        padding: 0.22rem 0.65rem;
        font-family: var(--mono);
        font-size: 0.75rem;
        cursor: pointer;
        transition: color 100ms, border-color 100ms;
      }
      .sh-chip:hover { color: var(--yellow); border-color: var(--yellow); }

      .sh-side {
        background: var(--bg);
        border: 1px solid var(--bg2);
        border-radius: 6px;
        padding: 0.85rem 0.95rem;
        display: flex;
        flex-direction: column;
        min-height: 22rem;
      }
      .sh-side-head {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 0.55rem;
      }
      .sh-side-head h4 {
        margin: 0;
        font-size: 0.82rem;
        color: var(--yellow);
        letter-spacing: 0.05em;
      }
      .sh-side-head span {
        font-size: 0.72rem;
        color: var(--gray);
      }

      .sh-empty {
        color: var(--gray); font-style: italic; margin: 0;
        font-size: 0.85rem;
      }
      .sh-log {
        list-style: none; padding: 0; margin: 0;
        font-size: 0.85rem;
        flex: 1;
        overflow-y: auto;
        max-height: 18rem;
      }
      .sh-log li {
        display: flex;
        gap: 0.6rem;
        align-items: baseline;
        padding: 0.18rem 0;
        border-bottom: 1px dashed var(--bg2);
      }
      .sh-ln {
        color: var(--gray);
        font-size: 0.72rem;
        min-width: 1.6em;
        text-align: right;
      }
      .sh-pair { color: var(--fg); }
      .sh-k { color: var(--blue); }
      .sh-comma { color: var(--gray); margin: 0 0.15em; }
      .sh-v { color: var(--fg); }

      .sh-meter {
        margin: 0.6rem 0 0;
        padding-top: 0.6rem;
        border-top: 1px solid var(--bg2);
        color: var(--fg-soft);
        font-size: 0.78rem;
      }
      .sh-meter strong { color: var(--orange); font-weight: 600; }
      .sh-meter code {
        background: var(--bg-soft);
        color: var(--aqua);
        padding: 0.05em 0.35em;
        border-radius: 3px;
        font-size: 0.85em;
      }
    `}</style>
    );
}
