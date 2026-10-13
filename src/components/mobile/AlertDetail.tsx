"use client";
import { useEffect } from "react";
import { DATA } from "@/data/app";
import { ScreenShell } from "./LargeTitle";
import { useApp, useScreen } from "./store";

/** One alert: the Impact Radius ripple reaching the client rule, the rule card, and actions. */
export default function AlertDetail() {
  const app = useApp();
  const scr = useScreen();
  const id = +(scr.entry.param || 1);
  const a = DATA.alerts.find((x) => x.id === id) || DATA.alerts[0];
  const warn = !!a.warn;
  const { dispatch } = app;
  useEffect(() => { dispatch({ type: "read", id }); }, [dispatch, id]);

  const N = ([["frame v4", -162, 104], ["B14 = 1", 150, 112], ["PR #412", 28, 118], ["ADR-031", -28, 96, 1], ["client rule", -78, 118, 2]] as [string, number, number, number?][]).map(([l, ang, r, k]) => {
    const t = (ang * Math.PI) / 180; return { l, k, x: 179 + Math.cos(t) * r * 1.15, y: 150 + Math.sin(t) * r };
  });
  return (
    <ScreenShell title="Alert">
      <div className="irw">
        <svg className={"irs" + (warn ? " hot" : "")} viewBox="0 0 358 300" role="img" aria-label={warn ? "Impact Radius: the edit reaches the client rule from 14 Mar and conflicts with it." : "Impact Radius: no conflict found."}>
          {N.map((n, i) => <line key={i} x1="179" y1="150" x2={n.x} y2={n.y} className="ire" />)}
          <line x1={N[3].x} y1={N[3].y} x2={N[4].x} y2={N[4].y} className="ire" />
          {[0, 1, 2].map((i) => <circle key={"r" + i} cx="179" cy="150" r="150" className="ring" style={{ animationDelay: `${i * 0.35}s` }} />)}
          {N.map((n, i) => n.k === 2 ? (
            <g className="rule" key={"n" + i}><circle cx={n.x} cy={n.y} r="9" className="pulse" /><path d={`M${n.x} ${n.y - 9}l9 9-9 9-9-9z`} className="rn" /><text x={n.x} y={n.y + 24}>{n.l}</text></g>
          ) : (
            <g key={"n" + i}>{n.k ? <rect x={n.x - 6} y={n.y - 6} width="12" height="12" className="dn" /> : <circle cx={n.x} cy={n.y} r="5" className="cn" />}<text x={n.x} y={n.y + 20}>{n.l}</text></g>
          ))}
          <g className="fr"><rect x="112" y="124" width="134" height="52" rx="6" /><text x="179" y="146" className="fr1">{warn ? "Team plan picker v1" : a.id === 2 ? "Funnel_test.xlsx" : "Checkout copy"}</text><text x="179" y="163">{warn ? "edited · 22 Sep" : "edited"}</text></g>
        </svg>
      </div>
      <p className="irt">{warn ? "This edit contradicts a rule approved 6 months ago." : "No conflict. This edit agrees with past decisions."}</p>
      <p className="mono" style={{ padding: "0 16px 18px" }}>{a.m} · Impact Radius</p>
      {warn ? (
        <div className="paper-card rule-c"><div className="mono">Client rule</div><div className="rc-t">No seat selection on first purchase</div><div className="mono">Priya Nair · 14 Mar 2026 · ADR-031</div></div>
      ) : null}
      <div className="btns colb">
        {warn ? <button className="btn p" onClick={() => app.route("trail/2026-03-14")}>Open the trail</button> : null}
        <button className={"btn " + (warn ? "s" : "p")} onClick={() => { app.pop(); app.dropLater(id, app.RM ? 0 : 340); }}>Dismiss</button>
      </div>
    </ScreenShell>
  );
}
