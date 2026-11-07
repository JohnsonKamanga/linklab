import { NavLink, Outlet, Link } from "react-router-dom";
import {
  ArrowUpRight,
  FlaskConical,
  Link2,
  ChartNoAxesCombined,
  Sun,
  Moon,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
export function AppLayout() {
  const [dark, setDark] = useState(
    () => localStorage.getItem("linklab.theme") === "dark",
  );
  function toggleTheme() {
    const next = !dark;
    setDark(next);
    localStorage.setItem("linklab.theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  }
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <Link to="/" className="brand" aria-label="LinkLab home">
            <img src="/linlklab-logo-text.png" alt="LinkLab" />
          </Link>
          <span className="header-divider">/</span>
          <div className="workspace">
            <span className="workspace-avatar">P</span>
            <span>Personal workspace</span>
          </div>
          <div className="header-right">
            <span className="demo-badge">
              <FlaskConical size={13} />
              Local demo
            </span>
            <Link to="/guide" className="header-guide">
              Quick guide
              <ArrowUpRight size={14} />
            </Link>
            <button
              className="icon-button"
              aria-label={
                dark ? "Switch to light theme" : "Switch to dark theme"
              }
              onClick={toggleTheme}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
        <div className="nav-inner">
          <nav aria-label="Main navigation">
            <NavLink to="/" end>
              <Link2 size={16} />
              Links
            </NavLink>
            <NavLink to="/analytics">
              <ChartNoAxesCombined size={16} />
              Analytics
            </NavLink>
          </nav>
          <span className="nav-note">Small links. Bigger possibilities.</span>
        </div>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="app-footer">
        <span>
          LinkLab <span className="footer-slash">/</span> Shorten smarter.
        </span>
        <span className="footer-demo">
          <span className="status-dot" /> Demo data · Saved in this browser
        </span>
        <Link to="/guide">
          <BookOpen size={14} /> Getting started <ChevronRight size={13} />
        </Link>
      </footer>
    </div>
  );
}
