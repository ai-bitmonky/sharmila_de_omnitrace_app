"use client";
import { Fragment, useEffect, useRef, useState } from "react";
import { M } from "./icons";
import { RoomRows } from "./shared";
import { useApp } from "./store";

/** First-launch welcome: three snap pages (trail mark draws in, choose rooms, the key drops into the phone). */
export default function Onboarding({ onDone }: { onDone: () => void }) {
  const app = useApp();
  const onb = app.state.onb;
  const pg = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(-1);

  useEffect(() => {
    if (onb !== "on") return;
    if (pg.current) pg.current.scrollLeft = 0;
    const r = requestAnimationFrame(() => setIdx(0));
    return () => cancelAnimationFrame(r);
  }, [onb]);

  if (onb === "off") return null;
  const at = (i: number) => setIdx((k) => (k === i ? k : i));
  return (
    <div id="onb" className={"onb" + (onb === "bye" ? " bye" : "")} role="dialog" aria-modal="true" aria-label="Welcome to OmniTrace">
      <button className="onb-skip" onClick={onDone}>Skip</button>
      <div className="onb-pages" ref={pg} onScroll={(e) => { const p = e.currentTarget; at(Math.round(p.scrollLeft / p.clientWidth)); }}>
        <section className={"op op1" + (idx === 0 ? " on" : "")}>
          <svg className="omark" viewBox="0 0 24 24" aria-hidden="true"><path pathLength={1} d="M2.5 17.5C6 17.5 6.5 6.5 12 12s6 -5.5 9.5 -5.5" /><circle cx="5" cy="16.3" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="7" r="1.5" /></svg>
          <div className="omarks">{["slack", "figma", "excel", "github"].map((a, i) => <Fragment key={a}>{i ? <i /> : null}<M a={a} /></Fragment>)}</div>
          <h1>Find the why.</h1><p>OmniTrace joins Slack, Figma, Excel and GitHub into one story.</p>
        </section>
        <section className={"op op2" + (idx === 1 ? " on" : "")}>
          <h1>Choose the rooms it may read.</h1><p>Turn off any room you like. You can change this later in Vault.</p>
          <div className="grp ic-in orooms"><RoomRows /></div>
        </section>
        <section className={"op op3" + (idx === 2 ? " on" : "")}>
          <svg className="okey" viewBox="0 0 200 180" aria-hidden="true"><rect x="62" y="14" width="76" height="150" rx="16" className="kph" /><rect x="70" y="30" width="60" height="118" rx="6" className="ksc" />
            <g className="kk"><use href="#g-key" x="76" y="-8" width="48" height="48" /></g><g className="kl"><use href="#g-lock" x="82" y="70" width="36" height="36" /></g></svg>
          <h1>Your key stays on this phone.</h1><p>Nothing is sent to the cloud. Not even to us.</p>
        </section>
      </div>
      <div className="onb-ft">
        <div className="dots" aria-hidden="true">{[0, 1, 2].map((i) => <i key={i} className={i === idx ? "on" : undefined} />)}</div>
        <button className="btn p" onClick={() => {
          if (idx >= 2) return onDone();
          const p = pg.current; if (p) p.scrollTo({ left: (idx + 1) * p.clientWidth, behavior: app.RM ? "auto" : "smooth" });
        }}>{idx === 2 ? "Start" : "Continue"}</button>
      </div>
    </div>
  );
}
