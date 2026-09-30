// =============================================================================
// src/pages/CurriculumBrowser.tsx
// Browse the A0→B2 curriculum. Lessons unlock in order: each opens only once the
// previous one is passed (>= the pass mark) on its lesson check. Open any
// unlocked lesson for its full context — grammar, examples, the trap, a mission,
// a culture note, a "say it from memory" line, links to the cheat-sheet and free
// resources — and take the check that unlocks the next lesson.
// =============================================================================

import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge, Button, ErrorState, PageHead, ProgressBar, RichText, Segmented, Spinner } from "../ui/components.js";
import { LessonCheckRunner } from "../ui/LessonCheckRunner.js";
import { useAsync } from "../hooks/useAsync.js";
import { useSpeech } from "../hooks/useSpeech.js";
import type { UseSpeech } from "../hooks/useSpeech.js";
import { getProgressMap, getUser, recordLessonCheck, setLessonCompleted } from "../db/repositories.js";
import { CURRICULUM } from "../data/curriculum.js";
import { LESSON_DETAIL } from "../data/lessonDetail.js";
import type { LessonDetail } from "../data/lessonDetail.js";
import { LESSON_CHECKS } from "../data/lessonChecks.js";
import { GRAMMAR_TOPICS } from "../data/grammar.js";
import { resourceById } from "../data/resources.js";
import { levelProgress } from "../progress/selectors.js";
import { PASS_THRESHOLD, gateMap, nextLesson } from "../progress/gating.js";
import { dueSlugSet } from "../progress/review.js";
import type { LessonGate } from "../progress/gating.js";
import type { CefrLevel } from "../types/index.js";
import type { LessonProgressRecord } from "../db/store.js";

type Filter = "all" | CefrLevel;

interface Bundle {
  progress: Map<string, LessonProgressRecord>;
  entryLevel: CefrLevel;
}

