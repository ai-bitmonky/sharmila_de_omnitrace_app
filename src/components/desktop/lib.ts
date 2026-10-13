/* Shared helpers for the desktop demos (port of the prototype's window.OT). */

export function prefersReduced(): boolean {
  return typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export interface OnEnterOpts {
  once?: boolean;
  threshold?: number;
  rootMargin?: string;
  onLeave?: (el: Element, e: IntersectionObserverEntry) => void;
}

/** Calls cb when el scrolls into view. Returns a disposer. */
export function onEnter(el: Element | null, cb: (el: Element, e?: IntersectionObserverEntry) => void, opts: OnEnterOpts = {}): () => void {
  if (!el) return () => {};
  const once = opts.once !== false;
  if (!("IntersectionObserver" in window)) {
    cb(el);
    return () => {};
  }
  const io = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (e.isIntersecting) {
          cb(e.target, e);
          if (once) io.disconnect();
        } else if (opts.onLeave) opts.onLeave(e.target, e);
      }),
    { threshold: opts.threshold != null ? opts.threshold : 0.25, rootMargin: opts.rootMargin || "0px" },
  );
  io.observe(el);
  return () => io.disconnect();
}

/** Observes visibility changes (both directions). Returns a disposer. */
export function watchVisible(el: Element | null, cb: (visible: boolean) => void, rootMargin = "0px"): () => void {
  if (!el) return () => {};
  if (!("IntersectionObserver" in window)) {
    cb(true);
    return () => {};
  }
  const io = new IntersectionObserver((es) => cb(es[0].isIntersecting), { rootMargin });
  io.observe(el);
  return () => io.disconnect();
}

/** Types text into el, character by character. Returns a cancel function. */
export function typeText(el: HTMLElement | SVGElement, text: string, speed = 28, done?: () => void): () => void {
  let i = 0;
  let id = 0;
  let stop = false;
  if (prefersReduced()) {
    el.textContent = text;
    if (done) done();
    return () => {};
  }
  el.textContent = "";
  const step = () => {
    if (stop) return;
    el.textContent = text.slice(0, ++i);
    if (i < text.length) id = window.setTimeout(step, speed * (text[i - 1] === " " ? 1.6 : 0.7 + Math.random() * 0.6));
    else if (done) done();
  };
  id = window.setTimeout(step, speed);
  return () => {
    stop = true;
    clearTimeout(id);
  };
}

export const SVG_NS = "http://www.w3.org/2000/svg";

/** Create an SVG element with attributes, optionally appended to a parent. */
export function mk(tag: string, attrs: Record<string, string | number>, parent?: Element): SVGElement {
  const e = document.createElementNS(SVG_NS, tag) as SVGElement;
  for (const k in attrs) e.setAttribute(k, String(attrs[k]));
  if (parent) parent.appendChild(e);
  return e;
}
