"use client";
import { useEffect, useRef } from "react";
import { SPINE_SECTIONS } from "@/data/site";

/* Fixed left spine: scroll-driven trail + one dot per section. */
export default function Spine() {
  const trailRef = useRef<SVGLineElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const trail = trailRef.current, box = boxRef.current;
    if (!trail || !box) return;
    const dotEls = Array.from(box.querySelectorAll<HTMLAnchorElement>(".spine-dot"));
    const secs: { el: HTMLElement; a: HTMLAnchorElement; p: number }[] = [];
    SPINE_SECTIONS.forEach((s, i) => {
      const el = document.getElementById(s.id);
      const a = dotEls[i];
      if (el && a) secs.push({ el, a, p: 0 });
      else if (a) a.style.display = "none";
    });
    let raf = 0;
    const tick = () => {
      raf = 0;
      const H = document.documentElement.scrollHeight, max = Math.max(1, H - innerHeight), y = Math.min(scrollY, max), q = Math.min(1, (y + (innerHeight * y) / max) / H);
      trail.style.strokeDashoffset = String(1 - q);
      let act = -1;
      secs.forEach((s, i) => { if (q >= s.p - 0.002) act = i; });
      secs.forEach((s, i) => { s.a.classList.toggle("is-passed", i < act); s.a.classList.toggle("is-active", i === act); });
    };
    const layout = () => {
      const H = document.documentElement.scrollHeight;
      secs.forEach((s) => { s.p = (s.el.getBoundingClientRect().top + scrollY) / H; s.a.style.top = s.p * 100 + "%"; });
      tick();
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    let rafL = 0;
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", layout);
    addEventListener("load", layout);
    const ro = "ResizeObserver" in window ? new ResizeObserver(() => { if (!rafL) rafL = requestAnimationFrame(() => { rafL = 0; layout(); }); }) : null;
    ro?.observe(document.body);
    layout();
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", layout);
      removeEventListener("load", layout);
      ro?.disconnect();
      cancelAnimationFrame(raf);
      cancelAnimationFrame(rafL);
    };
  }, []);
  return (
    <div className="spine" aria-hidden="true">
      <svg className="spine-svg" preserveAspectRatio="none">
        <line className="spine-track" x1="1" y1="0" x2="1" y2="100%" />
        <line className="spine-trail" ref={trailRef} x1="1" y1="0" x2="1" y2="100%" pathLength={1} />
      </svg>
      <div className="spine-dots" ref={boxRef}>
        {SPINE_SECTIONS.map((s) => (
          <a key={s.id} className="spine-dot" href={"#" + s.id} tabIndex={-1}><span>{s.name}</span></a>
        ))}
      </div>
    </div>
  );
}
