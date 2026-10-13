/* Navigation + app state for the mobile app: tabs, per-tab stacks, hash routes, stored prefs. */
"use client";
import { createContext, useContext, type ReactNode } from "react";
import { DATA, DEFAULT_ROOMS, Q, type RoomId } from "@/data/app";

export type Tab = "ask" | "trail" | "register" | "alerts" | "vault";
export const TABS: [Tab, string][] = [["ask", "Ask"], ["trail", "Trail"], ["register", "Register"], ["alerts", "Alerts"], ["vault", "Vault"]];
export type ScreenName = Tab | "answer" | "adr" | "alert";

export interface Entry {
  key: number;
  name: ScreenName;
  param?: string;
  /** screen view inside the entry: trail 'timeline'|'graph', adr 'record'|'raw' */
  view?: string;
  /** trail: scroll to a day (route #trail/2026-03-14) */
  focus?: { iso: string; n: number };
  /** trail: bumps when a route re-applies the mode (scroll to top) */
  reset?: number;
  anim: boolean;
  leaving?: boolean;
}
export type Onb = "off" | "on" | "bye";
export interface State {
  ready: boolean;
  tab: Tab;
  st: Record<Tab, Entry[]>;
  seq: number;
  rooms: Record<RoomId, number>;
  read: number[];
  gone: number[];
  onb: Onb;
}

/* ---------- localStorage (every access guarded: it may be blocked) ---------- */
export const ST = {
  get<T>(k: string, d: T): T { try { const v = localStorage.getItem("ot_" + k); return v == null ? d : (JSON.parse(v) as T); } catch { return d; } },
  set(k: string, v: unknown) { try { localStorage.setItem("ot_" + k, JSON.stringify(v)); } catch { /* blocked */ } },
  clear() { try { Object.keys(localStorage).filter((k) => k.indexOf("ot_") === 0).forEach((k) => localStorage.removeItem(k)); } catch { /* blocked */ } },
};

const roots = (): Record<Tab, Entry[]> => ({
  ask: [{ key: 1, name: "ask", anim: false }],
  trail: [{ key: 2, name: "trail", anim: false, view: "timeline" }],
  register: [{ key: 3, name: "register", anim: false }],
  alerts: [{ key: 4, name: "alerts", anim: false }],
  vault: [{ key: 5, name: "vault", anim: false }],
});
export const initialState: State = { ready: false, tab: "ask", st: roots(), seq: 10, rooms: { ...DEFAULT_ROOMS }, read: [2, 3], gone: [], onb: "off" };

export const live = (s: Entry[]) => s.filter((e) => !e.leaving);
export const topOf = (s: Entry[]) => { const l = live(s); return l[l.length - 1]; };
export const titleOf = (e: Entry) =>
  ({ ask: "Ask", answer: "Answer", trail: "Trail", register: "Register", adr: "ADR-" + e.param, alerts: "Alerts", alert: "Alert", vault: "Vault" })[e.name];

export function hashOf(s: State): string {
  const e = topOf(s.st[s.tab]);
  if (!e) return s.tab;
  switch (e.name) {
    case "answer": return "ask/answer/" + e.param;
    case "trail": return "trail" + (e.view === "graph" ? "/graph" : "");
    case "adr": return s.tab === "register" ? `register/${e.param}${e.view === "raw" ? "/raw" : ""}` : "trail";
    case "alert": return "alerts/" + e.param;
    default: return e.name;
  }
}

export type Action =
  | { type: "init"; hash: string; rooms: Record<RoomId, number> | null; read: number[]; gone: number[]; onbSeen: boolean }
  | { type: "tab"; t: Tab }
  | { type: "push"; t: Tab; name: ScreenName; param?: string; view?: string; anim: boolean }
  | { type: "pop"; t: Tab; anim: boolean }
  | { type: "popRoot"; t: Tab; anim: boolean }
  | { type: "remove"; t: Tab; key: number }
  | { type: "view"; t: Tab; key: number; view: string }
  | { type: "route"; hash: string }
  | { type: "room"; k: RoomId; on: boolean }
  | { type: "read"; id: number }
  | { type: "drop"; id: number }
  | { type: "onb"; v: Onb };

const isTab = (t: string): t is Tab => TABS.some(([k]) => k === t);

function pushed(s: State, t: Tab, name: ScreenName, anim: boolean, param?: string, view?: string): State {
  const seq = s.seq + 1;
  return { ...s, seq, st: { ...s.st, [t]: [...s.st[t], { key: seq, name, param, view, anim }] } };
}

