// =============================================================================
// src/ui/AppShell.tsx
// Responsive application shell: a sticky sidebar on desktop that becomes a
// slide-in drawer (with a topbar + hamburger) below 900px. Includes the
// light/dark theme toggle, which sets [data-theme] on <html> and persists it.
// =============================================================================

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.js";
import { cloudEnabled } from "../cloud/supabase.js";

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

const NAV_SECTIONS: { label: string; items: { to: string; label: string; icon: string; end?: boolean }[] }[] = [
  {
    label: "Learn",
    items: [
      { to: "/", label: "Dashboard", icon: "◈", end: true },
      { to: "/curriculum", label: "Curriculum", icon: "▤" },
      { to: "/grammar", label: "Grammar", icon: "¶" },
      { to: "/listening", label: "Listening", icon: "♪" },
    ],
  },
  {
    label: "Practise",
    items: [
      { to: "/drill", label: "Conjugation drill", icon: "↻" },
      { to: "/quiz", label: "Quiz", icon: "✎" },
      { to: "/vocabulary", label: "Vocabulary", icon: "▦" },
      { to: "/review", label: "Review mistakes", icon: "↺" },
      { to: "/writing", label: "Writing", icon: "✍" },
      { to: "/exam", label: "Mock exam", icon: "◆" },
    ],
  },
  {
    label: "Reference",
    items: [
      { to: "/phrasebook", label: "Phrasebook", icon: "❝" },
      { to: "/verbs", label: "Verb tables", icon: "▧" },
      { to: "/resources", label: "Toolkit", icon: "◎" },
      { to: "/guide", label: "Guide", icon: "☰" },
    ],
  },
  {
    label: "Plan",
    items: [
      { to: "/timeline", label: "Timeline", icon: "◔" },
      { to: "/diagnostics", label: "Diagnostics", icon: "◇" },
      { to: "/settings", label: "Settings", icon: "⚙" },
    ],
  },
];

export function AppShell(props: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  const [theme, setTheme] = useTheme();
  const location = useLocation();
  const { user, signOut } = useAuth();

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
          {NAV_SECTIONS.map((section) => (
            <div className="nav__section" key={section.label}>
              <div className="nav__section-label">{section.label}</div>
              {section.items.map((item) => (
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
            </div>
          ))}
        </nav>

        <div className="spacer" />

        {cloudEnabled && user && (
          <div className="nav__account">
            <span className="nav__account-email" title={user.email}>{user.email}</span>
            <button className="btn btn--ghost btn--sm" onClick={() => signOut()}>Sign out</button>
          </div>
        )}

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
