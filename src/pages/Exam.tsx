// =============================================================================
// src/pages/Exam.tsx
// CLI-Pisa mock exam: setup → timed runner → weighted results. Production
// sections are scored heuristically (length/engagement) and clearly labelled as
// such, with a self-assessment slider to override.
// =============================================================================

import { useState } from "react";
import { Badge, Button, Card, PageHead, ProgressRow, Segmented, Stat } from "../ui/components.js";
import { ExamRunner } from "../ui/exam/ExamRunner.js";
import { buildExam } from "../exam/builder.js";
import { gradeExam } from "../exam/grader.js";
import type { Exam, ExamResponse, ExamResult } from "../exam/types.js";
import { addStudyMinutes } from "../db/repositories.js";
import type { CefrLevel } from "../types/index.js";

type Phase = "setup" | "running" | "done";

export function ExamPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [level, setLevel] = useState<CefrLevel>("B1");
  const [exam, setExam] = useState<Exam | null>(null);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [responses, setResponses] = useState<Map<string, ExamResponse>>(new Map());

  const start = () => {
    setExam(buildExam(level));
    setResult(null);
    setPhase("running");
  };

  const onComplete = async (r: ExamResult, resp: Map<string, ExamResponse>) => {
    setResult(r);
    setResponses(resp);
    await addStudyMinutes(20);
    setPhase("done");
  };

  if (phase === "running" && exam) {
    return (
      <>
        <PageHead title={exam.title} sub={`${exam.totalMinutes} minuti · soglia ${exam.passThresholdPct}%`} />
        <ExamRunner exam={exam} onComplete={onComplete} />
      </>
    );
  }

  if (phase === "done" && result && exam) {
    return (
      <ExamResults
        exam={exam}
        result={result}
        responses={responses}
        onRegrade={setResult}
        onRetake={() => start()}
        onNew={() => setPhase("setup")}
      />
    );
  }

  return (
    <>
      <PageHead title="Mock exam" sub="A CLI-Pisa-style test across all five skills, under time pressure." />
      <div className="setup-grid" style={{ maxWidth: 560 }}>
        <Card title="Choose your level">
          <Segmented<CefrLevel>
            ariaLabel="Exam level"
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
        <Card title="Format" hint="Weighted like the real thing">
          <div className="stack">
            <div className="row row--between"><span>Ascolto</span><Badge>25%</Badge></div>
            <div className="row row--between"><span>Lettura</span><Badge>25%</Badge></div>
            <div className="row row--between"><span>Analisi delle strutture</span><Badge>25%</Badge></div>
            <div className="row row--between"><span>Produzione scritta</span><Badge>15%</Badge></div>
            <div className="row row--between"><span>Produzione orale</span><Badge>10%</Badge></div>
          </div>
          <p className="muted" style={{ marginTop: 12, fontSize: "0.85rem" }}>
            Production sections are auto-scored by length/engagement — a proxy, not an examiner’s judgement. You can self-assess afterwards.
          </p>
        </Card>
        <div>
          <Button variant="primary" onClick={start}>Begin exam →</Button>
        </div>
      </div>
    </>
  );
}

// ---- Results ----------------------------------------------------------------

function ExamResults(props: {
  exam: Exam;
  result: ExamResult;
  responses: Map<string, ExamResponse>;
  onRegrade: (r: ExamResult) => void;
  onRetake: () => void;
  onNew: () => void;
}) {
  const { exam, result, responses } = props;
  const [overrides, setOverrides] = useState<Partial<Record<ExamResult["sections"][number]["skill"], number>>>({});

  const applyOverride = (skill: "produzione_scritta" | "produzione_orale", value: number) => {
    const next = { ...overrides, [skill]: value };
    setOverrides(next);
    props.onRegrade(gradeExam(exam, responses, next));
  };

  return (
    <>
      <PageHead
        title="Exam results"
        badge={<Badge variant={result.passed ? "good" : "default"} dot>{result.passed ? "Promosso" : "Non superato"}</Badge>}
        sub={`Livello ${result.level} · soglia ${result.passThresholdPct}%`}
      />

      <div className="grid grid--stats" style={{ marginBottom: 24 }}>
        <Card>
          <Stat label="Voto finale" value={`${result.overallPct}%`} meta={result.passed ? "Superato 🎉" : `Servono ${result.passThresholdPct}%`} />
        </Card>
        {result.sections.map((s) => (
          <Card key={s.skill}>
            <Stat label={s.title} value={`${s.scorePct}%`} meta={`peso ${s.weightPct}% → ${s.weighted} pt${s.heuristic ? " · auto" : ""}`} />
          </Card>
        ))}
      </div>

      <Card title="Section breakdown" hint="Weighted contribution to the final mark">
        <div className="stack">
          {result.sections.map((s) => (
            <ProgressRow key={s.skill} label={s.title} pct={s.scorePct} meta={`${s.weighted}/${s.weightPct}`} />
          ))}
        </div>
      </Card>

      <div style={{ marginTop: 24 }}>
        <Card title="Self-assess production" hint="Auto-scores are a length proxy — set your own honest marks">
          {(["produzione_scritta", "produzione_orale"] as const).map((skill) => {
            const section = result.sections.find((s) => s.skill === skill);
            const label = skill === "produzione_scritta" ? "Produzione scritta" : "Produzione orale";
            const value = overrides[skill] ?? section?.scorePct ?? 0;
            return (
              <div key={skill} style={{ marginBottom: 16 }}>
                <div className="row row--between" style={{ marginBottom: 6 }}>
                  <span>{label}</span>
                  <strong>{value}%</strong>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={value}
                  style={{ width: "100%", accentColor: "var(--series-1)" }}
                  onChange={(e) => applyOverride(skill, Number(e.target.value))}
                />
              </div>
            );
          })}
        </Card>
      </div>

      <div className="row" style={{ marginTop: 24, gap: 12 }}>
        <Button variant="primary" onClick={props.onRetake}>Retake</Button>
        <Button variant="ghost" onClick={props.onNew}>Change level</Button>
      </div>
    </>
  );
}
