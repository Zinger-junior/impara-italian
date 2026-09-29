// =============================================================================
// src/pages/Vocabulary.tsx
// Personal vocabulary with Leitner spaced repetition. Add words, load the core
// pack, quiz yourself (weighted toward weak words), hear each word via TTS, and
// export to CSV for Anki. Everything persists in IndexedDB.
// =============================================================================

import { useMemo, useState } from "react";
import { Badge, Button, Card, ErrorState, PageHead, ProgressBar, Spinner, Stat } from "../ui/components.js";
import { useAsync } from "../hooks/useAsync.js";
import { useSpeech } from "../hooks/useSpeech.js";
import {
  addVocabWord,
  addVocabWords,
  deleteVocabWord,
  getVocab,
  setVocabBox,
} from "../db/repositories.js";
import type { VocabRecord } from "../db/store.js";
import { CORE_VOCAB } from "../data/coreVocab.js";
import { boxCounts, masteryPct, pickWeighted, weakWords } from "../vocab/srs.js";

const GOAL = 500;

interface QuizState {
  active: boolean;
  current: VocabRecord | null;
  revealed: boolean;
  right: number;
  seen: number;
  weakOnly: boolean;
  words: VocabRecord[];
}

const IDLE: QuizState = { active: false, current: null, revealed: false, right: 0, seen: 0, weakOnly: false, words: [] };

