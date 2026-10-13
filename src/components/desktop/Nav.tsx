"use client";
import { useEffect, useRef } from "react";
import { NAV_LINKS } from "@/data/site";

/* Sticky nav. The prototype's mobile sheet/burger is hidden at ≥900px, so it is not ported. */
export default function Nav() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const nav = ref.current;
    if (!nav) return;
    const onS = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
    onS();
    window.addEventListener("scroll", onS, { passive: true });
    return () => window.removeEventListener("scroll", onS);
  }, []);
  return (
    <header className="nav" id="nav" ref={ref}>
      <div className="container nav-inner">
        <a className="nav-logo" href="#top" aria-label="OmniTrace, back to top">
          <svg aria-hidden="true"><use href="#mark-omnitrace" /></svg>OmniTrace
        </a>
        <nav className="nav-links" aria-label="Main">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </nav>
        <a className="btn btn-primary nav-cta" href="#cta">
          Download<span className="nav-cta-long">&nbsp;for Mac</span>
        </a>
      </div>
    </header>
  );
}
