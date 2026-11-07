import type { LucideIcon } from "lucide-react";
export function MetricStrip({
  items,
}: {
  items: { label: string; value: string; note: string; icon: LucideIcon }[];
}) {
  return (
    <div className="metric-strip">
      {items.map(({ label, value, note, icon: Icon }) => (
        <div className="metric" key={label}>
          <div className="metric-label">
            {label}
            <Icon size={15} />
          </div>
          <div className="metric-value">{value}</div>
          <div className="metric-note">{note}</div>
        </div>
      ))}
    </div>
  );
}
