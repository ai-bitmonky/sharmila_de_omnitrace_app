"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ADR_ENTRIES, ADR_NEW, ASK_QUESTIONS, ASK_STOP, FINDER_NODES, IMPACT_NODES, IMPACT_RULE, type AdrEntry, type FileKind } from "@/data/site";
import { Chip, Mark } from "./Mark";
import { onEnter, prefersReduced, typeText } from "./lib";

/* ---------- A — "Why did we…?" ---------- */
const toks = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w && !ASK_STOP.has(w));
function matchQuestion(s: string) {
  const t = toks(s);
  let best = -1, bs = 0;
  ASK_QUESTIONS.forEach((x, i) => {
    const ks = x.k.split(" ");
    let sc = 0;
    t.forEach((w) => { if (ks.some((k) => k === w || (w.length > 3 && k.length > 3 && (k.indexOf(w) === 0 || w.indexOf(k) === 0)))) sc++; });
    if (sc > bs) { bs = sc; best = i; }
  });
  return best;
}
type AskOut = { kind: "idle" } | { kind: "tracing" } | { kind: "answer"; i: number; q: string; n: number };

function AskPanel() {
  const [value, setValue] = useState("");
  const [active, setActive] = useState(-1);
  const [nudge, setNudge] = useState(false);
  const [out, setOut] = useState<AskOut>({ kind: "idle" });
  const tid = useRef(0);
  const n = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => () => clearTimeout(tid.current), []);

  const show = (i: number, asked?: string) => {
    clearTimeout(tid.current);
    setActive(i);
    setNudge(false);
    const q = asked || (i >= 0 ? ASK_QUESTIONS[i].q : "");
    setOut({ kind: "tracing" });
    tid.current = window.setTimeout(() => {
      if (i < 0) setNudge(true);
      setOut({ kind: "answer", i, q, n: ++n.current });
    }, prefersReduced() ? 0 : 520);
  };
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const v = value.trim();
    if (!v) { inputRef.current?.focus(); return; }
    show(matchQuestion(v), v);
  };

  return (
    <div className="window-body" id="feat-ask">
      <form className="feat-ask-form" role="search" onSubmit={onSubmit}>
        <label className="vh" htmlFor="feat-q">Ask a question about this project</label>
        <input id="feat-q" ref={inputRef} className="feat-ask-input" type="text" autoComplete="off" placeholder="Ask anything about this project…" value={value} onChange={(e) => setValue(e.target.value)} />
        <button className="feat-go" type="submit">Ask</button>
      </form>
      <div className={"feat-qchips" + (nudge ? " is-nudge" : "")} aria-label="Example questions">
        {ASK_QUESTIONS.map((x, i) => (
          <button key={x.q} type="button" className={"feat-qchip" + (active === i ? " is-on" : "")} onClick={() => { setValue(x.q); show(i); }}>{x.q}</button>
        ))}
      </div>
      <div className="feat-ans" aria-live="polite">
        {out.kind === "idle" && <p className="mono">Pick a question above, or type your own.</p>}
        {out.kind === "tracing" && <p className="mono">tracing 5 rooms…</p>}
        {out.kind === "answer" && out.i < 0 && (
          <div className="feat-ans-in" key={out.n}><p className="feat-ans-q">{out.q}</p><p className="feat-ans-t">I can’t find that yet — try one of these.</p></div>
        )}
        {out.kind === "answer" && out.i >= 0 && (
          <div className="feat-ans-in" key={out.n}>
            <p className="feat-ans-q">{out.q}</p>
            <p className="feat-ans-t">{ASK_QUESTIONS[out.i].t}</p>
            <div className="feat-ans-c">{ASK_QUESTIONS[out.i].c.map((c) => <Chip key={c[1]} app={c[0]} label={c[1]} />)}</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- B — register: Raw | Record + ADR-032 auto-type ---------- */
function AdrArticle({ e }: { e: AdrEntry }) {
  const [view, setView] = useState<"raw" | "record">("record");
  return (
    <article className="feat-adr" data-view={view}>
      <div className="feat-adr-top"><span className="feat-adr-id">{e.id}</span><span className="feat-adr-date">{e.date}</span>
        <div className="feat-seg" role="group" aria-label={`${e.id} view`}>
          <button type="button" aria-pressed={view === "raw"} onClick={() => setView("raw")}>Raw</button>
          <button type="button" aria-pressed={view === "record"} onClick={() => setView("record")}>Record</button>
        </div>
        <h5 className="feat-adr-title">{e.title}</h5></div>
      <dl className="feat-adr-rec">
        <dt>Context</dt><dd>{e.context}</dd>
        <dt>Decision</dt><dd>{e.decision}</dd>
        <dt>Consequences</dt><dd>{e.consequences}</dd>
        <dt>Sources</dt><dd className="feat-adr-src">{e.sources.map((c) => <Chip key={c[1]} app={c[0]} label={c[1]} />)}</dd>
      </dl>
      <div className="feat-adr-raw">
        {e.raw.map((f) => (
          <div key={f.meta} className="feat-frag"><div className="feat-frag-m"><Mark app={f.app} />{f.meta}</div><p className="feat-frag-t">{f.text}</p></div>
        ))}
      </div>
    </article>
  );
}

function Register() {
  const newRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const nw = newRef.current;
    if (!nw) return;
    const els = Array.from(nw.querySelectorAll<HTMLElement>("[data-t]"));
    const fillAll = () => { els.forEach((el) => (el.textContent = el.dataset.t ?? "")); nw.classList.add("is-done"); };
    if (prefersReduced()) { fillAll(); return; }
    els.forEach((el) => (el.textContent = ""));
    nw.classList.remove("is-done");
    let cancel: (() => void) | null = null;
    const stopEnter = onEnter(nw, () => {
      let i = 0;
      const next = () => {
        if (i >= els.length) { nw.classList.add("is-done"); return; }
        const el = els[i++];
        cancel = typeText(el, el.dataset.t ?? "", 18, next);
      };
      next();
    });
    return () => { stopEnter(); if (cancel) cancel(); };
  }, []);
  return (
    <div className="feat-band" id="feat-register">
      <div className="container feat-row">
        <div className="feat-copy">
          <p className="feat-note">Automatic decision register</p>
          <h3>Nobody writes it. It writes itself.</h3>
          <p>Every decision gets a clean record: what happened, what was decided, what it changed, and where it came from. Flip any entry to Raw to see the messy notes it was built from.</p>
        </div>
        <figure className="feat-demo">
          <div className="feat-doc">
            <h4 className="feat-doc-h">Checkout decisions — ADR</h4>
            <p className="feat-doc-m">Notion · Acme Checkout · written by OmniTrace · 4 entries</p>
            {ADR_ENTRIES.map((e) => <AdrArticle key={e.id} e={e} />)}
            <article className="feat-adr is-new" id="feat-adr-new" ref={newRef}>
              <div className="feat-adr-top"><span className="feat-adr-id">{ADR_NEW.id}</span><span className="feat-adr-date">{ADR_NEW.date}</span><span className="feat-adr-tag">{ADR_NEW.tag}</span>
                <h5 className="feat-adr-title" data-t={ADR_NEW.title}></h5></div>
              <dl className="feat-adr-rec">
                <dt>Context</dt><dd data-t={ADR_NEW.context}></dd>
                <dt>Decision</dt><dd data-t={ADR_NEW.decision}></dd>
                <dt>Consequences</dt><dd data-t={ADR_NEW.consequences}></dd>
                <dt>Sources</dt><dd className="feat-adr-src">{ADR_NEW.sources.map((c) => <Chip key={c[1]} app={c[0]} label={c[1]} />)}</dd>
              </dl>
            </article>
          </div>
          <figcaption className="fig">fig. 04b — the register, written from the trail</figcaption>
        </figure>
      </div>
    </div>
  );
}

/* ---------- C — spatial timeline & folder finder ---------- */
function Thumb({ k }: { k: FileKind }) {
  if (k === "xls")
    return <svg viewBox="0 0 96 66" aria-hidden="true"><g stroke="var(--line-2)" fill="none"><path d="M8 18H88M8 30H88M8 42H88M8 54H88M30 8V58M52 8V58M74 8V58" /></g><rect x="52" y="30" width="22" height="12" fill="var(--trail-soft)" stroke="var(--trail)" /></svg>;
  if (k === "doc")
    return <svg viewBox="0 0 96 66" aria-hidden="true"><g fill="var(--line-2)"><rect x="14" y="12" width="50" height="5" rx="2" /><rect x="14" y="24" width="68" height="3" rx="1.5" /><rect x="14" y="32" width="62" height="3" rx="1.5" /><rect x="14" y="40" width="68" height="3" rx="1.5" /><rect x="14" y="48" width="40" height="3" rx="1.5" /></g></svg>;
  return <svg viewBox="0 0 96 66" aria-hidden="true"><g fill="none" stroke="var(--line-2)"><rect x="10" y="10" width="34" height="46" rx="2" /><rect x="52" y="10" width="34" height="46" rx="2" /></g><g fill="var(--line-2)"><rect x="15" y="16" width="20" height="4" rx="2" /><rect x="57" y="16" width="20" height="4" rx="2" /><rect x="15" y="44" width="24" height="7" rx="3.5" /></g><rect x="57" y="44" width="24" height="7" rx="3.5" fill="var(--trail)" /></svg>;
}

function Finder() {
  const N = FINDER_NODES;
  const [sel, setSel] = useState(-1);
  const [crumbs, setCrumbs] = useState<string[] | null>(null); /* null = idle hint */
  const [miss, setMiss] = useState(false);
  const [fileOn, setFileOn] = useState(false);
  const [value, setValue] = useState("");
  const scRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const timers = useRef<number[]>([]);
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => clear, []);

  const select = (i: number, animate: boolean) => {
    const n = N[i], RM = prefersReduced(), trail = trailRef.current, sc = scRef.current;
    clear();
    setSel(i); setMiss(false);
    if (trail) {
      trail.setAttribute("d", n.r);
      const L = trail.getTotalLength() || 1;
      trail.style.transition = "none"; trail.style.strokeDasharray = String(L); trail.style.strokeDashoffset = String(animate && !RM ? L : 0);
      trail.getBoundingClientRect(); trail.style.transition = "";
      if (animate && !RM) requestAnimationFrame(() => { trail.style.strokeDashoffset = "0"; });
    }
    if (sc && sc.scrollWidth > sc.clientWidth + 2) {
      const sw = sc.querySelector("svg")!.getBoundingClientRect().width;
      sc.scrollTo({ left: (n.x / 760) * sw - sc.clientWidth / 2, behavior: RM ? "auto" : "smooth" });
    }
    const parts = n.p.split("›");
    setCrumbs([]); setFileOn(false);
    const base = animate && !RM ? 700 : 0, step = animate && !RM ? 170 : 0;
    parts.forEach((_, j) => timers.current.push(window.setTimeout(() => setCrumbs(parts.slice(0, j + 1)), base + j * step)));
    timers.current.push(window.setTimeout(() => setFileOn(true), base + parts.length * step));
  };
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector("input")!;
    const v = (value.trim() || input.placeholder).toLowerCase().replace(/[^a-z0-9 _.]/g, " ").split(/\s+/).filter((w) => w.length > 1);
    let best = -1, bs = 0;
    N.forEach((n, i) => { const ks = (n.kw + " " + n.f.toLowerCase()).split(/[\s_.]+/); let sc = 0; v.forEach((w) => { if (ks.indexOf(w) > -1) sc++; }); if (sc > bs) { bs = sc; best = i; } });
    if (!value.trim()) setValue(input.placeholder);
    if (best < 0) { clear(); setMiss(true); setCrumbs(null); setFileOn(false); return; }
    select(best, true);
  };
  const cur = sel >= 0 ? N[sel] : null;

  return (
    <div className="window-body" id="feat-find">
      <form className="feat-find-form" role="search" onSubmit={onSubmit}>
        <label className="vh" htmlFor="feat-fq">Ask where a file is</label>
        <input id="feat-fq" className="feat-find-input" type="text" autoComplete="off" placeholder="Where is the final pricing sheet?" value={value} onChange={(e) => setValue(e.target.value)} />
        <button className="feat-go" type="submit">Find</button>
      </form>
      <div className="feat-tl-scroll" ref={scRef}>
        <svg className="feat-tl" viewBox="0 0 760 250" role="group" aria-label="Acme Checkout files from January to March. Select a point to see where the file lives.">
          <g className="feat-tl-ax"><line className="feat-tl-tick" x1="40" y1="222" x2="40" y2="230" /><text x="40" y="246" textAnchor="middle">Jan</text><line className="feat-tl-tick" x1="230" y1="222" x2="230" y2="230" /><text x="230" y="246" textAnchor="middle">Feb</text><line className="feat-tl-tick" x1="560" y1="222" x2="560" y2="230" /><text x="560" y="246" textAnchor="middle">Mar</text><line className="feat-tl-tick" x1="20" y1="226" x2="740" y2="226" /></g>
          <path className="feat-tl-base" d="M40 130H720M230 130C270 130 280 60 320 60C360 60 380 130 420 130M420 130C445 130 455 200 480 200H600C650 200 670 130 720 130" />
          <path className="feat-tl-trail" ref={trailRef} d="M40 130h.1" />
          <text className="feat-tl-lbl" x="34" y="104">Brief.docx · Jan</text>
          <text className="feat-tl-lbl" x="726" y="104" textAnchor="end">final_FINAL_v3.fig · Mar</text>
          <g className="feat-tl-nodes">
            {N.map((n, i) => (
              <g key={n.f} className={"feat-tl-node" + (sel === i ? " is-on" : "")} tabIndex={0} role="button" aria-label={n.f + ", " + n.d}
                onClick={() => select(i, true)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(i, true); } }}
                onMouseOver={() => { if (sel !== i && matchMedia("(hover:hover)").matches) select(i, false); }}>
                <circle className="feat-hit" cx={n.x} cy={n.y} r="26" /><circle className="feat-dot" cx={n.x} cy={n.y} r="7" />
              </g>
            ))}
          </g>
        </svg>
      </div>
      <div className="feat-find-out" aria-live="polite">
        <ol className="feat-crumb">
          {miss ? <li className="mono">No file matches that yet. Try “final pricing sheet” or “brief”.</li>
            : crumbs === null ? <li className="mono">Tap a point on the line, or ask for a file.</li>
            : crumbs.map((p, j) => <li key={j}>{p}</li>)}
        </ol>
        <div className="feat-file" hidden={!fileOn || !cur}>
          <div className="feat-thumb">{cur && <Thumb k={cur.k} />}</div>
          <div><div className="feat-file-n">{cur?.f}</div><div className="feat-file-m">{cur ? cur.d + " 2026 · " + cur.w : ""}</div></div>
        </div>
      </div>
    </div>
  );
}

