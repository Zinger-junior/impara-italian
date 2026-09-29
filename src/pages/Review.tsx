// =============================================================================
// src/pages/Review.tsx
// Practise the mistakes you logged in the conjugation drill. Two views:
//   • Flashcards — see the context, recall the correct form, then reveal it.
//                  "Got it" removes the card; "Keep" leaves it for next time.
//   • List       — every logged mistake, with audio and delete.
// Mistakes live in the `mistakes` IndexedDB store (written by the drill).
// =============================================================================

import { useState } from "react";
import { Badge, Button, Card, ErrorState, PageHead, Segmented, Spinner } from "../ui/components.js";
import { useAsync } from "../hooks/useAsync.js";
import { useSpeech } from "../hooks/useSpeech.js";
import { deleteMistake, getMistakes } from "../db/repositories.js";
import type { MistakeRecord } from "../db/store.js";

type View = "cards" | "list";

export function Review() {
  const { loading, error, value, reload } = useAsync<MistakeRecord[]>(() => getMistakes(), []);
  const [view, setView] = useState<View>("cards");

  if (loading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  const mistakes = value ?? [];

  return (
    <>
      <PageHead
        title="Review"
        badge={<Badge variant="accent">{mistakes.length} logged</Badge>}
        sub="Every form you got wrong in the drill lands here. The fastest gains in a language come from closing the gaps you already know you have."
      />

      {mistakes.length === 0 ? (
        <Card>
          <p className="muted">
            Nothing to review yet. In the conjugation drill, tap <strong>“Log to my mistakes”</strong> whenever
            you slip — they'll show up here for spaced review.
          </p>
        </Card>
      ) : (
        <>
          <div style={{ marginBottom: 20 }}>
            <Segmented<View>
              ariaLabel="Review view"
              value={view}
              onChange={setView}
              options={[
                { value: "cards", label: "Flashcards" },
                { value: "list", label: "List" },
              ]}
            />
          </div>
          {view === "cards" ? (
            <Flashcards mistakes={mistakes} onChange={reload} />
          ) : (
            <MistakeList mistakes={mistakes} onChange={reload} />
          )}
        </>
      )}
    </>
  );
}

function Flashcards(props: { mistakes: MistakeRecord[]; onChange: () => void }) {
  const { mistakes } = props;
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const speech = useSpeech();

  const safeIdx = Math.min(idx, mistakes.length - 1);
  const card = mistakes[safeIdx];
  if (!card) return null;

  const advance = () => {
    setRevealed(false);
    setIdx((i) => (i + 1) % mistakes.length);
  };

  const gotIt = async () => {
    if (card.id !== undefined) await deleteMistake(card.id);
    setRevealed(false);
    setIdx((i) => (mistakes.length <= 1 ? 0 : i % (mistakes.length - 1)));
    props.onChange();
  };

  return (
    <Card>
      <div style={{ textAlign: "center", padding: "8px 0" }}>
        <p className="muted" style={{ marginBottom: 6 }}>
          Card {safeIdx + 1} of {mistakes.length}
        </p>
        {card.note && <div className="review-context">{card.note}</div>}
        <p className="muted" style={{ margin: "10px 0" }}>You wrote:</p>
        <div className="review-bad">{card.bad}</div>

        {revealed ? (
          <>
            <p className="muted" style={{ margin: "14px 0 4px" }}>Correct:</p>
            <div className="row" style={{ justifyContent: "center", gap: 10, alignItems: "center" }}>
              <div className="review-good">{card.good}</div>
              <Button size="sm" variant="ghost" ariaLabel="Hear it" onClick={() => speech.speak(card.good)} disabled={!speech.support.tts}>🔊</Button>
            </div>
            <div className="row" style={{ justifyContent: "center", gap: 10, marginTop: 18 }}>
              <Button onClick={advance}>Keep practising</Button>
              <Button variant="primary" onClick={gotIt}>Got it — remove</Button>
            </div>
          </>
        ) : (
          <div style={{ marginTop: 18 }}>
            <Button variant="primary" onClick={() => setRevealed(true)}>Show correct form</Button>
          </div>
        )}
      </div>
    </Card>
  );
}

function MistakeList(props: { mistakes: MistakeRecord[]; onChange: () => void }) {
  const speech = useSpeech();

  const remove = async (id: number | undefined) => {
    if (id === undefined) return;
    await deleteMistake(id);
    props.onChange();
  };

  return (
    <Card title="All logged mistakes">
      <div className="vlist">
        {props.mistakes.map((m) => (
          <div className="vitem" key={m.id}>
            <button className="link-icon" aria-label="Hear it" onClick={() => speech.speak(m.good)} disabled={!speech.support.tts}>🔊</button>
            <span className="review-bad review-bad--inline">{m.bad}</span>
            <span aria-hidden="true" className="muted">→</span>
            <span className="review-good review-good--inline">{m.good}</span>
            {m.note && <span className="vitem__en">{m.note}</span>}
            <button className="link-icon link-icon--danger" aria-label="Delete" onClick={() => remove(m.id)}>✕</button>
          </div>
        ))}
      </div>
    </Card>
  );
}
