"use client";
import { useEffect, useRef } from "react";
import { FAQ, ORBIT_APPS } from "@/data/site";
import { prefersReduced, watchVisible } from "./lib";

/* §7 integrations orbit + FAQ (native <details>) */
export default function Integrations() {
  const secRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sec = secRef.current;
    const svg = sec?.querySelector<SVGSVGElement>("#orbit");
    const g = svg?.querySelector<SVGGElement>(".orbit-items"), line = svg?.querySelector<SVGLineElement>(".orbit-line");
    const rn = sec?.querySelector<HTMLElement>(".orbit-read-n"), rt = sec?.querySelector<HTMLElement>(".orbit-read-t");
    if (!sec || !svg || !g || !line || !rn || !rt) return;
    const A = ORBIT_APPS;
    const items = Array.from(g.querySelectorAll<SVGGElement>(".orbit-item"));
    let ang = -Math.PI / 2, act = -1, on = false, last = 0, raf = 0;
    const pos: [number, number][] = [];
    const place = () => {
      items.forEach((it, i) => { const a = ang + (i * 2 * Math.PI) / A.length, x = 200 + 150 * Math.cos(a), y = 200 + 150 * Math.sin(a); pos[i] = [x, y]; it.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ")"); });
      if (act > -1) {
        const p = pos[act], dx = p[0] - 200, dy = p[1] - 200, d = Math.hypot(dx, dy);
        line.setAttribute("x1", (200 + (dx * 38) / d).toFixed(1)); line.setAttribute("y1", (200 + (dy * 38) / d).toFixed(1));
        line.setAttribute("x2", (p[0] - (dx * 27) / d).toFixed(1)); line.setAttribute("y2", (p[1] - (dy * 27) / d).toFixed(1));
      }
    };
    const tick = (t: number) => { if (!on) return; const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t; if (act < 0) { ang += dt * 0.07; place(); } raf = requestAnimationFrame(tick); };
    const set = (i: number) => {
      act = i;
      items.forEach((it, j) => it.classList.toggle("is-on", j === i));
      line.classList.toggle("is-on", i > -1);
      if (i > -1) { rn.textContent = A[i][1] + " — what it reads"; rt.textContent = A[i][2]; }
      else { rn.textContent = "What it reads"; rt.textContent = "Hover or tap an app on the ring."; }
      place();
    };
    place();
    const itemOf = (e: Event) => (e.target as Element).closest<SVGGElement>(".orbit-item");
    const hov = () => matchMedia("(hover:hover)").matches;
    const onOver = (e: Event) => { const it = itemOf(e); if (it) set(Number(it.dataset.i)); };
    const onLeave = () => { if (hov()) set(-1); };
    const onClick = (e: Event) => { const it = itemOf(e); if (!it) return; const i = Number(it.dataset.i); set(hov() || act !== i ? i : -1); };
    const onKey = (e: Event) => { const ke = e as KeyboardEvent; const it = itemOf(e); if (it && (ke.key === "Enter" || ke.key === " ")) { e.preventDefault(); set(Number(it.dataset.i)); } };
    g.addEventListener("mouseover", onOver);
    g.addEventListener("mouseleave", onLeave);
    g.addEventListener("focusin", onOver);
    g.addEventListener("click", onClick);
    g.addEventListener("keydown", onKey);
    const unwatch = prefersReduced() ? () => {} : watchVisible(svg, (v) => { if (v && !on) { on = true; last = 0; raf = requestAnimationFrame(tick); } else if (!v) on = false; });
    return () => {
      g.removeEventListener("mouseover", onOver);
      g.removeEventListener("mouseleave", onLeave);
      g.removeEventListener("focusin", onOver);
      g.removeEventListener("click", onClick);
      g.removeEventListener("keydown", onKey);
      unwatch();
      on = false;
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="faq" className="section faq" ref={secRef}>
      <div className="container">
        <div className="orbit-wrap">
          <div className="orbit-copy">
            <h2>Works with the rooms you already use.</h2>
            <p className="lead">Seven apps today. You choose which ones it may read.</p>
            <div className="orbit-read" aria-live="polite"><p className="orbit-read-n">What it reads</p><p className="orbit-read-t">Hover or tap an app on the ring.</p></div>
          </div>
          <figure className="orbit-fig">
            <svg className="orbit" id="orbit" viewBox="0 0 400 400" role="group" aria-label="OmniTrace in the centre, seven apps around it. Select an app to see what OmniTrace reads from it.">
              <circle className="orbit-ring2" cx="200" cy="200" r="92" />
              <circle className="orbit-ring" cx="200" cy="200" r="150" />
              <line className="orbit-line" x1="200" y1="200" x2="200" y2="200" />
              <circle className="orbit-core" cx="200" cy="200" r="38" />
              <svg className="orbit-coremark" x="180" y="180" width="40" height="40"><use href="#mark-omnitrace" /></svg>
              <g className="orbit-items">
                {ORBIT_APPS.map((a, i) => (
                  <g key={a[0]} className="orbit-item" tabIndex={0} role="button" data-i={i} aria-label={a[1] + ": what it reads"}>
                    <circle className="orbit-dot" r="27" />
                    <svg className="orbit-glyph" x="-11" y="-11" width="22" height="22"><use href={"#mark-" + a[0]} /></svg>
                    <text y="46" textAnchor="middle">{a[1]}</text>
                  </g>
                ))}
              </g>
            </svg>
            <figcaption className="fig">fig. 06 — seven apps, one index</figcaption>
          </figure>
        </div>

        <div className="faq-block">
          <h2>Questions people actually ask</h2>
          <div className="faq-list">
            {FAQ.map((f) => (
              <details key={f.q} className="faq-item"><summary className="faq-q">{f.q}<span className="faq-plus" aria-hidden="true"></span></summary><p className="faq-a">{f.a}</p></details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
