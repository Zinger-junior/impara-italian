// =============================================================================
// src/pages/Onboarding.tsx
// A one-time mini-survey shown right after sign-up (or first run): name, current
// level, goal, target test date, and daily time. Saved onto the user record; the
// chosen level is what "start from any level" reads. Setting onboardedAt marks it
// done so it never shows again.
// =============================================================================

import { useState } from "react";
import { Button, ErrorState, Spinner } from "../ui/components.js";
import { useAsync } from "../hooks/useAsync.js";
import { getUser, saveUser } from "../db/repositories.js";
import type { UserRecord } from "../db/store.js";
import { toISODate, today } from "../util/date.js";
import type { CefrLevel } from "../types/index.js";

const LEVELS: { code: CefrLevel; name: string; blurb: string }[] = [
  { code: "A0", name: "A0 · Complete beginner", blurb: "Never studied Italian — start from the alphabet." },
  { code: "A1", name: "A1 · Beginner", blurb: "Know greetings and a few present-tense basics." },
  { code: "A2", name: "A2 · Elementary", blurb: "Can handle simple past and everyday needs." },
  { code: "B1", name: "B1 · Intermediate", blurb: "Hold a conversation; ready for subjunctive & conditional." },
  { code: "B2", name: "B2 · Upper-intermediate", blurb: "Fluent-ish; polishing complex structures." },
];

const GOALS = [
  "Pass an exam (CLI / CILS)",
  "Travel & daily life",
  "Work or study in Italy",
  "Family & heritage",
  "Just for fun",
];

const MINUTES = [10, 20, 30, 45];

export function Onboarding(props: { onDone: () => void }) {
  const { loading, error, value, reload } = useAsync<UserRecord>(() => getUser(), []);
  const [name, setName] = useState("");
  const [level, setLevel] = useState<CefrLevel>("A0");
  const [goal, setGoal] = useState<string>("");
  const [testDate, setTestDate] = useState("");
  const [minutes, setMinutes] = useState<number>(20);
  const [busy, setBusy] = useState(false);
  const [seeded, setSeeded] = useState(false);

  if (loading) return <div className="auth-screen"><Spinner /></div>;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (!value) return null;
  const user = value;

  // Prefill from the existing record once.
  if (!seeded) {
    if (user.displayName && user.displayName !== "Studente") setName(user.displayName);
    setLevel(user.entryCefr);
    if (user.targetExamDate) setTestDate(user.targetExamDate);
    setSeeded(true);
  }

  const finish = async () => {
    setBusy(true);
    const updated: UserRecord = {
      ...user,
      displayName: name.trim() || user.displayName,
      entryCefr: level,
      goal: goal || user.goal,
      minutesPerDay: minutes,
      onboardedAt: toISODate(today()),
      ...(testDate ? { targetExamDate: testDate } : {}),
    };
    await saveUser(updated);
    setBusy(false);
    props.onDone();
  };

  return (
    <div className="auth-screen">
      <div className="auth-card onboard-card">
        <div>
          <h1 style={{ fontSize: "1.4rem" }}>Benvenuto! Let's set you up</h1>
          <p className="muted" style={{ marginTop: 4 }}>Five quick questions so the plan fits you. You can change all of this later in Settings.</p>
        </div>

        <label className="settings-field" style={{ maxWidth: "none" }}>
          <span>What should we call you?</span>
          <input className="qinput" style={{ padding: 10 }} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        </label>

        <div className="onboard-section">
          <div className="ld-label">Where are you starting?</div>
          <div className="onboard-levels">
            {LEVELS.map((l) => (
              <button
                key={l.code}
                className={`level-pick${level === l.code ? " level-pick--active" : ""}`}
                onClick={() => setLevel(l.code)}
              >
                <span className="level-pick__name">{l.name}</span>
                <span className="level-pick__blurb">{l.blurb}</span>
              </button>
            ))}
          </div>
          {level !== "A0" && (
            <p className="muted" style={{ fontSize: "0.82rem", marginTop: 6 }}>
              Levels below {level} will be marked “placed out” — open for review, but you'll start at {level}.
            </p>
          )}
        </div>

        <div className="onboard-section">
          <div className="ld-label">What's your goal?</div>
          <div className="chip-row">
            {GOALS.map((g) => (
              <button key={g} className={`chip-link${goal === g ? " chip-link--active" : ""}`} onClick={() => setGoal(g)}>{g}</button>
            ))}
          </div>
        </div>

        <div className="onboard-section">
          <div className="ld-label">How much time per day?</div>
          <div className="chip-row">
            {MINUTES.map((m) => (
              <button key={m} className={`chip-link${minutes === m ? " chip-link--active" : ""}`} onClick={() => setMinutes(m)}>
                {m} min{m === 45 ? "+" : ""}
              </button>
            ))}
          </div>
        </div>

        <label className="settings-field" style={{ maxWidth: "none" }}>
          <span>Target test date (optional)</span>
          <input type="date" className="qinput" style={{ padding: 10 }} value={testDate} onChange={(e) => setTestDate(e.target.value)} />
        </label>

        <Button variant="primary" onClick={finish} disabled={busy}>
          {busy ? "Setting up…" : "Start learning →"}
        </Button>
      </div>
    </div>
  );
}