export function CurriculumBrowser() {
  const [filter, setFilter] = useState<Filter>("all");
  const { loading, error, value, reload } = useAsync<Bundle>(async () => {
    const [progress, user] = await Promise.all([getProgressMap(), getUser()]);
    return { progress, entryLevel: user.entryCefr };
  }, []);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const speech = useSpeech();

  if (loading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  const progress = value?.progress ?? new Map<string, LessonProgressRecord>();
  const entryLevel = value?.entryLevel ?? "A0";

  const levels = CURRICULUM.levels.filter((l) => filter === "all" || l.code === filter);
  const progressByLevel = new Map(levelProgress(progress).map((l) => [l.code, l]));
  const gates = gateMap(progress, entryLevel);
  const next = nextLesson(progress, entryLevel);
  const dueSet = dueSlugSet(progress);

  const toggleExpand = (slug: string) =>
    setExpanded((prev) => {
      const nextSet = new Set(prev);
      if (nextSet.has(slug)) nextSet.delete(slug);
      else nextSet.add(slug);
      return nextSet;
    });

  const onCheckResult = async (slug: string, level: CefrLevel, scorePct: number) => {
    await recordLessonCheck(slug, level, scorePct, { minutes: 15, passThreshold: PASS_THRESHOLD });
    reload();
  };

  const onManualComplete = async (slug: string, level: CefrLevel) => {
    await setLessonCompleted(slug, level, true, { scorePct: 100, minutes: 15 });
    reload();
  };

  return (
    <>
      <PageHead
        title="Curriculum"
        sub={`The A0→B2 path unlocks in order — pass each lesson's check at ${PASS_THRESHOLD}% to open the next one.`}
      />

      {next ? (
        <div className="next-up">
          <span className="next-up__label">Next up</span>
          <Badge variant="accent">{next.level}</Badge>
          <strong>{next.title}</strong>
        </div>
      ) : (
        <div className="next-up next-up--done">
          <strong>🎉 You've passed every lesson.</strong>
          <span className="muted"> Keep them sharp with the drill and mock exam.</span>
        </div>
      )}

      <div style={{ margin: "20px 0" }}>
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
                  const gate: LessonGate = gates.get(lesson.slug) ?? { locked: false, passed: false, placedOut: false, attempted: false };
                  const isOpen = expanded.has(lesson.slug);
                  const detail = LESSON_DETAIL[lesson.slug];
                  const check = LESSON_CHECKS[lesson.slug];

                  const statusGlyph = gate.locked ? "🔒" : gate.passed ? "✓" : "";
                  const statusClass =
                    "lesson__status" +
                    (gate.locked ? " lesson__status--locked" : gate.passed ? " lesson__status--done" : "");

                  return (
                    <div className="lesson-wrap" key={lesson.slug}>
                      <div className={`lesson${gate.locked ? " lesson--locked" : ""}`}>
                        <span className={statusClass} aria-hidden="true">{statusGlyph}</span>
                        <button
                          className="lesson__body lesson__body--btn"
                          onClick={() => toggleExpand(lesson.slug)}
                          aria-expanded={isOpen}
                        >
                          <div className="lesson__title">{lesson.title}</div>
                          <div className="lesson__obj">{lesson.objective}</div>
                        </button>
                        {gate.attempted && gate.scorePct != null && (
                          <span className={`lesson__score${gate.passed ? " lesson__score--pass" : ""}`}>
                            {gate.scorePct}%
                          </span>
                        )}
                        {gate.placedOut && <span className="due-chip placed-chip">Placed out</span>}
                        {gate.passed && dueSet.has(lesson.slug) && (
                          <span className="due-chip" title="Due for a spaced review">↻ Review</span>
                        )}
                        <span className="lesson__mins">{lesson.estimatedMinutes} min</span>
                        <span className={`chev${isOpen ? " chev--open" : ""}`} aria-hidden="true">▸</span>
                      </div>

                      {isOpen && gate.locked && (
                        <div className="lesson-detail">
                          <div className="lock-note">
                            🔒 Locked. Pass <strong>{gate.needsPrev}</strong> at {PASS_THRESHOLD}% to unlock this lesson.
                          </div>
                        </div>
                      )}

                      {isOpen && !gate.locked && (
                        <div className="lesson-detail">
                          {detail ? (
                            <LessonDetailView detail={detail} speech={speech} />
                          ) : (
                            <p className="muted">More detail for this lesson is coming soon.</p>
                          )}

                          <div className="ld-block" style={{ marginTop: 16 }}>
                            <div className="ld-label">
                              {gate.passed ? "Passed — retake to raise your score" : "Pass this to unlock the next lesson"}
                            </div>
                            {check ? (
                              <LessonCheckRunner
                                check={check}
                                speech={speech}
                                onResult={(pct) => onCheckResult(lesson.slug, level.code, pct)}
                              />
                            ) : (
                              <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                                <p className="muted" style={{ margin: 0 }}>No check for this lesson yet.</p>
                                <Button size="sm" variant="primary" onClick={() => onManualComplete(lesson.slug, level.code)}>
                                  Mark complete
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
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

function LessonDetailView(props: { detail: LessonDetail; speech: UseSpeech }) {
  const { detail, speech } = props;
  const topic = detail.grammarTopicId ? GRAMMAR_TOPICS.find((t) => t.id === detail.grammarTopicId) : undefined;
  const resources = (detail.resourceIds ?? []).map(resourceById).filter((r): r is NonNullable<typeof r> => !!r);

  return (
    <>
      {detail.grammarNote && (
        <div className="ld-block">
          <div className="ld-label">Grammar</div>
          <p><RichText text={detail.grammarNote} /></p>
        </div>
      )}

      {detail.examples && detail.examples.length > 0 && (
        <div className="ld-block">
          <div className="ld-label">Examples</div>
          {detail.examples.map((ex, i) => (
            <div className="ld-example" key={i}>
              <button className="link-icon" aria-label="Hear it" onClick={() => speech.speak(ex.it)} disabled={!speech.support.tts}>🔊</button>
              <div>
                <div className="ld-example__it">{ex.it}</div>
                <div className="ld-example__en">{ex.en}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {detail.trap && <div className="callout callout--trap"><RichText text={detail.trap} /></div>}

      {detail.mission && (
        <div className="callout callout--mission">
          <strong>Mission · </strong><RichText text={detail.mission} />
        </div>
      )}

      {detail.culture && (
        <div className="callout callout--culture">
          <strong>In Italy · </strong><RichText text={detail.culture} />
        </div>
      )}

      {detail.proof && (
        <div className="ld-block">
          <div className="ld-label">Say it from memory</div>
          <div className="ld-example">
            <button className="link-icon" aria-label="Hear it" onClick={() => speech.speak(detail.proof!.it)} disabled={!speech.support.tts}>🔊</button>
            <div>
              <div className="ld-example__it">{detail.proof.it}</div>
              <div className="ld-example__en">{detail.proof.en}</div>
            </div>
          </div>
        </div>
      )}

      {(topic || resources.length > 0) && (
        <div className="ld-links">
          {topic && <Link className="chip-link" to="/grammar">Cheat sheet: {topic.title} →</Link>}
          {resources.map((r) => (
            <a key={r.id} className="chip-link" href={r.url} target="_blank" rel="noopener noreferrer">{r.name} ↗</a>
          ))}
        </div>
      )}
    </>
  );
}
