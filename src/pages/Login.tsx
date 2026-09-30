// =============================================================================
// src/pages/Login.tsx
// The signed-out welcome screen. It doesn't contain a form — the two buttons
// open the Netlify Identity widget's hosted modal on the signup or login tab.
// =============================================================================

import { useAuth } from "../auth/AuthContext.js";

export function Login() {
  const { signIn } = useAuth();

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="brand" style={{ justifyContent: "center" }}>
          <div className="brand__mark">I</div>
          <div>
            <div className="brand__name">Impara</div>
            <div className="brand__sub">Italiano · A0→B2</div>
          </div>
        </div>

        <p className="muted" style={{ textAlign: "center", margin: 0 }}>
          Create an account to save your progress and pick up where you left off on any device.
        </p>

        <div className="auth-form">
          <button className="btn btn--primary" onClick={() => signIn("signup")}>
            Create account
          </button>
          <button className="btn btn--ghost" onClick={() => signIn("login")}>
            I already have an account
          </button>
        </div>

        <p className="muted" style={{ textAlign: "center", fontSize: "0.8rem", margin: 0 }}>
          Forgot your password? Choose “Log in”, then “Forgot password?” in the box that appears.
        </p>
      </div>
    </div>
  );
}
