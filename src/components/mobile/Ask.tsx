"use client";
import { useRef, useState } from "react";
import { DATA, PROJECT, Q, type Question } from "@/data/app";
import { Chev, G } from "./icons";
import { ScreenShell } from "./LargeTitle";
import { useApp } from "./store";

const STOP = /^(why|did|we|the|an|of|to|in|on|is|it|does|do|this|that|what|when|who|where|how|our|and|for|was|last|month)$/;
const words = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length > 1 && !STOP.test(w));
const score = (q: Question, s: string) => { const hay = (q.k + " " + q.q).toLowerCase(); return words(s).reduce((n, w) => n + (hay.includes(w.slice(0, Math.max(3, w.length - 1))) ? 1 : 0), 0); };

export default function Ask() {
  const app = useApp();
  const [v, setV] = useState("");
  const [project, setProject] = useState(PROJECT);
  const inp = useRef<HTMLInputElement>(null);
  const val = v.trim();
  const ok = (q: Question) => !val || score(q, val) > 0;
  const any = DATA.qs.some(ok);

  const projects = () => app.openSheet(
    <>
      <div className="sh-h"><div className="sh-t">Projects</div></div>
      <div className="grp">
        {DATA.projects.map((p) => (
          <button key={p} className="row tap" onClick={() => { setProject(p); app.closeSheet(); }}>
            <span className="tx t1">{p}</span>{p === project ? <G id="check" style={{ color: "var(--trail)" }} /> : null}
          </button>
        ))}
      </div>
      <p className="gf" style={{ margin: "-18px 0 8px" }}>Each project keeps its own trail on this phone.</p>
    </>,
  );

  return (
    <ScreenShell title="Ask" large right={<button className="pill" aria-label="Switch project" onClick={projects}><span>{project}</span><G id="chev-d" /></button>}>
      <form className="search serifph" autoComplete="off" onSubmit={(e) => {
        e.preventDefault(); if (!val) return;
        let best = null as Question | null, bs = 0;
        DATA.qs.forEach((q) => { const s = score(q, val); if (s > bs) { bs = s; best = q; } });
        if (!best) { app.toast("Try one of these questions"); return; }
        inp.current?.blur(); app.push("ask", "answer", best.id);
      }}>
        <G id="search" />
        <input ref={inp} type="text" enterKeyHint="search" placeholder="Why did we…?" aria-label="Ask a question about this project" value={v} onChange={(e) => setV(e.target.value)} />
      </form>
      <div className="rail" role="list">
        {DATA.qs.map((q) => (
          <button key={q.id} className="qchip" role="listitem" hidden={any ? !ok(q) : false} onClick={() => app.push("ask", "answer", q.id)}>{q.q}</button>
        ))}
      </div>
      <p className="nohit mono" hidden={!val || any}>No close match yet. Try one of these.</p>
      <h3 className="gh" style={{ marginTop: 26 }}>Recent</h3>
      <div className="grp">
        {DATA.recent.map((id) => {
          const q = Q(id);
          return (
            <button key={id} className="row tap" onClick={() => app.push("ask", "answer", id)}>
              <span className="tx"><span className="rq">{q.q}</span><span className="mono" style={{ display: "block", marginTop: 5 }}>{q.src.length} sources · {q.d}</span></span><Chev />
            </button>
          );
        })}
      </div>
      <p className="readout mono">on-device · 0 B sent today · 1,284 decisions</p>
    </ScreenShell>
  );
}
