import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Link2,
  MousePointer2,
  Search,
  TrendingUp,
  Trophy,
  X,
  Plus,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetricStrip } from "@/components/metrics";
import { CreateLink } from "@/features/links/create-link";
import { useLinks } from "@/features/links/queries";
import { LinkActions } from "@/features/links/link-actions";
import {
  displayUrl,
  downloadCsv,
  formatDate,
  formatNumber,
  metrics,
} from "@/features/links/repository";
import { DataState } from "@/components/data-state";
import { ActionMenu } from "@/components/ui/action-menu";
import { MobileLinkList } from "@/features/links/mobile-link-list";
export function Dashboard() {
  const query = useLinks();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [composerOpen, setComposerOpen] = useState(false);
  if (!query.data) return <DataState query={query} />;
  const links = query.data;
  const stats = metrics(links);
  const top = [...links].sort(
    (a, b) => b.analytics.totalClicks - a.analytics.totalClicks,
  )[0];
  const filtered = links
    .filter((l) =>
      `${l.title} ${l.url} ${l.code}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "clicks"
        ? b.analytics.totalClicks - a.analytics.totalClicks
        : sort === "oldest"
          ? a.createdAt.localeCompare(b.createdAt)
          : b.createdAt.localeCompare(a.createdAt),
    );
  const pages = Math.max(1, Math.ceil(filtered.length / 6));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * 6, currentPage * 6);
  return (
    <>
      <div className="page-heading dashboard-heading">
        <div>
          <h1>
            <span className="desktop-only">Your links, in focus.</span>
            <span className="mobile-only">Links</span>
          </h1>
          <p className="desktop-only">
            Everything you share. A little more connected.
          </p>
        </div>
        <span className="heading-date">
          {new Date().toLocaleDateString("en", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        {!!links.length && (
          <Button
            className="mobile-only new-link-button"
            aria-expanded={composerOpen}
            aria-controls="link-composer"
            onClick={() => setComposerOpen(!composerOpen)}
          >
            {composerOpen ? <X /> : <Plus />}
            {composerOpen ? "Close" : "New link"}
          </Button>
        )}
      </div>
      <CreateLink
        mobileOpen={composerOpen || !links.length}
        onExpand={() => setComposerOpen(true)}
        onCreated={() => setComposerOpen(true)}
      />
      {!!links.length && (
        <p className="mobile-only workspace-summary">
          {formatNumber(links.length)} {links.length === 1 ? "link" : "links"}
          <span aria-hidden="true">·</span>
          {formatNumber(stats.week)} clicks this week
        </p>
      )}
      <div className="desktop-only">
        <MetricStrip
          items={[
            {
              label: "Total links",
              value: formatNumber(links.length),
              note: "A home for everything you share",
              icon: Link2,
            },
            {
              label: "Total clicks",
              value: formatNumber(stats.total),
              note: "Across all your links",
              icon: MousePointer2,
            },
            {
              label: "Clicks this week",
              value: formatNumber(stats.week),
              note: "Last 7 days · UTC",
              icon: TrendingUp,
            },
            {
              label: "Top performing link",
              value: top?.analytics.totalClicks ? `/${top.code}` : "—",
              note: top?.analytics.totalClicks
                ? `${formatNumber(top.analytics.totalClicks)} clicks · ${top.title}`
                : "Your next great link awaits",
              icon: Trophy,
            },
          ]}
        />
      </div>
      <section
        className="links-panel"
        data-empty={!links.length}
        aria-labelledby="links-heading"
      >
        <div className="table-heading desktop-only">
          <div className="flex items-center gap-2.5">
            <h2 id="links-heading">All links</h2>
            <span className="count-badge">{links.length}</span>
          </div>
          <Button
            variant="outline"
            onClick={() => downloadCsv(filtered)}
            disabled={!filtered.length}
          >
            <ArrowDownToLine />
            Export CSV
          </Button>
        </div>
        <div className="table-toolbar">
          <div className="search-input">
            <Search size={16} />
            <input
              aria-label="Search links"
              placeholder="Search links…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            {search && (
              <button
                aria-label="Clear search"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>
          <label className="sort-control desktop-only">
            <ArrowDown size={14} />
            <span className="sr-only">Sort links</span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="clicks">Most clicks</option>
            </select>
          </label>
          <div className="mobile-only mobile-list-options">
            <ActionMenu
              label="List options"
              title="Sort links"
              items={[
                ...[
                  { value: "newest", label: "Newest first" },
                  { value: "oldest", label: "Oldest first" },
                  { value: "clicks", label: "Most clicks" },
                ].map((option) => ({
                  label: option.label,
                  icon:
                    sort === option.value ? (
                      <Check />
                    ) : (
                      <span className="menu-icon-space" />
                    ),
                  onSelect: () => {
                    setSort(option.value);
                    setPage(1);
                  },
                })),
                {
                  label: "Export CSV",
                  icon: <ArrowDownToLine />,
                  disabled: !filtered.length,
                  onSelect: () => downloadCsv(filtered),
                },
              ]}
            >
              <ArrowDown size={14} />
              {sort === "clicks"
                ? "Clicks"
                : sort === "oldest"
                  ? "Oldest"
                  : "Newest"}
            </ActionMenu>
          </div>
        </div>
        {visible.length ? (
          <>
            <MobileLinkList links={visible} />
            <div className="table-scroll desktop-only">
              <table className="links-table">
                <thead>
                  <tr>
                    <th>Link & destination</th>
                    <th>Short link</th>
                    <th className="numeric">Clicks</th>
                    <th>Created</th>
                    <th>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((link) => (
                    <tr key={link.id}>
                      <td>
                        <div className="destination-cell">
                          <div className="destination-icon">
                            <Link2 size={18} />
                          </div>
                          <div className="destination-text">
                            <Link
                              className="link-title"
                              to={`/links/${link.id}`}
                            >
                              {link.title}
                            </Link>
                            <a
                              className="destination-url"
                              href={link.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {link.url}
                              <ArrowUpRight size={12} />
                            </a>
                          </div>
                        </div>
                      </td>
                      <td>
                        <a
                          className="short-link"
                          href={`/${link.code}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <span>{displayUrl(link)}</span>
                          <ArrowUpRight size={13} />
                        </a>
                      </td>
                      <td className="numeric click-count">
                        {formatNumber(link.analytics.totalClicks)}
                      </td>
                      <td className="created-date">
                        {formatDate(link.createdAt)}
                      </td>
                      <td>
                        <LinkActions link={link} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              <span>
                <span className="desktop-only">Showing </span>
                {(currentPage - 1) * 6 + 1}–
                {Math.min(currentPage * 6, filtered.length)} of{" "}
                {filtered.length} links
              </span>
              <div className="pagination">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Previous page"
                  disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  <ChevronLeft />
                </Button>
                <span>
                  Page {currentPage} of {pages}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Next page"
                  disabled={currentPage === pages}
                  onClick={() => setPage(currentPage + 1)}
                >
                  <ChevronRight />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            {search ? <Search size={28} /> : <CirclePlus size={28} />}
            <h3>
              {search ? "No links found" : "Your first link starts here."}
            </h3>
            <p>
              {search
                ? "Try another title, destination, or short code."
                : "Paste a URL above to create something worth sharing."}
            </p>
            {search && (
              <Button variant="outline" onClick={() => setSearch("")}>
                Clear search
              </Button>
            )}
          </div>
        )}
      </section>
      <div className="under-table desktop-only">
        <span>
          <span className="status-dot" />
          Your links are saved to the LinkLab workspace.
        </span>
        <Link to="/analytics">
          Explore your analytics
          <ArrowRight size={14} />
        </Link>
      </div>
    </>
  );
}
