import type { LucideIcon } from "lucide-react";
export function MetricStrip({
  items,
  mobilePrimary,
}: {
  items: { label: string; value: string; note: string; icon: LucideIcon }[];
  mobilePrimary?: string[];
}) {
  return (
    <div className="metric-strip">
      {items.map(({ label, value, note, icon: Icon }) => (
        <div
          className={`metric ${mobilePrimary && !mobilePrimary.includes(label) ? "desktop-only" : ""}`}
          key={label}
        >
          <div className="metric-label">
            {label}
            <Icon size={15} />
          </div>
          <div className="metric-value">{value}</div>
          <div className="metric-note" title={note}>
            {note}
          </div>
        </div>
      ))}
    </div>
  );
}
