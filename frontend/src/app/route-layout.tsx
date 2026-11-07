import { useEffect } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
export function RouteLayout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${pathname === "/" ? "Links" : pathname === "/analytics" ? "Analytics" : pathname.startsWith("/links/") ? "Link analytics" : pathname === "/guide" ? "Quick guide" : "Link"} · LinkLab`;
  }, [pathname]);
  return <Outlet />;
}
export function RouteError() {
  return (
    <div className="empty-state" role="alert">
      <h1>Something interrupted your workspace.</h1>
      <p>
        Reload the page to try again. Your saved links remain in this browser.
      </p>
      <Link className="primary-link" to="/" reloadDocument>
        Reload workspace
      </Link>
    </div>
  );
}
