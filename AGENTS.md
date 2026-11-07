# Repository notes

- This repo has two independent app roots and no root-level task runner: `frontend/` is React + TypeScript + Vite; `backend/` is ASP.NET Core targeting .NET 8. The root `README.md` describes the intended product, not the current implementation—the frontend is still a `Home` placeholder and the backend is the WeatherForecast template. Check source/config before assuming planned features or APIs exist.
- Frontend entrypoint is `frontend/src/main.tsx` → `App.tsx`. The `@/` import alias maps to `frontend/src/`; shadcn component configuration is in `frontend/components.json`.
- Backend startup and middleware are in `backend/Program.cs`; controllers are in `backend/Controllers/`. Swagger is enabled only in Development. The launch profiles use `http://localhost:5164` and `https://localhost:7127`.

## Frontend packages and structure

- Use shadcn/ui and Tailwind CSS as the primary UI tools: build on reusable shadcn components, style with Tailwind, and follow the aliases in `frontend/components.json`.
- Use Bklit UI chart components from the configured `@bklit` registry first. Use Recharts only when Bklit does not provide the specific chart needed.
- Use TanStack Query (`@tanstack/react-query`) for API/server state, React Router for navigation, and Lucide React (`lucide-react`) for icons. Use a QR-code library for QR generation; the root README does not specify which one.
- Keep UI modular and reusable: share general-purpose components under `frontend/src/components`, group feature-specific code by feature, and avoid duplicating components, styles, or data-fetching logic. Keep pages focused on composition rather than accumulating unrelated UI and behavior.
- These are the intended frontend packages, not a guarantee they are installed. Check `frontend/package.json`; when a feature needs a missing package, add it in `frontend/` and keep `package-lock.json` in sync.

## Commands

- Frontend (run from `frontend/`): `npm ci`, `npm run dev`, `npm run lint`, `npm run build`. Build runs `tsc -b` before `vite build`.
- Backend (from repo root): `dotnet run --project backend/backend.csproj` and `dotnet build backend/backend.csproj`.
- There is currently no frontend test script or backend test project; no root command coordinates the two apps.
- At this checkout, frontend verification has existing failures: lint reports `react-refresh/only-export-components` in `src/components/ui/button.tsx`; build stops on TypeScript TS5101 (`baseUrl` deprecation) in `tsconfig.app.json`. Recheck these before attributing them to a change.
