import { FOOTER_LINKS } from "@/data/site";

export default function Footer() {
  return (
    <footer className="foot" id="footer">
      <div className="container foot-inner">
        <a className="nav-logo" href="#top"><svg aria-hidden="true"><use href="#mark-omnitrace" /></svg>OmniTrace</a>
        <nav className="foot-links" aria-label="Footer">
          {FOOTER_LINKS.map((l) => <a key={l.label} href={l.href}>{l.label}</a>)}
        </nav>
        <p className="mono foot-copy">© 2026 OmniTrace. Your memory stays yours.</p>
      </div>
    </footer>
  );
}
