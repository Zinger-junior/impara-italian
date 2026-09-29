// =============================================================================
// src/progress/gating.ts
// Sequential unlock: a lesson opens only once the previous lesson is *passed*
// (completed at >= PASS_THRESHOLD). Because the curriculum is a flat ordered
// list under the hood, this also gates levels — clearing the last lesson of a
// level unlocks the first lesson of the next. Pure: callers pass the progress
// map fetched from the repositories.
// =============================================================================

import type { CefrLevel } from "../types/index.js";
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

/** slug -> gate state, computed in curriculum order. */
export function gateMap(progress: Map<string, LessonProgressRecord>): Map<string, LessonGate> {
  const map = new Map<string, LessonGate>();
  let prevPassed = true; // the very first lesson is always open
  let prevTitle = "";

  for (const ref of flatLessons()) {
    const rec = progress.get(ref.slug);
    const passed = isPassed(rec);
    const attempted = !!rec && (rec.status === "completed" || rec.status === "in_progress");
    const locked = !prevPassed;

    const gate: LessonGate = { locked, passed, attempted };
    if (rec?.scorePct != null) gate.scorePct = rec.scorePct;
    if (locked) gate.needsPrev = prevTitle;
    map.set(ref.slug, gate);

    prevPassed = passed;
    prevTitle = ref.title;
  }
  return map;
}

/** The first unlocked-but-not-yet-passed lesson — i.e. "what to do next". */
export function nextLesson(progress: Map<string, LessonProgressRecord>): LessonRef | null {
  const gates = gateMap(progress);
  for (const ref of flatLessons()) {
    const gate = gates.get(ref.slug);
    if (gate && !gate.locked && !gate.passed) return ref;
  }
  return null; // everything passed
}
