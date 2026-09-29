// =============================================================================
// src/ui/LessonCheckRunner.tsx
// The graded check that gates the next lesson. Answer every question, submit,
// and get a score. Passing (>= the check's pass mark) unlocks the next lesson;
// falling short shows what you missed and lets you retake.
// =============================================================================

import { useMemo, useState } from "react";
import { Button } from "./components.js";
import type { UseSpeech } from "../hooks/useSpeech.js";
import type { CheckQuestion, LessonCheck } from "../data/lessonChecks.js";
import { gradeCheck } from "../data/lessonChecks.js";

interface Graded {
  correct: number;
  total: number;
  pct: number;
  results: boolean[];
  passed: boolean;
}

export function LessonCheckRunner(props: {
  check: LessonCheck;
  /** Called once per submit so the caller can persist + reload progress. */
  onResult: (scorePct: number, passed: boolean) => void;
  speech?: UseSpeech;
}) {
  const { check, speech } = props;
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [graded, setGraded] = useState<Graded | null>(null);

  const allAnswered = useMemo(
    () => check.questions.every((_, i) => (answers[i] ?? "").trim() !== ""),
    [answers, check.questions],
  );

  const set = (i: number, val: string) => {
    if (graded) return; // locked after submit until retake
    setAnswers((a) => ({ ...a, [i]: val }));
  };

  const submit = () => {
    const g = gradeCheck(check, answers);
    const passed = g.pct >= check.pass;
    setGraded({ ...g, passed });
    props.onResult(g.pct, passed);
  };

  const retake = () => {
    setAnswers({});
    setGraded(null);
  };

  return (
    <div className="check-runner">
      <div className="check-runner__head">
        <strong>Lesson check</strong>
        <span className="muted"> · pass at {check.pass}%</span>
      </div>

      <ol className="check-qlist">
        {check.questions.map((q, i) => (
          <li className="check-q" key={i}>
            <div className="check-q__prompt">{q.prompt}</div>
            {q.hint && <div className="check-q__hint">{q.hint}</div>}
            <QuestionInput
              q={q}
              value={answers[i] ?? ""}
              correct={graded ? graded.results[i] : undefined}
              onChange={(v) => set(i, v)}
              speech={speech}
            />
            {graded && !graded.results[i] && (
              <div className="check-q__answer">
                Answer: <strong>{q.answer}</strong>
                {speech?.support.tts && !q.options && (
                  <button className="link-icon" aria-label="Hear it" onClick={() => speech.speak(q.answer)}>🔊</button>
                )}
              </div>
            )}
          </li>
        ))}
      </ol>

      {!graded ? (
        <Button variant="primary" onClick={submit} disabled={!allAnswered}>
          Submit check
        </Button>
      ) : (
        <div className={`check-result ${graded.passed ? "check-result--pass" : "check-result--fail"}`}>
          <div className="check-result__score">{graded.pct}%</div>
          <div className="check-result__body">
            <strong>{graded.passed ? "Passed — next lesson unlocked" : "Not quite yet"}</strong>
            <div className="muted">
              {graded.correct} of {graded.total} correct · need {check.pass}% to unlock the next lesson.
            </div>
            <div style={{ marginTop: 8 }}>
              <Button size="sm" onClick={retake}>Retake check</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionInput(props: {
  q: CheckQuestion;
  value: string;
  correct: boolean | undefined;
  onChange: (v: string) => void;
  speech?: UseSpeech;
}) {
  const { q, value, correct, speech } = props;
  const graded = correct !== undefined;

  if (q.options && q.options.length > 0) {
    return (
      <div className="check-options">
        {q.options.map((opt) => {
          const selected = value === opt;
          const isAnswer = opt === q.answer;
          let cls = "option option--sm";
          if (graded) {
            if (isAnswer) cls += " option--correct";
            else if (selected) cls += " option--wrong";
          } else if (selected) {
            cls += " option--selected";
          }
          return (
            <button key={opt} className={cls} disabled={graded} onClick={() => props.onChange(opt)}>
              {opt}
            </button>
          );
        })}
      </div>
    );
  }

  const cls = `qinput${graded ? (correct ? " qinput--correct" : " qinput--wrong") : ""}`;
  const hasTts = !!speech?.support.tts;

  return (
    <div>
      {q.listen && (
        <div className="check-listen">
          {hasTts ? (
            <button className="btn btn--sm" onClick={() => speech!.speak(q.answer)} disabled={graded}>
              🔊 Play audio
            </button>
          ) : (
            <span className="muted">Audio unavailable here — type: <strong>{q.answer}</strong></span>
          )}
        </div>
      )}
      <input
        className={cls}
        style={{ fontSize: "1rem", padding: 10, maxWidth: 320 }}
        value={value}
        onChange={(e) => props.onChange(e.target.value)}
        disabled={graded}
        placeholder={q.listen ? "type what you hear" : "type your answer"}
        spellCheck={false}
        autoComplete="off"
        autoCapitalize="off"
      />
    </div>
  );
}
