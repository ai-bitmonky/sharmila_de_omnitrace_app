"use client";
import { useEffect, useRef } from "react";
import { DATA } from "@/data/app";
import { Chev, G, M } from "./icons";
import { ScreenShell } from "./LargeTitle";
import { useApp } from "./store";

/** Alerts list (Impact Radius): swipe left to reveal Dismiss; swipe far to dismiss in one go. */
export default function Alerts() {
  const app = useApp();
  const { read, gone } = app.state;
  const L = DATA.alerts.filter((a) => !gone.includes(a.id));
  const open = useRef<HTMLElement | null>(null);
  const sw = useRef<{ r: HTMLElement; x: number; y: number; dx: number; on: boolean; base: number; W: number } | null>(null);
  const swiped = useRef(false);
  const timers = useRef<number[]>([]);
  const appRef = useRef(app);
  useEffect(() => { appRef.current = app; });

  const shut = (r: HTMLElement) => { r.style.transform = ""; if (open.current === r) open.current = null; };
  const dismiss = (box: HTMLElement) => {
    const id = +(box.dataset.al || 0), r = box.querySelector<HTMLElement>(".al");
    if (r) r.style.transform = "translateX(-100%)";
    box.style.height = box.offsetHeight + "px"; void box.offsetHeight; box.classList.add("going"); box.style.height = "0";
    if (open.current === r) open.current = null;
    appRef.current.buzz();
    appRef.current.dropLater(id, appRef.current.RM ? 0 : 330);
  };
  const dismissRef = useRef(dismiss);
  useEffect(() => { dismissRef.current = dismiss; });

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const s = sw.current; if (!s) return;
      const dx = e.clientX - s.x, dy = e.clientY - s.y;
      if (!s.on) { if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return; if (Math.abs(dy) > Math.abs(dx)) { sw.current = null; return; } s.on = true; s.r.classList.add("drag"); }
      s.dx = Math.min(0, s.base + dx); s.r.style.transform = `translateX(${s.dx}px)`;
      s.r.closest(".sw")?.classList.toggle("far", -s.dx > s.W * 0.4);
    };
    const end = () => {
      const s = sw.current; sw.current = null; if (!s || !s.on) return;
      swiped.current = true; timers.current.push(window.setTimeout(() => (swiped.current = false), 60)); s.r.classList.remove("drag");
      if (-s.dx > s.W * 0.4) dismissRef.current(s.r.closest(".sw") as HTMLElement);
      else if (-s.dx > 60) { s.r.style.transform = "translateX(-88px)"; open.current = s.r; }
      else shut(s.r);
    };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", end); window.addEventListener("pointercancel", end);
    const t = timers.current;
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", end); window.removeEventListener("pointercancel", end); t.forEach(clearTimeout); };
  }, []);

  return (
    <ScreenShell title="Alerts" large>
      <div className="alw"
        onPointerDown={(e) => {
          const r = (e.target as Element).closest<HTMLElement>(".al"); if (!r) return;
          if (open.current && open.current !== r) shut(open.current);
          sw.current = { r, x: e.clientX, y: e.clientY, dx: 0, on: false, base: r === open.current ? -88 : 0, W: r.offsetWidth };
        }}
        onClickCapture={(e) => {
          if (swiped.current) { e.stopPropagation(); e.preventDefault(); return; }
          if ((e.target as Element).closest("[data-dis]")) return;
          if (open.current) { shut(open.current); e.stopPropagation(); }
        }}
      >
        {L.length ? (
          <>
            <h3 className="gh" style={{ marginTop: 4 }}>Impact Radius</h3>
            <div className="grp ic-in">
              {L.map((a) => {
                const unread = !read.includes(a.id);
                return (
                  <div className="sw" data-al={a.id} key={a.id}>
                    <button className="sw-act" data-dis tabIndex={-1} onClick={(e) => dismiss(e.currentTarget.closest(".sw") as HTMLElement)}>Dismiss</button>
                    <button className={"row tap al" + (a.warn ? " warn" : "") + (unread ? " unread" : "")} onClick={() => app.push("alerts", "alert", String(a.id))}>
                      <span className="ic"><M a={a.a} /></span>
                      <span className="tx"><span className="t1" style={{ display: "block" }}>{a.t}</span><span className="t2" style={{ display: "block" }}>{a.m}</span></span>
                      {unread ? <i className="udot" aria-label="Unread" /> : null}<Chev />
                    </button>
                  </div>
                );
              })}
            </div>
            <p className="gf">Swipe left on an alert to dismiss it.</p>
          </>
        ) : (
          <div className="empty"><G id="check" /><b>All clear</b><span>OmniTrace tells you when a new edit breaks an old decision.</span></div>
        )}
      </div>
    </ScreenShell>
  );
}
