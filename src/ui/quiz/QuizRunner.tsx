// =============================================================================
// src/ui/quiz/QuizRunner.tsx
// Drives a quiz: renders the current question by type, captures the response,
// grades on demand (immediately for choices, on "Check" for typed/spoken),
// shows inline feedback, and rolls up a summary on completion.
// =============================================================================

import { useMemo, useState } from "react";
import type { Question, Response } from "../../quiz/types.js";
import { gradeAnswer, summarize } from "../../quiz/grader.js";
import type { QuizResultSummary } from "../../quiz/types.js";
import { useSpeech } from "../../hooks/useSpeech.js";
import { Button } from "../components.js";

const OPTION_KEYS = ["A", "B", "C", "D", "E", "F"];

export function QuizRunner(props: {
  questions: Question[];
  onComplete: (summary: QuizResultSummary, responses: Map<string, Response>) => void;
}) {
  const { questions } = props;
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState<Map<string, Response>>(new Map());
  const [graded, setGraded] = useState<Set<string>>(new Set());
  const [textDraft, setTextDraft] = useState("");
  const speech = useSpeech();

  const q = questions[index]!;
  const isGraded = graded.has(q.id);
  const response = responses.get(q.id);
  const gradedAnswer = isGraded ? gradeAnswer(q, response) : null;
  const isLast = index === questions.length - 1;

  const setResponse = (r: Response) => {
    setResponses((prev) => new Map(prev).set(q.id, r));
  };
  const markGraded = () => setGraded((prev) => new Set(prev).add(q.id));

  // ---- Choice questions: grade immediately on select ----
  const chooseOption = (i: number) => {
    if (isGraded) return;
    setResponse({ kind: "choice", index: i });
    markGraded();
  };

  // ---- Text questions: grade on Check ----
  const checkText = () => {
    setResponses((prev) => new Map(prev).set(q.id, { kind: "text", value: textDraft }));
    markGraded();
  };

  // ---- Pronunciation: capture speech then grade ----
  const record = async () => {
    const result = await speech.listen();
    if (result) {
      setResponses((prev) =>
        new Map(prev).set(q.id, { kind: "speech", transcript: result.transcript, confidence: result.confidence }),
      );
      markGraded();
    }
  };

  const advance = () => {
    if (isLast) {
      const summary = summarize(questions, responses);
      props.onComplete(summary, responses);
      return;
    }
    setIndex((i) => i + 1);
    setTextDraft("");
    speech.cancelListen();
  };

  const skip = () => {
    markGraded(); // records no response -> graded incorrect
    advance();
  };

  const progressPct = Math.round((index / questions.length) * 100);

  return (
    <div className="quiz">
      <div className="quiz__bar">
        <div className="quiz__bar-fill" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="quiz__meta">
        <span className="type-badge">{labelForType(q.type)}</span>
        <span className="muted">
          {index + 1} / {questions.length}
        </span>
      </div>

      <QuestionBody
        question={q}
        response={response}
        graded={isGraded}
        gradedCorrect={gradedAnswer ? gradedAnswer.correct : null}
        textDraft={textDraft}
        onText={setTextDraft}
        onChoose={chooseOption}
        onRecord={record}
        speech={speech}
      />

      {gradedAnswer && (
        <div className={`feedback ${gradedAnswer.correct ? "feedback--good" : "feedback--bad"}`}>
          {gradedAnswer.feedback}
          {q.explanation && <div className="muted" style={{ marginTop: 4, fontWeight: 400 }}>{q.explanation}</div>}
        </div>
      )}

      <div className="row row--between" style={{ marginTop: 24 }}>
        {!isGraded ? (
          <Button variant="ghost" onClick={skip}>Skip</Button>
        ) : (
          <span />
        )}
        <div className="row">
          {isTextType(q.type) && !isGraded && (
            <Button variant="primary" onClick={checkText} disabled={textDraft.trim().length === 0}>
              Check
            </Button>
          )}
          {isGraded && (
            <Button variant="primary" onClick={advance}>
              {isLast ? "Finish" : "Next →"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Question body (per type) ----------------------------------------------

function QuestionBody(props: {
  question: Question;
  response: Response | undefined;
  graded: boolean;
  gradedCorrect: boolean | null;
  textDraft: string;
  onText: (v: string) => void;
  onChoose: (i: number) => void;
  onRecord: () => void;
  speech: ReturnType<typeof useSpeech>;
}) {
  const { question: q, response, graded, speech } = props;

  switch (q.type) {
    case "multiple_choice":
      return (
        <>
          <p className="qprompt">{renderPrompt(q.prompt)}</p>
          <Choices
            options={q.options}
            correctIndex={q.correctIndex}
            selected={response?.kind === "choice" ? response.index : null}
            graded={graded}
            onChoose={props.onChoose}
          />
        </>
      );

    case "listening":
      return (
        <>
          <p className="qprompt">{q.prompt}</p>
          <div className="mic-wrap">
            <Button
              variant="primary"
              onClick={() => speech.speak(q.audioText)}
              disabled={!speech.support.tts || speech.speaking}
            >
              🔊 {speech.speaking ? "Playing…" : "Play audio"}
            </Button>
            {!speech.support.tts && <span className="notice">Audio playback isn’t supported in this browser.</span>}
          </div>
          <Choices
            options={q.options}
            correctIndex={q.correctIndex}
            selected={response?.kind === "choice" ? response.index : null}
            graded={graded}
            onChoose={props.onChoose}
          />
        </>
      );

    case "conjugation":
    case "fill_blank": {
      const stateCls = graded ? (props.gradedCorrect ? " qinput--correct" : " qinput--wrong") : "";
      return (
        <>
          <p className="qprompt">{renderPrompt(q.prompt)}</p>
          <input
            className={`qinput${stateCls}`}
            value={props.textDraft}
            onChange={(e) => props.onText(e.target.value)}
            disabled={graded}
            placeholder="Type your answer…"
            autoFocus
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
          />
        </>
      );
    }

    case "pronunciation":
      return (
        <>
          <p className="qprompt">{q.prompt}</p>
          <p className="qprompt" style={{ marginTop: 0 }}>
            <em>{q.targetText}</em>
          </p>
          {q.translation && <p className="muted" style={{ marginTop: -12, marginBottom: 16 }}>{q.translation}</p>}
          <div className="mic-wrap">
            <Button variant="ghost" size="sm" onClick={() => speech.speak(q.targetText)} disabled={!speech.support.tts || speech.speaking}>
              🔊 Hear it
            </Button>
            {speech.support.stt ? (
              <button
                className={`mic${speech.listening ? " mic--listening" : ""}`}
                onClick={props.onRecord}
                disabled={speech.listening || graded}
                aria-label={speech.listening ? "Listening…" : "Tap to speak"}
              >
                {speech.listening ? "●" : "🎤"}
              </button>
            ) : (
              <span className="notice">Speech recognition isn’t supported here — use Chrome or Edge to practise pronunciation.</span>
            )}
            <span className="muted">{speech.listening ? "Listening… speak now" : graded ? "" : "Tap the mic and say it aloud"}</span>
          </div>
          {speech.error && <div className="feedback feedback--bad">{speech.error}</div>}
        </>
      );
  }
}

function Choices(props: {
  options: string[];
  correctIndex: number;
  selected: number | null;
  graded: boolean;
  onChoose: (i: number) => void;
}) {
  return (
    <div className="options">
      {props.options.map((opt, i) => {
        let cls = "option";
        if (props.graded) {
          if (i === props.correctIndex) cls += " option--correct";
          else if (i === props.selected) cls += " option--wrong";
        } else if (i === props.selected) {
          cls += " option--selected";
        }
        return (
          <button key={i} className={cls} onClick={() => props.onChoose(i)} disabled={props.graded}>
            <span className="option__key">{OPTION_KEYS[i]}</span>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ---- Helpers ----------------------------------------------------------------

function isTextType(t: Question["type"]): boolean {
  return t === "conjugation" || t === "fill_blank";
}

function labelForType(t: Question["type"]): string {
  switch (t) {
    case "multiple_choice": return "Multiple choice";
    case "conjugation": return "Conjugation";
    case "fill_blank": return "Fill the blank";
    case "pronunciation": return "Pronunciation";
    case "listening": return "Listening";
  }
}

/** Render «guillemet»-wrapped fragments as accent-coloured emphasis. */
function renderPrompt(prompt: string) {
  const parts = prompt.split(/(«[^»]*»)/g);
  return parts.map((part, i) =>
    part.startsWith("«") && part.endsWith("»") ? <em key={i}>{part.slice(1, -1)}</em> : <span key={i}>{part}</span>,
  );
}

// Re-export for callers that memoise questions.
export function useQuizQuestions(questions: Question[]): Question[] {
  return useMemo(() => questions, [questions]);
}
