// =============================================================================
// src/pages/CurriculumBrowser.tsx
// Browse the A0→B2 curriculum tree and mark lessons complete. Toggling a lesson
// writes to IndexedDB (and logs study time), then refreshes so the dashboard
// and timeline reflect it immediately.
// =============================================================================

import { useState } from "react";
import { Badge, Card, ErrorState, PageHead, ProgressBar, Segmented, Spinner } from "../ui/components.js";
import { useAsync } from "../hooks/useAsync.js";
import { getProgressMap, setLessonCompleted } from "../db/repositories.js";
import { CURRICULUM } from "../data/curriculum.js";
import { levelProgress } from "../progress/selectors.js";
import type { CefrLevel } from "../types/index.js";
import type { LessonProgressRecord } from "../db/store.js";

type Filter = "all" | CefrLevel;

export function CurriculumBrowser() {
  const [filter, setFilter] = useState<Filter>("all");
  const { loading, error, value, reload } = useAsync<Map<string, LessonProgressRecord>>(
    () => getProgressMap(),
    [],
  );
  const [busy, setBusy] = useState<string | null>(null);

  if (loading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  const progress = value ?? new Map();

  const levels = CURRICULUM.levels.filter((l) => filter === "all" || l.code === filter);
  const progressByLevel = new Map(levelProgress(progress).map((l) => [l.code, l]));

  const toggle = async (slug: string, level: CefrLevel, done: boolean) => {
    setBusy(slug);
    try {
      await setLessonCompleted(slug, level, !done, { minutes: 15 });
      reload();
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <PageHead
        title="Curriculum"
        sub="The full A0→B2 path for CLI Pisa. Tick lessons as you complete them."
      />

      <div style={{ marginBottom: 20 }}>
        <Segmented<Filter>
          ariaLabel="Filter by level"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All" },
            { value: "A0", label: "A0" },
            { value: "A1", label: "A1" },
            { value: "A2", label: "A2" },
            { value: "B1", label: "B1" },
            { value: "B2", label: "B2" },
          ]}
        />
      </div>

      {levels.map((level) => {
        const lp = progressByLevel.get(level.code);
        return (
          <div className="level" key={level.code}>
            <div className="level__head">
              <div className="level__code">{level.code}</div>
              <div style={{ flex: 1 }}>
                <h2>{level.title}</h2>
                <p className="muted" style={{ fontSize: "0.88rem" }}>{level.description}</p>
              </div>
              <Badge>{lp ? `${lp.completed}/${lp.total}` : "0/0"}</Badge>
            </div>

            <div style={{ marginBottom: 16 }}>
              <ProgressBar pct={lp?.pct ?? 0} label={`${level.code} progress`} />
            </div>

            {level.units.map((unit) => (
              <div className="unit" key={unit.slug}>
                <div className="unit__title">{unit.title}</div>
                {unit.lessons.map((lesson) => {
                  const done = progress.get(lesson.slug)?.status === "completed";
                  return (
                    <div className="lesson" key={lesson.slug}>
                      <button
                        className={`lesson__check${done ? " lesson__check--done" : ""}`}
                        aria-pressed={done}
                        aria-label={done ? `Mark ${lesson.title} incomplete` : `Mark ${lesson.title} complete`}
                        disabled={busy === lesson.slug}
                        onClick={() => toggle(lesson.slug, level.code, done)}
                      >
                        {done ? "✓" : ""}
                      </button>
                      <div className="lesson__body">
                        <div className="lesson__title">{lesson.title}</div>
                        <div className="lesson__obj">{lesson.objective}</div>
                      </div>
                      <span className="lesson__mins">{lesson.estimatedMinutes} min</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        );
      })}
    </>
  );
}