/* ---------- D — impact radius ---------- */
const DUR = 2200, R = 380;
function Impact() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const go = root.querySelector<HTMLButtonElement>(".feat-ir-go")!, undo = root.querySelector<HTMLButtonElement>(".feat-ir-undo")!, warn = root.querySelector<HTMLElement>(".feat-ir-warn")!, st = root.querySelector<HTMLElement>(".feat-ir-st")!;
    const ns = Array.from(root.querySelectorAll<SVGGElement>(".feat-ir-n"));
    let timers: number[] = [];
    const at = (fn: () => void, ms: number) => { timers.push(window.setTimeout(fn, prefersReduced() ? 0 : ms)); };
    const onGo = () => {
      go.disabled = true; root.classList.add("is-edited"); st.textContent = "Daniel · editing · seats added";
      at(() => root.classList.add("is-run"), 350);
      ns.forEach((n) => { const t = 350 + (Number(n.dataset.d) / R) * DUR; at(() => n.classList.add(n.classList.contains("feat-ir-rule") ? "is-warn" : "is-hit"), t); });
      at(() => { warn.hidden = false; undo.hidden = false; go.hidden = true; st.textContent = "1 conflict found"; undo.focus({ preventScroll: true }); }, 350 + DUR + 150);
    };
    const onUndo = () => {
      timers.forEach(clearTimeout); timers = [];
      root.classList.remove("is-edited", "is-run");
      ns.forEach((n) => n.classList.remove("is-hit", "is-warn"));
      warn.hidden = true; undo.hidden = true; go.hidden = false; go.disabled = false; st.textContent = "Daniel · 22 Sep 2026"; go.focus({ preventScroll: true });
    };
    go.addEventListener("click", onGo);
    undo.addEventListener("click", onUndo);
    return () => { go.removeEventListener("click", onGo); undo.removeEventListener("click", onUndo); timers.forEach(clearTimeout); };
  }, []);
  return (
    <div className="window feat-ir" id="feat-ir" ref={ref}>
      <div className="window-bar"><span className="window-dots"><i></i><i></i><i></i></span><span className="window-title">Acme Checkout — design file</span></div>
      <div className="feat-ir-canvas">
        <svg className="feat-ir-svg" viewBox="0 0 480 320" role="img" aria-label="Design canvas with the frame Team plan picker v1, linked to Checkout v3, PR 412, cell B14, ADR-031 and a client rule.">
          <g><circle className="feat-ir-ring is-fill" cx="99" cy="140" r="380" /><circle className="feat-ir-ring" cx="99" cy="140" r="380" /><circle className="feat-ir-ring" cx="99" cy="140" r="380" /></g>
          <g><line className="feat-ir-edge" x1="174" y1="120" x2="250" y2="58" /><line className="feat-ir-edge" x1="174" y1="170" x2="230" y2="250" /><line className="feat-ir-edge" x1="250" y1="58" x2="400" y2="64" /><line className="feat-ir-edge" x1="230" y1="250" x2="356" y2="168" /><line className="feat-ir-edge" x1="356" y1="168" x2="400" y2="64" /><line className="feat-ir-edge" x1="400" y1="64" x2="432" y2="250" /></g>
          {IMPACT_NODES.map((n) => (
            <g key={n.label.t} className="feat-ir-n" data-d={n.d}><circle cx={n.cx} cy={n.cy} r="7" /><text x={n.label.x} y={n.label.y} textAnchor={n.label.anchor}>{n.label.t}</text></g>
          ))}
          <g className="feat-ir-n feat-ir-rule" data-d={IMPACT_RULE.d}><circle className="feat-ir-pulse" cx={IMPACT_RULE.cx} cy={IMPACT_RULE.cy} r="7" /><circle cx={IMPACT_RULE.cx} cy={IMPACT_RULE.cy} r="7" /><text x="452" y="232" textAnchor="end">{IMPACT_RULE.label}</text><text className="feat-ir-l2" x="464" y="300" textAnchor="end">{IMPACT_RULE.line2}</text></g>
          <text className="feat-ir-flbl" x="24" y="32">Team plan picker v1</text>
          <rect className="feat-ir-frame" x="24" y="40" width="150" height="200" rx="2" />
          <rect className="feat-ir-ui" x="36" y="54" width="90" height="8" rx="2" />
          <rect className="feat-ir-ui" x="36" y="74" width="60" height="70" rx="4" /><rect className="feat-ir-ui" x="102" y="74" width="60" height="70" rx="4" />
          <rect className="feat-ir-ui" x="36" y="206" width="126" height="22" rx="11" />
          <g className="feat-ir-seat"><rect x="36" y="156" width="126" height="34" rx="4" fill="var(--bg-2)" stroke="var(--trail)" /><text x="46" y="178">Seats  −  3  +</text></g>
          <rect className="feat-ir-sel" x="21" y="37" width="156" height="206" />
        </svg>
        <div className="feat-ir-warn" hidden>
          <p className="feat-ir-warn-t">This edit contradicts a rule approved 6 months ago.</p>
          <p className="mono">ADR-031 · Priya Nair · 14 Mar 2026</p>
          <a className="feat-ir-open" href="#how">Open the trail</a>
        </div>
      </div>
      <div className="feat-ir-bar">
        <button className="btn btn-primary feat-ir-go" type="button">Make the edit</button>
        <button className="btn-text feat-ir-undo" type="button" hidden>Undo</button>
        <span className="mono feat-ir-st">Daniel · 22 Sep 2026</span>
      </div>
    </div>
  );
}

