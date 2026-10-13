"use client";
import { G } from "./icons";

export default function Toast({ msg, on }: { msg: string; on: boolean }) {
  return (
    <div id="toast" className={"toast" + (on ? " on" : "")} role="status" aria-live="polite">
      {msg ? <><G id="check" />{msg}</> : null}
    </div>
  );
}
