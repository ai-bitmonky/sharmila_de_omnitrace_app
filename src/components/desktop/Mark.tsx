import type { AppId } from "@/data/site";

/** App glyph from the shared <symbol> sprite (rendered once by DeviceGate/AppMarks). */
export function Mark({ app, className = "app-mark" }: { app: AppId | "omnitrace"; className?: string }) {
  return (
    <svg className={className} aria-hidden="true">
      <use href={`#mark-${app}`} />
    </svg>
  );
}

export function Chip({ app, label }: { app: AppId; label: string }) {
  return (
    <span className="chip">
      <Mark app={app} />
      {label}
    </span>
  );
}
