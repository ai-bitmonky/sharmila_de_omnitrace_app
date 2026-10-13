"use client";
import type { CSSProperties } from "react";

/** Two-way segmented control (.seg) with the sliding thumb (<i>). */
export default function Segmented<T extends string>({ options, value, onChange, label }: { options: [T, string][]; value: T; onChange: (v: T) => void; label: string }) {
  const i = Math.max(0, options.findIndex(([v]) => v === value));
  return (
    <div className="seg" role="group" aria-label={label} style={{ "--i": i, "--n": options.length } as CSSProperties}>
      <i />
      {options.map(([v, l]) => (
        <button key={v} aria-pressed={v === value} onClick={() => { if (v !== value) onChange(v); }}>{l}</button>
      ))}
    </div>
  );
}
