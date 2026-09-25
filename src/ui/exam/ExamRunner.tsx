// =============================================================================
// src/ui/exam/ExamRunner.tsx
// Runs a full exam under a global countdown: one item per screen, section
// headers, the reading passage pinned above lettura items, and per-type input
// (choices, typed grammar, written textarea, spoken capture). No inline
// correctness — grading happens once, on submit or timeout.
// =============================================================================

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Exam, ExamItem, ExamResponse } from "../../exam/types.js";
import { examItemsFlat } from "../../exam/builder.js";
import { gradeExam } from "../../exam/grader.js";
import type { ExamResult } from "../../exam/types.js";
import { wordCount } from "../../exam/grader.js";
import { useSpeech } from "../../hooks/useSpeech.js";
import { Button, Card } from "../components.js";

const KEYS = ["A", "B", "C", "D", "E"];

export function ExamRunner(props: {
  exam: Exam;
  onComplete: (result: ExamResult, responses: Map<string, ExamResponse>) => void;
}) {
  const { exam } = props;
  const flat = useMemo(() => examItemsFlat(exam), [exam]);
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState<Map<string, ExamResponse>>(new Map());
  const [secondsLeft, setSecondsLeft] = useState(exam.totalMinutes * 60);
  const speech = useSpeech();
  const submittedRef = useRef(false);

  const submit = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    props.onComplete(gradeExam(exam, responses), responses);
  }, [exam, responses, props]);

  // Global countdown; auto-submits at zero.
  useEffect(() => {
    if (secondsLeft <= 0) {
      submit();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, submit]);

  const entry = flat[index]!;
  const { item, section } = entry;
  const isFirstOfSection = index === 0 || flat[index - 1]!.section.skill !== section.skill;
  const isLast = index === flat.length - 1;

  const setResponse = (r: ExamResponse) => setResponses((prev) => new Map(prev).set(item.id, r));
  const current = responses.get(item.id);

  const mm = Math.floor(secondsLeft / 60);
  const ss = secondsLeft % 60;
  const timeLow = secondsLeft <= 60;

  return (
    <div className="quiz">
      <div className="quiz__meta">
        <span className="type-badge">{section.title}</span>
        <span className={`exam-timer${timeLow ? " exam-timer--low" : ""}`}>
          ⏱ {mm}:{String(ss).padStart(2, "0")}
        </span>
      </div>
      <div className="quiz__bar">
        <div className="quiz__bar-fill" style={{ width: `${Math.round((index / flat.length) * 100)}%` }} />
      </div>

      {isFirstOfSection && (
        <p className="muted" style={{ marginBottom: 12 }}>
          Sezione {entry.sectionIndex + 1} di {exam.sections.length} · {section.items.length} item · peso {section.weightPct}%
        </p>
      )}

      {section.skill === "lettura" && section.passage && (
        <Card title={section.passage.title} className="passage">
          <p style={{ lineHeight: 1.7 }}>{section.passage.text}</p>
        </Card>
      )}

      <div style={{ marginTop: 16 }}>
        <ItemView item={item} response={current} onRespond={setResponse} speech={speech} />
      </div>

      <div className="row row--between" style={{ marginTop: 24 }}>
        <Button variant="ghost" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
          ← Back
        </Button>
        <div className="row" style={{ gap: 12 }}>
          <span className="muted">{index + 1} / {flat.length}</span>
          {isLast ? (
            <Button variant="primary" onClick={submit}>Submit exam</Button>
          ) : (
            <Button variant="primary" onClick={() => setIndex((i) => i + 1)}>Next →</Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Per-item rendering -----------------------------------------------------

function ItemView(props: {
  item: ExamItem;
  response: ExamResponse | undefined;
  onRespond: (r: ExamResponse) => void;
  speech: ReturnType<typeof useSpeech>;
}) {
  const { item, response, speech } = props;

  switch (item.skill) {
    case "ascolto":
      return (
        <>
          <div className="mic-wrap" style={{ paddingTop: 0 }}>
            <Button variant="primary" onClick={() => speech.speak(item.audioText)} disabled={!speech.support.tts || speech.speaking}>
              🔊 {speech.speaking ? "Playing…" : "Play audio"}
            </Button>
            {!speech.support.tts && <span className="notice">Audio playback isn’t supported here.</span>}
          </div>
          <p className="qprompt">{item.question}</p>
          <Choices options={item.options} selected={response?.kind === "choice" ? response.index : null} onChoose={(i) => props.onRespond({ kind: "choice", index: i })} />
        </>
      );

    case "lettura":
      return (
        <>
          <p className="qprompt">{item.question}</p>
          <Choices options={item.options} selected={response?.kind === "choice" ? response.index : null} onChoose={(i) => props.onRespond({ kind: "choice", index: i })} />
        </>
      );

    case "strutture": {
      const q = item.question;
      if (q.type === "multiple_choice" || q.type === "listening") {
        return (
          <>
            <p className="qprompt">{stripGuillemets(q.prompt)}</p>
            <Choices options={q.options} selected={response?.kind === "choice" ? response.index : null} onChoose={(i) => props.onRespond({ kind: "choice", index: i })} />
          </>
        );
      }
      // conjugation / fill_blank
      return (
        <>
          <p className="qprompt">{stripGuillemets(q.prompt)}</p>
          <input
            className="qinput"
            value={response?.kind === "text" ? response.value : ""}
            onChange={(e) => props.onRespond({ kind: "text", value: e.target.value })}
            placeholder="La tua risposta…"
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
          />
        </>
      );
    }

    case "produzione_scritta": {
      const text = response?.kind === "text" ? response.value : "";
      const words = wordCount(text);
      return (
        <>
          <p className="qprompt">{item.prompt}</p>
          <textarea
            className="qinput"
            rows={8}
            value={text}
            onChange={(e) => props.onRespond({ kind: "text", value: e.target.value })}
            placeholder="Scrivi qui la tua risposta…"
          />
          <p className={`muted${words >= item.minWords ? " ok-words" : ""}`} style={{ marginTop: 8 }}>
            {words} / {item.minWords} parole minime
          </p>
        </>
      );
    }

    case "produzione_orale": {
      const transcript = response?.kind === "speech" ? response.transcript : "";
      const words = wordCount(transcript);
      const record = async () => {
        const r = await speech.listen();
        if (r) props.onRespond({ kind: "speech", transcript: r.transcript, confidence: r.confidence });
      };
      return (
        <>
          <p className="qprompt">{item.prompt}</p>
          <div className="mic-wrap">
            {speech.support.stt ? (
              <button className={`mic${speech.listening ? " mic--listening" : ""}`} onClick={record} disabled={speech.listening} aria-label="Record answer">
                {speech.listening ? "●" : "🎤"}
              </button>
            ) : (
              <span className="notice">Speech recognition isn’t available — type your answer instead below.</span>
            )}
            <span className="muted">{speech.listening ? "Listening… parla adesso" : `${words} / ${item.minWords} parole`}</span>
          </div>
          {!speech.support.stt && (
            <textarea
              className="qinput"
              rows={5}
              value={response?.kind === "text" ? response.value : ""}
              onChange={(e) => props.onRespond({ kind: "text", value: e.target.value })}
              placeholder="Trascrivi qui la tua risposta orale…"
            />
          )}
          {transcript && <div className="feedback feedback--good" style={{ marginTop: 12 }}>Hai detto: “{transcript}”</div>}
          {speech.error && <div className="feedback feedback--bad">{speech.error}</div>}
        </>
      );
    }
  }
}

function Choices(props: { options: string[]; selected: number | null; onChoose: (i: number) => void }) {
  return (
    <div className="options">
      {props.options.map((opt, i) => (
        <button
          key={i}
          className={`option${i === props.selected ? " option--selected" : ""}`}
          onClick={() => props.onChoose(i)}
        >
          <span className="option__key">{KEYS[i]}</span>
          {opt}
        </button>
      ))}
    </div>
  );
}

/** Exam prompts show grammar plainly; drop the «» emphasis markers. */
function stripGuillemets(s: string): string {
  return s.replace(/[«»]/g, "");
}
