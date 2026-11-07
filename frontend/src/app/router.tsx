import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { Dashboard } from "@/pages/dashboard";
import { NotFound } from "@/pages/not-found";
import { RedirectLink } from "@/pages/redirect";
import { Guide } from "@/pages/guide";
import { RouteLayout, RouteError } from "./route-layout";
export const router = createBrowserRouter([
  {
    element: <RouteLayout />,
    hydrateFallbackElement: (
      <div className="empty-state" role="status">
        Loading workspace…
      </div>
    ),
    errorElement: <RouteError />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          {
            path: "analytics",
            lazy: async () => ({
              Component: (await import("@/pages/analytics")).Analytics,
            }),
          },
          {
            path: "links/:id",
            lazy: async () => ({
              Component: (await import("@/pages/analytics")).Analytics,
            }),
          },
          { path: "guide", element: <Guide /> },
          { path: "404", element: <NotFound /> },
          { path: ":code", element: <RedirectLink /> },
          { path: "*", element: <NotFound /> },
        ],
      },
    ],
  },
]);
