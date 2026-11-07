export type ClickEvent = { at: string; referrer: string };
export type LinkRecord = {
  id: string;
  title: string;
  url: string;
  code: string;
  createdAt: string;
  events: ClickEvent[];
};
const KEY = "linklab.links.v1";
const day = 86400000;
const titles = [
  ".NET 8.0 release notes",
  "The design engineering handbook",
  "Introducing our new workspace",
  "React documentation",
  "Building for the web",
  "Our open-source toolkit",
  "November product update",
  "Brand assets & guidelines",
];
const urls = [
  "https://github.com/dotnet/aspnetcore/releases/tag/v8.0.0",
  "https://vercel.com/design",
  "https://www.notion.so/product",
  "https://react.dev/learn",
  "https://web.dev/learn",
  "https://github.com/shadcn-ui/ui",
  "https://example.com/updates/november",
  "https://example.com/brand",
];
const codes = [
  "a7Bx92Q",
  "k9Tm4Wp",
  "n3Rc8Ld",
  "r8Jv2Hs",
  "w5Fg6Za",
  "s2Qd9Bk",
  "p6Nx3Cv",
  "b4Lt7Mf",
];
const counts = [1349, 824, 579, 363, 288, 146, 92, 48];
function sampleVisitTime(now: number, index: number, linkIndex: number) {
  const bucket = (index * 37 + linkIndex * 11) % 100;
  const dayIndex = [10, 25, 37, 55, 66, 88, 100].findIndex(
    (edge) => bucket < edge,
  );
  const midnight = new Date(now).setUTCHours(0, 0, 0, 0);
  const available = dayIndex === 6 ? now - midnight : day;
  return (
    midnight - (6 - dayIndex) * day + ((index * 7919) % Math.max(1, available))
  );
}
function seed(): LinkRecord[] {
  const now = Date.now();
  return titles.map((title, i) => ({
    id: `demo-${i}`,
    title,
    url: urls[i],
    code: codes[i],
    createdAt: new Date(now - (i * 3 + 8) * day).toISOString(),
    events: Array.from({ length: counts[i] }, (_, n) => ({
      at: new Date(sampleVisitTime(now, n, i)).toISOString(),
      referrer: [
        "github.com",
        "Direct / Unknown",
        "github.com",
        "x.com",
        "linkedin.com",
        "Direct / Unknown",
        "dev.to",
      ][n % 7],
    })),
  }));
}
function read(): LinkRecord[] {
  const stored = localStorage.getItem(KEY);
  if (!stored) {
    const initial = seed();
    localStorage.setItem(KEY, JSON.stringify(initial));
    return initial;
  }
  const parsed: unknown = JSON.parse(stored);
  if (
    !Array.isArray(parsed) ||
    parsed.some(
      (l) =>
        typeof l.id !== "string" ||
        typeof l.code !== "string" ||
        typeof l.url !== "string" ||
        !Array.isArray(l.events),
    )
  )
    throw new Error(
      "Your local workspace could not be read. Restore your browser storage and try again.",
    );
  return parsed;
}
function save(links: LinkRecord[]) {
  localStorage.setItem(KEY, JSON.stringify(links));
}
export const linksRepository = {
  async list() {
    return read().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async create(url: string): Promise<LinkRecord> {
    const links = read();
    let code: string;
    do {
      code = Array.from(
        crypto.getRandomValues(new Uint8Array(7)),
        (n) =>
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"[
            n % 62
          ],
      ).join("");
    } while (links.some((l) => l.code === code));
    const record = {
      id: crypto.randomUUID(),
      title: new URL(url).hostname.replace(/^www\./, ""),
      url,
      code,
      createdAt: new Date().toISOString(),
      events: [],
    };
    save([record, ...links]);
    return record;
  },
  async remove(id: string) {
    save(read().filter((l) => l.id !== id));
  },
  async visit(code: string) {
    const links = read();
    const link = links.find((l) => l.code === code);
    if (link) {
      link.events.unshift({
        at: new Date().toISOString(),
        referrer: "Direct / Unknown",
      });
      save(links);
    }
    return link;
  },
};
export const shortUrl = (link: LinkRecord) =>
  `${window.location.origin}/${link.code}`;
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
    .flatMap((l) => l.events)
    .sort((a, b) => b.at.localeCompare(a.at));
  const today = new Date().toISOString().slice(0, 10);
  const daily = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(Date.now() - (6 - i) * day);
    const key = date.toISOString().slice(0, 10);
    return {
      date,
      count: events.filter((e) => e.at.slice(0, 10) === key).length,
    };
  });
  const sources = Object.entries(
    events.reduce<Record<string, number>>((a, e) => {
      a[e.referrer] = (a[e.referrer] || 0) + 1;
      return a;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);
  return {
    events,
    daily,
    sources,
    total: events.length,
    today: events.filter((e) => e.at.slice(0, 10) === today).length,
    week: daily.reduce((a, d) => a + d.count, 0),
    last: events[0]?.at,
  };
}
export function downloadCsv(links: LinkRecord[]) {
  const cell = (v: string | number) =>
    `"${String(v)
      .replace(/^[=+@-]/, "'$&")
      .replaceAll('"', '""')}"`;
  const rows = [
    ["Title", "Destination", "Short URL", "Created at", "Clicks"],
    ...links.map((l) => [
      l.title,
      l.url,
      shortUrl(l),
      l.createdAt,
      l.events.length,
    ]),
  ];
  const href = URL.createObjectURL(
    new Blob([rows.map((r) => r.map(cell).join(",")).join("\r\n")], {
      type: "text/csv;charset=utf-8;",
    }),
  );
  const a = document.createElement("a");
  a.href = href;
  a.download = "linklab-links.csv";
  a.click();
  URL.revokeObjectURL(href);
}
