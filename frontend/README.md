# LinkLab frontend

React 19, TypeScript, Vite, Tailwind CSS, shadcn/Base UI, React Router, TanStack Query, Lucide, Bklit charts, and QRCode.

## Run locally

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. The existing ASP.NET template does not need to run.

```sh
npm run build
npm run lint
```

## Pages

Routes are declared in `src/app/router.tsx` using `createBrowserRouter` and rendered with `RouterProvider`.

| URL | Page |
| --- | --- |
| `/` | Create and manage links, search, sort, pagination, CSV export |
| `/analytics` | Workspace click history, sources, popular links, recent activity |
| `/links/:id` | Individual link analytics, copy, QR, deletion |
| `/guide` | Usage and demo limitations |
| `/:code` | Browser-local redirect and click recording |
| `/404` and unmatched routes | Branded not-found page |

A production static host must rewrite frontend route requests to `index.html`. Once a backend handles `/:shortCode`, configure that route ahead of the frontend fallback. Browser redirects in this demo are not HTTP 302 responses, and the frontend 404 is not an HTTP 404 response.

## Demo data and future API integration

`src/features/links/repository.ts` is the asynchronous data-access boundary; `queries.ts` provides Query hooks and mutation invalidation. Replace the repository methods with API calls when endpoints are ready. No requests currently target the backend template.

The first visit seeds eight example links and illustrative click events. Creation, deletion, and visits persist in local storage under `linklab.links.v1`. New links use seven-character codes from Web Crypto and check local uniqueness. Short URLs are built from the current origin, including the development port. The same destination can be shortened more than once.

Links and QR codes work only on the app origin and browser where their records exist. There is no shared storage or cross-device redirect service yet. Real referrer collection also belongs to the backend; demo visits use Direct / Unknown. Analytics aggregate seven UTC calendar dates, including zero-visit days. Clearing site storage resets the demo. Theme choice persists separately under `linklab.theme`.

Charts are installed from the configured Bklit registry into `src/components/charts`. ESLint has narrowly scoped exceptions for upstream chart component patterns; authored application code retains the normal lint rules.

## Browser verification

The Playwright suite covers validation, duplicate destination creation, persistence, clipboard, QR PNG downloads, delete confirmation, redirects and click recording, navigation, analytics filters, CSV downloads, unknown links, mobile layout, pagination, and theme persistence.

Start the dev server in another terminal, install Playwright Chromium, then run:

```sh
npx playwright install chromium
npm run test:e2e
```

For a different port or an existing Chromium installation:

```sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:5174 PLAYWRIGHT_CHROMIUM_PATH=/path/to/chrome npm run test:e2e
```
