"use client";
import { useApp } from "./store";

/** iOS-style switch (.tg). Clicks never bubble to the row behind it. */
export default function Toggle({ on, onChange, label, disabled }: { on: boolean; onChange?: (on: boolean) => void; label: string; disabled?: boolean }) {
  const app = useApp();
  return (
    <button
      className="tg" role="switch" aria-checked={on} aria-label={label} disabled={disabled}
      onClick={(e) => { e.stopPropagation(); if (disabled) return; app.buzz(); onChange?.(!on); }}
    />
  );
}
