// =============================================================================
// src/progress/timeline.ts
// Builds the 1-year study plan and the planned-vs-actual progress series that
// the dashboard timeline chart renders.
//
// Planned curve: a piecewise-linear trajectory whose control points are the
// end-of-level checkpoints (each level should be finished by a date weighted by
// its recommended study hours). Actual curve: cumulative completed lessons by
// week, truncated at the current week (future weeks have no actual value).
// =============================================================================

import type { CefrLevel } from "../types/index.js";
import { CURRICULUM } from "../data/curriculum.js";
import type { LessonProgressRecord, UserRecord } from "../db/store.js";
import { addDays, daysBetween, fromISODate, today } from "../util/date.js";

export interface TimelinePoint {
  weekIndex: number;
  date: Date;
  /** Cumulative lessons the plan expects completed by this week. */
  planned: number;
  /** Cumulative lessons actually completed by this week; null for future weeks. */
  actual: number | null;
}

export interface LevelCheckpoint {
  level: CefrLevel;
  /** Cumulative lesson count through the end of this level. */
  cumulativeLessons: number;
  /** Days from plan start when this level should be finished. */
  dayOffset: number;
}

/** Lessons per level, in curriculum order. */
export function lessonsPerLevel(): { level: CefrLevel; count: number }[] {
  return CURRICULUM.levels.map((l) => ({
    level: l.code,
    count: l.units.reduce((sum, u) => sum + u.lessons.length, 0),
  }));
}

/** Total lessons across the whole curriculum. */
export function totalLessonCount(): number {
  return lessonsPerLevel().reduce((sum, l) => sum + l.count, 0);
}

/**
 * End-of-level control points, spacing the levels across `planDays` in
 * proportion to their recommended study hours.
 */
export function levelCheckpoints(planDays: number): LevelCheckpoint[] {
  const perLevel = lessonsPerLevel();
  const totalHours = CURRICULUM.levels.reduce((s, l) => s + l.recommendedHours, 0) || 1;

  let cumulativeLessons = 0;
  let cumulativeHours = 0;
  return CURRICULUM.levels.map((level, i) => {
    cumulativeLessons += perLevel[i]!.count;
    cumulativeHours += level.recommendedHours;
    return {
      level: level.code,
      cumulativeLessons,
      dayOffset: Math.round((cumulativeHours / totalHours) * planDays),
    };
  });
}

/** Linear interpolation of the planned cumulative lessons at a given day offset. */
function plannedAtDay(dayOffset: number, checkpoints: LevelCheckpoint[]): number {
  if (dayOffset <= 0) return 0;
  let prevDay = 0;
  let prevLessons = 0;
  for (const cp of checkpoints) {
    if (dayOffset <= cp.dayOffset) {
      const span = cp.dayOffset - prevDay || 1;
      const t = (dayOffset - prevDay) / span;
      return prevLessons + t * (cp.cumulativeLessons - prevLessons);
    }
    prevDay = cp.dayOffset;
    prevLessons = cp.cumulativeLessons;
  }
  return prevLessons; // past the final checkpoint
}

/** Count lessons completed on or before a cutoff date. */
function completedBy(progress: LessonProgressRecord[], cutoff: Date): number {
  return progress.filter(
    (p) => p.status === "completed" && p.completedAt && fromISODate(p.completedAt) <= cutoff,
  ).length;
}

/** Build the full weekly planned-vs-actual series for the dashboard chart. */
export function buildTimeline(user: UserRecord, progress: LessonProgressRecord[]): TimelinePoint[] {
  const start = fromISODate(user.startDate);
  const end = fromISODate(user.targetExamDate);
  const planDays = Math.max(daysBetween(start, end), 7);
  const totalWeeks = Math.ceil(planDays / 7);
  const checkpoints = levelCheckpoints(planDays);
  const now = today();

  const points: TimelinePoint[] = [];
  for (let w = 0; w <= totalWeeks; w++) {
    const dayOffset = Math.min(w * 7, planDays);
    const date = addDays(start, dayOffset);
    const isFuture = daysBetween(now, date) > 0;
    points.push({
      weekIndex: w,
      date,
      planned: Math.round(plannedAtDay(dayOffset, checkpoints) * 10) / 10,
      actual: isFuture ? null : completedBy(progress, date),
    });
  }
  return points;
}

/** Are we ahead of, behind, or on the plan right now? */
export function planStatus(
  points: TimelinePoint[],
): { deltaLessons: number; label: "ahead" | "on track" | "behind" } {
  const latest = [...points].reverse().find((p) => p.actual !== null);
  if (!latest) return { deltaLessons: 0, label: "on track" };
  const delta = (latest.actual ?? 0) - latest.planned;
  const rounded = Math.round(delta);
  if (rounded >= 1) return { deltaLessons: rounded, label: "ahead" };
  if (rounded <= -1) return { deltaLessons: rounded, label: "behind" };
  return { deltaLessons: 0, label: "on track" };
}
