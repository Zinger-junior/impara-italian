// =============================================================================
// src/pages/Quiz.tsx
// Quiz flow: setup → runner → results. Generates a mixed quiz from the chosen
// level/types/length, runs it, then persists the result (and any pronunciation
// attempts) and logs study time.
// =============================================================================

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Badge, Button, Card, PageHead, ProgressRow, Segmented } from "../ui/components.js";
import { QuizRunner } from "../ui/quiz/QuizRunner.js";
import { generateQuiz } from "../quiz/generator.js";
import type { Question, QuestionType, QuizResultSummary, QuizSpec, Response } from "../quiz/types.js";
import { QUIZ_PASS_PCT } from "../quiz/grader.js";
import { useSpeech } from "../hooks/useSpeech.js";
import { addStudyMinutes, savePronunciationAttempt, saveQuizResult } from "../db/repositories.js";
import type { CefrLevel } from "../types/index.js";

type Phase = "setup" | "running" | "done";

const TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: "multiple_choice", label: "Multiple choice" },
  { value: "conjugation", label: "Conjugation" },
  { value: "fill_blank", label: "Fill the blank" },
  { value: "pronunciation", label: "Pronunciation (speak)" },
  { value: "listening", label: "Listening (audio)" },
];

export function Quiz() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [level, setLevel] = useState<CefrLevel>("A1");
  const [length, setLength] = useState<number>(10);
  const [types, setTypes] = useState<Set<QuestionType>>(
    new Set(TYPE_OPTIONS.map((t) => t.value)),
  );
  const [questions, setQuestions] = useState<Question[]>([]);
  const [result, setResult] = useState<QuizResultSummary | null>(null);
  const [lastSpec, setLastSpec] = useState<QuizSpec | null>(null);

  const speech = useSpeech();

  const toggleType = (t: QuestionType) => {
    setTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  const start = (spec?: QuizSpec) => {
    const chosen: QuizSpec = spec ?? {
      level,
      length,
      types: [...types],
    };
    const qs = generateQuiz(chosen);
    if (qs.length === 0) return;
    setQuestions(qs);
    setLastSpec(chosen);
    setResult(null);
    setPhase("running");
  };

  const onComplete = async (summary: QuizResultSummary, responses: Map<string, Response>) => {
    const takenAt = new Date().toISOString();
    await saveQuizResult({
      takenAt,
      level: lastSpec?.level ?? level,
      total: summary.total,
      correct: summary.correct,
      scorePct: summary.scorePct,
      passed: summary.passed,
      byTypeJson: JSON.stringify(summary.byType),
    });

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]!;
      if (q.type === "pronunciation") {
        const r = responses.get(q.id);
        if (r && r.kind === "speech") {
          await savePronunciationAttempt({
            takenAt,
            targetText: q.targetText,
            recognizedText: r.transcript,
            accuracyPct: summary.answers[i]!.score,
          });
        }
      }
    }

    await addStudyMinutes(Math.max(5, Math.round(questions.length * 0.75)));
    setResult(summary);
    setPhase("done");
  };

  if (phase === "running") {
    return (
      <>
        <PageHead title="Quiz" sub={`${level} · ${questions.length} questions`} />
        <QuizRunner questions={questions} onComplete={onComplete} />
      </>
    );
  }

  if (phase === "done" && result) {
    return (
      <Results
        summary={result}
        onRetry={() => lastSpec && start({ ...lastSpec, seed: undefined })}
        onNew={() => setPhase("setup")}
      />
    );
  }

  // ---- Setup ----
  const pronunciationSelected = types.has("pronunciation");
  const listeningSelected = types.has("listening");
  const canStart = types.size > 0;

  return (
    <>
      <PageHead title="Quiz" sub="Build a mixed practice set from any level." />

      <div className="setup-grid" style={{ maxWidth: 620 }}>
        <Card title="Level">
          <Segmented<CefrLevel>
            ariaLabel="Quiz level"
            value={level}
            onChange={setLevel}
            options={[
              { value: "A0", label: "A0" },
              { value: "A1", label: "A1" },
              { value: "A2", label: "A2" },
              { value: "B1", label: "B1" },
              { value: "B2", label: "B2" },
            ]}
          />
        </Card>

        <Card title="Question types" hint="Mix and match — all five are on by default">
          <div className="checks">
            {TYPE_OPTIONS.map((opt) => (
              <label className="check" key={opt.value}>
                <input type="checkbox" checked={types.has(opt.value)} onChange={() => toggleType(opt.value)} />
                <span style={{ flex: 1 }}>{opt.label}</span>
              </label>
            ))}
          </div>
          {pronunciationSelected && !speech.support.stt && (
            <div className="notice" style={{ marginTop: 12 }}>
              Speech recognition isn’t available in this browser — pronunciation questions will show the target but can’t be scored. Chrome or Edge recommended.
            </div>
          )}
          {listeningSelected && !speech.support.tts && (
            <div className="notice" style={{ marginTop: 12 }}>
              Audio playback isn’t available in this browser — listening questions won’t play.
            </div>
          )}
        </Card>

        <Card title="Length">
          <Segmented<string>
            ariaLabel="Quiz length"
            value={String(length)}
            onChange={(v) => setLength(Number(v))}
            options={[
              { value: "5", label: "5" },
              { value: "10", label: "10" },
              { value: "15", label: "15" },
              { value: "20", label: "20" },
            ]}
          />
        </Card>

        <div>
          <Button variant="primary" onClick={() => start()} disabled={!canStart}>
            Start quiz →
          </Button>
          {!canStart && <span className="muted" style={{ marginLeft: 12 }}>Pick at least one question type.</span>}
        </div>
      </div>
    </>
  );
}

