"use client";
import { useEffect, useRef } from "react";
import { GRAPH_ADR_SOURCES, GRAPH_EDGES, GRAPH_NODES, GRAPH_PATH, GRAPH_PEOPLE, GRAPH_PROV, GRAPH_QUESTION, GRAPH_STEPS, type GraphNodeType } from "@/data/site";
import { prefersReduced, typeText, watchVisible } from "./lib";

/* date helpers (pure, safe for server render) */
const D0 = Date.UTC(2026, 0, 1), MAXD = 272, MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dayOf = (s: string) => Math.round((Date.parse(s) - D0) / 864e5);
const fmt = (d: number, y?: boolean) => { const t = new Date(D0 + d * 864e5); return t.getUTCDate() + " " + MON[t.getUTCMonth()] + (y ? " 2026" : ""); };
const CARD_DAYS = GRAPH_NODES.filter((r) => r[1] !== "room" && r[1] !== "person").map((r) => (r[5] ? dayOf(r[5]) : 0));
const EV_DAYS = Array.from(new Set(CARD_DAYS));
const START_DAY = dayOf("2026-03-14");
/** the "Step n of 4" breakpoint: pinned story at ≥1024px; 900–1023 uses the stepper */
const WIDE = "(min-width:1024px)";

interface GNode {
  id: string; type: GraphNodeType; s: string; l: string; lane: number; day: number;
  x: number; y: number; vx: number; vy: number; ax: number; ay: number; a: number; pi: number; k: number;
}

