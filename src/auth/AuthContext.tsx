// =============================================================================
// src/auth/AuthContext.tsx
// React context around the Netlify Identity widget. Tracks auth status and the
// current user, and exposes sign-in / sign-out helpers. The widget itself
// renders the login / signup / password-recovery modal, so there are no forms
// here — we just react to its events.
// =============================================================================

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  initIdentity,
  onIdentity,
  openIdentity,
  closeIdentity,
  logoutIdentity,
  currentUser,
} from "./netlifyIdentity.js";
import type { IdentityUser } from "./netlifyIdentity.js";
import { clearLocal, flushSync, setSyncActive } from "../cloud/sync.js";

export type AuthStatus = "loading" | "signed-in" | "signed-out";

interface AuthValue {
  status: AuthStatus;
  user: IdentityUser | null;
  signIn: (tab?: "login" | "signup") => void;
  signOut: () => Promise<void>;
}

const AuthCtx = createContext<AuthValue | null>(null);

export function AuthProvider(props: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<IdentityUser | null>(null);

  useEffect(() => {
    let resolved = false;
    const settle = (u: IdentityUser | null) => {
      resolved = true;
      setUser(u);
      setStatus(u ? "signed-in" : "signed-out");
    };

    // Subscribe BEFORE init() so we never miss the one-shot "init" event that
    // the widget fires with the restored session (or null).
    const offInit = onIdentity("init", (u) => settle(u));
    const offLogin = onIdentity("login", (u) => {
      setUser(u);
      setStatus("signed-in");
      closeIdentity();
    });
    const offLogout = onIdentity("logout", () => {
      setUser(null);
      setStatus("signed-out");
    });
    const offError = onIdentity("error", () => {
      // Misconfigured / offline Identity: don't hang on the spinner. Fall back
      // to the login screen; the widget shows its own error when opened.
      if (!resolved) settle(currentUser());
    });

    initIdentity();

    // Safety net: if the widget never emits "init" (e.g. Identity isn't enabled
    // on the site yet), stop showing the spinner after a short wait.
    const timer = window.setTimeout(() => {
      if (!resolved) settle(currentUser());
    }, 2000);

    return () => {
      window.clearTimeout(timer);
      offInit();
      offLogin();
      offLogout();
      offError();
    };
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      status,
      user,
      signIn: (tab = "login") => openIdentity(tab),
      signOut: async () => {
        // Push any unsaved progress, then wipe this device's copy so the next
        // person to use the browser doesn't inherit it.
        await flushSync();
        setSyncActive(false);
        await clearLocal();
        await logoutIdentity();
      },
    }),
    [status, user],
  );

  return <AuthCtx.Provider value={value}>{props.children}</AuthCtx.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
