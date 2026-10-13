"use client";
import { useSyncExternalStore } from "react";
import AppMarks from "./AppMarks";
import DesktopSite from "./desktop/DesktopSite";
import MobileApp from "./mobile/MobileApp";

const QUERY = "(max-width: 899px)";
function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

export default function DeviceGate({ initialIsMobile }: { initialIsMobile: boolean }) {
  const isMobile = useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => initialIsMobile);
  return (
    <>
      <AppMarks />
      {isMobile ? <MobileApp /> : <DesktopSite />}
    </>
  );
}
