// =============================================================================
// src/pages/Guide.tsx
// Three reference sections behind a segmented switch:
//   • Daily life & culture — the unwritten rules
//   • Can-do checklist      — CEFR self-assessment (persisted)
//   • Missions              — real-world things to go and do (persisted)
// Check-state lives in localStorage (lightweight, no schema change).
// =============================================================================

import { useCallback, useState } from "react";
import { Badge, Card, PageHead, ProgressBar, RichText, Segmented } from "../ui/components.js";
import { CULTURE_SECTIONS } from "../data/culture.js";
import { CAN_DO, CAN_DO_LEVELS } from "../data/canDo.js";
import { MISSIONS, MISSION_KIND_LABEL } from "../data/missions.js";
import type { MissionKind } from "../data/missions.js";

type Section = "culture" | "cando" | "missions";

/** A localStorage-backed set of string ids. */
function useCheckedSet(key: string): [Set<string>, (id: string) => void] {
  const [ids, setIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(key);
      return new Set(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      return new Set();
    }
  });
  const toggle = useCallback(
    (id: string) => {
      setIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        try {
          localStorage.setItem(key, JSON.stringify([...next]));
        } catch {
          /* ignore quota errors */
        }
        return next;
      });
    },
    [key],
  );
  return [ids, toggle];
}

export function Guide() {
  const [section, setSection] = useState<Section>("culture");

  return (
    <>
      <PageHead
        title="Guide"
        sub="The context around the language: how daily life works, what you should be able to do at each level, and things to go and try."
      />

      <div style={{ marginBottom: 20 }}>
        <Segmented<Section>
          ariaLabel="Guide section"
          value={section}
          onChange={setSection}
          options={[
            { value: "culture", label: "Daily life & culture" },
            { value: "cando", label: "Can-do checklist" },
            { value: "missions", label: "Missions" },
          ]}
        />
      </div>

      {section === "culture" && <CultureSection />}
      {section === "cando" && <CanDoSection />}
      {section === "missions" && <MissionsSection />}
    </>
  );
}

function CultureSection() {
  return (
    <div className="stack">
      {CULTURE_SECTIONS.map((s) => (
        <Card key={s.title} title={s.title} hint={s.blurb}>
          <div className="stack" style={{ gap: 10 }}>
            {s.notes.map((n, i) => (
              <div key={i} className="culture-note">
                <div className="culture-note__title">{n.title}</div>
                <div className="culture-note__body"><RichText text={n.body} /></div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

function CanDoSection() {
  const [checked, toggle] = useCheckedSet("impara.cando");
  const done = CAN_DO.filter((c) => checked.has(c.id)).length;
  const pct = Math.round((done / CAN_DO.length) * 100);

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <div className="row row--between" style={{ marginBottom: 6 }}>
          <span className="muted">{done} of {CAN_DO.length} ticked</span>
          <strong>{pct}%</strong>
        </div>
        <ProgressBar pct={pct} label="can-do progress" />
      </div>
      <p className="muted" style={{ marginBottom: 16, fontSize: "0.88rem" }}>
        Tick one only after you've actually done it once, for real, with a person — not after you've read about it.
      </p>
      <div className="stack">
        {CAN_DO_LEVELS.map((level) => (
          <Card key={level} title={`${level} — I can…`}>
            <div className="stack" style={{ gap: 2 }}>
              {CAN_DO.filter((c) => c.level === level).map((c) => (
                <label className="checkline" key={c.id}>
                  <input type="checkbox" checked={checked.has(c.id)} onChange={() => toggle(c.id)} />
                  <span className={checked.has(c.id) ? "checkline__done" : ""}>{c.text}</span>
                </label>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

function MissionsSection() {
  const [done, toggle] = useCheckedSet("impara.missions");
  const kinds: MissionKind[] = ["real-world", "speak", "listen", "read", "write"];

  return (
    <>
      <p className="muted" style={{ marginBottom: 16, fontSize: "0.88rem" }}>
        Concrete things to do that turn study into contact with the language. Do one a day; tick it when it's genuinely done.
      </p>
      <div className="stack">
        {kinds.map((kind) => {
          const items = MISSIONS.filter((m) => m.kind === kind);
          if (items.length === 0) return null;
          return (
            <Card key={kind} title={MISSION_KIND_LABEL[kind]}>
              <div className="stack" style={{ gap: 2 }}>
                {items.map((m) => (
                  <label className="checkline" key={m.id}>
                    <input type="checkbox" checked={done.has(m.id)} onChange={() => toggle(m.id)} />
                    <span className={done.has(m.id) ? "checkline__done" : ""}>{m.text}</span>
                    <Badge>{m.level}</Badge>
                  </label>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
