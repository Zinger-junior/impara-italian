// =============================================================================
// src/pages/Phrasebook.tsx
// Situational phrasebook with search and text-to-speech on every line.
// =============================================================================

import { useMemo, useState } from "react";
import { Card, PageHead } from "../ui/components.js";
import { useSpeech } from "../hooks/useSpeech.js";
import { PHRASE_GROUPS } from "../data/phrasebook.js";

export function Phrasebook() {
  const [search, setSearch] = useState("");
  const speech = useSpeech();

  const groups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return PHRASE_GROUPS;
    return PHRASE_GROUPS.map((g) => ({
      ...g,
      phrases: g.phrases.filter((p) => p.it.toLowerCase().includes(q) || p.en.toLowerCase().includes(q)),
    })).filter((g) => g.phrases.length > 0);
  }, [search]);

  return (
    <>
      <PageHead
        title="Phrasebook"
        sub="Grouped by the situation you'll be standing in. Tap 🔊 to hear any line. The 'repair your Italian' set matters most — learn it first."
      />

      <input
        className="qinput"
        style={{ marginBottom: 20, fontSize: "0.95rem", padding: 10 }}
        placeholder="Search phrases…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="stack">
        {groups.map((group) => (
          <Card key={group.title} title={group.title} hint={group.blurb}>
            <div className="phrase-list">
              {group.phrases.map((p, i) => (
                <div className="phrase-row" key={i}>
                  <button className="link-icon" aria-label="Hear it" onClick={() => speech.speak(p.it)} disabled={!speech.support.tts}>🔊</button>
                  <div className="phrase-row__body">
                    <div className="phrase-row__it">{p.it}</div>
                    <div className="phrase-row__en">{p.en}</div>
                    {p.note && <div className="phrase-row__note">{p.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
        {groups.length === 0 && <p className="muted">No phrases match “{search}”.</p>}
      </div>
    </>
  );
}
