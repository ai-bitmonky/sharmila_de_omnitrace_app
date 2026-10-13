"use client";
import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";

/** Bottom sheet: spring in, backdrop tap to close, drag the grabber/header down to dismiss. */
export default function Sheet({ content, on, closing, onClose }: { content: ReactNode; on: boolean; closing: boolean; onClose: () => void }) {
  const sh = useRef<HTMLDivElement>(null);
  const bd = useRef<HTMLDivElement>(null);
  const c = useRef<HTMLDivElement>(null);
  const t0 = useRef(0);
  const closeRef = useRef(onClose);
  useLayoutEffect(() => { closeRef.current = onClose; });

  useLayoutEffect(() => {
    if (sh.current) sh.current.style.transform = "";
    if (on) { t0.current = performance.now(); if (c.current) c.current.scrollTop = 0; }
  }, [on, content]);

  /* drag to dismiss */
  useEffect(() => {
    const el = sh.current; if (!el) return;
    let d: { y: number; t: number; dy: number; v: number; h: number } | null = null;
    const down = (e: PointerEvent) => {
      const tg = e.target as Element;
      if (!tg.closest(".grab,.sh-h") || tg.closest("button")) return;
      d = { y: e.clientY, t: e.timeStamp, dy: 0, v: 0, h: el.offsetHeight }; el.classList.add("drag"); e.preventDefault();
    };
    const move = (e: PointerEvent) => {
      if (!d) return; const dy = e.clientY - d.y; d.v = (dy - d.dy) / Math.max(1, e.timeStamp - d.t); d.t = e.timeStamp; d.dy = dy;
      el.style.transform = `translateY(${dy > 0 ? dy : dy / 5}px)`; if (bd.current) bd.current.style.opacity = String(1 - Math.max(0, dy) / d.h);
    };
    const end = () => {
      if (!d) return; el.classList.remove("drag"); if (bd.current) bd.current.style.opacity = "";
      const go = d.dy > d.h * 0.25 || d.v > 0.5; d = null;
      if (go) closeRef.current(); else el.style.transform = "";
    };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", end); window.addEventListener("pointercancel", end);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", end); window.removeEventListener("pointercancel", end);
    };
  }, []);

  return (
    <div id="sheet" className={"sheet-wrap" + (on ? " on" : "") + (closing ? " closing" : "")} aria-hidden={!on}>
      <div className="sheet-bd" ref={bd} onClick={() => { if (performance.now() - t0.current > 450) onClose(); }} />
      <div className="sheet" role="dialog" aria-modal="true" ref={sh}>
        <div className="grab"><i /></div>
        <div className="sheet-c" ref={c}>{content}</div>
      </div>
    </div>
  );
}
