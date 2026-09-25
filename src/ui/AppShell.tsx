// =============================================================================
// src/ui/AppShell.tsx
// Responsive application shell: a sticky sidebar on desktop that becomes a
// slide-in drawer (with a topbar + hamburger) below 900px. Includes the
// light/dark theme toggle, which sets [data-theme] on <html> and persists it.
// =============================================================================

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";

type Theme = "light" | "dark" | "system";
const THEME_KEY = "impara.theme";

function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
}

function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem(THEME_KEY) as Theme | null) ?? "system";
  });
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);
  return [theme, setTheme];
}

const NAV = [
  { to: "/", label: "Dashboard", icon: "◈", end: true },
  { to: "/curriculum", label: "Curriculum", icon: "▤", end: false },
  { to: "/quiz", label: "Practice", icon: "✎", end: false },
  { to: "/exam", label: "Mock exam", icon: "◆", end: false },
  { to: "/timeline", label: "Timeline", icon: "◔", end: false },
  { to: "/diagnostics", label: "Diagnostics", icon: "◇", end: false },
];

export function AppShell(props: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  const [theme, setTheme] = useTheme();
  const location = useLocation();

  // Close the mobile drawer whenever the route changes.
  useEffect(() => setNavOpen(false), [location.pathname]);

  const cycleTheme = () => {
    setTheme(theme === "light" ? "dark" : theme === "dark" ? "system" : "light");
  };
  const themeLabel = theme === "light" ? "☀ Light" : theme === "dark" ? "☾ Dark" : "◐ System";

  return (
    <div className="app" data-nav={navOpen ? "open" : "closed"}>
      <div className="scrim" onClick={() => setNavOpen(false)} />

      <aside className="sidebar">
        <div className="brand">
          <div className="brand__mark">I</div>
          <div>
            <div className="brand__name">Impara</div>
            <div className="brand__sub">Italiano · A0→B2</div>
          </div>
        </div>

        <nav className="nav" aria-label="Primary">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav__link${isActive ? " nav__link--active" : ""}`}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="spacer" />

        <button className="btn btn--ghost" onClick={cycleTheme} aria-label="Change color theme">
          {themeLabel}
        </button>
      </aside>

      <div>
        <header className="topbar">
          <button
            className="hamburger"
            aria-label="Toggle navigation"
            aria-expanded={navOpen}
            onClick={() => setNavOpen((o) => !o)}
          >
            ≡
          </button>
          <div className="brand">
            <div className="brand__mark">I</div>
            <div className="brand__name">Impara</div>
          </div>
          <button className="btn btn--ghost btn--sm" onClick={cycleTheme} aria-label="Change color theme">
            {themeLabel}
          </button>
        </header>

        <main className="content">{props.children}</main>
      </div>
    </div>
  );
}
