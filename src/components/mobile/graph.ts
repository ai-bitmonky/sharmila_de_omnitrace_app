/* Canvas force graph for the Trail › Graph view — ported from makeGraph() in the prototype.
   Same layout algorithm (seeded positions, 600 force steps, label collision pass), pan, pinch,
   tap-to-select, travelling packet along the decision path. destroy() removes every listener. */
import { DATA, type NodeType, type RoomId } from "@/data/app";

export interface GNode { id: string; type: NodeType; s: string; l: string; room?: RoomId; iso?: string; date: number; i: number; x: number; y: number; vx: number; vy: number }
export interface GraphApi {
  N: GNode[]; E: [GNode, GNode][];
  resize(): void; fit(): void; kick(): void; draw(): void;
  onTap: (n: GNode) => void;
  setDate(t: number): void; clear(): void; destroy(): void;
}

export function makeGraph(cv: HTMLCanvasElement, active: () => boolean, RM: boolean): GraphApi {
  const ctx = cv.getContext("2d") as CanvasRenderingContext2D;
  const C = { ink: "#EDE8DF", ink2: "#B8B2A6", ink3: "#7F7A70", tr: "#F2C945", paper: "#F4EFE4", bg2: "#15140F", bg3: "#1C1A15" };
  const N: GNode[] = DATA.nodes.map((r, i) => ({ id: r[0], type: r[1], s: r[2], l: r[3], room: r[4], iso: r[5], date: r[5] ? Date.parse(r[5]) : 0, i, x: 0, y: 0, vx: 0, vy: 0 }));
  const by: Record<string, GNode> = {};
  N.forEach((n) => (by[n.id] = n));
  const E: [GNode, GNode][] = DATA.edges.map((e) => [by[e[0]], by[e[1]]]);
  const PA = DATA.path.map((id) => by[id]);
  N.forEach((n) => {
    if (n.type === "room") { const a = -Math.PI / 2 + (n.i * 2 * Math.PI) / 5; n.x = Math.cos(a) * 150; n.y = Math.sin(a) * 150; }
    else if (n.type === "person") { const a = n.i * 1.7; n.x = Math.cos(a) * 55; n.y = Math.sin(a) * 55; }
    else { const r = by[n.room as string]; n.x = r.x * 0.75 + ((n.i % 3) - 1) * 16; n.y = r.y * 0.75 + (n.i % 2 ? 12 : -12); }
  });
  for (let it = 0; it < 600; it++) {
    for (let a = 0; a < N.length; a++) for (let b = a + 1; b < N.length; b++) {
      const A = N[a], B = N[b]; let dx = B.x - A.x, dy = B.y - A.y;
      const d2 = dx * dx + dy * dy + 0.01, d = Math.sqrt(d2), f = 3400 / d2; dx /= d; dy /= d;
      A.vx -= dx * f; A.vy -= dy * f; B.vx += dx * f; B.vy += dy * f;
    }
    E.forEach(([A, B]) => { const dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy) || 1, f = (d - 70) * 0.02; A.vx += (dx / d) * f; A.vy += (dy / d) * f; B.vx -= (dx / d) * f; B.vy -= (dy / d) * f; });
    N.forEach((n) => { n.vx -= n.x * 0.004; n.vy -= n.y * 0.004; n.vx *= 0.8; n.vy *= 0.8; n.x += n.vx; n.y += n.vy; });
  }
  const lw = (n: GNode) => (n.type === "person" ? 24 : n.s.length * 6.8 + 10); /* label collision pass */
  for (let it = 0; it < 160; it++) for (let a = 0; a < N.length; a++) for (let b = a + 1; b < N.length; b++) {
    const A = N[a], B = N[b], dx = B.x - A.x, dy = B.y - A.y, px = (lw(A) + lw(B)) / 2 - Math.abs(dx), py = 30 - Math.abs(dy);
    if (px > 0 && py > 0) {
      if (px < py) { const m = (px / 2) * (dx < 0 ? -1 : 1); A.x -= m; B.x += m; }
      else { const m = (py / 2) * (dy < 0 ? -1 : 1); A.y -= m; B.y += m; }
    }
  }
  let W = 0, H = 0, dpr = 1, s = 1, ox = 0, oy = 0, date = Infinity, sel: GNode | null = null, raf = 0;
  const vis = (n: GNode) => !n.date || n.date <= date;
  const P = (n: GNode): [number, number] => [n.x * s + ox, n.y * s + oy];
  function fit() {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    N.forEach((n) => { x0 = Math.min(x0, n.x); x1 = Math.max(x1, n.x); y0 = Math.min(y0, n.y); y1 = Math.max(y1, n.y); });
    s = Math.min((W - 70) / (x1 - x0), (H - 70) / (y1 - y0), 2.2); ox = W / 2 - ((x0 + x1) / 2) * s; oy = H / 2 - ((y0 + y1) / 2) * s + 4; draw();
  }
  function resize() {
    const r = cv.getBoundingClientRect(); if (!r.width) return;
    W = r.width; H = r.height; dpr = Math.min(2, devicePixelRatio || 1); cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); fit();
  }
  function draw(t?: number | null) {
    if (!W) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H); ctx.lineCap = "round";
    E.forEach(([A, B]) => {
      const k = PA.indexOf(A), pa = k > -1 && PA[k + 1] === B;
      ctx.globalAlpha = vis(A) && vis(B) ? (sel && !(A === sel || B === sel) ? 0.35 : 1) : 0.07;
      ctx.strokeStyle = pa ? C.tr : "rgba(237,232,223,.2)"; ctx.lineWidth = pa ? 2 : 1;
      const [a1, a2] = P(A), [b1, b2] = P(B); ctx.beginPath(); ctx.moveTo(a1, a2); ctx.lineTo(b1, b2); ctx.stroke();
    });
    if (t != null) {
      const u = ((t / 3600) % 1) * (PA.length - 1), k = Math.floor(u), f = u - k, A = PA[k], B = PA[k + 1];
      if (vis(B)) {
        const [a1, a2] = P(A), [b1, b2] = P(B); ctx.globalAlpha = 1; ctx.fillStyle = C.tr; ctx.shadowColor = C.tr; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(a1 + (b1 - a1) * f, a2 + (b2 - a2) * f, 3, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
      }
    }
    N.forEach((n) => {
      const [x, y] = P(n), on = PA.includes(n); ctx.globalAlpha = vis(n) ? 1 : 0.12; ctx.lineWidth = 1.5; let r = 6; ctx.beginPath();
      if (n.type === "room") { r = 11; if (ctx.roundRect) ctx.roundRect(x - r, y - r, 2 * r, 2 * r, 5); else ctx.rect(x - r, y - r, 2 * r, 2 * r); ctx.fillStyle = C.bg3; ctx.fill(); ctx.strokeStyle = C.ink2; ctx.stroke(); }
      else if (n.type === "person") { r = 10; ctx.arc(x, y, r, 0, 7); ctx.fillStyle = C.bg3; ctx.fill(); ctx.strokeStyle = C.ink3; ctx.stroke(); ctx.fillStyle = C.ink2; ctx.font = "600 10px Inter,system-ui,sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(n.s[0], x, y + 0.5); }
      else if (n.type === "rule") { r = 7; ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y); ctx.closePath(); ctx.fillStyle = C.paper; ctx.fill(); }
      else if (n.type === "dec") { r = 7; ctx.rect(x - r, y - r, 2 * r, 2 * r); ctx.fillStyle = C.tr; ctx.fill(); }
      else { r = 5; ctx.arc(x, y, r, 0, 7); ctx.fillStyle = on ? C.tr : C.ink2; ctx.fill(); }
      if (sel === n) { ctx.beginPath(); ctx.arc(x, y, r + 6, 0, 7); ctx.strokeStyle = C.tr; ctx.lineWidth = 2; ctx.stroke(); }
      ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.font = n.type === "room" ? "600 12px Inter,system-ui,sans-serif" : "10.5px ui-monospace,Menlo,monospace";
      ctx.fillStyle = n.type === "room" ? C.ink : on || n.type === "dec" ? C.tr : C.ink3;
      if (n.type !== "person") { ctx.lineWidth = 4; ctx.lineJoin = "round"; ctx.strokeStyle = "#0F0E0C"; ctx.strokeText(n.s, x, y + r + 5); ctx.fillText(n.s, x, y + r + 5); }
    });
    ctx.globalAlpha = 1;
  }
  function frame(t: number) { raf = 0; if (!active()) { draw(); return; } draw(RM ? null : t); if (!RM) raf = requestAnimationFrame(frame); }
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

  /* pan + pinch + tap */
  type Gest = { m: 1; x: number; y: number; ox: number; oy: number; mv: number } | { m: 2; d: number; s: number; wx: number; wy: number; mv: number } | null;
  const pts = new Map<number, { x: number; y: number }>(); let g: Gest = null;
  const snap = () => {
    const p = [...pts.values()];
    if (p.length === 1) g = { m: 1, x: p[0].x, y: p[0].y, ox, oy, mv: g && g.m === 2 ? 99 : 0 };
    else if (p.length === 2) { const d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y), mx = (p[0].x + p[1].x) / 2, my = (p[0].y + p[1].y) / 2; g = { m: 2, d, s, wx: (mx - ox) / s, wy: (my - oy) / s, mv: 99 }; }
    else g = null;
  };
  const xy = (e: PointerEvent) => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const down = (e: PointerEvent) => { try { cv.setPointerCapture(e.pointerId); } catch { /* not capturable */ } pts.set(e.pointerId, xy(e)); snap(); };
  const move = (e: PointerEvent) => {
    if (!pts.has(e.pointerId) || !g) return; pts.set(e.pointerId, xy(e)); const p = [...pts.values()];
    if (g.m === 1) { const dx = p[0].x - g.x, dy = p[0].y - g.y; g.mv = Math.max(g.mv, Math.hypot(dx, dy)); if (g.mv > 6) { ox = g.ox + dx; oy = g.oy + dy; } }
    else if (g.m === 2 && p.length > 1) { const d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y), mx = (p[0].x + p[1].x) / 2, my = (p[0].y + p[1].y) / 2; s = Math.max(0.5, Math.min(4, (g.s * d) / g.d)); ox = mx - g.wx * s; oy = my - g.wy * s; }
    draw();
  };
  const up = (e: PointerEvent) => {
    if (!pts.has(e.pointerId)) return;
    const tap = !!g && g.m === 1 && g.mv <= 6 && e.type === "pointerup"; const q = xy(e);
    pts.delete(e.pointerId); snap(); if (pts.size === 1 && g) g.mv = 99;
    if (tap) {
      let best = null as GNode | null, bd = 24;
      N.forEach((n) => { if (!vis(n)) return; const [x, y] = P(n), d = Math.hypot(x - q.x, y - q.y); if (d < bd) { bd = d; best = n; } });
      sel = best; draw(); if (best) api.onTap(best);
    }
  };
  cv.addEventListener("pointerdown", down); cv.addEventListener("pointermove", move);
  cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);

  const api: GraphApi = {
    N, E, resize, fit, kick, draw: () => draw(), onTap: () => {},
    setDate(t) { date = t; draw(); },
    clear() { sel = null; draw(); },
    destroy() {
      if (raf) cancelAnimationFrame(raf); raf = 0;
      cv.removeEventListener("pointerdown", down); cv.removeEventListener("pointermove", move);
      cv.removeEventListener("pointerup", up); cv.removeEventListener("pointercancel", up);
    },
  };
  return api;
}
