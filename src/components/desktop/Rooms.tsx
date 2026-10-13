"use client";
import { useEffect, useRef } from "react";
import { ROOMS, ROOMS_PROBLEMS, ROOMS_STATUS, ROOM_FURN, ROOM_LAYOUT, type RoomLayout } from "@/data/site";
import { mk, prefersReduced, watchVisible } from "./lib";

type Pt = [number, number];

export default function Rooms() {
  const secRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sec = secRef.current;
    const svg = sec?.querySelector<SVGSVGElement>(".rooms-svg");
    const status = sec?.querySelector<HTMLElement>(".rooms-status");
    if (!sec || !svg || !status) return;
    const btns = Array.from(sec.querySelectorAll<HTMLButtonElement>(".rooms-toggle button"));
    const RM = prefersReduced();
    let L: RoomLayout = ROOM_LAYOUT.d, pts: Pt[] = [], cum: number[] = [], tot = 1, stopS: number[] = [];
    let trail: SVGElement | null = null, ghost: SVGElement | null = null, dot: SVGElement | null = null, hallT: SVGElement | null = null;
    let cards: SVGElement[] = [];
    let withOn = false, s = 0, next = 1, wait = 900, last = 0, raf = 0, vis = false, mode = "";

    const ptAt = (v: number): Pt => {
      v = Math.max(0, Math.min(tot, v));
      let i = 1;
      while (i < pts.length - 1 && cum[i] < v) i++;
      const a = pts[i - 1], b = pts[i], sl = cum[i] - cum[i - 1] || 1, f = (v - cum[i - 1]) / sl;
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
    };
    function build() {
      const m = matchMedia("(min-width:1024px)").matches ? "d" : "m";
      if (m === mode) return;
      mode = m; L = ROOM_LAYOUT[m]; const fs = L.fs;
      svg!.textContent = ""; svg!.setAttribute("viewBox", `0 0 ${L.w} ${L.h}`);
      const h = L.hall; mk("rect", { x: h[0], y: h[1], width: h[2], height: h[3], rx: 10, class: "rooms-hall" }, svg!);
      hallT = mk("text", { x: L.ht[0], y: L.ht[1], "font-size": fs * 0.8, class: "rooms-hall-t", transform: `rotate(${L.ht[2]} ${L.ht[0]} ${L.ht[1]})` }, svg!);
      pts = []; stopS = []; const stopIdx: number[] = [];
      L.r.forEach((r, i) => {
        const g = mk("g", {}, svg!);
        mk("rect", { x: r[0], y: r[1], width: r[2], height: r[3], rx: 12, class: "rooms-room" }, g);
        mk("use", { href: "#mark-" + ROOMS[i][0], x: r[0] + 16, y: r[1] + 16, width: fs * 1.3, height: fs * 1.3, class: "rooms-mark" }, g);
        mk("text", { x: r[0] + 24 + fs * 1.3, y: r[1] + 16 + fs * 1.05, "font-size": fs * 1.05, class: "rooms-name" }, g).textContent = ROOMS[i][1];
        mk("text", { x: r[0] + 16, y: r[1] + 30 + fs * 2.2, "font-size": fs * 0.78, class: "rooms-sub" }, g).textContent = ROOMS[i][2];
        const f = mk("g", { class: "rooms-furn", transform: `translate(${r[8]} ${r[9]}) scale(${r[10]})` }, g);
        f.innerHTML = ROOM_FURN[ROOMS[i][0]];
        const st: Pt = [r[6], r[7]], hp = L.hp(r[6], r[7]);
        if (i === 0) { pts.push(st); stopIdx.push(0); pts.push(hp); }
        else { pts.push(hp, st); stopIdx.push(pts.length - 1); if (i < 4) pts.push(hp); }
      });
      cum = [0];
      for (let i = 1; i < pts.length; i++) cum[i] = cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      tot = cum[cum.length - 1]; stopS = stopIdx.map((i) => cum[i]);
      trail = mk("path", { d: "M" + pts.map((p) => p.join(" ")).join("L"), class: "rooms-trail", "stroke-dasharray": tot, "stroke-dashoffset": tot }, svg!);
      ghost = mk("g", { class: "rooms-ghost" }, svg!);
      for (let k = 0; k < 6; k++) mk("polyline", { points: "", "stroke-opacity": (0.6 - k * 0.1).toFixed(2) }, ghost);
      const cw = fs * 9.4, ch = fs * 3.3;
      cards = L.r.map((r, i) => {
        const o = mk("g", { transform: `translate(${r[4] - cw / 2} ${r[5] - ch / 2})` }, svg!), c = mk("g", { class: "rooms-card" }, o);
        mk("rect", { width: cw, height: ch, rx: 6, class: "rooms-card-bg" }, c);
        mk("rect", { width: 5, height: ch, rx: 2, class: "rooms-card-tab" }, c);
        mk("text", { x: 16, y: ch * 0.46, "font-size": fs * 0.95, class: "rooms-card-t" }, c).textContent = ROOMS[i][3];
        mk("text", { x: 16, y: ch * 0.8, "font-size": fs * 0.72, class: "rooms-card-s" }, c).textContent = ROOMS[i][4];
        return c;
      });
      dot = mk("g", {}, svg!);
      mk("circle", { r: fs * 1.05, class: "rooms-dot-ring" }, dot);
      mk("circle", { r: fs * 0.5, class: "rooms-dot" }, dot);
      label();
      if (RM) still(); else { reset(); render(); }
    }
    function label() { if (hallT) hallT.textContent = withOn ? "hallway · OmniTrace keeps it" : "hallway · nobody keeps it"; }
    function reset() { s = 0; next = 1; wait = 900; cards.forEach((c, i) => c.classList.toggle("is-in", withOn && i === 0)); }
    function still() { s = withOn ? tot : stopS[2]; cards.forEach((c) => c.classList.toggle("is-in", withOn)); render(); }
    function render() {
      if (!dot || !trail || !ghost) return;
      const p = ptAt(s);
      dot.setAttribute("transform", `translate(${p[0].toFixed(1)} ${p[1].toFixed(1)})`);
      trail.setAttribute("stroke-dashoffset", (tot - s).toFixed(1));
      const polys = ghost.querySelectorAll("polyline");
      if (withOn || RM) { polys.forEach((pl) => pl.setAttribute("points", "")); return; }
      const seg = tot * 0.014;
      polys.forEach((pl, k) => {
        const a = s - k * seg, b = a - seg, q: string[] = [];
        if (a > 0) { for (let v = a; v >= Math.max(0, b); v -= seg / 5) q.push(ptAt(v).map((n) => n.toFixed(1)).join(",")); }
        pl.setAttribute("points", q.join(" "));
      });
    }
    function frame(t: number) {
      raf = 0;
      const dt = Math.min(64, t - (last || t)); last = t;
      if (wait > 0) { wait -= dt; if (wait <= 0 && next > 4) reset(); }
      else {
        s += (dt * tot) / 9000;
        if (s >= stopS[next]) { s = stopS[next]; if (withOn) cards[next].classList.add("is-in"); next++; wait = next > 4 ? 2600 : 750; }
      }
      render();
      if (vis) raf = requestAnimationFrame(frame);
    }
    const play = () => { if (!RM && vis && !raf) { last = 0; raf = requestAnimationFrame(frame); } };
    const onBtn = (e: Event) => {
      const b = e.currentTarget as HTMLButtonElement;
      const w = b.dataset.with === "1";
      if (w === withOn) return;
      withOn = w;
      btns.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      sec.classList.toggle("rooms-is-with", w);
      label();
      const st = w ? ROOMS_STATUS.with : ROOMS_STATUS.without;
      status.textContent = st.text;
      const bEl = document.createElement("b"); bEl.textContent = st.bold; status.appendChild(bEl);
      if (RM) still(); else { reset(); render(); }
    };
    btns.forEach((b) => b.addEventListener("click", onBtn));
    build();
    addEventListener("resize", build);
    const unwatch = watchVisible(svg, (v) => { vis = v; play(); }, "80px");
    return () => {
      btns.forEach((b) => b.removeEventListener("click", onBtn));
      removeEventListener("resize", build);
      unwatch();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="problem" className="section" aria-labelledby="rooms-title" ref={secRef}>
      <div className="container">
        <div className="rooms-head">
          <div>
            <h2 id="rooms-title" className="rooms-h2">Work happens in rooms. Nobody keeps the hallway.</h2>
            <p className="rooms-lede">Slack is the meeting room. Figma is the drawing board. Excel is the accounting desk. Your team walks between them all day. Nobody writes down what happened on the way. Six months later, nobody knows why.</p>
          </div>
          <div className="rooms-toggle" role="group" aria-label="Show the office">
            <button type="button" aria-pressed="true" data-with="0">Without OmniTrace</button>
            <button type="button" aria-pressed="false" data-with="1">With OmniTrace</button>
          </div>
        </div>
        <div className="rooms-plan">
          <svg className="rooms-svg" viewBox="0 0 1600 700" role="img" aria-label="Floor plan: five rooms (Slack, Figma, Excel, GitHub, Notion) joined by one hallway. A person walks from room to room."></svg>
        </div>
        <p className="rooms-status" aria-live="polite">{ROOMS_STATUS.without.text}<b>{ROOMS_STATUS.without.bold}</b></p>
        <p className="fig rooms-cap">fig. 02 — five rooms, one hallway</p>

        <div className="rooms-probs">
          <div className="rooms-prob">
            <svg className="rooms-demo" viewBox="0 0 200 72" aria-hidden="true">
              <g className="rooms-f1"><rect x="6" y="8" width="36" height="22" rx="4" /><path d="M12 16h18M12 22h10" /><path className="rooms-y" d="M43 19h9" /></g>
              <g className="rooms-f2"><rect x="62" y="40" width="36" height="22" rx="4" /><path d="M68 48h20M68 54h12" /><path className="rooms-y" d="M99 51h9" /></g>
              <g className="rooms-f3"><rect x="114" y="6" width="36" height="22" rx="4" /><path d="M120 14h16M120 20h20" /><path className="rooms-y" d="M151 17h8" /></g>
              <g className="rooms-f4"><rect x="160" y="38" width="36" height="22" rx="4" /><path d="M166 46h18M166 52h8" /></g>
            </svg>
            <h3 className="rooms-prob-h">{ROOMS_PROBLEMS[0].h}</h3>
            <p className="rooms-prob-p">{ROOMS_PROBLEMS[0].p}</p>
          </div>
          <div className="rooms-prob">
            <svg className="rooms-demo" viewBox="0 0 200 72" aria-hidden="true">
              <circle className="rooms-head-f" cx="34" cy="32" r="7" /><path d="M22 60q12-18 24 0" />
              <g className="rooms-ask"><rect x="44" y="6" width="22" height="18" rx="5" /><text className="rooms-qt" x="51" y="19">?</text></g>
              <g className="rooms-leaver"><circle className="rooms-head-l" cx="100" cy="32" r="7" /><path d="M88 60q12-18 24 0" /><rect className="rooms-bub" x="108" y="4" width="36" height="18" rx="5" /><path className="rooms-y" d="M116 13h4M124 13h4M132 13h4" /></g>
              <path d="M178 12v50M178 12h16" />
            </svg>
            <h3 className="rooms-prob-h">{ROOMS_PROBLEMS[1].h}</h3>
            <p className="rooms-prob-p">{ROOMS_PROBLEMS[1].p}</p>
          </div>
          <div className="rooms-prob">
            <svg className="rooms-demo" viewBox="0 0 200 72" aria-hidden="true">
              <rect x="50" y="3" width="100" height="18" rx="9" /><circle cx="62" cy="12" r="3.5" /><path d="M65 15l3 3" />
              <path className="rooms-beam rooms-l0" d="M100 21L29 44" /><path className="rooms-beam" style={{ animationDelay: "1s" }} d="M100 21L77 44" /><path className="rooms-beam" style={{ animationDelay: "2s" }} d="M100 21L123 44" /><path className="rooms-beam" style={{ animationDelay: "3s" }} d="M100 21L171 44" />
              <rect x="14" y="44" width="30" height="24" rx="4" /><rect x="62" y="44" width="30" height="24" rx="4" /><rect x="108" y="44" width="30" height="24" rx="4" /><rect x="156" y="44" width="30" height="24" rx="4" />
              <rect className="rooms-lit rooms-l0" x="14" y="44" width="30" height="24" rx="4" /><rect className="rooms-lit" style={{ animationDelay: "1s" }} x="62" y="44" width="30" height="24" rx="4" /><rect className="rooms-lit" style={{ animationDelay: "2s" }} x="108" y="44" width="30" height="24" rx="4" /><rect className="rooms-lit" style={{ animationDelay: "3s" }} x="156" y="44" width="30" height="24" rx="4" />
            </svg>
            <h3 className="rooms-prob-h">{ROOMS_PROBLEMS[2].h}</h3>
            <p className="rooms-prob-p">{ROOMS_PROBLEMS[2].p}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
