// =============================================================================
// src/pages/Listening.tsx
// The listening lab. Dictation (hear a sentence, type it back) and comprehension
// (hear a passage, answer a question). Audio comes from the Web Speech API; where
// a browser has no speech synthesis, the text is shown so the exercise still works.
// =============================================================================

import { useMemo, useState } from "react";
import { Badge, Button, Card, PageHead, Segmented } from "../ui/components.js";
import { useSpeech } from "../hooks/useSpeech.js";
import type { UseSpeech } from "../hooks/useSpeech.js";
import { isCorrect } from "../data/lessonChecks.js";
import { COMPREHENSION, DICTATION, LISTENING_LEVELS } from "../data/listening.js";
import type { ComprehensionItem, DictationItem } from "../data/listening.js";
import type { CefrLevel } from "../types/index.js";

type Mode = "dictation" | "comprehension";
type Filter = "all" | CefrLevel;

export function Listening() {
  const [mode, setMode] = useState<Mode>("dictation");
  const [level, setLevel] = useState<Filter>("all");
  const speech = useSpeech();

  const dictation = useMemo(
    () => DICTATION.filter((d) => level === "all" || d.level === level),
    [level],
  );
  const comprehension = useMemo(
    () => COMPREHENSION.filter((c) => level === "all" || c.level === level),
    [level],
  );

  return (
    <>
      <PageHead
        title="Listening lab"
        sub="The skill that lags behind reading for most learners. Train your ear: take dictation, or listen to a passage and answer. Replay as many times as you need."
      />

      <div className="row" style={{ gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <Segmented<Mode>
          ariaLabel="Exercise type"
          value={mode}
          onChange={setMode}
          options={[
            { value: "dictation", label: "Dictation" },
            { value: "comprehension", label: "Comprehension" },
          ]}
        />
        <Segmented<Filter>
          ariaLabel="Level"
          value={level}
          onChange={setLevel}
          options={[
            { value: "all", label: "All" },
            ...LISTENING_LEVELS.map((l) => ({ value: l as Filter, label: l })),
          ]}
        />
      </div>

      {!speech.support.tts && (
        <div className="notice" style={{ marginBottom: 16 }}>
          This browser has no speech synthesis, so the text is shown instead of played. Chrome or Safari give the best audio.
        </div>
      )}

      {mode === "dictation" ? (
        dictation.length > 0 ? (
          <DictationLab key={level} items={dictation} speech={speech} />
        ) : (
          <Card><p className="muted">No dictation items at this level yet.</p></Card>
        )
      ) : comprehension.length > 0 ? (
        <ComprehensionLab key={level} items={comprehension} speech={speech} />
      ) : (
        <Card><p className="muted">No comprehension passages at this level yet.</p></Card>
      )}
    </>
  );
}

function DictationLab(props: { items: DictationItem[]; speech: UseSpeech }) {
  const { items, speech } = props;
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [checked, setChecked] = useState(false);
  const [right, setRight] = useState(0);
  const [seen, setSeen] = useState(0);

  const item = items[Math.min(idx, items.length - 1)];
  if (!item) return null;
  const ok = checked && isCorrect({ prompt: "", answer: item.it }, input);

  const check = () => {
    if (checked || !input.trim()) return;
    setChecked(true);
    setSeen((s) => s + 1);
    if (isCorrect({ prompt: "", answer: item.it }, input)) setRight((r) => r + 1);
  };
  const next = () => {
    setChecked(false);
    setInput("");
    setIdx((i) => (i + 1) % items.length);
  };

  return (
    <Card>
      <div className="row row--between" style={{ marginBottom: 12 }}>
        <Badge variant="accent">{item.level}</Badge>
        <span className="muted">{right} right of {seen} · {Math.min(idx, items.length - 1) + 1}/{items.length}</span>
      </div>

      <div className="listen-play">
        {speech.support.tts ? (
          <Button variant="primary" onClick={() => speech.speak(item.it)}>🔊 Play sentence</Button>
        ) : (
          <div className="listen-text">{item.it}</div>
        )}
      </div>

      <input
        className={`qinput${checked ? (ok ? " qinput--correct" : " qinput--wrong") : ""}`}
        style={{ marginTop: 16, fontSize: "1.05rem", padding: 12 }}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { checked ? next() : check(); } }}
        placeholder="type what you hear"
        disabled={checked}
        spellCheck={false}
        autoComplete="off"
      />

      {checked && (
        <div className={`feedback ${ok ? "feedback--good" : "feedback--bad"}`} style={{ marginTop: 14 }}>
          <div><strong>{item.it}</strong></div>
          <div className="muted" style={{ marginTop: 2 }}>{item.en}</div>
        </div>
      )}

      <div className="row" style={{ gap: 10, marginTop: 16 }}>
        {checked ? (
          <Button variant="primary" onClick={next}>Next →</Button>
        ) : (
          <Button variant="primary" onClick={check} disabled={!input.trim()}>Check</Button>
        )}
        <Button variant="ghost" onClick={() => speech.speak(item.it)} disabled={!speech.support.tts}>🔊 Replay</Button>
        <Button variant="ghost" onClick={next}>Skip</Button>
      </div>
    </Card>
  );
}

function ComprehensionLab(props: { items: ComprehensionItem[]; speech: UseSpeech }) {
  const { items, speech } = props;
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [right, setRight] = useState(0);
  const [seen, setSeen] = useState(0);

  const item = items[Math.min(idx, items.length - 1)];
  if (!item) return null;
  const answered = selected !== null;

  const choose = (opt: string) => {
    if (answered) return;
    setSelected(opt);
    setSeen((s) => s + 1);
    if (opt === item.answer) setRight((r) => r + 1);
  };
  const next = () => {
    setSelected(null);
    setIdx((i) => (i + 1) % items.length);
  };

  return (
    <Card>
      <div className="row row--between" style={{ marginBottom: 12 }}>
        <Badge variant="accent">{item.level}</Badge>
        <span className="muted">{right} right of {seen} · {Math.min(idx, items.length - 1) + 1}/{items.length}</span>
      </div>

      <div className="listen-play">
        {speech.support.tts ? (
          <Button variant="primary" onClick={() => speech.speak(item.script)}>🔊 Play passage</Button>
        ) : (
          <div className="listen-text">{item.script}</div>
        )}
      </div>

      <p style={{ fontWeight: 600, margin: "16px 0 10px" }}>{item.question}</p>
      <div className="options">
        {item.options.map((opt) => {
          const isAnswer = opt === item.answer;
          const isPicked = opt === selected;
          let cls = "option";
          if (answered) {
            if (isAnswer) cls += " option--correct";
            else if (isPicked) cls += " option--wrong";
          } else if (isPicked) {
            cls += " option--selected";
          }
          return (
            <button key={opt} className={cls} disabled={answered} onClick={() => choose(opt)}>
              {opt}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="feedback feedback--good" style={{ marginTop: 14 }}>
          <div><strong>{item.script}</strong></div>
          <div className="muted" style={{ marginTop: 2 }}>{item.en}</div>
        </div>
      )}

      <div className="row" style={{ gap: 10, marginTop: 16 }}>
        {answered && <Button variant="primary" onClick={next}>Next →</Button>}
        <Button variant="ghost" onClick={() => speech.speak(item.script)} disabled={!speech.support.tts}>🔊 Replay</Button>
        {!answered && <Button variant="ghost" onClick={next}>Skip</Button>}
      </div>
    </Card>
  );
}
