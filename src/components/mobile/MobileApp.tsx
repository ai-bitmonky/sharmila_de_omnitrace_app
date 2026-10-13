"use client";
/* OmniTrace native-style mobile app (< 900px). Port of OmniTrace_Mobile_App_v1.0.html:
   five tabs, each with its own push/pop stack, hash routes, swipe-back, sheet, toast, onboarding. */
import { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState, type ComponentType, type ReactNode } from "react";
import "./mobile.css";
import { DEFAULT_ROOMS, type RoomId } from "@/data/app";
import AlertDetail from "./AlertDetail";
import Alerts from "./Alerts";
import Answer from "./Answer";
import Ask from "./Ask";
import Decision from "./Decision";
import { Sprite, StatusBar } from "./icons";
import Onboarding from "./Onboarding";
import Register from "./Register";
import Sheet from "./Sheet";
import TabBar from "./TabBar";
import Toast from "./Toast";
import Trail from "./Trail";
import Vault from "./Vault";
import {
  AppCtx, ST, ScreenCtx, TABS, hashOf, initialState, live, reducer, titleOf, topOf,
  type AppApi, type Entry, type ScreenApi, type ScreenName, type Tab,
} from "./store";

const SCREENS: Record<ScreenName, ComponentType> = {
  ask: Ask, answer: Answer, trail: Trail, register: Register, adr: Decision, alerts: Alerts, alert: AlertDetail, vault: Vault,
};

function ScreenHost({ entry, tab, under, back, active, register }: { entry: Entry; tab: Tab; under: boolean; back?: string; active: boolean; register: (key: number, el: HTMLElement | null) => void }) {
  /* push: render once at translateX(100%), flush styles, then drop the class so it slides in */
  const [entering, setEntering] = useState(entry.anim);
  const el = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    if (!entering) return;
    void el.current?.offsetWidth;
    setEntering(false);
  }, [entering]);
  const setEl = useCallback((n: HTMLElement | null) => { el.current = n; register(entry.key, n); }, [register, entry.key]);
  const cls = entry.leaving || entering ? " right" : under ? " under" : "";
  const api = useMemo<ScreenApi>(() => ({ tab, entry, cls, back, active, setEl }), [tab, entry, cls, back, active, setEl]);
  const C = SCREENS[entry.name];
  return <ScreenCtx.Provider value={api}><C /></ScreenCtx.Provider>;
}

const reducedMotion = () => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; } };

