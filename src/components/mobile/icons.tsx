/* Glyph + tab-icon sprite for the mobile app (the mark-* app logos come from the shared AppMarks sprite). */
import type { CSSProperties } from "react";

export const G = ({ id, c = "gl", style }: { id: string; c?: string; style?: CSSProperties }) => (
  <svg className={c} aria-hidden="true" style={style}><use href={`#g-${id}`} /></svg>
);
export const M = ({ a, c = "am" }: { a: string; c?: string }) => (
  <svg className={c} aria-hidden="true"><use href={`#mark-${a}`} /></svg>
);
export const Chev = () => <G id="chev-r" c="gl chev" />;

export function Sprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <symbol id="t-ask" viewBox="0 0 28 28"><path className="f" d="M4.5 7A3 3 0 0 1 7.5 4h13a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H11l-5 4.2V20h0A3 3 0 0 1 4.5 17z" /><path d="M11.6 9.6a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1.1.9-1.1 1.6v.4" /><circle cx="14" cy="16.6" r=".4" /></symbol>
      <symbol id="t-trail" viewBox="0 0 28 28"><path d="M4 21.5c4.5 0 4.5-8 10-8s5.5-8 10-8" strokeDasharray="0 0" /><circle className="f" cx="5" cy="21.4" r="2.4" /><circle className="f" cx="14" cy="13.5" r="2.4" /><circle className="f" cx="23" cy="5.6" r="2.4" /></symbol>
      <symbol id="t-register" viewBox="0 0 28 28"><path className="f" d="M7 3.5h9.5l4.5 4.5v16.5H7z" /><path d="M16.5 3.5V8H21M10.5 13h7M10.5 16.5h7M10.5 20h4" /></symbol>
      <symbol id="t-alerts" viewBox="0 0 28 28"><path className="f" d="M8 18.5v-6a6 6 0 0 1 12 0v6l1.6 2.2H6.4z" /><path d="M12 23.5a2 2 0 0 0 4 0M4.2 10.5a10 10 0 0 1 2.6-5M23.8 10.5a10 10 0 0 0-2.6-5" /></symbol>
      <symbol id="t-vault" viewBox="0 0 28 28"><path className="f" d="M14 3.5l8 3.2v6c0 5.3-3.4 9.4-8 11.6-4.6-2.2-8-6.3-8-11.6v-6z" /><circle cx="14" cy="11.5" r="2.4" /><path d="M14 13.9v5.6M14 17h2" /></symbol>
      <symbol id="g-chev-l" viewBox="0 0 24 24"><path d="M15 4.5L7.5 12l7.5 7.5" /></symbol>
      <symbol id="g-chev-r" viewBox="0 0 9 15"><path d="M1.5 1.5l6 6-6 6" /></symbol>
      <symbol id="g-chev-d" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></symbol>
      <symbol id="g-search" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5l5 5" /></symbol>
      <symbol id="g-share" viewBox="0 0 24 24"><path d="M12 3v12M7.5 7.5L12 3l4.5 4.5M8 11H6v10h12V11h-2" /></symbol>
      <symbol id="g-check" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></symbol>
      <symbol id="g-lock" viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="10" rx="2.5" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></symbol>
      <symbol id="g-unlock" viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="10" rx="2.5" /><path d="M8 10.5V8a4 4 0 0 1 7.7-1.5" /></symbol>
      <symbol id="g-key" viewBox="0 0 24 24"><circle cx="8" cy="12" r="4" /><path d="M12 12h9M18 12v3.5M21 12v2.5" /></symbol>
      <symbol id="g-mask" viewBox="0 0 24 24"><path d="M3 8h18v8H3z" /><path d="M7 12h.01M10.5 12h.01M14 12h.01M17.5 12h.01" strokeWidth="2.6" /></symbol>
      <symbol id="g-chip" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /><path d="M9.5 3v3M14.5 3v3M9.5 18v3M14.5 18v3M3 9.5h3M3 14.5h3M18 9.5h3M18 14.5h3" /></symbol>
      <symbol id="g-wifioff" viewBox="0 0 24 24"><path d="M3 9a13 13 0 0 1 18 0M6 12.5a8.5 8.5 0 0 1 12 0M9 16a4 4 0 0 1 6 0" /><circle cx="12" cy="19" r=".6" /></symbol>
      <symbol id="g-info" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5v.01" /></symbol>
      <symbol id="g-db" viewBox="0 0 24 24"><ellipse cx="12" cy="6" rx="7" ry="2.8" /><path d="M5 6v12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8V6M5 12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8" /></symbol>
      <symbol id="g-cloud" viewBox="0 0 24 24"><path d="M7 18.5h10.5a4 4 0 0 0 .4-8A6 6 0 0 0 6.4 9.2 4.7 4.7 0 0 0 7 18.5z" /></symbol>
      <symbol id="g-reset" viewBox="0 0 24 24"><path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4v4.5H9" /></symbol>
    </svg>
  );
}

export function StatusBar() {
  return (
    <div className="sbar" aria-hidden="true"><span>9:41</span><span className="r">
      <svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" /><rect x="10" y="3" width="3" height="9" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
      <svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 2.6c2.3 0 4.4.9 6 2.4l1.2-1.3A10.4 10.4 0 0 0 8 .8C5.2.8 2.7 1.9.8 3.7L2 5c1.6-1.5 3.7-2.4 6-2.4zm0 3.6c1.3 0 2.6.5 3.5 1.4l1.2-1.3A6.8 6.8 0 0 0 8 4.4c-1.8 0-3.5.7-4.7 1.9l1.2 1.3c.9-.9 2.2-1.4 3.5-1.4zM8 9.3l2-2a2.9 2.9 0 0 0-4 0z" /></svg>
      <svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.8" fill="none" stroke="currentColor" opacity=".4" /><rect x="2" y="2" width="20" height="9" rx="2.5" /><path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2z" opacity=".45" /></svg></span></div>
  );
}
