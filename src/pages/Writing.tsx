// =============================================================================
// src/pages/Writing.tsx
// A composition workshop. Pick a level, get a prompt with a "make sure you
// include" rubric, write your answer (saved locally as you type), watch the word
// count, then reveal a model answer to compare against. Output isn't auto-graded —
// writing is judged against the rubric and the model, by you.
// =============================================================================

import { useMemo, useState } from "react";
import { Badge, Button, Card, PageHead, Segmented } from "../ui/components.js";
import { useSpeech } from "../hooks/useSpeech.js";
import { WRITING_LEVELS, WRITING_PROMPTS } from "../data/writingPrompts.js";
import type { CefrLevel } from "../types/index.js";

type Filter = "all" | CefrLevel;

const STORE_KEY = "impara.writing";

function loadTexts(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) ?? "{}") as Record<string, string>;
  } catch {
    return {};
  }
}

function countWords(s: string): number {
  const t = s.trim();
  return t === "" ? 0 : t.split(/\s+/).length;
}

export function Writing() {
  const [level, setLevel] = useState<Filter>("all");
  const [idx, setIdx] = useState(0);
  const [texts, setTexts] = useState<Record<string, string>>(loadTexts);
  const [showModel, setShowModel] = useState(false);
  const speech = useSpeech();

  const prompts = useMemo(
    () => WRITING_PROMPTS.filter((p) => level === "all" || p.level === level),
    [level],
  );

  const safeIdx = prompts.length ? Math.min(idx, prompts.length - 1) : 0;
  const prompt = prompts[safeIdx];

  const setText = (id: string, val: string) => {
    setTexts((prev) => {
      const next = { ...prev, [id]: val };
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(next));
      } catch {
        /* ignore quota */
      }
      return next;
    });
  };

  const go = (delta: number) => {
    if (!prompts.length) return;
    setIdx((i) => (Math.min(i, prompts.length - 1) + delta + prompts.length) % prompts.length);
    setShowModel(false);
  };

  const changeLevel = (l: Filter) => {
    setLevel(l);
    setIdx(0);
    setShowModel(false);
  };

  return (
    <>
      <PageHead
        title="Writing workshop"
        sub="Production is where a language sticks. Write against a prompt, hit the checklist, then compare with a model answer — the fastest way to see your own gaps."
      />

      <div style={{ marginBottom: 20 }}>
        <Segmented<Filter>
          ariaLabel="Level"
          value={level}
          onChange={changeLevel}
          options={[{ value: "all", label: "All" }, ...WRITING_LEVELS.map((l) => ({ value: l as Filter, label: l }))]}
        />
      </div>

      {!prompt ? (
        <Card><p className="muted">No prompts at this level yet.</p></Card>
      ) : (
        <>
          <Card
            title={prompt.title}
            hint={`${prompt.level} · aim for ${prompt.minWords}+ words`}
            actions={<Badge variant="accent">{safeIdx + 1}/{prompts.length}</Badge>}
          >
            <p style={{ fontWeight: 550, marginBottom: 12 }}>{prompt.prompt}</p>
            <div className="ld-label">Make sure you include</div>
            <ul className="write-rubric">
              {prompt.include.map((it, i) => <li key={i}>{it}</li>)}
            </ul>
          </Card>

          <div style={{ marginTop: 16 }}>
            <Card title="Your answer">
              <textarea
                className="qinput"
                style={{ minHeight: 160, lineHeight: 1.6, fontSize: "1rem", padding: 12 }}
                value={texts[prompt.id] ?? ""}
                onChange={(e) => setText(prompt.id, e.target.value)}
                placeholder="Scrivi qui…"
                spellCheck={false}
              />
              <div className="row row--between" style={{ marginTop: 10 }}>
                <span className={`muted${countWords(texts[prompt.id] ?? "") >= prompt.minWords ? " ok-words" : ""}`}>
                  {countWords(texts[prompt.id] ?? "")} words · target {prompt.minWords}
                </span>
                <span className="muted" style={{ fontSize: "0.8rem" }}>Saved automatically on this device</span>
              </div>
            </Card>
          </div>

          <div style={{ marginTop: 16 }}>
            <Card
              title="Model answer"
              actions={
                <Button size="sm" onClick={() => setShowModel((s) => !s)}>
                  {showModel ? "Hide" : "Reveal"}
                </Button>
              }
            >
              {showModel ? (
                <>
                  <p style={{ whiteSpace: "pre-line", lineHeight: 1.7 }}>{prompt.model}</p>
                  <div style={{ marginTop: 10 }}>
                    <Button size="sm" variant="ghost" onClick={() => speech.speak(prompt.model)} disabled={!speech.support.tts}>
                      🔊 Hear the model
                    </Button>
                  </div>
                </>
              ) : (
                <p className="muted">Write your own version first — then reveal this and compare structure, tenses, and connectors.</p>
              )}
            </Card>
          </div>

          <div className="row" style={{ gap: 10, marginTop: 16 }}>
            <Button onClick={() => go(-1)} disabled={prompts.length < 2}>← Previous</Button>
            <Button variant="primary" onClick={() => go(1)} disabled={prompts.length < 2}>Next prompt →</Button>
          </div>
        </>
      )}
    </>
  );
}
