"use client";
import "./desktop.css";
import Nav from "./Nav";
import Spine from "./Spine";
import Hero from "./Hero";
import Rooms from "./Rooms";
import Graph from "./Graph";
import Features from "./Features";
import Privacy from "./Privacy";
import Who from "./Who";
import Integrations from "./Integrations";
import Cta from "./Cta";
import Footer from "./Footer";

/* Desktop marketing site (≥900px) — port of OmniTrace_Prototype_v1.0.html */
export default function DesktopSite() {
  return (
    <>
      <Nav />
      <Spine />
      <main id="main" className="ds">
        <Hero />
        <Rooms />
        <Graph />
        <Features />
        <Privacy />
        <Who />
        <Integrations />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
