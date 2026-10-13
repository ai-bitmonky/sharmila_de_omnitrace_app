"use client";
import { useEffect, useRef } from "react";
import { PRIV_INDEX, PRIV_TABLE } from "@/data/site";
import { SVG_NS, prefersReduced, watchVisible } from "./lib";

export default function Privacy() {
  const secRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sec = secRef.current;
    if (!sec) return;
    const RM = prefersReduced();
    const cleanups: (() => void)[] = [];
    const listen = (el: EventTarget, type: string, fn: EventListener) => { el.addEventListener(type, fn); cleanups.push(() => el.removeEventListener(type, fn)); };

    /* 1 — packets bouncing inside the laptop */
    {
      const root = sec.querySelector<HTMLElement>("#priv-device");
      const g = root?.querySelector<SVGGElement>(".priv-pks");
      if (root && g) {
        const X0 = 36, X1 = 204, Y0 = 30, Y1 = 132;
        let on = false, last = 0, raf = 0;
        g.textContent = "";
        const P = Array.from({ length: 9 }, (_, i) => {
          const c = document.createElementNS(SVG_NS, "circle");
          c.setAttribute("r", String(i % 3 ? 3 : 4.5)); c.setAttribute("class", "priv-pk"); g.appendChild(c);
          return { el: c, x: X0 + 10 + Math.random() * (X1 - X0 - 20), y: Y0 + 10 + Math.random() * (Y1 - Y0 - 20), vx: (Math.random() < 0.5 ? -1 : 1) * (28 + Math.random() * 40), vy: (Math.random() < 0.5 ? -1 : 1) * (22 + Math.random() * 34) };
        });
        const draw = () => P.forEach((p) => p.el.setAttribute("transform", "translate(" + p.x.toFixed(1) + " " + p.y.toFixed(1) + ")"));
        const tick = (t: number) => {
          if (!on) return;
          const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
          P.forEach((p) => {
            p.x += p.vx * dt; p.y += p.vy * dt;
            if (p.x < X0 || p.x > X1) { p.vx *= -1; p.x = Math.max(X0, Math.min(X1, p.x)); }
            if (p.y < Y0 || p.y > Y1) { p.vy *= -1; p.y = Math.max(Y0, Math.min(Y1, p.y)); }
          });
          draw(); raf = requestAnimationFrame(tick);
        };
        draw();
        if (!RM) {
          cleanups.push(watchVisible(root, (v) => { if (v && !on) { on = true; last = 0; raf = requestAnimationFrame(tick); } else if (!v) on = false; }));
          cleanups.push(() => { on = false; cancelAnimationFrame(raf); });
        }
      }
    }

    /* 2 — sensitivity masking */
    {
      const root = sec.querySelector<HTMLButtonElement>("#priv-mask");
      const card = root?.querySelector<HTMLElement>("[data-k=card]"), pw = root?.querySelector<HTMLElement>("[data-k=pw]"), log = root?.querySelector<HTMLElement>(".priv-log");
      if (root && card && pw && log) {
        const Cn = "4556 7720 1934 0081", Wp = "hunter2-acme";
        let i = 0, paused = false, seen = false, tm = 0;
        const maskC = (n: number) => Cn.slice(0, n).replace(/\d/g, (d, k: number) => (k < 4 ? d : "•"));
        const END = Cn.length + Wp.length + 4;
        const render = () => { const a = Math.min(i, Cn.length), b = Math.max(0, Math.min(i - Cn.length - 2, Wp.length)); card.textContent = maskC(a); pw.textContent = "•".repeat(b); log.classList.toggle("is-on", i >= END); };
        const step = () => { if (paused || !seen) return; i++; render(); tm = window.setTimeout(step, i > END ? 2600 : i === END ? 400 : 90); if (i > END + 1) i = 0; };
        if (RM) { i = END; render(); }
        else cleanups.push(watchVisible(root, (v) => { seen = v; clearTimeout(tm); if (v) step(); }));
        const setP = (p: boolean) => { paused = p; root.setAttribute("aria-pressed", p ? "true" : "false"); clearTimeout(tm); if (!p && !RM) step(); };
        const hov = () => matchMedia("(hover:hover)").matches;
        listen(root, "click", () => setP(root.getAttribute("aria-pressed") !== "true"));
        listen(root, "mouseenter", () => { if (hov()) setP(true); });
        listen(root, "mouseleave", () => { if (hov()) setP(false); });
        cleanups.push(() => clearTimeout(tm));
      }
    }

    /* 3 — zero-knowledge lock / unlock */
    {
      const root = sec.querySelector<HTMLElement>("#priv-zk");
      const sw = root?.querySelector<HTMLButtonElement>(".priv-seg");
      if (root && sw) {
        const li = Array.from(root.querySelectorAll<HTMLLIElement>(".priv-idx li")), G = "0123456789abcdef#%&*+=/";
        let raf = 0;
        const scr = (s: string) => s.replace(/[^ ]/g, () => G[(Math.random() * G.length) | 0]);
        li.forEach((l) => (l.textContent = scr(l.dataset.t ?? "")));
        const run = (open: boolean) => {
          cancelAnimationFrame(raf);
          const t0 = performance.now(), D = RM ? 0 : 520;
          const f = (t: number) => {
            const k = D ? Math.min(1, (t - t0) / D) : 1;
            li.forEach((l) => { const s = l.dataset.t ?? "", L = s.length, n = Math.round(L * k); l.textContent = open ? s.slice(0, n) + scr(s.slice(n)) : s.slice(0, L - n) + scr(s.slice(L - n)); });
            if (k < 1) raf = requestAnimationFrame(f);
          };
          f(t0);
        };
        listen(sw, "click", () => {
          const open = sw.getAttribute("aria-checked") !== "true";
          sw.setAttribute("aria-checked", open ? "true" : "false");
          sw.setAttribute("aria-label", open ? "Lock the index" : "Unlock the index");
          root.classList.toggle("is-open", open);
          run(open);
        });
        cleanups.push(() => cancelAnimationFrame(raf));
      }
    }

    /* 4 — offline ask */
    {
      const root = sec.querySelector<HTMLElement>("#priv-off");
      const tog = root?.querySelector<HTMLButtonElement>(".priv-tog"), net = root?.querySelector<HTMLElement>(".priv-net"), ans = root?.querySelector<HTMLElement>(".priv-ans"), ask = root?.querySelector<HTMLButtonElement>(".priv-ask");
      if (root && tog && net && ans && ask) {
        let tm = 0;
        const answer = () => {
          const off = tog.getAttribute("aria-checked") === "false";
          clearTimeout(tm);
          ans.innerHTML = '<span class="mono">searching this laptop…</span>';
          tm = window.setTimeout(() => {
            ans.innerHTML = '<div class="priv-ans-in">Priya Nair, on 6 Feb, in #acme-checkout.<span class="mono">' + (off ? "answered offline · 0 B sent" : "answered on this laptop · 0 B sent") + "</span></div>";
          }, RM ? 0 : 450);
        };
        listen(tog, "click", () => {
          const on = tog.getAttribute("aria-checked") !== "true";
          tog.setAttribute("aria-checked", on ? "true" : "false");
          root.classList.toggle("is-off", !on);
          net.textContent = on ? "Wi-Fi on" : "Wi-Fi off · no internet";
          if (!on) answer();
        });
        listen(ask, "click", answer);
        cleanups.push(() => clearTimeout(tm));
      }
    }

    return () => cleanups.forEach((f) => f());
  }, []);

  return (
    <section id="privacy" className="section priv" ref={secRef}>
      <div className="container">
        <header className="section-head">
          <h2>Your memory never leaves this laptop.</h2>
          <p className="lead">Privacy is the foundation, not a setting.</p>
        </header>
        <div className="priv-grid">
          <article className="priv-card">
            <div className="priv-proof" id="priv-device">
              <svg viewBox="0 0 320 190" role="img" aria-label="Data moves only inside the laptop. 0 bytes go to the cloud.">
                <rect className="priv-out" x="28" y="22" width="184" height="118" rx="7" />
                <path className="priv-out" d="M12 152h216l-10 12H22z" />
                <g className="priv-pks"></g>
                <line className="priv-cut" x1="218" y1="80" x2="250" y2="80" />
                <path className="priv-cloud" d="M258 96h44a14 14 0 0 0 0-28 20 20 0 0 0-38-6 13 13 0 0 0-6 34z" />
                <text className="priv-zero" x="280" y="122" textAnchor="middle">0 B</text>
                <text className="priv-zero" x="280" y="140" textAnchor="middle" style={{ fill: "var(--ink-3)", fontSize: "12px" }}>cloud</text>
              </svg>
            </div>
            <h3>On-device memory</h3>
            <p>Reading, indexing and search all happen on your laptop. No screen video. Nothing is uploaded.</p>
          </article>

          <article className="priv-card">
            <button className="priv-proof priv-mask" id="priv-mask" type="button" aria-pressed="false" aria-label="Masking demo. Tap to pause and see what was skipped.">
              <span className="priv-hint">tap to pause</span>
              <span className="priv-field"><span className="priv-fl">Card number</span><span className="priv-fv" data-k="card"></span></span>
              <span className="priv-field"><span className="priv-fl">Password</span><span className="priv-fv" data-k="pw"></span></span>
              <span className="priv-log">skipped: banking tab, private window</span>
              <span className="priv-skip"><b>Not stored</b><span>card number · password</span><span>banking tab · private window</span><span>0 characters from this form</span></span>
            </button>
            <h3>Sensitivity masking</h3>
            <p>Passwords, card numbers, banking apps and private tabs are ignored. They are never recorded.</p>
          </article>

          <article className="priv-card">
            <div className="priv-proof priv-zk" id="priv-zk">
              <div className="priv-zk-top">
                <svg viewBox="0 0 44 28" aria-hidden="true"><g className="priv-key"><circle cx="7" cy="14" r="5" /><path d="M12 14h12M20 14v4M24 14v3" /><path className="priv-shackle" d="M31 12V8a5 5 0 0 1 10 0v4" /><rect x="29" y="12" width="14" height="12" rx="2" /></g></svg>
                <button className="priv-seg" type="button" role="switch" aria-checked="false" aria-label="Unlock the index"><span>Lock</span><span>Unlock</span></button>
              </div>
              <ul className="priv-idx" aria-live="polite">
                {PRIV_INDEX.map((t) => <li key={t} data-t={t}></li>)}
              </ul>
            </div>
            <h3>Zero-knowledge key</h3>
            <p>Your index is encrypted with a key locked to your hardware. Only your hardware key opens it.</p>
          </article>

          <article className="priv-card">
            <div className="priv-proof priv-off" id="priv-off">
              <div className="priv-off-top">
                <svg className="priv-wifi" viewBox="0 0 24 24" aria-hidden="true"><g className="priv-arcs"><path d="M3 9.5a13 13 0 0 1 18 0M6 13a8.5 8.5 0 0 1 12 0M9 16.5a4 4 0 0 1 6 0" /><circle cx="12" cy="19.5" r=".8" fill="currentColor" /></g><path className="priv-slash" d="M4 4l16 16" /></svg>
                <span className="priv-net">Wi-Fi on</span>
                <span className="priv-tog-hit"><button className="priv-tog" type="button" role="switch" aria-checked="true" aria-label="Wi-Fi"></button></span>
              </div>
              <div className="priv-bar"><span className="q">Who approved the revised scope?</span><button className="priv-ask" type="button">Ask</button></div>
              <div className="priv-ans" aria-live="polite"></div>
            </div>
            <h3>Works offline</h3>
            <p>No internet needed. Turn the Wi-Fi off and ask anyway.</p>
          </article>
        </div>

        <figure className="priv-spec">
          <table className="priv-table">
            <thead><tr><th scope="col">What is stored</th><th scope="col">Where it lives</th><th scope="col">Who holds the key</th></tr></thead>
            <tbody>
              {PRIV_TABLE.map((r) => (
                <tr key={r[0]}><td>{r[0]}</td><td className={r[3] ? "priv-yes" : undefined}>{r[1]}</td><td>{r[2]}</td></tr>
              ))}
            </tbody>
          </table>
          <figcaption className="fig">fig. 05 — where your data lives</figcaption>
        </figure>
      </div>
    </section>
  );
}