export function Vocabulary() {
  const { loading, error, value, reload } = useAsync<VocabRecord[]>(() => getVocab(), []);
  const [itText, setItText] = useState("");
  const [enText, setEnText] = useState("");
  const [search, setSearch] = useState("");
  const [quiz, setQuiz] = useState<QuizState>(IDLE);
  const [busy, setBusy] = useState(false);
  const speech = useSpeech();

  const words = value ?? [];
  const mastery = masteryPct(words);
  const counts = boxCounts(words);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = [...words].reverse();
    if (!q) return list;
    return list.filter((w) => w.it.toLowerCase().includes(q) || w.en.toLowerCase().includes(q));
  }, [words, search]);

  if (loading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const add = async () => {
    if (!itText.trim() || !enText.trim()) return;
    setBusy(true);
    const ok = await addVocabWord(itText, enText, "custom");
    setBusy(false);
    if (ok) {
      setItText("");
      setEnText("");
      reload();
    }
  };

  const loadCorePack = async () => {
    setBusy(true);
    await addVocabWords(CORE_VOCAB.map((w) => ({ it: w.it, en: w.en, theme: w.theme })));
    setBusy(false);
    reload();
  };

  const removeWord = async (id: number | undefined) => {
    if (id === undefined) return;
    await deleteVocabWord(id);
    reload();
  };

  const startQuiz = (weakOnly: boolean) => {
    const pool = weakOnly ? weakWords(words) : words;
    if (pool.length === 0) return;
    setQuiz({ active: true, current: pickWeighted(pool), revealed: false, right: 0, seen: 0, weakOnly, words: pool });
  };

  const answer = async (knew: boolean) => {
    const cur = quiz.current;
    if (!cur) return;
    const newBox = knew ? Math.min(5, (cur.box || 1) + 1) : 1;
    await setVocabBox(cur, newBox);
    const updated = quiz.words.map((w) => (w.id === cur.id ? { ...w, box: newBox } : w));
    const pool = quiz.weakOnly ? updated.filter((w) => (w.box || 1) <= 2) : updated;
    setQuiz((q) => ({
      ...q,
      words: updated,
      right: q.right + (knew ? 1 : 0),
      seen: q.seen + 1,
      revealed: false,
      current: pool.length ? pickWeighted(pool) : null,
    }));
  };

  const stopQuiz = () => {
    setQuiz(IDLE);
    reload();
  };

  const exportCsv = () => {
    if (words.length === 0) return;
    const rows = words.map((w) => `"${w.it.replace(/"/g, '""')}","${w.en.replace(/"/g, '""')}"`);
    const blob = new Blob([rows.join("\r\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "impara-vocab.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <>
      <PageHead
        title="Vocabulary"
        badge={<Badge variant="accent">{words.length} words</Badge>}
        sub="B1 needs roughly 1,500 words, but the first 500 do most of the work. Load the core pack, then add words you actually meet."
      />

      <div className="grid grid--stats" style={{ marginBottom: 24 }}>
        <Card><Stat label="Words logged" value={words.length} meta={`goal ${GOAL}`} /></Card>
        <Card><Stat label="Mastery" value={`${mastery}%`} meta="average Leitner box" /></Card>
        <Card><Stat label="Still weak" value={weakWords(words).length} meta="box 1–2" /></Card>
        <Card>
          <div className="stat">
            <div className="stat__label">By box (1→5)</div>
            <div className="row" style={{ gap: 4, marginTop: 6 }}>
              {counts.map((c, i) => (
                <span key={i} className="box-pip" title={`Box ${i + 1}: ${c}`}>{c}</span>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card title="Add & manage">
        <div style={{ marginBottom: 12 }}>
          <ProgressBar pct={Math.min(100, Math.round((words.length / GOAL) * 100))} label="progress to 500 words" />
        </div>
        <div className="row" style={{ gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <input className="qinput" style={{ flex: "1 1 180px", fontSize: "1rem", padding: 10 }} placeholder="Italian word or phrase" value={itText} onChange={(e) => setItText(e.target.value)} />
          <input className="qinput" style={{ flex: "1 1 180px", fontSize: "1rem", padding: 10 }} placeholder="Meaning / note" value={enText} onChange={(e) => setEnText(e.target.value)} />
          <Button variant="primary" onClick={add} disabled={busy || !itText.trim() || !enText.trim()}>Add word</Button>
        </div>
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <Button size="sm" onClick={loadCorePack} disabled={busy}>Load the core pack ({CORE_VOCAB.length})</Button>
          <Button size="sm" onClick={() => startQuiz(false)} disabled={words.length === 0}>Quiz me</Button>
          <Button size="sm" onClick={() => startQuiz(true)} disabled={weakWords(words).length === 0}>Drill my weakest</Button>
          <Button size="sm" onClick={exportCsv} disabled={words.length === 0}>Export CSV for Anki</Button>
        </div>
      </Card>

      {quiz.active && (
        <div style={{ marginTop: 24 }}>
          <Card title={quiz.weakOnly ? "Drilling your weakest words" : "Quiz"}>
            {quiz.current ? (
              <div style={{ textAlign: "center" }}>
                <div className="row" style={{ justifyContent: "center", gap: 10, alignItems: "center" }}>
                  <div className="qprompt" style={{ margin: "8px 0" }}>{quiz.current.it}</div>
                  <Button size="sm" variant="ghost" ariaLabel="Hear it" onClick={() => quiz.current && speech.speak(quiz.current.it)} disabled={!speech.support.tts}>🔊</Button>
                </div>
                <div className="qm" style={{ minHeight: 26, color: "var(--series-1)", fontSize: "1.1rem" }}>
                  {quiz.revealed ? quiz.current.en : ""}
                </div>
                <div className="row" style={{ justifyContent: "center", gap: 10, marginTop: 16 }}>
                  {quiz.revealed ? (
                    <>
                      <Button onClick={() => answer(false)}>Missed it</Button>
                      <Button variant="primary" onClick={() => answer(true)}>Knew it</Button>
                    </>
                  ) : (
                    <Button variant="primary" onClick={() => setQuiz((q) => ({ ...q, revealed: true }))}>Show meaning</Button>
                  )}
                  <Button variant="ghost" onClick={stopQuiz}>Stop</Button>
                </div>
                <p className="muted" style={{ marginTop: 12 }}>
                  {quiz.right} of {quiz.seen} · this word is at box {quiz.current.box || 1} of 5
                </p>
              </div>
            ) : (
              <div style={{ textAlign: "center" }}>
                <p>Done — {quiz.right} of {quiz.seen} correct.</p>
                <Button variant="ghost" onClick={stopQuiz}>Close</Button>
              </div>
            )}
          </Card>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <Card title="Your words">
          <input className="qinput" style={{ marginBottom: 12, fontSize: "0.95rem", padding: 9 }} placeholder="Search your words…" value={search} onChange={(e) => setSearch(e.target.value)} />
          {filtered.length === 0 ? (
            <p className="muted">Empty. Load the core pack, or add the first word you didn't know today.</p>
          ) : (
            <div className="vlist">
              {filtered.slice(0, 400).map((w) => (
                <div className="vitem" key={w.id}>
                  <button className="link-icon" aria-label="Hear it" onClick={() => speech.speak(w.it)} disabled={!speech.support.tts}>🔊</button>
                  <span className="vitem__it">{w.it}</span>
                  <span className="vitem__en">{w.en}</span>
                  <span className="badge">{w.box || 1}/5</span>
                  <button className="link-icon link-icon--danger" aria-label="Delete" onClick={() => removeWord(w.id)}>✕</button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
