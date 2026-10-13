"use client";
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { DATA, MON, P, RN, dm, fmtDay, type Source } from "@/data/app";
import { makeGraph, type GNode, type GraphApi } from "./graph";
import { Chev, M } from "./icons";
import { ScreenShell } from "./LargeTitle";
import Segmented from "./Segmented";
import { openSourceSheet } from "./shared";
import { useApp, useScreen } from "./store";

const T0 = Date.parse("2026-01-01"), TD = 272;
const DAYS: Record<string, number[]> = {};
DATA.ev.forEach((e, i) => (DAYS[e[0]] = DAYS[e[0]] || []).push(i));
const DAY_KEYS = Object.keys(DAYS);
const evSrc = (i: number): Source => { const e = DATA.ev[i]; return { a: e[2], n: RN[e[2]], h: e[3], w: e[4], at: e[1], d: dm(e[0]), x: e[3] }; };
const evFor = (n: GNode) => {
  const ev = DATA.ev, f = (k: (e: (typeof ev)[number]) => boolean) => ev.findIndex(k);
  let i = f((e) => e[5] === "n:" + n.id);
  if (i < 0 && n.id === "adr") i = f((e) => e[5] === "adr:031");
  if (i < 0) i = f((e) => (e[2] === n.id || e[4] === n.id) && !!e[5] && e[5][0] === "n");
  if (i < 0) i = f((e) => e[2] === n.id || e[4] === n.id);
  return Math.max(0, i);
};
const nodesAsOf = (t: number) => DATA.nodes.filter((n) => !n[5] || Date.parse(n[5]) <= t).length;
const KIND: Record<GNode["type"], string> = { room: "Room", person: "Person", card: "Card", dec: "Decision", rule: "Client rule" };

