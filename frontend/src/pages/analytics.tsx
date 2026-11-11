import { lazy, Suspense, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Globe2,
  Link2,
  MousePointer2,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetricStrip } from "@/components/metrics";
import { DataState } from "@/components/data-state";
import { useLinks } from "@/features/links/queries";
import { LinkActions } from "@/features/links/link-actions";
import {
  displayUrl,
  downloadCsv,
  formatDate,
  formatNumber,
  metrics,
} from "@/features/links/repository";
import { NotFound } from "./not-found";
const ClickChart = lazy(() => import("@/components/click-chart"));
export function Analytics() {
  const { id } = useParams();
  const query = useLinks();
  const [search, setSearch] = useState("");
  const [activityPage, setActivityPage] = useState(1);
  if (!query.data) return <DataState query={query} />;
  const link = id ? query.data.find((l) => l.id === id) : undefined;
  if (id && !link) return <NotFound />;
  const links = link ? [link] : query.data;
  const stats = metrics(links);
  const activity = stats.events.filter((e) =>
    e.referrer.toLowerCase().includes(search.toLowerCase()),
  );
  const pages = Math.max(1, Math.ceil(activity.length / 5));
  const page = Math.min(activityPage, pages);
  return (
    <>
      <Link className="back-link" to="/">
        <ArrowLeft size={14} />
        All links
      </Link>
      <div className="page-heading analytics-heading">
        <div>
          <h1>{link ? "Behind every click." : "The bigger picture."}</h1>
          <p>
            {link
              ? "A closer look at how your link connects."
              : "One clear view of everything you share."}
          </p>
        </div>
        <Button
          variant="outline"
          disabled={!links.length}
          onClick={() => downloadCsv(links)}
        >
          <ArrowDownToLine />
          Export links
        </Button>
      </div>
      {link ? (
        <section className="link-summary">
          <div className="summary-main">
            <div className="create-icon">
              <Link2 size={20} />
            </div>
            <div>
              <h2>{link.title}</h2>
              <a
                className="summary-short"
                href={`/${link.code}`}
                target="_blank"
                rel="noreferrer"
              >
                {displayUrl(link)}
                <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
          <LinkActions link={link} expanded />
          <div className="summary-meta">
            <span>
              Destination{" "}
              <a href={link.url} target="_blank" rel="noreferrer">
                {link.url}
                <ArrowUpRight size={12} />
              </a>
            </span>
            <span>
              <CalendarDays size={13} />
              Created {formatDate(link.createdAt)}
            </span>
          </div>
        </section>
      ) : (
        <div className="analytics-context">
          <Globe2 size={16} />
          Workspace overview
          <span>{links.length} links · Live workspace activity</span>
        </div>
      )}
      <MetricStrip
        items={[
          {
            label: "Total clicks",
            value: formatNumber(stats.total),
            note: "All recorded visits",
            icon: MousePointer2,
          },
          {
            label: "Clicks today",
            value: formatNumber(stats.today),
            note: "Since midnight · UTC",
            icon: TrendingUp,
          },
          {
            label: "Last 7 days",
            value: formatNumber(stats.week),
            note: "Including today · UTC",
            icon: CalendarDays,
          },
          {
            label: "Last accessed",
            value: stats.last
              ? new Date(stats.last).toLocaleTimeString("en", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "UTC",
                })
              : "—",
            note: stats.last
              ? `${formatDate(stats.last)} · UTC`
              : "No visits yet",
            icon: Clock3,
          },
        ]}
      />
      <section className="chart-panel">
        <div className="section-heading">
          <div>
            <h2>Clicks over time</h2>
            <p>A daily view of the connections you’re making.</p>
          </div>
          <span className="period-badge">
            <CalendarDays size={14} />
            Last 7 days
          </span>
        </div>
        {stats.week ? (
          <Suspense fallback={<div className="skeleton h-64" />}>
            <ClickChart data={stats.daily} />
          </Suspense>
        ) : (
          <div className="empty-state chart-empty">
            <MousePointer2 size={28} />
            <h3>Your story is just getting started.</h3>
            <p>Share a short link to see your first clicks here.</p>
          </div>
        )}
        <div className="chart-caption">
          <span>
            <span className="status-dot" />
            Recorded clicks
          </span>
          <span>Daily totals · UTC</span>
        </div>
      </section>
      <div className="analytics-bottom">
        <section className="referrers-panel">
          <div className="section-heading">
            <div>
              <h2>Where clicks come from</h2>
              <p>Your top referring sources.</p>
            </div>
            <Globe2 size={17} />
          </div>
          {stats.sources.length ? (
            <div className="source-list">
              {stats.sources.map(([source, count], i) => (
                <div className={`source tone-${i % 5}`} key={source}>
                  <div className="source-label">
                    <span>
                      <span className="source-dot" />
                      {source}
                    </span>
                    <span>
                      {formatNumber(count)}
                      <strong>
                        {Math.round((count / stats.total) * 100)}%
                      </strong>
                    </span>
                  </div>
                  <div className="source-track">
                    <div style={{ width: `${(count / stats.total) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Referrers will appear after your first visit.</p>
            </div>
          )}
          <p className="panel-footnote">
            Missing referrers are grouped as Direct / Unknown.
          </p>
        </section>
        <section className="popular-panel">
          <div className="section-heading">
            <div>
              <h2>{link ? "About this link" : "Your most-clicked links"}</h2>
              <p>
                {link
                  ? "The details, all in one place."
                  : "Good things are getting around."}
              </p>
            </div>
            <Link2 size={17} />
          </div>
          {link ? (
            <dl className="link-details">
              <div>
                <dt>Short code</dt>
                <dd>{link.code}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{formatDate(link.createdAt)}</dd>
              </div>
              <div>
                <dt>Tracking window</dt>
                <dd>Last 7 days</dd>
              </div>
              <div>
                <dt>Storage</dt>
                <dd>LinkLab database</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd className="active-label">
                  <span className="status-dot" />
                  Active
                </dd>
              </div>
            </dl>
          ) : (
            <ol className="popular-list">
              {[...links]
                .sort(
                  (a, b) => b.analytics.totalClicks - a.analytics.totalClicks,
                )
                .slice(0, 5)
                .map((l, i) => (
                  <li key={l.id}>
                    <span className="rank">{i + 1}</span>
                    <Link to={`/links/${l.id}`}>
                      <strong>{l.title}</strong>
                      <span>/{l.code}</span>
                    </Link>
                    <span>{formatNumber(l.analytics.totalClicks)}</span>
                  </li>
                ))}
              {!links.length && (
                <li>No links yet. Create one to get started.</li>
              )}
            </ol>
          )}
        </section>
      </div>
      <section className="activity-panel">
        <div className="section-heading">
          <div>
            <h2>Recent activity</h2>
            <p>The latest recorded visits, newest first.</p>
          </div>
          <input
            className="activity-search"
            aria-label="Filter recent activity by referrer"
            placeholder="Filter by referrer…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setActivityPage(1);
            }}
          />
        </div>
        {activity.length ? (
          <>
            <div className="table-scroll">
              <table className="activity-table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Referrer</th>
                    <th>Date · UTC</th>
                    <th className="numeric">Time · UTC</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.slice((page - 1) * 5, page * 5).map((event, i) => (
                    <tr key={`${event.at}-${i}`}>
                      <td>
                        <span className="event-label">
                          <MousePointer2 size={14} />
                          Link opened
                        </span>
                      </td>
                      <td>{event.referrer}</td>
                      <td>
                        {new Date(event.at).toLocaleDateString("en", {
                          month: "short",
                          day: "numeric",
                          timeZone: "UTC",
                        })}
                      </td>
                      <td className="numeric">
                        {new Date(event.at).toLocaleTimeString("en", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          timeZone: "UTC",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              <span>
                {formatNumber(activity.length)} visits
                {search ? " matching your filter" : ""}
              </span>
              <div className="pagination">
                <Button
                  variant="ghost"
                  disabled={page === 1}
                  onClick={() => setActivityPage(page - 1)}
                >
                  Previous
                </Button>
                <span>
                  {page} / {pages}
                </span>
                <Button
                  variant="ghost"
                  disabled={page === pages}
                  onClick={() => setActivityPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <h3>{search ? "No matching visits" : "No activity yet"}</h3>
            <p>
              {search
                ? "Try a different referrer."
                : "Your next click will show up here."}
            </p>
          </div>
        )}
      </section>
    </>
  );
}
