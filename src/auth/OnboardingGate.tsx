// =============================================================================
// src/auth/OnboardingGate.tsx
// Sits between the auth Gate and the app: once the local DB is ready, it checks
// whether the user has completed the onboarding survey. If not, it shows the
// survey; otherwise it renders the app. Works in both cloud and local modes.
// =============================================================================

import type { ReactNode } from "react";
import { Spinner } from "../ui/components.js";
import { useAsync } from "../hooks/useAsync.js";
import { getUser } from "../db/repositories.js";
import type { UserRecord } from "../db/store.js";
import { Onboarding } from "../pages/Onboarding.js";

export function OnboardingGate(props: { children: ReactNode }) {
  const { loading, error, value, reload } = useAsync<UserRecord>(() => getUser(), []);

  if (loading) return <div className="auth-screen"><Spinner /></div>;
  // If we can't read the user, don't block the app — just render it.
  if (error || !value) return <>{props.children}</>;
  if (!value.onboardedAt) return <Onboarding onDone={reload} />;
  return <>{props.children}</>;
}
