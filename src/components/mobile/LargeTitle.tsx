"use client";
import { useState, type ReactNode, type UIEvent } from "react";
import { G } from "./icons";
import { useApp, useScreen } from "./store";

/** iOS large title; it collapses into the nav bar title once the screen scrolls past it. */
export function LargeTitle({ children }: { children: ReactNode }) {
  return <h1 className="lt">{children}</h1>;
}

/** One stack screen: nav bar (back button, centred title, right slot) + scroll body. */
export function ScreenShell({ title, large, right, cls, children, scRef, onScroll }: {
  title: string; large?: boolean; right?: ReactNode; cls?: string; children: ReactNode;
  scRef?: (el: HTMLDivElement | null) => void; onScroll?: (e: UIEvent<HTMLDivElement>) => void;
}) {
  const s = useScreen();
  const app = useApp();
  const [scrolled, setScrolled] = useState(false);
  return (
    <section ref={s.setEl} className={"screen" + (large ? "" : " small") + (cls ? " " + cls : "") + (scrolled ? " scrolled" : "") + s.cls}>
      <header className="nb">
        {s.back ? (
          <button className="nb-back" aria-label={`Back to ${s.back}`} onClick={() => app.pop()}><G id="chev-l" /><span>{s.back}</span></button>
        ) : <span />}
        <h2 className="nb-t">{title}</h2>
        <div className="nb-r">{right}</div>
      </header>
      <div className="sc" ref={scRef} onScroll={(e) => { setScrolled(e.currentTarget.scrollTop > (large ? 44 : 2)); onScroll?.(e); }}>
        {large ? <LargeTitle>{title}</LargeTitle> : null}
        {children}
      </div>
    </section>
  );
}
