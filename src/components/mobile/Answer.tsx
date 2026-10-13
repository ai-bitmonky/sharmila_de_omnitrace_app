"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { P, Q } from "@/data/app";
import { Chev, G, M } from "./icons";
import { ScreenShell } from "./LargeTitle";
import { openSourceSheet } from "./shared";
import { useApp, useScreen } from "./store";

/** Answer (pushed from Ask): rooms light up, the answer types itself, sources slide in, the trail line draws. */
export default function Answer() {
  const app = useApp();
  const scr = useScreen();
  const q = Q(scr.entry.param);
  const n = q.src.length;
  const RM = app.RM;
  const [marks, setMarks] = useState(0);
  const [traced, setTraced] = useState(false);
  const [rowsIn, setRowsIn] = useState(0);
  const [text, setText] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);
  const [phase, setPhase] = useState<"run" | "line">("run");
  const [line, setLine] = useState<{ top: number; height: number } | null>(null);
  const [drawn, setDrawn] = useState(false);
  const [lit, setLit] = useState(0);
  const rows = useRef<(HTMLButtonElement | null)[]>([]);
  const leaving = useRef(false);
  leaving.current = !!scr.entry.leaving;

  useEffect(() => {
    let dead = false;
    const timers: number[] = [];
    const wait = (ms: number) => new Promise<void>((r) => { timers.push(window.setTimeout(r, RM ? 0 : ms)); });
    const gone = () => dead || leaving.current;
    (async () => {
      await wait(340);
      for (let i = 0; i < n; i++) { await wait(1200 / n); if (gone()) return; setMarks(i + 1); }
      setTraced(true);
      for (let i = 0; i < n; i++) timers.push(window.setTimeout(() => setRowsIn((k) => Math.max(k, i + 1)), RM ? 0 : i * 90));
      const w = q.t.split(" ");
      setText(""); setTyping(true);
      if (RM) setText(q.t);
      else for (let i = 0; i < w.length; i++) { if (gone()) return; setText(w.slice(0, i + 1).join(" ")); await wait(26); }
      if (gone()) return;
      setTyping(false); setPhase("line");
    })();
    return () => { dead = true; timers.forEach(clearTimeout); };
  }, [q, n, RM]);

  /* measure the trail line once the text has settled, then draw it and light the nodes */
  useLayoutEffect(() => {
    if (phase !== "line") return;
    const r0 = rows.current[0], rn = rows.current[n - 1];
    const a = r0?.querySelector<HTMLElement>(".node"), b = rn?.querySelector<HTMLElement>(".node");
    if (r0 && rn && a && b) setLine({ top: a.offsetTop + r0.offsetTop + 18, height: rn.offsetTop + b.offsetTop - (r0.offsetTop + a.offsetTop) });
    const timers: number[] = [];
    const raf = requestAnimationFrame(() => setDrawn(true));
    for (let i = 0; i < n; i++) timers.push(window.setTimeout(() => setLit((k) => Math.max(k, i + 1)), RM ? 0 : (i * 900) / n));
    return () => { cancelAnimationFrame(raf); timers.forEach(clearTimeout); };
  }, [phase, n, RM]);

  return (
    <ScreenShell title="Answer">
      <h1 className="aq serif">{q.q}</h1>
      <div className="trace mono">
        <span className="tt">{traced ? `${n} rooms · ${n} sources` : `tracing ${n} rooms…`}</span>
        <span className="ms">{q.src.map((s, i) => <M key={i} a={s.a} c={"am" + (i < marks ? " on" : "")} />)}</span>
      </div>
      <p className="at" aria-live="polite">{text != null ? <><span>{text}</span>{typing ? <i className="cur" /> : null}</> : null}</p>
      <h3 className="gh">Sources, in time order</h3>
      <div className={"grp srcs" + (drawn ? " drawn" : "")}>
        <i className="line" style={line ? { top: line.top + "px", height: line.height + "px" } : undefined} />
        {q.src.map((s, i) => (
          <button key={i} ref={(el) => { rows.current[i] = el; }} className={"row tap" + (i < rowsIn ? " in" : "") + (i < lit ? " lit" : "")} onClick={() => openSourceSheet(app, s)}>
            <span className="node"><M a={s.a} /></span>
            <span className="tx"><span className="t1 ell" style={{ display: "block" }}>{s.n} · {s.h}</span><span className="t2 ell" style={{ display: "block" }}>{P[s.w]} · {s.at}, {s.d}</span></span>
            <Chev />
          </button>
        ))}
      </div>
      <div className="btns" style={{ marginTop: 22 }}>
        <button className="btn s" onClick={() => app.toast("Copied link")}><G id="share" />Share</button>
        <button className="btn p" onClick={() => app.toast(q.save || "Saved to Register")}>Save to Register</button>
      </div>
    </ScreenShell>
  );
}
