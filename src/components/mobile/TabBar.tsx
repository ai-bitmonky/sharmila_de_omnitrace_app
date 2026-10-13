"use client";
import { TABS, badgeCount, useApp } from "./store";

export default function TabBar() {
  const app = useApp();
  const n = badgeCount(app.state);
  return (
    <nav className="tabbar" role="tablist" aria-label="OmniTrace">
      {TABS.map(([k, label]) => {
        const on = app.state.tab === k;
        return (
          <button
            key={k} className={"tab" + (on ? " on" : "")} role="tab" data-t={k} aria-selected={on}
            aria-label={k === "alerts" ? "Alerts" + (n ? `, ${n} new` : "") : undefined}
            onClick={() => app.tabClick(k)}
          >
            <svg aria-hidden="true"><use href={`#t-${k}`} /></svg>{label}
            {k === "alerts" ? <span className={"badge" + (n ? "" : " off")} id="badge">{n || ""}</span> : null}
          </button>
        );
      })}
    </nav>
  );
}
