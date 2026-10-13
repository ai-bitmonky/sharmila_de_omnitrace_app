"use client";
import { Fragment, useEffect, useRef, type CSSProperties } from "react";
import { HERO_ANSWER, HERO_DAYS, HERO_EVIDENCE, HERO_QUESTION } from "@/data/site";
import { Mark } from "./Mark";
import { onEnter, prefersReduced, typeText } from "./lib";

const X = (t: number) => 5 + (t / 4) * 88;
const Q = HERO_QUESTION;

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const win = hero?.querySelector<HTMLElement>("#heroAsk");
    if (!hero || !win) return;
    const RM = prefersReduced();
    const $ = <T extends Element>(s: string) => win.querySelector<T>(s)!;
    const qEl = $<HTMLElement>(".hero-q-text"), think = $<HTMLElement>(".hero-think"), thinkL = $<HTMLElement>(".hero-think-l");
    const marks = Array.from(win.querySelectorAll<SVGElement>(".hero-marks svg"));
    const ans = $<HTMLElement>(".hero-ans"), live = hero.querySelector<HTMLElement>("#heroLive")!, tl = $<HTMLElement>(".hero-tl"), plot = $<HTMLElement>(".hero-plot");
    const svg = plot.querySelector<SVGSVGElement>("svg")!, path = plot.querySelector<SVGPathElement>(".hero-trail")!, grid = plot.querySelector<SVGGElement>(".hero-grid-g")!, tip = $<HTMLElement>(".hero-tip");
    const chips = Array.from(ans.querySelectorAll<HTMLButtonElement>(".chip"));
    const words = Array.from(ans.querySelectorAll<HTMLElement>(".w"));
    const dots = Array.from(plot.querySelectorAll<HTMLButtonElement>(".hero-dot"));
    const cleanups: (() => void)[] = [];
    const on = <K extends keyof HTMLElementEventMap>(el: HTMLElement | Document | Window, type: K, fn: (e: HTMLElementEventMap[K]) => void) => {
      el.addEventListener(type, fn as EventListener);
      cleanups.push(() => el.removeEventListener(type, fn as EventListener));
    };

    let len = 0, drawn = false;
    const layout = () => {
      const w = plot.clientWidth, h = plot.clientHeight, l = h / 4;
      svg.setAttribute("viewBox", "0 0 " + w + " " + h);
      grid.innerHTML = [0, 1, 2, 3].map((i) => '<line class="hero-grid-l" x1="' + (X(i) * w) / 100 + '" x2="' + (X(i) * w) / 100 + '" y1="0" y2="' + h + '"/>').join("");
      const P = HERO_EVIDENCE.map((e, i) => [(X(e.t) * w) / 100, (i + 0.5) * l]);
      let d = "M0 " + P[0][1] + " L" + P[0][0] + " " + P[0][1];
      for (let i = 1; i < P.length; i++) { const a = P[i - 1], b = P[i], m = (a[0] + b[0]) / 2; d += " C" + m + " " + a[1] + " " + m + " " + b[1] + " " + b[0] + " " + b[1]; }
      d += " L" + w + " " + P[3][1];
      path.setAttribute("d", d);
      len = path.getTotalLength();
      path.style.transition = "none";
      path.style.strokeDasharray = String(len);
      path.style.strokeDashoffset = String(drawn ? 0 : len);
    };

    /* tooltip + chip↔dot link */
    let pinned = -1;
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    const show = (i: number) => {
      dots.forEach((d, k) => d.classList.toggle("hl", k === i));
      chips.forEach((c, k) => c.classList.toggle("is-on", k === i));
      if (i < 0) { tip.classList.remove("on"); return; }
      const e = HERO_EVIDENCE[i];
      tip.innerHTML = '<div class="hero-tip-h"><svg class="app-mark" aria-hidden="true"><use href="#mark-' + e.app + '"/></svg>' + esc(e.head) + '</div><p class="hero-tip-b">' + esc(e.body) + '</p><div class="hero-tip-f">' + esc(e.foot) + "</div>";
      if (!matchMedia("(max-width:640px)").matches) {
        const tr = tl.getBoundingClientRect(), dr = dots[i].getBoundingClientRect(), tw = Math.min(280, tr.width), cx = dr.left + dr.width / 2 - tr.left;
        tip.style.left = Math.max(tw / 2, Math.min(tr.width - tw / 2, cx)) + "px";
        tip.style.top = dr.top - tr.top - 4 + "px";
      }
      tip.classList.add("on");
    };
    const bind = (el: HTMLElement, i: number) => {
      on(el, "mouseenter", () => show(i));
      on(el, "focus", () => show(i));
      on(el, "mouseleave", () => show(pinned));
      on(el, "blur", () => show(pinned));
      on(el, "click", (ev) => { ev.stopPropagation(); pinned = pinned === i ? -1 : i; show(pinned < 0 ? i : pinned); });
    };
    dots.forEach((d, i) => bind(d, i));
    chips.forEach((c) => bind(c, Number(c.dataset.i)));
    on(document, "click", () => { if (pinned > -1) { pinned = -1; show(-1); } });

    /* orchestrated sequence */
    let timers: number[] = [];
    let cancelType: (() => void) | null = null;
    const at = (ms: number, fn: () => void) => { timers.push(window.setTimeout(fn, ms)); };
    const drawTrail = (dur: number) => {
      drawn = true;
      path.style.transition = "none";
      path.style.strokeDashoffset = String(len);
      path.getBoundingClientRect();
      path.style.transition = "stroke-dashoffset " + dur + "ms linear";
      path.style.strokeDashoffset = "0";
      const w = plot.clientWidth;
      dots.forEach((d, i) => at((dur * ((X(HERO_EVIDENCE[i].t) * w) / 100)) / w, () => d.classList.add("lit")));
    };
    const finalState = () => {
      qEl.textContent = Q; think.classList.add("on"); thinkL.textContent = "4 rooms traced";
      marks.forEach((m) => m.classList.add("on")); words.forEach((w) => w.classList.add("on"));
      drawn = true; layout(); dots.forEach((d) => d.classList.add("lit"));
      live.textContent = ans.textContent; hero.classList.add("is-ready");
    };
    const reset = () => {
      timers.forEach(clearTimeout); timers = [];
      if (cancelType) cancelType();
      pinned = -1; show(-1); qEl.textContent = ""; think.classList.remove("on"); thinkL.textContent = "tracing 4 rooms…";
      marks.forEach((m) => m.classList.remove("on")); words.forEach((w) => w.classList.remove("on")); dots.forEach((d) => d.classList.remove("lit"));
      drawn = false; layout(); live.textContent = "";
    };
    const run = () => {
      if (prefersReduced()) { finalState(); return; }
      reset(); hero.classList.add("is-ready");
      at(450, () => {
        cancelType = typeText(qEl, Q, 26, () => {
          at(250, () => think.classList.add("on"));
          marks.forEach((m, i) => at(450 + i * 260, () => m.classList.add("on")));
          at(1650, () => {
            thinkL.textContent = "4 rooms traced";
            words.forEach((w, i) => at(i * 38, () => w.classList.add("on")));
            at(words.length * 38 + 200, () => { drawTrail(1500); live.textContent = ans.textContent; });
          });
        });
      });
    };
    layout();
    on(window, "resize", layout);
    on($<HTMLButtonElement>(".hero-replay"), "click", (e) => { e.stopPropagation(); run(); });
    if (RM) finalState();
    else { reset(); cleanups.push(onEnter(win, run, { threshold: 0.3 })); }

    return () => {
      timers.forEach(clearTimeout);
      if (cancelType) cancelType();
      cleanups.forEach((f) => f());
    };
  }, []);

  return (
    <section className="hero" id="top" aria-labelledby="heroTitle" ref={heroRef}>
      <div className="container hero-grid">
        <div className="hero-copy">
          <h1 className="display" id="heroTitle">Find the <span className="hero-hl">why</span> behind every decision.</h1>
          <p className="lead hero-sub">OmniTrace joins the Slack thread, the Figma frame, the spreadsheet cell and the commit into one story. It runs on your laptop. Nothing goes to the cloud.</p>
          <div className="hero-ctas"><a className="btn btn-primary" href="#cta">Download for Mac</a><a className="btn btn-secondary" href="#how">See how it works</a></div>
          <p className="mono hero-readout"><i className="hero-live" aria-hidden="true"></i><b>on-device</b><span>· 0 B sent today</span><span>· 1,284 decisions indexed</span></p>
        </div>
        <figure className="hero-fig">
          <div className="window hero-ask" id="heroAsk">
            <div className="window-bar"><span className="window-dots" aria-hidden="true"><i></i><i></i><i></i></span><span className="window-title">OmniTrace · Acme Checkout</span><button className="btn-text hero-replay" type="button">Replay</button></div>
            <div className="window-body">
              <div className="hero-cmd">
                <Mark app="omnitrace" />
                <p className="hero-q ask"><span className="hero-q-ghost" aria-hidden="true">{Q}</span><span><span className="hero-q-text">{Q}</span><span className="hero-caret" aria-hidden="true"></span></span></p>
                <kbd className="keycap">⌘K</kbd>
              </div>
              <div className="hero-think mono on"><span className="hero-think-l">4 rooms traced</span><span className="hero-marks" aria-hidden="true">{HERO_EVIDENCE.map((e) => <Mark key={e.app} app={e.app} />)}</span></div>
              <p className="hero-ans">
                {HERO_ANSWER.map((part, k) =>
                  "text" in part ? (
                    <Fragment key={k}>{part.text.split(/(\s+)/).map((p, j) => (!p ? null : /^\s+$/.test(p) ? p : <span key={j} className="w">{p}</span>))}</Fragment>
                  ) : (
                    <span key={k} className="hero-cite w"><button className="chip" type="button" data-i={part.cite}><Mark app={HERO_EVIDENCE[part.cite].app} />{part.label}</button>{part.punct}</span>
                  ),
                )}
              </p>
              <p className="vh" aria-live="polite" id="heroLive"></p>
              <div className="hero-tl" role="group" aria-label="Evidence timeline, 11 to 14 March 2026">
                {HERO_EVIDENCE.map((e) => (
                  <div key={e.app} className="hero-lane"><span className="hero-lane-name"><Mark app={e.app} /><span>{e.lane}</span></span></div>
                ))}
                <div className="hero-plot">
                  <svg className="hero-svg" aria-hidden="true"><g className="hero-grid-g"></g><path className="hero-trail" /></svg>
                  {HERO_EVIDENCE.map((e, i) => (
                    <button key={e.app} type="button" className="hero-dot" data-i={i} aria-label={e.head + ", " + e.foot} style={{ "--x": X(e.t), "--y": i } as CSSProperties}></button>
                  ))}
                </div>
                <div className="hero-axis" aria-hidden="true">
                  {HERO_DAYS.map((d, i) => <span key={d} style={{ "--x": X(i) } as CSSProperties}>{d}</span>)}
                </div>
                <div className="hero-tip" role="status"></div><p className="hero-hint">Tap a dot or a source to see the evidence.</p>
              </div>
            </div>
          </div>
          <figcaption className="fig">fig. 01 — a question, answered with evidence</figcaption>
        </figure>
      </div>
    </section>
  );
}
