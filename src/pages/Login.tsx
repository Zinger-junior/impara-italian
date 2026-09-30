// =============================================================================
// src/pages/Login.tsx
// Sign-in / sign-up / forgot-password screen shown when cloud accounts are on and
// nobody is logged in. Email + password via Supabase Auth.
// =============================================================================

import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../auth/AuthContext.js";

type Mode = "in" | "up" | "forgot";

export function Login() {
  const { signIn, signUp, sendPasswordReset, error, clearError } = useAuth();
  const [mode, setMode] = useState<Mode>("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setNotice(null);
    if (mode === "forgot") {
      const ok = await sendPasswordReset(email.trim());
      if (ok) setNotice("If that email has an account, a reset link is on its way. Open it to set a new password.");
    } else if (mode === "up") {
      const ok = await signUp(email.trim(), password);
      if (ok) {
        setNotice("Account created. If your project requires email confirmation, click the link we emailed you, then sign in.");
        setMode("in");
      }
    } else {
      await signIn(email.trim(), password);
    }
    setBusy(false);
  };

  const swap = (m: Mode) => {
    setMode(m);
    clearError();
    setNotice(null);
  };

  const needsPassword = mode !== "forgot";
  const canSubmit = email.trim() !== "" && (!needsPassword || password.length >= 6);

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="brand" style={{ justifyContent: "center", marginBottom: 8 }}>
          <div className="brand__mark">I</div>
          <div>
            <div className="brand__name">Impara</div>
            <div className="brand__sub">Italiano · A0→B2</div>
          </div>
        </div>

        {mode !== "forgot" && (
          <div className="segmented" role="tablist" aria-label="Sign in or create account" style={{ alignSelf: "center" }}>
            <button role="tab" aria-selected={mode === "in"} className={`segmented__opt${mode === "in" ? " segmented__opt--active" : ""}`} onClick={() => swap("in")}>Sign in</button>
            <button role="tab" aria-selected={mode === "up"} className={`segmented__opt${mode === "up" ? " segmented__opt--active" : ""}`} onClick={() => swap("up")}>Create account</button>
          </div>
        )}

        {mode === "forgot" && <h1 style={{ fontSize: "1.2rem", textAlign: "center" }}>Reset your password</h1>}

        <form onSubmit={submit} className="auth-form">
          <label className="settings-field" style={{ maxWidth: "none" }}>
            <span>Email</span>
            <input className="qinput" style={{ padding: 10 }} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>

          {needsPassword && (
            <label className="settings-field" style={{ maxWidth: "none" }}>
              <span>Password</span>
              <input className="qinput" style={{ padding: 10 }} type="password" autoComplete={mode === "in" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
              <span className="muted" style={{ fontSize: "0.78rem" }}>At least 6 characters.</span>
            </label>
          )}

          {error && <div className="feedback feedback--bad">{error}</div>}
          {notice && <div className="notice">{notice}</div>}

          <button className="btn btn--primary" type="submit" disabled={busy || !canSubmit}>
            {busy ? "Please wait…" : mode === "in" ? "Sign in" : mode === "up" ? "Create account" : "Send reset link"}
          </button>
        </form>

        <div style={{ textAlign: "center" }}>
          {mode === "in" && (
            <button className="btn btn--ghost btn--sm" onClick={() => swap("forgot")}>Forgot password?</button>
          )}
          {mode === "forgot" && (
            <button className="btn btn--ghost btn--sm" onClick={() => swap("in")}>← Back to sign in</button>
          )}
        </div>

        <p className="muted" style={{ fontSize: "0.8rem", textAlign: "center", marginTop: 4 }}>
          Your progress is private to your account and syncs across your devices.
        </p>
      </div>
    </div>
  );
}
