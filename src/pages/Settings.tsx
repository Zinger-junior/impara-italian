// =============================================================================
// src/pages/Settings.tsx
// Learner settings: account, display name, current level, goal, target CLI Pisa
// exam date, and a danger zone to reset all progress. When signed in, changes
// sync to your Netlify Identity profile so they follow you across devices.
// =============================================================================

import { useState } from "react";
import { Button, Card, ErrorState, PageHead, Spinner } from "../ui/components.js";
import { useAsync } from "../hooks/useAsync.js";
import { getUser, resetAll, saveUser } from "../db/repositories.js";
import type { UserRecord } from "../db/store.js";
import { formatShort, fromISODate } from "../util/date.js";
import { CEFR_ORDER } from "../types/index.js";
import type { CefrLevel } from "../types/index.js";
import { useAuth } from "../auth/AuthContext.js";
import { pushSnapshot, scheduleSync } from "../cloud/sync.js";

export function Settings() {
  const { loading, error, value, reload } = useAsync<UserRecord>(() => getUser(), []);
  const { user: account, signOut } = useAuth();
  const [name, setName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [level, setLevel] = useState<CefrLevel>("A0");
  const [goal, setGoal] = useState("");
  const [saved, setSaved] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [dirtyLoaded, setDirtyLoaded] = useState(false);

  if (loading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (!value) return null;
  const user = value;

  // Seed the form from the loaded record once.
  if (!dirtyLoaded) {
    setName(user.displayName);
    setExamDate(user.targetExamDate);
    setLevel(user.entryCefr);
    setGoal(user.goal ?? "");
    setDirtyLoaded(true);
  }

  const save = async () => {
    const updated: UserRecord = {
      ...user,
      displayName: name.trim() || user.displayName,
      targetExamDate: examDate || user.targetExamDate,
      entryCefr: level,
      goal: goal.trim() || user.goal,
    };
    await saveUser(updated);
    scheduleSync();
    setSaved(true);
    reload();
    setTimeout(() => setSaved(false), 2500);
  };

  const doReset = async () => {
    await resetAll();
    // Persist the wiped state to the profile first, otherwise the next load
    // would pull the old snapshot back in and undo the reset.
    await pushSnapshot();
    window.location.reload();
  };

  return (
    <>
      <PageHead title="Settings" sub="Your account, profile, and plan. When you're signed in, your progress syncs to your account and follows you to any device." />

      {account && (
        <div style={{ marginBottom: 16 }}>
          <Card title="Account">
            <div className="settings-field">
              <label>Signed in as</label>
              <span style={{ fontWeight: 600 }}>{account.email}</span>
              <span className="muted" style={{ fontSize: "0.82rem" }}>
                Your progress is saved to this account and restored when you log in elsewhere.
              </span>
            </div>
            <div className="row" style={{ marginTop: 8 }}>
              <Button onClick={() => void signOut()}>Sign out</Button>
            </div>
          </Card>
        </div>
      )}

      <Card title="Profile">
        <div className="settings-field">
          <label htmlFor="set-name">Display name</label>
          <input id="set-name" className="qinput" style={{ padding: 10, fontSize: "1rem" }} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="settings-field">
          <label htmlFor="set-date">Target exam date</label>
          <input id="set-date" type="date" className="qinput" style={{ padding: 10, fontSize: "1rem" }} value={examDate} onChange={(e) => setExamDate(e.target.value)} />
          <span className="muted" style={{ fontSize: "0.82rem" }}>
            Plan started {formatShort(fromISODate(user.startDate))} · timezone {user.timezone}
          </span>
        </div>
        <div className="settings-field" style={{ maxWidth: "none" }}>
          <label>Current level (where the path starts)</label>
          <div className="chip-row">
            {CEFR_ORDER.map((l) => (
              <button key={l} className={`chip-link${level === l ? " chip-link--active" : ""}`} onClick={() => setLevel(l)}>{l}</button>
            ))}
          </div>
          <span className="muted" style={{ fontSize: "0.82rem" }}>Lessons below your level become “placed out” — optional review, not required.</span>
        </div>
        <div className="settings-field">
          <label htmlFor="set-goal">Goal</label>
          <input id="set-goal" className="qinput" style={{ padding: 10, fontSize: "1rem" }} value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. Pass CILS B1" />
        </div>
        <div className="row" style={{ gap: 10, marginTop: 8 }}>
          <Button variant="primary" onClick={save}>Save changes</Button>
          {saved && <span className="ok-words">Saved ✓</span>}
        </div>
      </Card>

      <div style={{ marginTop: 16 }}>
        <Card title="Danger zone">
          <p className="muted" style={{ marginBottom: 12 }}>
            Reset wipes all your progress — completed lessons, scores, vocabulary, mistakes, and study history — back to a
            clean start. This can't be undone.
          </p>
          {confirming ? (
            <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 600 }}>Are you sure?</span>
              <Button onClick={() => setConfirming(false)}>Cancel</Button>
              <button className="btn btn--danger" onClick={doReset}>Yes, reset everything</button>
            </div>
          ) : (
            <button className="btn btn--danger" onClick={() => setConfirming(true)}>Reset all progress</button>
          )}
        </Card>
      </div>
    </>
  );
}