export default function Graph() {
  const secRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sec = secRef.current;
    if (!sec) return;
    const pin = sec.querySelector<HTMLElement>(".graph-pin"), box = sec.querySelector<HTMLElement>(".graph-box"), cv = sec.querySelector<HTMLCanvasElement>(".graph-canvas");
    const ctx = cv?.getContext("2d");
    if (!pin || !box || !cv || !ctx) return;
    const RM = prefersReduced();
    const root = getComputedStyle(document.documentElement), cvar = (n: string) => root.getPropertyValue(n).trim();
    const C = { ink: cvar("--ink") || "#EDE8DF", ink2: cvar("--ink-2") || "#B8B2A6", ink3: cvar("--ink-3") || "#7F7A70", trail: cvar("--trail") || "#F2C945", soft: cvar("--trail-glow") || "rgba(242,201,69,.35)", bg: cvar("--bg-2") || "#15140F", edge: "rgba(237,232,223,.2)", lane: "rgba(237,232,223,.08)", mono: cvar("--font-mono") || "monospace" };

    const nodes: GNode[] = GRAPH_NODES.map((r) => ({ id: r[0], type: r[1], s: r[2], l: r[3], lane: r[4] ?? -1, day: r[5] ? dayOf(r[5]) : 0, x: 0, y: 0, vx: 0, vy: 0, ax: 0, ay: 0, a: 0, pi: GRAPH_PATH.indexOf(r[0]), k: 0 }));
    const by: Record<string, GNode> = {};
    nodes.forEach((n) => (by[n.id] = n));
    const nb: Record<string, Set<string>> = {};
    nodes.forEach((n) => (nb[n.id] = new Set([n.id])));
    const edges = GRAPH_EDGES.map(([a, b]) => { nb[a].add(b); nb[b].add(a); return { a: by[a], b: by[b] }; });
    nodes.forEach((n) => {
      if (n.lane >= 0 && n.type !== "room")
        n.k = nodes.filter((m) => (m.lane === n.lane && m.type !== "room" && m.day < n.day) || (m.lane === n.lane && m.type !== "room" && m.day === n.day && nodes.indexOf(m) < nodes.indexOf(n))).length;
    });
    const CARDS = nodes.filter((n) => n.type !== "room" && n.type !== "person");
    const wideMQ = matchMedia(WIDE);
    let wide = wideMQ.matches;
    let W = 0, H = 0, narrow = false, step = 0, heat = 1, pathT = 0, pathAt = 0, laneA = 1, edgeA = 0, sel: string | null = null, auto = false, hover: GNode | null = null, day = START_DAY, typed = false, autoShown = false, vis = false, raf = 0;
    const q = <T extends Element>(s: string) => sec.querySelector<T>(s);
    const steps = Array.from(sec.querySelectorAll<HTMLElement>(".graph-step")), dots = Array.from(sec.querySelectorAll<HTMLButtonElement>(".graph-dot")), navB = Array.from(sec.querySelectorAll<HTMLButtonElement>(".graph-nav-b"));
    const ask = q<HTMLElement>(".graph-ask"), askT = q<HTMLElement>(".graph-ask-t"), tip = q<HTMLElement>(".graph-tip"), prov = q<HTMLElement>(".graph-prov"), main = q<HTMLElement>(".graph-main");
    const cleanups: (() => void)[] = [];
    const listen = (el: EventTarget, type: string, fn: EventListener, opts?: AddEventListenerOptions) => { el.addEventListener(type, fn, opts); cleanups.push(() => el.removeEventListener(type, fn, opts)); };
    let cancelType: (() => void) | null = null;

    const pad = () => Math.max(26, W * 0.05), laneX = (i: number) => pad() + ((W - 2 * pad()) / 5) * (i + 0.5), cardOpen = () => !!prov && !prov.hidden;
    const rowY = (i: number) => 46 + (i * (H - 90)) / 5, rowX0 = () => pad() + 80;
    function laneT(n: GNode): [number, number] {
      if (n.type === "person") return [W * (0.2 + GRAPH_PEOPLE.indexOf(n.id) * 0.2), H - 36];
      if (narrow) { const x0 = rowX0(); return n.type === "room" ? [pad(), rowY(n.lane)] : [x0 + (n.k * (W - x0 - 78)) / 2, rowY(n.lane)]; }
      if (n.type === "room") return [laneX(n.lane), 46];
      return [laneX(n.lane), 46 + (n.k + 1) * Math.min(100, (H - 120) / 4)];
    }
    function size() {
      const r = box!.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const nw = r.width, nh = r.height, dpr = Math.min(2, devicePixelRatio || 1);
      if (W) nodes.forEach((n) => { n.x *= nw / W; n.y *= nh / H; });
      W = nw; H = nh; narrow = W < 560;
      cv!.width = Math.round(W * dpr); cv!.height = Math.round(H * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!nodes[0].x) nodes.forEach((n) => { const t = laneT(n); n.x = t[0]; n.y = t[1]; });
      heat = 1;
      if (RM) settle();
      draw();
    }
    function tick() {
      const lane = step === 0, top = step >= 2 ? (narrow ? 100 : 92) : 40, rest = Math.min(W, H) * 0.15, shift = wide && cardOpen(), cx = shift ? (W - 370) / 2 : W / 2, cy = step >= 2 ? H * 0.57 : H * 0.5, span = (shift ? W - 370 : W) * (narrow ? 0.19 : 0.16), xmax = shift ? W - 420 : W - pad() * 0.6 - 30;
      nodes.forEach((n) => { n.ax = 0; n.ay = 0; });
      if (lane) nodes.forEach((n) => { const t = laneT(n); n.ax = (t[0] - n.x) * 0.06; n.ay = (t[1] - n.y) * 0.06; });
      else {
        for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j], dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy + 1, d = Math.sqrt(d2);
          if (d > rest * 3) continue;
          const f = Math.min(4, (rest * rest * 0.5) / d2);
          a.ax -= (dx / d) * f; a.ay -= (dy / d) * f; b.ax += (dx / d) * f; b.ay += (dy / d) * f;
        }
        edges.forEach((e) => { const dx = e.b.x - e.a.x, dy = e.b.y - e.a.y, d = Math.hypot(dx, dy) || 1, f = (d - rest) * 0.02; e.a.ax += (dx / d) * f; e.a.ay += (dy / d) * f; e.b.ax -= (dx / d) * f; e.b.ay -= (dy / d) * f; });
        nodes.forEach((n) => {
          n.ax += (cx - n.x) * 0.004; n.ay += (cy - n.y) * 0.004;
          if (n.pi >= 0) { n.ax += (cx + (n.pi - 2) * span - n.x) * 0.03; n.ay += (cy + (narrow ? (n.pi % 2 ? 24 : -24) : 0) - n.y) * 0.02; }
          else if (n.type === "room") n.ay += (cy - rest * 1.25 - n.y) * 0.012;
          else if (n.type === "person") n.ay += (cy + rest * 1.25 - n.y) * 0.012;
        });
      }
      const p = pad() * 0.6;
      nodes.forEach((n) => {
        n.vx = (n.vx + n.ax) * 0.8; n.vy = (n.vy + n.ay) * 0.8;
        const v = Math.hypot(n.vx, n.vy);
        if (v > 14) { n.vx *= 14 / v; n.vy *= 14 / v; }
        n.x = Math.max(p, Math.min(xmax, n.x + n.vx)); n.y = Math.max(top, Math.min(H - 34, n.y + n.vy));
      });
      heat *= 0.995;
    }
    function settle() { for (let i = 0; i < 500; i++) tick(); }
    function update(t: number) {
      if (heat > 0.02) tick();
      const k = RM ? 1 : 0.14;
      laneA += ((step === 0 ? 1 : 0) - laneA) * k; edgeA += ((step === 0 ? 0 : 1) - edgeA) * k;
      nodes.forEach((n) => { const tgt = (step === 0 && n.type === "person" ? 0 : 1) * (n.day <= day ? 1 : 0.13); n.a += (tgt - n.a) * k; });
      if (step === 3) { pathT = RM ? 4.6 : Math.min(4.6, (t - pathAt) / 420); if (pathT >= 4.6 && !autoShown) { autoShown = true; if (!cardOpen()) open("adr", true); } }
      else pathT = 0;
    }
    function shape(n: GNode, r: number, lit: boolean) {
      const c = ctx!;
      c.beginPath();
      if (n.type === "room") { c.rect(n.x - r, n.y - r, r * 2, r * 2); c.fillStyle = C.bg; c.fill(); c.strokeStyle = lit ? C.trail : C.ink; c.lineWidth = 1.4; c.stroke(); return; }
      if (n.type === "rule") { c.moveTo(n.x, n.y - r); c.lineTo(n.x + r, n.y); c.lineTo(n.x, n.y + r); c.lineTo(n.x - r, n.y); c.closePath(); c.fillStyle = C.bg; c.fill(); c.strokeStyle = C.ink2; c.lineWidth = 1.4; c.stroke(); return; }
      c.arc(n.x, n.y, r, 0, Math.PI * 2);
      if (n.type === "person") { c.fillStyle = C.ink2; c.fill(); return; }
      if (lit) { c.fillStyle = C.trail; c.fill(); return; }
      if (n.type === "dec") { c.fillStyle = C.ink; c.fill(); return; }
      c.fillStyle = C.bg; c.fill(); c.strokeStyle = step === 0 ? C.ink3 : C.ink2; c.lineWidth = 1.5; c.stroke();
    }
    function draw() {
      if (!W) return;
      const c = ctx!;
      c.clearRect(0, 0, W, H);
      if (laneA > 0.01) {
        c.save(); c.globalAlpha = laneA; c.strokeStyle = C.lane; c.setLineDash([3, 6]); c.lineWidth = 1;
        for (let i = 0; i < 5; i++) { c.beginPath(); if (narrow) { const y = rowY(i); c.moveTo(rowX0() - 24, y); c.lineTo(W - 14, y); } else { const x = laneX(i); c.moveTo(x, 62); c.lineTo(x, H - 20); } c.stroke(); }
        c.restore();
      }
      const hi = hover ? nb[hover.id] : null, dim = (n: GNode) => (hi && !hi.has(n.id) ? 0.2 : 1);
      c.lineWidth = 1;
      edges.forEach((e) => {
        const al = edgeA * Math.min(e.a.a, e.b.a) * Math.min(dim(e.a), dim(e.b));
        if (al < 0.01) return;
        c.globalAlpha = al;
        c.strokeStyle = hi && hi.has(e.a.id) && hi.has(e.b.id) && (e.a === hover || e.b === hover) ? C.ink2 : C.edge;
        c.beginPath(); c.moveTo(e.a.x, e.a.y); c.lineTo(e.b.x, e.b.y); c.stroke();
      });
      if (step === 3) {
        c.globalAlpha = 1; c.strokeStyle = C.trail; c.lineWidth = 2.5; c.lineCap = "round";
        for (let i = 0; i < 4; i++) {
          const a = by[GRAPH_PATH[i]], b = by[GRAPH_PATH[i + 1]];
          if (b.day > day) break;
          const f = Math.max(0, Math.min(1, pathT - i));
          if (!f) break;
          c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f); c.stroke();
        }
      }
      c.font = "11px " + C.mono; c.textBaseline = "middle";
      nodes.forEach((n) => {
        const al = n.a * dim(n);
        if (al < 0.01) return;
        c.globalAlpha = al;
        const lit = step === 3 && n.pi >= 0 && pathT > n.pi && n.day <= day, r = n.type === "room" ? 6 : n.type === "dec" ? 7 : n.type === "rule" ? 6.5 : n.type === "person" ? 5 : 4.5;
        if (lit) { c.beginPath(); c.arc(n.x, n.y, r + 6, 0, Math.PI * 2); c.fillStyle = C.soft; c.fill(); }
        shape(n, r, lit);
        if (sel === n.id) { c.beginPath(); c.arc(n.x, n.y, r + 5, 0, Math.PI * 2); c.strokeStyle = C.ink; c.lineWidth = 1; c.stroke(); }
        c.fillStyle = lit || n === hover ? C.ink : n.type === "room" ? C.ink2 : C.ink3;
        const tw = c.measureText(n.s).width, left = n.x + r + 8 + tw > W - 6;
        c.textAlign = left ? "right" : "left";
        c.fillText(n.s, left ? n.x - r - 7 : n.x + r + 7, n.y);
      });
      c.globalAlpha = 1; c.textAlign = "left";
    }
    function loop(t: number) { raf = 0; if (!vis) return; update(t); draw(); raf = requestAnimationFrame(loop); }
    cleanups.push(watchVisible(box, (v) => { vis = v; if (v && !raf) raf = requestAnimationFrame(loop); }, "80px"));

    /* provenance card (built from our own static data) */
    function open(id: string, isAuto: boolean) {
      if (!prov || !main) return;
      const n = by[id];
      let h = '<button type="button" class="graph-prov-x" aria-label="Close card">×</button>';
      if (id === "adr") {
        h += '<p class="graph-prov-src">ADR-031 · Notion</p><h3 class="graph-prov-h">Removed the multi-seat option from checkout</h3>' + (day < n.day ? `<p class="graph-prov-note">On ${fmt(day)} this was not decided yet.</p>` : "") +
          '<dl class="graph-prov-dl"><dt>Why</dt><dd>38% of SMB buyers dropped off at the seat step.</dd><dt>Decision</dt><dd>One seat by default. Teams add seats later.</dd></dl><div class="graph-prov-srcs">' +
          GRAPH_ADR_SOURCES.map((s) => `<button type="button" class="graph-prov-s" data-id="${s[0]}"><svg class="app-mark"><use href="#mark-${s[1]}"/></svg>${s[2]}</button>`).join("") + '</div><p class="graph-prov-meta">Written by OmniTrace · 14 Mar 2026</p>';
      } else if (GRAPH_PROV[id]) {
        const P = GRAPH_PROV[id];
        h += `<p class="graph-prov-src">${P[0]}</p><h3 class="graph-prov-h">${n.l.split(" · ").pop()}</h3><p class="graph-prov-q">${P[1]}</p><p class="graph-prov-meta">${P[2]}</p>` + (n.pi >= 0 ? '<button type="button" class="graph-prov-s" data-id="adr" style="margin-top:10px">Part of ADR-031</button>' : "");
      } else {
        const list = Array.from(nb[id]).filter((x) => (x !== id && GRAPH_PROV[x]) || (x === "adr" && nb[id].has(x))).map((x) => by[x].s);
        h += `<p class="graph-prov-src">${n.type === "room" ? "Room" : "Person"}</p><h3 class="graph-prov-h">${n.l}</h3><p class="graph-prov-q">${n.type === "room" ? "Cards from this room:" : "Cards this person touched:"} ${list.join(", ")}.</p>`;
      }
      prov.innerHTML = h;
      const was = cardOpen();
      prov.hidden = false;
      main.classList.add("graph-has-card");
      if (!was && !RM) { prov.style.animation = "none"; void prov.offsetWidth; prov.style.animation = ""; }
      sel = isAuto ? null : id; auto = isAuto; heat = 1;
    }
    function close() { if (!prov || !main) return; prov.hidden = true; main.classList.remove("graph-has-card"); sel = null; auto = false; heat = 1; }
    if (prov) listen(prov, "click", (e) => {
      const b = (e.target as Element).closest<HTMLButtonElement>("button");
      if (!b) return;
      if (b.classList.contains("graph-prov-x")) close();
      else if (b.dataset.id) open(b.dataset.id, false);
    });

    /* steps */
    function setStep(s: number) {
      s = Math.max(0, Math.min(3, s));
      if (s === step) return;
      const prev = step; step = s; heat = 1;
      steps.forEach((el, i) => { el.classList.toggle("is-on", i === s); el.setAttribute("aria-hidden", String(i !== s)); });
      dots.forEach((d, i) => (i === s ? d.setAttribute("aria-current", "step") : d.removeAttribute("aria-current")));
      if (navB.length) { navB[0].disabled = s === 0; navB[1].disabled = s === 3; }
      if (ask) ask.classList.toggle("is-on", s >= 2);
      if (s >= 2 && !typed && askT) { typed = true; if (!RM) cancelType = typeText(askT, GRAPH_QUESTION, 26); else askT.textContent = GRAPH_QUESTION; }
      autoShown = false;
      if (s === 3) pathAt = performance.now();
      if (prev === 3 && auto) close();
      if (RM) settle();
    }
    steps.forEach((el, i) => el.setAttribute("aria-hidden", String(i !== 0)));
    const stepTop = (i: number) => { const r = pin.getBoundingClientRect(); return scrollY + r.top + ((r.height - innerHeight) * (i + 0.5)) / 4; };
    dots.forEach((d, i) => listen(d, "click", () => { if (wide) scrollTo({ top: stepTop(i), behavior: RM ? "auto" : "smooth" }); else setStep(i); }));
    navB.forEach((b) => listen(b, "click", () => setStep(step + Number(b.dataset.go))));
    let sq = 0;
    const onScroll = () => {
      sq = 0;
      if (!wide) return;
      const r = pin.getBoundingClientRect(), span = r.height - innerHeight;
      const p = span > 0 ? Math.max(0, Math.min(1, -r.top / span)) : 0;
      setStep(Math.min(3, Math.floor(p * 4)));
    };
    listen(window, "scroll", () => { if (!sq) sq = requestAnimationFrame(onScroll); }, { passive: true });

    /* hover + click */
    const hit = (e: PointerEvent | MouseEvent, rad: number) => {
      const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      let best: GNode | null = null, bd = rad * rad;
      nodes.forEach((n) => { if (n.a < 0.3) return; const d = (n.x - x) ** 2 + (n.y - y) ** 2; if (d < bd) { bd = d; best = n; } });
      return best as GNode | null;
    };
    listen(cv, "pointermove", (ev) => {
      const e = ev as PointerEvent;
      if (e.pointerType !== "mouse") return;
      const n = hit(e, 18);
      if (n === hover) return;
      hover = n; cv.style.cursor = n ? "pointer" : "default";
      if (n && tip) {
        tip.textContent = n.l + (n.day ? " · " + fmt(n.day) : "");
        tip.classList.add("is-on");
        const tw = tip.offsetWidth;
        tip.style.transform = `translate(${Math.max(8, Math.min(W - tw - 8, n.x - tw / 2))}px,${n.y > 70 ? n.y - 46 : n.y + 16}px)`;
      } else if (tip) tip.classList.remove("is-on");
    });
    listen(cv, "pointerleave", () => { hover = null; if (tip) tip.classList.remove("is-on"); });
    listen(cv, "click", (ev) => { const e = ev as PointerEvent; const n = hit(e, e.pointerType === "mouse" ? 18 : 26); if (n) open(n.id, false); });

    /* time scrubber */
    const track = q<HTMLElement>(".graph-track"), handle = q<HTMLElement>(".graph-handle"), fill = q<HTMLElement>(".graph-fill"), qd = q<HTMLElement>(".graph-scrub-d"), cnt = q<HTMLElement>(".graph-scrub-n"), capd = q<HTMLElement>(".graph-cap-d");
    function setDay(d: number) {
      day = Math.max(0, Math.min(MAXD, Math.round(d)));
      const p = day / MAXD;
      if (handle) { handle.style.left = p * 100 + "%"; handle.setAttribute("aria-valuenow", String(day)); handle.setAttribute("aria-valuetext", fmt(day, true)); }
      if (fill) fill.style.transform = `scaleX(${p})`;
      if (qd) qd.textContent = fmt(day);
      if (capd) capd.textContent = fmt(day, true);
      if (cnt) cnt.textContent = CARDS.filter((n) => n.day <= day).length + " of " + CARDS.length + " cards known";
      if (cardOpen() && (auto || sel === "adr")) open("adr", auto);
    }
    if (track && handle) {
      const fromX = (x: number) => { const r = track.getBoundingClientRect(); setDay(((x - r.left) / r.width) * MAXD); };
      let drag = false;
      listen(track, "pointerdown", (ev) => { const e = ev as PointerEvent; drag = true; track.setPointerCapture(e.pointerId); fromX(e.clientX); handle.focus({ preventScroll: true }); });
      listen(track, "pointermove", (ev) => { if (drag) fromX((ev as PointerEvent).clientX); });
      ["pointerup", "pointercancel"].forEach((t) => listen(track, t, () => { drag = false; }));
      listen(handle, "keydown", (ev) => {
        const e = ev as KeyboardEvent;
        const k = ({ ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1, PageDown: -7, PageUp: 7 } as Record<string, number>)[e.key];
        if (k) { setDay(day + k); e.preventDefault(); }
        else if (e.key === "Home") { setDay(0); e.preventDefault(); }
        else if (e.key === "End") { setDay(MAXD); e.preventDefault(); }
      });
    }
    setDay(day);
    const onMQ = () => { wide = wideMQ.matches; if (wide) onScroll(); heat = 1; };
    wideMQ.addEventListener("change", onMQ);
    cleanups.push(() => wideMQ.removeEventListener("change", onMQ));
    if ("ResizeObserver" in window) { const ro = new ResizeObserver(size); ro.observe(box); cleanups.push(() => ro.disconnect()); }
    else listen(window, "resize", size);
    size();
    onScroll();

    return () => {
      cleanups.forEach((f) => f());
      cancelAnimationFrame(raf);
      cancelAnimationFrame(sq);
      if (cancelType) cancelType();
    };
  }, []);

  return (
    <section id="how" className="section" aria-labelledby="graph-title" ref={secRef}>
      <div className="container">
        <h2 id="graph-title" className="graph-h2">One decision. Four rooms. One trail.</h2>
        <p className="graph-lede">Follow the checkout decision from a Slack message to a written record.</p>
      </div>
      <div className="graph-pin">
        <div className="graph-sticky">
          <div className="container graph-grid">
            <div className="graph-side">
              <div className="graph-steps" aria-live="polite">
                {GRAPH_STEPS.map((s, i) => (
                  <div key={s.h} className={"graph-step" + (i === 0 ? " is-on" : "")}><p className="graph-step-k">Step {i + 1} of 4</p><h3 className="graph-step-h">{s.h}</h3><p className="graph-step-p">{s.p}</p></div>
                ))}
              </div>
              <div className="graph-ctrl">
                <button type="button" className="btn btn-secondary graph-nav-b" data-go="-1" disabled>Back</button>
                <div className="graph-dots" role="group" aria-label="Steps">
                  {GRAPH_STEPS.map((s, i) => (
                    <button key={s.h} type="button" className="graph-dot" aria-label={`Step ${i + 1}: ${s.h}`} aria-current={i === 0 ? "step" : undefined}></button>
                  ))}
                </div>
                <button type="button" className="btn btn-primary graph-nav-b" data-go="1">Next</button>
              </div>
            </div>
            <div className="graph-main">
              <div className="graph-box">
                <canvas className="graph-canvas" role="img" aria-label="Decision graph of 18 cards. A Slack message (11 Mar), a Figma frame (12 Mar), an Excel cell (13 Mar) and GitHub PR #412 (14 Mar) lead to decision ADR-031: the multi-seat option was removed from checkout on 14 Mar 2026."></canvas>
                <p className="graph-ask" aria-hidden="true"><span className="graph-ask-k">you asked</span><span className="graph-ask-t"></span></p>
                <p className="graph-legend" aria-hidden="true"><span>■ room</span><span>● person</span><span>○ card</span><span>◆ rule</span></p>
                <div className="graph-tip" aria-hidden="true"></div>
              </div>
              <aside className="graph-prov paper" hidden aria-live="polite"></aside>
              <div className="graph-scrub">
                <div className="graph-scrub-top"><p className="graph-scrub-q">What did we know on <span className="graph-scrub-d">14 Mar</span>?</p><span className="graph-scrub-n"></span></div>
                <div className="graph-track">
                  <span className="graph-fill"></span>
                  {EV_DAYS.map((d) => <span key={d} className="graph-ev" style={{ left: (d / MAXD) * 100 + "%" }}></span>)}
                  <span className="graph-handle" role="slider" tabIndex={0} aria-label="Show the graph as of this date" aria-valuemin={0} aria-valuemax={MAXD}></span>
                </div>
                <div className="graph-ticks" aria-hidden="true">
                  {MON.slice(0, 9).map((m, i) => <span key={m} style={{ left: (dayOf(`2026-0${i + 1}-01`) / MAXD) * 100 + "%" }}>{m}</span>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container graph-capwrap"><p className="fig graph-cap">fig. 03 — the decision graph, as of <span className="graph-cap-d">14 Mar 2026</span></p></div>
    </section>
  );
}
