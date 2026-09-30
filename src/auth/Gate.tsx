// =============================================================================
// src/auth/Gate.tsx
// Decides what to render based on auth status:
//   • Local dev (`npm run dev`) → login is skipped entirely, because Netlify
//     Identity has no endpoint on localhost. You get straight into the app with
//     local-only data, which is what you want while building.
//   • Production build (the deployed site) → login is required. When signed out
//     we show the welcome screen; once signed in we pull the user's saved
//     progress out of their Identity profile before rendering the app.
// The OnboardingGate (survey) always runs just inside the authed app.
// =============================================================================

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Spinner } from "../ui/components.js";
import { useAuth } from "./AuthContext.js";
import { OnboardingGate } from "./OnboardingGate.js";
import { Login } from "../pages/Login.js";
import { hydrateForUser } from "../cloud/sync.js";

// Vite sets DEV=true only under `npm run dev`; production builds are false.
const REQUIRE_LOGIN = !import.meta.env.DEV;

export function Gate(props: { children: ReactNode }) {
  const { status } = useAuth();

  // Local dev: no login, straight into onboarding + app.
  if (!REQUIRE_LOGIN) {
    return <OnboardingGate>{props.children}</OnboardingGate>;
  }

  if (status === "loading") {
    return <div className="auth-screen"><Spinner /></div>;
  }
  if (status === "signed-out") {
    return <Login />;
  }
  return <SignedIn>{props.children}</SignedIn>;
}

/** Pull the signed-in user's saved progress into IndexedDB, then render the app. */
function SignedIn(props: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await hydrateForUser();
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return <div className="auth-screen"><Spinner /></div>;
  }
  return <OnboardingGate>{props.children}</OnboardingGate>;
}
