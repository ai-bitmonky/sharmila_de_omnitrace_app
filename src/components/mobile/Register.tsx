"use client";
import { useState } from "react";
import { DATA } from "@/data/app";
import { Chev, G } from "./icons";
import { ScreenShell } from "./LargeTitle";
import { useApp } from "./store";

const IDS = Object.keys(DATA.adr).sort().reverse();

export default function Register() {
  const app = useApp();
  const [v, setV] = useState("");
  const q = v.trim().toLowerCase();
  const ok = (id: string) => { const a = DATA.adr[id]; return !q || ("adr-" + id + " " + a.t + " " + a.line + " " + a.ctx).toLowerCase().includes(q); };
  const n = IDS.filter(ok).length;
  return (
    <ScreenShell title="Register" large>
      <form className="search" autoComplete="off" onSubmit={(e) => { e.preventDefault(); (e.currentTarget.querySelector("input") as HTMLInputElement).blur(); }}>
        <G id="search" />
        <input type="text" enterKeyHint="search" placeholder="Search decisions" aria-label="Search decisions" value={v} onChange={(e) => setV(e.target.value)} />
      </form>
      <p className="gf" style={{ margin: "12px 0 10px" }}>Checkout decisions · written by OmniTrace</p>
      <div className="grp regl" hidden={!n}>
        {IDS.map((id) => {
          const a = DATA.adr[id];
          return (
            <button key={id} className="row tap adr" hidden={!ok(id)} onClick={() => app.push("register", "adr", id)}>
              <span className="tx">
                <span className="ar1"><span className="mono aid">ADR-{id}</span>{a.nw ? <span className="new">New</span> : null}<span className="mono adt">{a.d.replace(" 2026", "")}</span></span>
                <span className="t1 atl">{a.t}</span>
                <span className="t2 ell" style={{ display: "block" }}>{a.line}</span>
              </span>
              <Chev />
            </button>
          );
        })}
      </div>
      <p className="nohit mono" hidden={!!n}>No decisions match that.</p>
    </ScreenShell>
  );
}