export default function Trail() {
  const app = useApp();
  const scr = useScreen();
  const RM = app.RM;
  const mode = scr.entry.view === "graph" ? "graph" : "timeline";
  const sc = useRef<HTMLDivElement | null>(null);
  const st = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const gwrap = useRef<HTMLDivElement>(null);
  const scrubEl = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const tr = useRef<HTMLDivElement>(null);
  const G1 = useRef<GraphApi | null>(null);
  const [graphOn, setGraphOn] = useState(false);
  const [curM, setCurM] = useState(-1);
  const curMRef = useRef(-1);
  const [stuck, setStuck] = useState(false);
  const [scrub, setScrubV] = useState(TD);
  const active = useRef(false);
  active.current = scr.active && mode === "graph";
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const section = () => sc.current?.parentElement as HTMLElement | undefined;
  const stickH = () => (section()?.querySelector<HTMLElement>(".nb")?.offsetHeight || 0) + (st.current?.offsetHeight || 0);
  const goY = (y: number) => sc.current?.scrollTo({ top: Math.max(0, y - stickH() - 10), behavior: RM ? "auto" : "smooth" });
  const flash = (r: Element | null | undefined) => { if (!r) return; r.classList.remove("flash"); void (r as HTMLElement).offsetWidth; r.classList.add("flash"); };
  const goRow = (i: number) => later(() => {
    const r = sc.current?.querySelector(`[data-e="${i}"]`); const h = r?.closest(".grp")?.previousElementSibling as HTMLElement | null;
    if (h) goY(h.offsetTop); flash(r);
  }, 60);
  const goDay = (iso: string) => later(() => {
    const h = sc.current?.querySelector<HTMLElement>(`[data-day="${iso}"]`);
    if (h) { goY(h.offsetTop); flash(h.nextElementSibling?.firstElementChild); }
  }, 60);

  const setMode = (m: "timeline" | "graph", user: boolean) => { if (m === mode) return; if (user) app.buzz(); app.setView("trail", scr.entry.key, m); };

  const sizeG = useCallback(() => {
    const el = section(), gw = gwrap.current, g = G1.current; if (!el || !gw || !g) return;
    const top = gw.getBoundingClientRect().top - el.getBoundingClientRect().top;
    const tabbar = el.closest(".ot")?.querySelector<HTMLElement>(".tabbar");
    const h = el.clientHeight - (tabbar?.offsetHeight || 0) - top - (scrubEl.current?.offsetHeight || 0) - 10;
    gw.style.height = Math.max(240, h) + "px"; g.resize();
  }, []);

  /* the node sheet (latest closure through a ref, the graph is created once) */
  const nodeSheet = (n: GNode) => {
    const g = G1.current; if (!g) return;
    const ppl = g.E.filter(([a, b]) => (a === n && b.type === "person") || (b === n && a.type === "person")).map(([a, b]) => (a === n ? b : a));
    const links = g.E.filter(([a, b]) => a === n || b === n).length;
    const kind = KIND[n.type];
    const rows: [string, string | number][] = [["Type", kind]];
    if (n.room) rows.push(["Room", RN[n.room]]); if (ppl[0]) rows.push(["Author", ppl[0].l]); if (n.iso) rows.push(["Date", dm(n.iso) + " 2026"]); rows.push(["Links", links]);
    app.openSheet(
      <>
        <div className="sh-h">
          <span className="node" style={n.type === "dec" || DATA.path.includes(n.id) ? { color: "var(--trail)" } : undefined}>
            {n.type === "room" ? <M a={n.id} /> : n.type === "person" ? <b style={{ fontSize: 15 }}>{n.s[0]}</b> : <M a={n.room || "omnitrace"} />}
          </span>
          <div className="tx"><div className="sh-t">{n.l}</div><div className="mono">{kind}{n.iso ? " · " + dm(n.iso) : ""}</div></div>
        </div>
        <div className="grp">{rows.map((r) => <div className="row" key={r[0]}><span className="tx t1">{r[0]}</span><span className="val">{r[1]}</span></div>)}</div>
        <div className="btns"><button className="btn p" onClick={() => { const i = evFor(n); app.closeSheet(); setModeRef.current("timeline", true); goRowRef.current(i); }}>Show in timeline</button></div>
      </>,
      () => G1.current?.clear(),
    );
  };
  const nodeSheetRef = useRef(nodeSheet);
  const setModeRef = useRef(setMode);
  const goRowRef = useRef(goRow);
  useLayoutEffect(() => { nodeSheetRef.current = nodeSheet; setModeRef.current = setMode; goRowRef.current = goRow; });

  /* mode change (or a route re-applying it): scroll to top; lazily build the graph */
  useEffect(() => {
    if (sc.current) sc.current.scrollTop = 0;
    if (mode !== "graph" || !cv.current) return;
    if (!G1.current) {
      const g = makeGraph(cv.current, () => active.current && !document.hidden, RM);
      g.onTap = (n) => nodeSheetRef.current(n);
      G1.current = g; setGraphOn(true);
    }
    sizeG(); G1.current.kick();
  }, [mode, scr.entry.reset, RM, sizeG]);
  useEffect(() => () => { G1.current?.destroy(); G1.current = null; }, []);

  /* scrubber → graph date */
  useEffect(() => { if (graphOn) G1.current?.setDate(T0 + scrub * 864e5); }, [scrub, graphOn]);

  /* keep the packet animation alive only while visible */
  useEffect(() => { if (scr.active && mode === "graph") G1.current?.kick(); }, [scr.active, mode]);
  useEffect(() => {
    const vis = () => G1.current?.kick();
    const rs = () => { if (G1.current && active.current) sizeG(); };
    document.addEventListener("visibilitychange", vis); window.addEventListener("resize", rs);
    return () => { document.removeEventListener("visibilitychange", vis); window.removeEventListener("resize", rs); };
  }, [sizeG]);

  /* route focus: #trail/2026-03-14 */
  const focusN = scr.entry.focus?.n;
  useEffect(() => { const f = scr.entry.focus; if (f) goDay(f.iso); }, [focusN]);

  /* timeline scroll → current month chip + stuck header */
  const onScroll = () => {
    const s = sc.current; if (!s || mode !== "timeline") return;
    const y = s.scrollTop + stickH() + 24; let m = 0;
    s.querySelectorAll<HTMLElement>(".day").forEach((h) => { if (h.offsetTop <= y) m = +(h.dataset.mo || 0); });
    if (m !== curMRef.current) {
      curMRef.current = m; setCurM(m);
      const sp = strip.current, b = sp?.children[m] as HTMLElement | undefined;
      if (sp && b) sp.scrollTo({ left: b.offsetLeft - 16 - (sp.clientWidth - b.offsetWidth) / 2 + 16, behavior: RM ? "auto" : "smooth" });
    }
    setStuck(s.scrollTop > 44);
  };
  const onScrollRef = useRef(onScroll);
  useLayoutEffect(() => { onScrollRef.current = onScroll; });
  useEffect(() => { const r = requestAnimationFrame(() => onScrollRef.current()); return () => cancelAnimationFrame(r); }, []);

  /* scrubber */
  const sd = useRef(false);
  const sx = (e: RPointerEvent) => { const r = tr.current!.getBoundingClientRect(); return ((e.clientX - r.left - 14) / (r.width - 28)) * TD; };
  const setScrub = (d: number) => setScrubV(Math.max(0, Math.min(TD, Math.round(d))));
  const dt = new Date(T0 + scrub * 864e5);

  return (
    <ScreenShell title="Trail" large cls="trail-s" scRef={(el) => { sc.current = el; }} onScroll={onScroll}>
      <div className={"tr-st" + (stuck ? " stuck" : "")} ref={st}>
        <Segmented label="Trail view" options={[["timeline", "Timeline"], ["graph", "Graph"]]} value={mode} onChange={(m) => setMode(m, true)} />
        <div className="months" ref={strip} hidden={mode === "graph"}>
          {MON.slice(0, 9).map((m, i) => (
            <button key={m} data-mo={i} className={i === curM ? "on" : undefined} onClick={() => { const h = sc.current?.querySelector<HTMLElement>(`.day[data-mo="${i}"]`); if (h) goY(h.offsetTop); }}>{m}</button>
          ))}
        </div>
      </div>
      <div className="tl" hidden={mode === "graph"}>
        {DAY_KEYS.map((d) => (
          <Fragment key={d}>
            <h3 className="gh day mono" data-day={d} data-mo={+d.slice(5, 7) - 1}>{fmtDay(d)}</h3>
            <div className="grp ic-in">
              {DAYS[d].map((i) => {
                const e = DATA.ev[i], dec = !!e[5] && e[5].indexOf("adr:") === 0;
                return (
                  <button key={i} className={"row tap ev" + (dec ? " dec" : "")} data-e={i} onClick={() => { if (dec) app.push("trail", "adr", (e[5] as string).slice(4)); else openSourceSheet(app, evSrc(i)); }}>
                    <span className="ic"><M a={e[2]} /></span>
                    <span className="tx"><span className="t1 ell" style={{ display: "block" }}>{dec ? "ADR-" + (e[5] as string).slice(4) + " · " : ""}{e[3]}</span><span className="t2">{P[e[4]]} · {e[1]}</span></span>
                    {dec ? <span className="tag">Decision</span> : null}<Chev />
                  </button>
                );
              })}
            </div>
          </Fragment>
        ))}
        <p className="readout mono" style={{ paddingTop: 4 }}>8 Jan → 22 Sep 2026 · {DATA.ev.length} events</p>
      </div>
      <div className="gv" hidden={mode !== "graph"}>
        <div className="gwrap" ref={gwrap}>
          <canvas ref={cv} aria-label="Decision graph: 18 nodes. Slack, Figma, Excel and GitHub cards link through PR #412 to ADR-031 and the client rule." />
          <span className="ghint mono">pinch to zoom · drag to move</span>
          <button className="pill gfit" onClick={() => G1.current?.fit()}>Fit</button>
        </div>
        <div className="scrub" ref={scrubEl}>
          <div className="slbl"><span className="mono">As of</span><b className="sd">{dt.getUTCDate()} {MON[dt.getUTCMonth()]} 2026</b><span className="mono sn">{nodesAsOf(T0 + scrub * 864e5)} of {DATA.nodes.length} nodes</span></div>
          <div
            className="strack" ref={tr} role="slider" tabIndex={0} aria-label="Show the graph as of a date" aria-valuemin={0} aria-valuemax={TD}
            aria-valuenow={scrub} aria-valuetext={dm(dt.toISOString().slice(0, 10))} style={{ "--p": scrub / TD } as CSSProperties}
            onPointerDown={(e) => { sd.current = true; try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ } setScrub(sx(e)); }}
            onPointerMove={(e) => { if (sd.current) setScrub(sx(e)); }}
            onPointerUp={() => { sd.current = false; }} onPointerCancel={() => { sd.current = false; }}
            onKeyDown={(e: KeyboardEvent) => {
              if (e.key === "ArrowRight" || e.key === "ArrowUp") setScrub(scrub + 7);
              else if (e.key === "ArrowLeft" || e.key === "ArrowDown") setScrub(scrub - 7);
              else return;
              e.preventDefault();
            }}
          ><i className="sfill" /><i className="knob" /></div>
          <div className="sticks mono">{"JFMAMJJAS".split("").map((c, i) => <span key={i}>{c}</span>)}</div>
        </div>
      </div>
    </ScreenShell>
  );
}
