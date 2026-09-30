// =============================================================================
// src/pages/ResetPassword.tsx
// Shown when the user arrives via a password-reset email link (Supabase fires a
// PASSWORD_RECOVERY event). They set a new password; on success the recovery flag
// clears and the app appears.
// =============================================================================

import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../auth/AuthContext.js";

export function ResetPassword() {
  const { updatePassword, error } = useAuth();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return;
    setBusy(true);
    await updatePassword(password);
    setBusy(false);
    // On success the recovery flag flips off and the Gate renders the app.
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1 style={{ fontSize: "1.2rem", textAlign: "center" }}>Choose a new password</h1>
        <form onSubmit={submit} className="auth-form">
          <label className="settings-field" style={{ maxWidth: "none" }}>
            <span>New password</span>
            <input className="qinput" style={{ padding: 10 }} type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
            <span className="muted" style={{ fontSize: "0.78rem" }}>At least 6 characters.</span>
          </label>
          {error && <div className="feedback feedback--bad">{error}</div>}
          <button className="btn btn--primary" type="submit" disabled={busy || password.length < 6}>
            {busy ? "Saving…" : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
