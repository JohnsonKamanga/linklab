import { apiRequest } from "@/lib/api";

export type ClickEvent = { at: string; referrer: string };
export type DailyClick = { date: string; count: number };
export type TopReferrer = { domain: string; count: number };
export type LinkAnalytics = {
  totalClicks: number;
  clicksToday: number;
  clicksLast7Days: number;
  lastAccessedAt: string | null;
  dailyClicks: DailyClick[];
  topReferrers: TopReferrer[];
  recentClicks: ClickEvent[];
};
export type LinkRecord = {
  id: string;
  title: string;
  url: string;
  code: string;
  createdAt: string;
  analytics: LinkAnalytics;
};

type ApiLink = {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  createdAt: string;
};

type ApiAnalytics = Omit<LinkAnalytics, "recentClicks"> & {
  recentClicks?: { at: string; referrer: string | null }[];
};

function emptyAnalytics(): LinkAnalytics {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return {
    totalClicks: 0,
    clicksToday: 0,
    clicksLast7Days: 0,
    lastAccessedAt: null,
    dailyClicks: Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setUTCDate(today.getUTCDate() - 6 + index);
      return { date: date.toISOString().slice(0, 10), count: 0 };
    }),
    topReferrers: [],
    recentClicks: [],
  };
}

function mapLink(link: ApiLink, analytics = emptyAnalytics()): LinkRecord {
  let title = link.originalUrl;
  try {
    title = new URL(link.originalUrl).hostname.replace(/^www\./, "");
  } catch {
    // Keep the destination as the title if it is not a parseable URL.
  }

  return {
    id: link.id,
    title,
    url: link.originalUrl,
    code: link.shortCode,
    createdAt: link.createdAt,
    analytics,
  };
}

async function loadAnalytics(id: string): Promise<LinkAnalytics> {
  const response = await apiRequest<ApiAnalytics>(
    `/links/${encodeURIComponent(id)}/analytics`,
  );
  return {
    ...response,
    recentClicks: (response.recentClicks ?? []).map((click) => ({
      at: click.at,
      referrer: click.referrer || "Direct / Unknown",
    })),
  };
}

export const linksRepository = {
  async list(): Promise<LinkRecord[]> {
    const links = await apiRequest<ApiLink[]>("/links");
    const withAnalytics = await Promise.all(
      links.map(async (link) => mapLink(link, await loadAnalytics(link.id))),
    );
    return withAnalytics.sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  },
  async create(url: string): Promise<LinkRecord> {
    const link = await apiRequest<ApiLink>("/links", {
      method: "POST",
      body: JSON.stringify({ originalUrl: url }),
    });
    return mapLink(link);
  },
  async remove(id: string): Promise<void> {
    await apiRequest<boolean>(`/links/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },
};

export const shortUrl = (link: LinkRecord) =>
  `${window.location.origin}/${encodeURIComponent(link.code)}`;
export const displayUrl = (link: LinkRecord) =>
  `${window.location.host}/${link.code}`;
export const formatNumber = (n: number) =>
  new Intl.NumberFormat("en").format(n);
export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

export function metrics(links: LinkRecord[]) {
  const events = links
    .flatMap((link) => link.analytics.recentClicks)
    .sort((a, b) => b.at.localeCompare(a.at));
  const dailyCounts = new Map<string, number>();
  const sourceCounts = new Map<string, number>();

  for (const link of links) {
    for (const click of link.analytics.dailyClicks) {
      dailyCounts.set(
        click.date,
        (dailyCounts.get(click.date) ?? 0) + click.count,
      );
    }
    for (const referrer of link.analytics.topReferrers) {
      sourceCounts.set(
        referrer.domain,
        (sourceCounts.get(referrer.domain) ?? 0) + referrer.count,
      );
    }
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const daily = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - 6 + index);
    const key = date.toISOString().slice(0, 10);
    return { date, count: dailyCounts.get(key) ?? 0 };
  });
  const sources = [...sourceCounts.entries()].sort((a, b) => b[1] - a[1]);
  const last = links
    .map((link) => link.analytics.lastAccessedAt)
    .filter((date): date is string => date !== null)
    .sort((a, b) => b.localeCompare(a))[0];

  return {
    events,
    daily,
    sources,
    total: links.reduce((sum, link) => sum + link.analytics.totalClicks, 0),
    today: links.reduce((sum, link) => sum + link.analytics.clicksToday, 0),
    week: links.reduce(
      (sum, link) => sum + link.analytics.clicksLast7Days,
      0,
    ),
    last,
  };
}

export function downloadCsv(links: LinkRecord[]) {
  const cell = (v: string | number) =>
    `"${String(v)
      .replace(/^[=+@-]/, "'$&")
      .replaceAll('"', '""')}"`;
  const rows = [
    ["Title", "Destination", "Short URL", "Created at", "Clicks"],
    ...links.map((link) => [
      link.title,
      link.url,
      shortUrl(link),
      link.createdAt,
      link.analytics.totalClicks,
    ]),
  ];
  const href = URL.createObjectURL(
    new Blob([rows.map((row) => row.map(cell).join(",")).join("\r\n")], {
      type: "text/csv;charset=utf-8;",
    }),
  );
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = "linklab-links.csv";
  anchor.click();
  URL.revokeObjectURL(href);
}
