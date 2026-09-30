// =============================================================================
// src/progress/gating.ts
// Sequential unlock: a lesson opens only once the previous lesson is *passed*
// (completed at >= PASS_THRESHOLD). Because the curriculum is a flat ordered
// list under the hood, this also gates levels — clearing the last lesson of a
// level unlocks the first lesson of the next.
//
// Entry level: a learner can start above A0. Lessons in levels below their entry
// level are "placed out" — open to review but not required, and they don't block
// the first lesson of the entry level. Nothing is faked as completed; placed-out
// lessons simply aren't locked and don't count toward mastery. Pure: callers pass
// the progress map (and optionally the entry level).
// =============================================================================

import type { CefrLevel } from "../types/index.js";
import { CEFR_ORDER } from "../types/index.js";
import { CURRICULUM } from "../data/curriculum.js";
import type { LessonProgressRecord } from "../db/store.js";

/** The score a lesson check must reach to unlock the next lesson. */
export const PASS_THRESHOLD = 70;

export interface LessonRef {
  slug: string;
  title: string;
  level: CefrLevel;
  /** Global position in the ordered curriculum. */
  index: number;
}

export interface LessonGate {
  locked: boolean;
  /** Completed at or above the pass mark. */
  passed: boolean;
  /** Below the learner's entry level — open, optional, not required. */
  placedOut: boolean;
  /** Ever attempted (passed or a stored below-mark attempt). */
  attempted: boolean;
  scorePct?: number;
  /** When locked, the title of the lesson you must pass first. */
  needsPrev?: string;
}

/** The whole curriculum flattened into one ordered list of lessons. */
export function flatLessons(): LessonRef[] {
  const out: LessonRef[] = [];
  let index = 0;
  for (const level of CURRICULUM.levels) {
    for (const unit of level.units) {
      for (const lesson of unit.lessons) {
        out.push({ slug: lesson.slug, title: lesson.title, level: level.code, index });
        index++;
      }
    }
  }
  return out;
}

function isPassed(rec: LessonProgressRecord | undefined): boolean {
  // A completed lesson with no stored score is treated as a pass (legacy data).
  return !!rec && rec.status === "completed" && (rec.scorePct ?? 100) >= PASS_THRESHOLD;
}

function levelIndex(level: CefrLevel): number {
  const i = CEFR_ORDER.indexOf(level);
  return i < 0 ? 0 : i;
}

/** slug -> gate state, computed in curriculum order, honouring the entry level. */
export function gateMap(
  progress: Map<string, LessonProgressRecord>,
  entryLevel: CefrLevel = "A0",
): Map<string, LessonGate> {
  const map = new Map<string, LessonGate>();
  const entryIdx = levelIndex(entryLevel);
  let prevPassed = true; // the very first available lesson is always open
  let prevTitle = "";

  for (const ref of flatLessons()) {
    const belowEntry = levelIndex(ref.level) < entryIdx;
    const rec = progress.get(ref.slug);
    const passed = isPassed(rec);
    const attempted = !!rec && (rec.status === "completed" || rec.status === "in_progress");

    // Placed-out lessons are never locked and never block the next lesson.
    const locked = belowEntry ? false : !prevPassed;
    const placedOut = belowEntry && !passed;

    const gate: LessonGate = { locked, passed, placedOut, attempted };
    if (rec?.scorePct != null) gate.scorePct = rec.scorePct;
    if (locked) gate.needsPrev = prevTitle;
    map.set(ref.slug, gate);

    // A real pass, or being placed out, lets the next lesson open.
    prevPassed = passed || belowEntry;
    prevTitle = ref.title;
  }
  return map;
}

/** The first unlocked, not-yet-passed, not-placed-out lesson — "what to do next". */
export function nextLesson(
  progress: Map<string, LessonProgressRecord>,
  entryLevel: CefrLevel = "A0",
): LessonRef | null {
  const gates = gateMap(progress, entryLevel);
  for (const ref of flatLessons()) {
    const gate = gates.get(ref.slug);
    if (gate && !gate.locked && !gate.passed && !gate.placedOut) return ref;
  }
  return null; // everything passed
}