export default function Features() {
  return (
    <section id="product" className="section feat">
      <div className="container">
        <header className="feat-head">
          <h2>What OmniTrace does all day.</h2>
          <p className="lead">Four jobs. All of them run on your laptop. Try each one.</p>
        </header>
      </div>

      <div className="container feat-wrap">
        <div className="feat-row">
          <div className="feat-copy">
            <p className="feat-note">“Why did we…?” search</p>
            <h3>Ask a question. Get the story, with sources.</h3>
            <p>Type the way you talk. OmniTrace answers in a few lines and links each part to the exact Slack message, Figma frame, sheet cell or pull request.</p>
          </div>
          <figure className="feat-demo">
            <div className="window">
              <div className="window-bar"><span className="window-dots"><i></i><i></i><i></i></span><span className="window-title">OmniTrace · Acme Checkout</span></div>
              <AskPanel />
            </div>
            <figcaption className="fig">fig. 04a — a plain question, a short answer, four sources</figcaption>
          </figure>
        </div>
      </div>

      <Register />

      <div className="container feat-wrap">
        <div className="feat-row is-flip">
          <div className="feat-copy">
            <p className="feat-note">Spatial timeline &amp; folder finder</p>
            <h3>Find the file by its story, not its folder.</h3>
            <p>See how the project grew, file by file. Ask for a file and OmniTrace walks you to it, one folder at a time.</p>
            <p className="feat-note">Here the answer is a place, not a story.</p>
          </div>
          <figure className="feat-demo">
            <div className="window">
              <div className="window-bar"><span className="window-dots"><i></i><i></i><i></i></span><span className="window-title">OmniTrace · Folder finder</span></div>
              <Finder />
            </div>
            <figcaption className="fig">fig. 04c — the project, file by file, Jan to Mar</figcaption>
          </figure>
        </div>

        <div className="feat-row">
          <div className="feat-copy">
            <p className="feat-note">Impact radius</p>
            <h3>A warning before you undo a past decision.</h3>
            <p>When a new edit clashes with a rule someone approved months ago, OmniTrace tells you right away. It also shows you why the rule exists.</p>
          </div>
          <figure className="feat-demo">
            <Impact />
            <figcaption className="fig">fig. 04d — one edit, checked against six months of decisions</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
