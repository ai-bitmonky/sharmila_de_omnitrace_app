"use client";
import { DATA } from "@/data/app";
import { G, M } from "./icons";
import { ScreenShell } from "./LargeTitle";
import Segmented from "./Segmented";
import { useApp, useScreen } from "./store";

/** ADR detail: the paper record OmniTrace wrote, or the raw fragments it saw (Record / Raw). */
export default function Decision() {
  const app = useApp();
  const scr = useScreen();
  const id = scr.entry.param || "031";
  const a = DATA.adr[id] || DATA.adr["031"];
  const view = scr.entry.view === "raw" ? "raw" : "record";
  return (
    <ScreenShell title={"ADR-" + id} right={<button className="ib" aria-label="Share" onClick={() => app.toast("Copied link")}><G id="share" /></button>}>
      <div className="dh"><div className="mono">ADR-{id} · {a.d}{a.nw ? " · new" : ""}</div><h1 className="dtl">{a.t}</h1></div>
      <div style={{ padding: "0 16px 18px" }}>
        <Segmented label="Decision view" options={[["record", "Record"], ["raw", "Raw"]]} value={view} onChange={(v) => { app.buzz(); app.setView(scr.tab, scr.entry.key, v); }} />
      </div>
      <article className="paper-card" hidden={view === "raw"}>
        <div className="pc-h mono"><span>Checkout decisions — ADR</span><span>Notion</span></div>
        <dl>
          {([["Context", a.ctx], ["Decision", a.dec], ["Consequences", a.con]] as const).map((r) => [<dt key={r[0] + "t"}>{r[0]}</dt>, <dd key={r[0] + "d"}>{r[1]}</dd>])}
          <dt>Sources</dt>
          <dd className="pchips">{a.src.map((s) => <span className="pchip" key={s[1]}><M a={s[0]} />{s[1]}</span>)}</dd>
        </dl>
        <p className="mono pc-f">Written by OmniTrace from {a.raw.length} fragments. Nobody typed this.</p>
      </article>
      <div className="raw" hidden={view !== "raw"}>
        <p className="gf" style={{ margin: "0 0 12px", padding: "0 16px" }}>What OmniTrace saw, before it wrote the record:</p>
        {a.raw.map((r, i) => <div className="frag" key={i}><div className="mono fm"><M a={r[0]} />{r[1]}</div><p>{r[2]}</p></div>)}
      </div>
    </ScreenShell>
  );
}
