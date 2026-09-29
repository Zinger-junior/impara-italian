// =============================================================================
// src/pages/Drill.tsx
// Conjugation drill. Pick a tense (or Mixed), type the form, get marked
// strictly — and when you're wrong, get a diagnosis, not just a cross. Hear the
// correct answer, and log misses straight to your mistake list.
// =============================================================================

import { useEffect, useRef, useState } from "react";
import { Badge, Button, Card, PageHead } from "../ui/components.js";
import { useSpeech } from "../hooks/useSpeech.js";
import { PERSONS } from "../types/index.js";
import { VERBS } from "../data/verbs.js";
import { addMistake } from "../db/repositories.js";
import { DRILL_TENSES, diagnose, expectedDisplay, newPrompt } from "../quiz/drill.js";
import type { DrillPrompt } from "../quiz/drill.js";

export function Drill() {
  const [filter, setFilter] = useState<string>("all");
  const [prompt, setPrompt] = useState<DrillPrompt>(() => newPrompt("all"));
  const [input, setInput] = useState("");
  const [fb, setFb] = useState<{ ok: boolean; message: string; expected: string } | null>(null);
  const [right, setRight] = useState(0);
  const [seen, setSeen] = useState(0);
  const [accentsOptional, setAccentsOptional] = useState(false);
  const [logged, setLogged] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const speech = useSpeech();

  const verb = VERBS[prompt.verb]!;
  const tense = DRILL_TENSES.find((t) => t.key === prompt.tenseKey)!;
  const pronoun = (tense.key === "congiuntivo" ? "che " : "") + PERSONS[prompt.person];

  useEffect(() => {
    inputRef.current?.focus();
  }, [prompt]);

  const next = (f = filter) => {
    setPrompt(newPrompt(f));
    setInput("");
    setFb(null);
    setLogged(false);
  };

  const check = () => {
    if (!input.trim() || (fb && fb.ok)) return;
    const result = diagnose(input, prompt, accentsOptional);
    setSeen((s) => s + 1);
    if (result.ok) {
      setRight((r) => r + 1);
      setFb({ ok: true, message: result.message, expected: result.expected });
      setTimeout(() => next(), 950);
    } else {
      setFb({ ok: false, message: result.message, expected: result.expected });
    }
  };

  const changeFilter = (f: string) => {
    setFilter(f);
    setRight(0);
    setSeen(0);
    next(f);
  };

  const logMistake = async () => {
    if (!fb || fb.ok) return;
    await addMistake(input.trim(), fb.expected, `${verb.infinitive} · ${tense.label} · ${PERSONS[prompt.person]}`);
    setLogged(true);
  };

  return (
    <>
      <PageHead
        title="Conjugation drill"
        sub="Six tenses, regular and irregular verbs, marked strictly. Wrong answers get a diagnosis."
      />

      <div className="quiz">
        <div className="row" style={{ gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          <button className={`segmented__opt${filter === "all" ? " segmented__opt--active" : ""}`} onClick={() => changeFilter("all")}>Mixed</button>
          {DRILL_TENSES.map((t) => (
            <button key={t.key} className={`segmented__opt${filter === t.key ? " segmented__opt--active" : ""}`} onClick={() => changeFilter(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        <Card>
          <div style={{ textAlign: "center" }}>
            <Badge variant="accent">{tense.label}</Badge>
            <div className="qprompt" style={{ margin: "14px 0 2px" }}>
              {pronoun} — <em>{verb.infinitive}</em>
            </div>
            <div className="muted" style={{ marginBottom: 14 }}>{verb.translation}</div>

            <input
              ref={inputRef}
              className={`qinput${fb ? (fb.ok ? " qinput--correct" : " qinput--wrong") : ""}`}
              style={{ maxWidth: 320, textAlign: "center", fontSize: "1.2rem" }}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { fb && !fb.ok ? next() : check(); } }}
              placeholder="type the form"
              disabled={!!(fb && fb.ok)}
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
            />

            {fb && (
              <div className={`feedback ${fb.ok ? "feedback--good" : "feedback--bad"}`} style={{ marginTop: 14, textAlign: "left" }}>
                {fb.ok ? (
                  <span>Corretto — {fb.expected}</span>
                ) : (
                  <>
                    <div><strong>{input}</strong> → {fb.expected}</div>
                    {fb.message && <div className="muted" style={{ marginTop: 4, fontWeight: 400 }}>{fb.message}</div>}
                  </>
                )}
                <div className="row" style={{ gap: 8, marginTop: 8 }}>
                  <Button size="sm" variant="ghost" onClick={() => speech.speak(fb.expected.split(" / ")[0] || "")} disabled={!speech.support.tts}>🔊 Hear it</Button>
                  {!fb.ok && (
                    <Button size="sm" variant="ghost" onClick={logMistake} disabled={logged}>{logged ? "Logged ✓" : "Log to my mistakes"}</Button>
                  )}
                </div>
              </div>
            )}

            <div className="row" style={{ justifyContent: "center", gap: 10, marginTop: 16 }}>
              {fb && !fb.ok ? (
                <Button variant="primary" onClick={() => next()}>Next →</Button>
              ) : (
                <Button variant="primary" onClick={check} disabled={!input.trim() || !!(fb && fb.ok)}>Check</Button>
              )}
              <Button variant="ghost" onClick={() => next()}>Skip</Button>
              <Button size="sm" variant="ghost" onClick={() => setAccentsOptional((a) => !a)}>
                {accentsOptional ? "Accents optional" : "Accents marked"}
              </Button>
            </div>

            <p className="muted" style={{ marginTop: 12 }}>{right} right out of {seen}</p>
          </div>
        </Card>
      </div>
    </>
  );
}
