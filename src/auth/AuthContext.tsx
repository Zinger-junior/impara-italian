// =============================================================================
// src/auth/AuthContext.tsx
// Wraps Supabase Auth in a small React context: current session, and sign-up /
// sign-in / sign-out actions with error state. When Supabase isn't configured it
// reports "signed-out" and the Gate falls back to local-only mode.
// =============================================================================

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "../cloud/supabase.js";
import { clearLocal, setSyncUser } from "../cloud/sync.js";

export type AuthStatus = "loading" | "signed-in" | "signed-out";

export interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  error: string | null;
  /** True while the user arrived via a password-reset link and must set a new one. */
  recovery: boolean;
  signUp: (email: string, password: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  updatePassword: (password: string) => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider(props: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(supabase ? "loading" : "signed-out");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recovery, setRecovery] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const u = data.session?.user;
      setUser(u ? { id: u.id, email: u.email ?? "" } : null);
      setStatus(u ? "signed-in" : "signed-out");
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user;
      setUser(u ? { id: u.id, email: u.email ?? "" } : null);
      setStatus(u ? "signed-in" : "signed-out");
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!supabase) return false;
    setError(null);
    const { error: e } = await supabase.auth.signUp({ email, password });
    if (e) {
      setError(e.message);
      return false;
    }
    return true;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return false;
    setError(null);
    const { error: e } = await supabase.auth.signInWithPassword({ email, password });
    if (e) {
      setError(e.message);
      return false;
    }
    return true;
  }, []);

  const signOut = useCallback(async () => {
    setSyncUser(null);
    await clearLocal();
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setStatus("signed-out");
    setRecovery(false);
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    if (!supabase) return false;
    setError(null);
    const { error: e } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (e) {
      setError(e.message);
      return false;
    }
    return true;
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    if (!supabase) return false;
    setError(null);
    const { error: e } = await supabase.auth.updateUser({ password });
    if (e) {
      setError(e.message);
      return false;
    }
    setRecovery(false);
    return true;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      error,
      recovery,
      signUp,
      signIn,
      signOut,
      sendPasswordReset,
      updatePassword,
      clearError: () => setError(null),
    }),
    [status, user, error, recovery, signUp, signIn, signOut, sendPasswordReset, updatePassword],
  );

  return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
