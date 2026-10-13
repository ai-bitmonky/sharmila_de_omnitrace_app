"use client";
import { useEffect, useRef } from "react";
import { onEnter, prefersReduced } from "./lib";

export default function Cta() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    if (prefersReduced()) { c.classList.add("is-in"); return; }
    return onEnter(c, () => c.classList.add("is-in"), { threshold: 0.35 });
  }, []);
  return (
    <section className="section cta" id="cta" aria-labelledby="ctaTitle" ref={ref}>
      <div className="container">
        <div className="cta-line" aria-hidden="true"></div><div className="cta-end" aria-hidden="true"></div>
        <h2 id="ctaTitle">Stop losing the why.</h2>
        <p className="lead">Free for individuals. Teams from one price per seat.</p>
        <div className="cta-btns"><a className="btn btn-primary" href="#cta">Download for Mac</a><a className="btn btn-secondary" href="#cta">Download for Windows</a></div>
        <p className="mono">macOS 14+ · Windows 11</p>
      </div>
    </section>
  );
}