// ---- Results ----------------------------------------------------------------

function Results(props: { summary: QuizResultSummary; onRetry: () => void; onNew: () => void }) {
  const { summary } = props;
  const typeRows = useMemo(
    () =>
      (Object.entries(summary.byType) as [QuestionType, { total: number; correct: number }][])
        .filter(([, v]) => v.total > 0)
        .map(([type, v]) => ({
          type,
          pct: v.total === 0 ? 0 : Math.round((v.correct / v.total) * 100),
          label: `${v.correct}/${v.total}`,
        })),
    [summary],
  );

  return (
    <>
      <PageHead
        title="Results"
        badge={<Badge variant={summary.passed ? "good" : "default"} dot>{summary.passed ? "Passed" : "Keep practising"}</Badge>}
      />

      <div className="grid grid--2">
        <Card>
          <div className="score-hero">
            <div className="score-ring" style={{ ["--pct"]: summary.scorePct } as CSSProperties}>
              <div className="score-ring__inner">{summary.scorePct}%</div>
            </div>
            <div className="stat__meta">
              {summary.correct} of {summary.total} correct · pass mark {QUIZ_PASS_PCT}%
            </div>
            <div className="row" style={{ justifyContent: "center", marginTop: 20, gap: 12 }}>
              <Button variant="primary" onClick={props.onRetry}>Try again</Button>
              <Button variant="ghost" onClick={props.onNew}>New quiz</Button>
            </div>
          </div>
        </Card>

        <Card title="By question type">
          <div className="stack">
            {typeRows.map((r) => (
              <ProgressRow key={r.type} label={shortType(r.type)} pct={r.pct} meta={r.label} />
            ))}
          </div>
        </Card>
      </div>

      <div style={{ marginTop: 24 }}>
        <Card title="Review">
          {summary.answers.map((a, i) => (
            <div className="review-row" key={a.questionId}>
              <span className={`review-mark ${a.correct ? "review-mark--ok" : "review-mark--no"}`}>
                {a.correct ? "✓" : "✗"}
              </span>
              <div className="review-body">
                <div>
                  <strong>Q{i + 1}.</strong> Expected «{a.expected}»
                </div>
                <div className="review-given">You: {a.given} — {a.feedback}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}

function shortType(t: QuestionType): string {
  switch (t) {
    case "multiple_choice": return "Choice";
    case "conjugation": return "Conjug.";
    case "fill_blank": return "Fill";
    case "pronunciation": return "Speak";
    case "listening": return "Listen";
  }
}