/** route(#tab/a/b): select the tab, pop to its root without animation, then let the root apply a and b. */
function route(s: State, hash: string): State | null {
  const [t, a, b] = String(hash || "").replace(/^#/, "").split("/");
  if (!isTab(t)) return null;
  let seq = s.seq + 1;
  let root = s.st[t][0];
  if (t === "trail") {
    root = { ...root, view: a === "graph" ? "graph" : "timeline", reset: seq, focus: /^\d{4}-/.test(a || "") ? { iso: a, n: ++seq } : root.focus };
  }
  let n: State = { ...s, seq, tab: t, st: { ...s.st, [t]: [root] } };
  if (t === "ask" && a === "answer") n = pushed(n, "ask", "answer", false, Q(b || "seat").id);
  if (t === "register" && a && DATA.adr[a]) n = pushed(n, "register", "adr", false, a, b === "raw" ? "raw" : "record");
  if (t === "alerts" && a) {
    const al = DATA.alerts.find((x) => x.id === +a);
    if (al && !s.gone.includes(al.id)) n = pushed(n, "alerts", "alert", false, String(al.id));
  }
  return n;
}

export function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "init": {
      const base: State = { ...s, ready: true, rooms: a.rooms || { ...DEFAULT_ROOMS }, read: a.read, gone: a.gone, onb: a.hash === "onboarding" || (!a.hash && !a.onbSeen) ? "on" : "off" };
      return route(base, a.hash) || { ...base, tab: "ask" };
    }
    case "tab": return s.tab === a.t ? s : { ...s, tab: a.t };
    case "push": return pushed(s, a.t, a.name, a.anim, a.param, a.view);
    case "pop": {
      const l = live(s.st[a.t]);
      if (l.length < 2) return s;
      const top = l[l.length - 1];
      const st = a.anim ? s.st[a.t].map((e) => (e === top ? { ...e, leaving: true } : e)) : s.st[a.t].filter((e) => e !== top);
      return { ...s, st: { ...s.st, [a.t]: st } };
    }
    case "popRoot": {
      const [root, ...rest] = s.st[a.t];
      if (!rest.length) return s;
      return { ...s, st: { ...s.st, [a.t]: a.anim ? [root, ...rest.map((e) => (e.leaving ? e : { ...e, leaving: true }))] : [root] } };
    }
    case "remove": return { ...s, st: { ...s.st, [a.t]: s.st[a.t].filter((e) => e.key !== a.key) } };
    case "view": return { ...s, st: { ...s.st, [a.t]: s.st[a.t].map((e) => (e.key === a.key ? { ...e, view: a.view } : e)) } };
    case "route": return route(s, a.hash) || s;
    case "room": return { ...s, rooms: { ...s.rooms, [a.k]: a.on ? 1 : 0 } };
    case "read": return s.read.includes(a.id) ? s : { ...s, read: [...s.read, a.id] };
    case "drop": return { ...s, gone: s.gone.includes(a.id) ? s.gone : [...s.gone, a.id], read: s.read.includes(a.id) ? s.read : [...s.read, a.id] };
    case "onb": return { ...s, onb: a.v };
  }
}

/* ---------- context ---------- */
export interface AppApi {
  state: State;
  RM: boolean;
  dispatch: (a: Action) => void;
  push: (t: Tab, name: ScreenName, param?: string) => void;
  pop: () => void;
  setView: (t: Tab, key: number, view: string) => void;
  route: (hash: string) => void;
  toast: (msg: string) => void;
  openSheet: (content: ReactNode, onClose?: () => void) => void;
  closeSheet: () => void;
  tabClick: (t: Tab) => void;
  dropLater: (id: number, ms: number) => void;
  buzz: () => void;
}
export const AppCtx = createContext<AppApi | null>(null);
export const useApp = () => { const c = useContext(AppCtx); if (!c) throw new Error("AppCtx missing"); return c; };

export interface ScreenApi {
  tab: Tab;
  entry: Entry;
  /** ' under' | ' right' | '' */
  cls: string;
  back?: string;
  /** this screen is the visible top of the visible tab */
  active: boolean;
  setEl: (el: HTMLElement | null) => void;
}
export const ScreenCtx = createContext<ScreenApi | null>(null);
export const useScreen = () => { const c = useContext(ScreenCtx); if (!c) throw new Error("ScreenCtx missing"); return c; };

export const badgeCount = (s: State) => DATA.alerts.filter((a) => a.warn && !s.read.includes(a.id) && !s.gone.includes(a.id)).length;
