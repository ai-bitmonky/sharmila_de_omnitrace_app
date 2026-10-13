"use client";
import { WHO } from "@/data/site";
import { Chip } from "./Mark";

export default function Who() {
  return (
    <section id="who" className="section who">
      <div className="container">
        <header className="section-head"><h2>Built for people who get asked “why?”</h2></header>
        <div className="who-grid">
          {WHO.map((w) => (
            <article key={w.role} className="who-col">
              <h3 className="who-role">{w.role}</h3>
              <p className="who-q">{w.q}</p>
              <p className="who-line">{w.line}</p>
              <div className="who-card"><p className="who-card-t">{w.card}</p><div className="who-card-c">{w.chips.map((c) => <Chip key={c[1]} app={c[0]} label={c[1]} />)}</div></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
