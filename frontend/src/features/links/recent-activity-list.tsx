import type { ClickEvent } from "./repository";

export function RecentActivityList({ events }: { events: ClickEvent[] }) {
  return (
    <ul className="mobile-activity-list" aria-label="Recent visits">
      {events.map((event, index) => (
        <li key={`${event.at}-${index}`}>
          <div>
            <strong>{event.referrer}</strong>
            <span>Link opened</span>
          </div>
          <time dateTime={event.at}>
            {new Date(event.at).toLocaleDateString("en", {
              month: "short",
              day: "numeric",
              timeZone: "UTC",
            })}
            <span>
              {new Date(event.at).toLocaleTimeString("en", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "UTC",
              })}{" "}
              UTC
            </span>
          </time>
        </li>
      ))}
    </ul>
  );
}
