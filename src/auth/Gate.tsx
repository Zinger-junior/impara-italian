// =============================================================================
// src/auth/Gate.tsx
// Decides what to render based on auth state. Local-only mode (no Supabase keys)
// renders the app straight through. With cloud on: a splash while the session
// resolves, the Login screen when signed out, and — once signed in — the app,
// but only after the user's cloud snapshot has been loaded into the local DB.
// =============================================================================

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { cloudEnabled } from "../cloud/supabase.js";
import { hydrateForUser } from "../cloud/sync.js";
import { useAuth } from "./AuthContext.js";
import { OnboardingGate } from "./OnboardingGate.js";
import { Login } from "../pages/Login.js";
import { ResetPassword } from "../pages/ResetPassword.js";

function AuthSplash(props: { label: string }) {
  return (
    <div className="auth-screen">
      <div style={{ textAlign: "center" }}>
        <div className="spinner" role="status" aria-label="Loading" style={{ margin: "0 auto 12px" }} />
        <p className="muted">{props.label}</p>
      </div>
    </div>
  );
}

export function Gate(props: { children: ReactNode }) {
  const { status, user, recovery } = useAuth();
  const [ready, setReady] = useState(!cloudEnabled);

  useEffect(() => {
    if (!cloudEnabled) return;
    let cancelled = false;
    if (status === "signed-in" && user) {
      setReady(false);
      hydrateForUser(user.id)
        .catch((err) => console.warn("[gate] hydrate failed:", err))
        .then(() => {
          if (!cancelled) setReady(true);
        });
    } else {
      setReady(false);
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, user?.id]);

  if (!cloudEnabled) return <OnboardingGate>{props.children}</OnboardingGate>;
  if (status === "loading") return <AuthSplash label="Loading…" />;
  if (recovery) return <ResetPassword />;
  if (status === "signed-out") return <Login />;
  if (!ready) return <AuthSplash label="Loading your progress…" />;
  return <OnboardingGate>{props.children}</OnboardingGate>;
}
