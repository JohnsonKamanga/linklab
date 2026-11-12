import { Link } from "react-router-dom";
import { formatNumber, type LinkRecord } from "./repository";
import { LinkActions } from "./link-actions";

function destination(url: string) {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname.replace(/^www\./, ""),
      path: `${parsed.pathname === "/" ? "" : parsed.pathname}${parsed.search}${parsed.hash}`,
    };
  } catch {
    return { host: url, path: "" };
  }
}

export function MobileLinkList({ links }: { links: LinkRecord[] }) {
  return (
    <ul className="mobile-link-list" aria-label="Your links">
      {links.map((link) => {
        const target = destination(link.url);
        return (
          <li key={link.id} className="mobile-link-row">
            <Link
              className="mobile-link-destination"
              to={`/links/${link.id}`}
              title={link.url}
              aria-label={`${target.host}${target.path}`}
            >
              <span className="mobile-link-host">{target.host}</span>
              {target.path && (
                <span className="mobile-link-path">{target.path}</span>
              )}
            </Link>
            <div className="mobile-link-meta">
              <a
                href={`/${encodeURIComponent(link.code)}`}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open short link ${link.code}`}
              >
                /{link.code}
              </a>
              <span aria-hidden="true">·</span>
              <span>{formatNumber(link.analytics.totalClicks)} clicks</span>
            </div>
            <LinkActions link={link} compact />
          </li>
        );
      })}
    </ul>
  );
}