export default function MobileApp() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [framed, setFramed] = useState(false);
  const [RM, setRM] = useState(false);
  const [sheet, setSheet] = useState<{ content: ReactNode; on: boolean; closing: boolean }>({ content: null, on: false, closing: false });
  const [toast, setToast] = useState({ msg: "", on: false });
  const stateRef = useRef(state);
  const els = useRef(new Map<number, HTMLElement>());
  const appEl = useRef<HTMLDivElement>(null);
  const RMRef = useRef(false);
  useLayoutEffect(() => { stateRef.current = state; RMRef.current = RM; });

  /* ---------- boot: take over the viewport, read hash + stored prefs ---------- */
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("ot-app");
    const noop = () => {};
    document.addEventListener("touchstart", noop, { passive: true });
    const rm = reducedMotion(); setRM(rm); RMRef.current = rm;
    setFramed(/[?&]frame=1/.test(location.search));
    const raw = ST.get<Partial<Record<RoomId, number>> | null>("rooms", null);
    dispatch({
      type: "init", hash: location.hash.slice(1),
      rooms: raw ? { ...DEFAULT_ROOMS, ...raw } : null,
      read: ST.get<number[]>("read", [2, 3]), gone: ST.get<number[]>("gone", []), onbSeen: !!ST.get("onb", 0),
    });
    return () => { html.classList.remove("ot-app"); document.removeEventListener("touchstart", noop); };
  }, []);

  /* ---------- persist ---------- */
  useEffect(() => {
    if (!state.ready) return;
    ST.set("rooms", state.rooms); ST.set("read", state.read); ST.set("gone", state.gone);
  }, [state.ready, state.rooms, state.read, state.gone]);

  /* ---------- hash: state → URL (replaceState, so it never loops back) ---------- */
  useEffect(() => {
    if (!state.ready || state.onb === "on") return;
    const h = hashOf(state);
    if (location.hash.slice(1) === h) return;
    try { history.replaceState(history.state, "", "#" + h); } catch { location.hash = h; }
  }, [state]);

  /* ---------- toast ---------- */
  const toastT = useRef(0);
  const showToast = useCallback((msg: string) => {
    setToast({ msg, on: true }); clearTimeout(toastT.current);
    toastT.current = window.setTimeout(() => setToast((t) => ({ ...t, on: false })), 2400);
  }, []);

  /* ---------- sheet ---------- */
  const sheetOn = useRef(false);
  const onSheetClose = useRef<(() => void) | null>(null);
  const sheetT = useRef(0);
  const openSheet = useCallback((content: ReactNode, onClose?: () => void) => {
    clearTimeout(sheetT.current); onSheetClose.current = onClose || null; sheetOn.current = true;
    setSheet({ content, on: true, closing: false });
  }, []);
  const closeSheet = useCallback(() => {
    if (!sheetOn.current) return;
    sheetOn.current = false;
    setSheet((s) => ({ ...s, on: false, closing: true }));
    const f = onSheetClose.current; onSheetClose.current = null;
    clearTimeout(sheetT.current);
    sheetT.current = window.setTimeout(() => { if (!sheetOn.current) setSheet({ content: null, on: false, closing: false }); }, 320);
    if (f) f();
  }, []);

  /* ---------- user hash edits / deep links ---------- */
  useEffect(() => {
    const hc = () => {
      if (stateRef.current.onb !== "off" && location.hash !== "#onboarding") dispatch({ type: "onb", v: "off" });
      closeSheet();
      dispatch({ type: "route", hash: location.hash });
    };
    window.addEventListener("hashchange", hc);
    return () => window.removeEventListener("hashchange", hc);
  }, [closeSheet]);

  /* ---------- popped screens leave after their slide-out ---------- */
  const scheduled = useRef(new Set<number>());
  const leaveTimers = useRef<number[]>([]);
  useEffect(() => {
    TABS.forEach(([t]) => state.st[t].forEach((e) => {
      if (e.leaving && !scheduled.current.has(e.key)) {
        scheduled.current.add(e.key);
        leaveTimers.current.push(window.setTimeout(() => dispatch({ type: "remove", t, key: e.key }), 360));
      }
    }));
  }, [state.st]);
  useEffect(() => () => { leaveTimers.current.forEach(clearTimeout); clearTimeout(toastT.current); clearTimeout(sheetT.current); }, []);

  /* ---------- api ---------- */
  const buzz = useCallback(() => {
    try { const ua = (navigator as Navigator & { userActivation?: { isActive: boolean } }).userActivation; if (navigator.vibrate && ua && ua.isActive) navigator.vibrate(8); } catch { /* no haptics */ }
  }, []);
  const dropTimers = useRef<number[]>([]);
  const api = useMemo<AppApi>(() => ({
    state, RM, dispatch, buzz, toast: showToast, openSheet, closeSheet,
    push: (t, name, param) => dispatch({ type: "push", t, name, param, view: name === "adr" ? "record" : undefined, anim: !RMRef.current }),
    pop: () => dispatch({ type: "pop", t: stateRef.current.tab, anim: !RMRef.current }),
    setView: (t, key, view) => dispatch({ type: "view", t, key, view }),
    route: (hash) => { closeSheet(); dispatch({ type: "route", hash }); },
    dropLater: (id, ms) => { dropTimers.current.push(window.setTimeout(() => dispatch({ type: "drop", id }), ms)); },
    tabClick: (t) => {
      closeSheet();
      const s = stateRef.current;
      if (s.tab === t) {
        if (live(s.st[t]).length > 1) dispatch({ type: "popRoot", t, anim: !RMRef.current });
        else { const top = topOf(s.st[t]); els.current.get(top.key)?.querySelector(".sc")?.scrollTo({ top: 0, behavior: RMRef.current ? "auto" : "smooth" }); }
        return;
      }
      buzz(); dispatch({ type: "tab", t });
    },
  }), [state, RM, buzz, showToast, openSheet, closeSheet]);

  const register = useCallback((key: number, el: HTMLElement | null) => { if (el) els.current.set(key, el); else els.current.delete(key); }, []);

  /* ---------- swipe back from the left edge ---------- */
  const swipe = useRef<{ v: HTMLElement; u: HTMLElement; x: number; t: number; w: number; dx: number; vx: number; go: boolean } | null>(null);
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = swipe.current; if (!d) return;
      const dx = Math.max(0, e.clientX - d.x);
      if (!d.go) { if (dx < 6) return; d.go = true; d.v.classList.add("drag"); d.u.classList.add("drag"); }
      d.vx = (dx - d.dx) / Math.max(1, e.timeStamp - d.t); d.t = e.timeStamp; d.dx = dx;
      const p = Math.min(1, dx / d.w);
      d.v.style.transform = `translateX(${dx}px)`; d.u.style.transform = `translateX(${-30 + 30 * p}%)`; d.u.style.setProperty("--dim", String(0.4 * (1 - p)));
    };
    const end = (e: PointerEvent) => {
      const x = swipe.current; swipe.current = null; if (!x || !x.go) return;
      [x.v, x.u].forEach((el) => { el.classList.remove("drag"); el.style.transform = ""; el.style.removeProperty("--dim"); });
      if (e.type !== "pointercancel" && (x.dx > x.w * 0.35 || (x.vx > 0.5 && x.dx > 30))) dispatch({ type: "pop", t: stateRef.current.tab, anim: !RMRef.current });
    };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", end); window.addEventListener("pointercancel", end);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", end); window.removeEventListener("pointercancel", end); dropTimers.current.forEach(clearTimeout); };
  }, []);
  const swipeDown = (e: React.PointerEvent) => {
    const s = stateRef.current, l = live(s.st[s.tab]);
    if (l.length < 2 || !e.isPrimary || !appEl.current) return;
    const r = appEl.current.getBoundingClientRect();
    if (e.clientX - r.left > 24) return;
    const v = els.current.get(l[l.length - 1].key), u = els.current.get(l[l.length - 2].key);
    if (!v || !u) return;
    if (e.pointerType === "mouse") e.preventDefault();
    swipe.current = { v, u, x: e.clientX, t: e.timeStamp, w: r.width, dx: 0, vx: 0, go: false };
  };

  /* ---------- onboarding ---------- */
  const onbT = useRef(0);
  const onbDone = useCallback(() => {
    ST.set("onb", 1);
    dispatch({ type: "onb", v: "bye" });
    clearTimeout(onbT.current);
    onbT.current = window.setTimeout(() => dispatch({ type: "onb", v: "off" }), RMRef.current ? 0 : 420);
  }, []);
  useEffect(() => () => clearTimeout(onbT.current), []);

  return (
    <AppCtx.Provider value={api}>
      <div id="app" className={"ot" + (framed ? " framed" : "")} ref={appEl}>
        <Sprite />
        {framed ? <StatusBar /> : null}
        {state.ready ? (
          <>
            <main id="tabs" onPointerDown={swipeDown}>
              {TABS.map(([t]) => {
                const st = state.st[t], top = topOf(st);
                return (
                  <div key={t} className={"stack" + (t === state.tab ? " on" : "")} data-tab={t}>
                    {st.map((e, i) => {
                      let prev: Entry | undefined;
                      for (let k = i - 1; k >= 0; k--) if (!st[k].leaving) { prev = st[k]; break; }
                      return (
                        <ScreenHost
                          key={e.key} entry={e} tab={t} register={register}
                          under={!e.leaving && e !== top} back={prev ? titleOf(prev) : undefined}
                          active={t === state.tab && e === top}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </main>
            <TabBar />
          </>
        ) : null}
        {framed ? <div className="homeind" /> : null}
        <Sheet content={sheet.content} on={sheet.on} closing={sheet.closing} onClose={closeSheet} />
        <Toast msg={toast.msg} on={toast.on} />
        {state.ready ? <Onboarding onDone={onbDone} /> : null}
      </div>
    </AppCtx.Provider>
  );
}
