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
  Menu,
} from "lucide-react";
import { useTheme } from "@/lib/theme";
import { Brand } from "@/components/brand";
import { ActionMenu } from "@/components/ui/action-menu";
export function AppLayout() {
  const { dark, toggleTheme } = useTheme();
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <Link to="/" className="brand" aria-label="LinkLab home">
            <Brand />
          </Link>
          <span className="header-divider desktop-only">/</span>
          <div className="workspace desktop-only">
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
              className="icon-button desktop-only"
              aria-label={
                dark ? "Switch to light theme" : "Switch to dark theme"
              }
              onClick={toggleTheme}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="mobile-only workspace-menu">
              <ActionMenu
                label="Workspace menu"
                title="Personal workspace"
                items={[
                  {
                    label: dark
                      ? "Switch to light theme"
                      : "Switch to dark theme",
                    icon: dark ? <Sun /> : <Moon />,
                    onSelect: toggleTheme,
                  },
                  { label: "Quick guide", icon: <BookOpen />, to: "/guide" },
                ]}
              >
                <Menu size={20} />
              </ActionMenu>
            </div>
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
        <span className="desktop-only">
          LinkLab <span className="footer-slash">/</span> Shorten smarter.
        </span>
        <span className="footer-demo desktop-only">
          <span className="status-dot" /> Demo data · Saved in this browser
        </span>
        <Link to="/guide">
          <BookOpen size={14} /> Getting started <ChevronRight size={13} />
        </Link>
      </footer>
    </div>
  );
}
