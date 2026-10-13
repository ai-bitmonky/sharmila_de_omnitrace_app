"use client";
import { DATA, P, type Source } from "@/data/app";
import { M } from "./icons";
import Toggle from "./Toggle";
import { useApp, type AppApi } from "./store";

/** Source detail sheet (Answer rows, Trail timeline rows). */
export function openSourceSheet(app: AppApi, s: Source) {
  app.openSheet(
    <>
      <div className="sh-h"><span className="node"><M a={s.a} /></span><div className="tx"><div className="sh-t">{s.n}</div><div className="mono ell">{s.h}</div></div></div>
      <blockquote className="quote">{s.x}</blockquote>
      <div className="grp">
        <div className="row"><span className="tx t1">Author</span><span className="val">{P[s.w]}</span></div>
        <div className="row"><span className="tx t1">Time</span><span className="val">{s.at}, {s.d} 2026</span></div>
        <div className="row"><span className="tx t1">Room</span><span className="val ell" style={{ maxWidth: "60%" }}>{s.h}</span></div>
      </div>
      <div className="btns"><button className="btn p" onClick={() => { app.closeSheet(); app.toast(`Opening in ${s.n}…`); }}>Open in {s.n}</button></div>
    </>,
  );
}

/** The room toggles — shared by onboarding page 2 and Vault › Rooms (one stored state). */
export function RoomRows() {
  const app = useApp();
  return (
    <>
      {DATA.rooms.map((r) => (
        <div className="row" key={r[0]}>
          <span className="ic"><M a={r[0]} /></span>
          <span className="tx"><span className="t1" style={{ display: "block" }}>{r[1]}</span><span className="t2 ell" style={{ display: "block" }}>{r[2]}</span></span>
          <Toggle on={!!app.state.rooms[r[0]]} label={r[1]} onChange={(on) => app.dispatch({ type: "room", k: r[0], on })} />
        </div>
      ))}
    </>
  );
}
