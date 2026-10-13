"use client";
import { useEffect, useRef, useState } from "react";
import { DATA } from "@/data/app";
import { G } from "./icons";
import { ScreenShell } from "./LargeTitle";
import { RoomRows } from "./shared";
import Toggle from "./Toggle";
import { ST, useApp } from "./store";

const ST3: [string, string][] = [["1,284", "decisions"], ["4,912", "cards"], ["412 MB", "index"]];
const PK = [[2.6, 1.9, 0, 1], [3.1, 2.3, -0.7, 0], [2.2, 2.9, -1.3, 0], [3.6, 1.7, -2.1, 1], [2.9, 2.1, -0.4, 0], [2.4, 3.3, -1.8, 0]];
const GLY = "⠿⣿⡷⣾⢿⣻⠾⣽";
const mask = (s: string) => s.replace(/./g, "⣿");

export default function Vault() {
  const app = useApp();
  const RM = app.RM;
  const [locked, setLocked] = useState(true);
  const [masking, setMasking] = useState(true);
  const [offline, setOffline] = useState(true);
  const stats = useRef<(HTMLElement | null)[]>([]);
  const ivs = useRef(new Map<HTMLElement, number>());
  const tm = useRef(0);

  useEffect(() => {
    stats.current.forEach((b, i) => { if (b) b.textContent = mask(ST3[i][0]); });
    const m = ivs.current;
    return () => { clearTimeout(tm.current); m.forEach((t) => clearInterval(t)); m.clear(); };
  }, []);

  /* lock/unlock scramble: random braille glyphs settle left to right */
  const scramble = (el: HTMLElement, to: string) => {
    let n = 0; const L = to.length; clearInterval(ivs.current.get(el));
    if (RM) { el.textContent = to; return; }
    ivs.current.set(el, window.setInterval(() => {
      n++; el.textContent = Array.from({ length: L }, (_, i) => (n > 8 + i * 2 ? to[i] : GLY[(Math.random() * GLY.length) | 0])).join("");
      if (n > 8 + L * 2) { clearInterval(ivs.current.get(el)); ivs.current.delete(el); el.textContent = to; }
    }, 40));
  };
  const setLock = (l: boolean) => {
    if (l === locked) return; setLocked(l); app.buzz();
    clearTimeout(tm.current);
    tm.current = window.setTimeout(() => stats.current.forEach((b, i) => b && scramble(b, l ? mask(ST3[i][0]) : ST3[i][0])), l ? 0 : RM ? 0 : 600);
  };

  const maskSheet = () => app.openSheet(
    <>
      <div className="sh-h"><G id="mask" /><div className="tx"><div className="sh-t">Skipped today</div><div className="mono">never read · never stored</div></div></div>
      <div className="grp ic-in">{DATA.skipped.map((k, i) => <div className="row" key={i}><span className="ic"><G id={k[2]} /></span><span className="tx"><span className="t1" style={{ display: "block" }}>{k[0]}</span><span className="t2">{k[1]}</span></span></div>)}</div>
      <p className="gf" style={{ margin: "-8px 0 12px" }}>OmniTrace ignores passwords, card numbers, banking apps and private windows.</p>
    </>,
  );
  const resetSheet = () => app.openSheet(
    <>
      <div className="sh-h"><div className="tx"><div className="sh-t">Reset OmniTrace?</div><div className="t2" style={{ marginTop: 6 }}>This clears your rooms, alerts and setup on this phone. You will see the welcome screens again.</div></div></div>
      <div className="btns colb">
        <button className="btn d" onClick={() => { ST.clear(); location.replace(location.pathname + location.search); }}>Reset app</button>
        <button className="btn t" onClick={() => app.closeSheet()}>Cancel</button>
      </div>
    </>,
  );

  return (
    <ScreenShell title="Vault" large>
      <div className="vhero">
        <svg viewBox="0 0 358 168" aria-label="Data packets stay inside the phone. The cloud gets 0 bytes.">
          <rect x="44" y="12" width="96" height="144" rx="18" className="ph" /><rect x="78" y="20" width="28" height="7" rx="3.5" className="phn" />
          <g transform="translate(56 34)">
            {PK.map((p, i) => (
              <g key={i} className="bx" style={{ animationDuration: `${p[0]}s`, animationDelay: `${p[2]}s` }}>
                <g className="by" style={{ animationDuration: `${p[1]}s`, animationDelay: `${p[2] * 1.3}s` }}><circle r="3.2" cx="3" cy="3" className={p[3] ? "pt" : "pi"} /></g>
              </g>
            ))}
          </g>
          <path d="M150 84H226" className="vline" /><path d="M182 76l12 16M194 76l-12 16" className="vx" />
          <g className="cl"><use href="#g-cloud" x="236" y="40" width="80" height="80" className="clg" /><text x="276" y="128">0 B</text></g>
        </svg>
        <p className="mono">Everything stays on this phone</p>
      </div>
      <h3 className="gh">Memory</h3>
      <div className="grp ic-in">
        <div className="row"><span className="ic"><G id="db" /></span><span className="tx"><span className="t1" style={{ display: "block" }}>On-device memory</span><span className="t2">Always on</span></span><Toggle on label="On-device memory" disabled /></div>
        <div className="row tap" role="button" tabIndex={0} aria-label="Sensitivity masking: see what was skipped today" onClick={maskSheet} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); maskSheet(); } }}>
          <span className="ic"><G id="mask" /></span><span className="tx"><span className="t1" style={{ display: "block" }}>Sensitivity masking</span><span className="t2">{DATA.skipped.length} things skipped today</span></span>
          <Toggle on={masking} label="Sensitivity masking" onChange={setMasking} />
        </div>
        <div className="row"><span className="ic"><G id="wifioff" /></span><span className="tx"><span className="t1" style={{ display: "block" }}>Works offline</span><span className="t2">No internet needed</span></span><Toggle on={offline} label="Works offline" onChange={setOffline} /></div>
      </div>
      <h3 className="gh" style={{ marginTop: 26 }}>Hardware key</h3>
      <div className={"grp ic-in key-g" + (locked ? "" : " open")}>
        <div className="row">
          <span className="ic kic"><G id="key" /></span>
          <span className="tx"><span className="t1 kst" style={{ display: "block" }}>{locked ? "Locked" : "Unlocked"} · Face ID</span><span className="t2">Secure chip only</span></span>
          <button className="pill kbtn" aria-pressed={!locked} onClick={() => setLock(!locked)}><G id={locked ? "lock" : "unlock"} /><span>{locked ? "Unlock" : "Lock"}</span></button>
        </div>
        <div className="row kstats">{ST3.map((x, i) => <div key={x[1]}><b ref={(el) => { stats.current[i] = el; }} /><span className="mono">{x[1]}</span></div>)}</div>
      </div>
      <p className="gf">Only your hardware key opens the index. Not even OmniTrace can read it.</p>
      <h3 className="gh">Rooms</h3>
      <div className="grp ic-in"><RoomRows /></div>
      <p className="gf">OmniTrace reads only the rooms you turn on.</p>
      <h3 className="gh">About</h3>
      <div className="grp">
        <div className="row"><span className="tx t1">Storage</span><span className="val">412 MB</span></div>
        <div className="row"><span className="tx t1">Sent to cloud</span><span className="val">0 B</span></div>
        <div className="row"><span className="tx t1">Version</span><span className="val">1.0 (prototype)</span></div>
        <button className="row tap" onClick={resetSheet}><span className="tx t1" style={{ color: "var(--warn)" }}>Reset app</span></button>
      </div>
    </ScreenShell>
  );
}
