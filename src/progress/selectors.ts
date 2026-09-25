// =============================================================================
// src/progress/selectors.ts
// Pure derivations over progress + study data for the dashboard. No I/O here —
// callers pass in records fetched from the repositories.
// =============================================================================

import type { CefrLevel } from "../types/index.js";
import { CURRICULUM } from "../data/curriculum.js";
import type { LessonProgressRecord, StudySessionRecord } from "../db/store.js";
import { addDays, daysBetween, fromISODate, toISODate, today } from "../util/date.js";

export interface LevelProgress {
  code: CefrLevel;
  title: string;
  completed: number;
  total: number;
  pct: number;
}

/** Per-level completion, in curriculum order. */
export function levelProgress(progress: Map<string, LessonProgressRecord>): LevelProgress[] {
  return CURRICULUM.levels.map((level) => {
    const lessons = level.units.flatMap((u) => u.lessons);
    const completed = lessons.filter(
      (l) => progress.get(l.slug)?.status === "completed",
    ).length;
    const total = lessons.length;
    return {
      code: level.code,
      title: level.title,
      completed,
      total,
      pct: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  });
}

export interface OverallStats {
  lessonsCompleted: number;
  lessonsTotal: number;
  masteryPct: number;
  totalMinutes: number;
  totalXp: number;
  streakDays: number;
}

/** Headline dashboard numbers. */
export function overallStats(
  progress: Map<string, LessonProgressRecord>,
  sessions: StudySessionRecord[],
): OverallStats {
  const levels = levelProgress(progress);
  const lessonsCompleted = levels.reduce((s, l) => s + l.completed, 0);
  const lessonsTotal = levels.reduce((s, l) => s + l.total, 0);
  const totalMinutes = sessions.reduce((s, x) => s + x.minutes, 0);
  const totalXp = sessions.reduce((s, x) => s + x.xp, 0);
  return {
    lessonsCompleted,
    lessonsTotal,
    masteryPct: lessonsTotal === 0 ? 0 : Math.round((lessonsCompleted / lessonsTotal) * 100),
    totalMinutes,
    totalXp,
    streakDays: computeStreak(sessions),
  };
}

/**
 * Current daily streak: consecutive days with a study session, counting back
 * from today (or yesterday, so the streak survives until end of day).
 */
export function computeStreak(sessions: StudySessionRecord[]): number {
  if (sessions.length === 0) return 0;
  const studied = new Set(sessions.filter((s) => s.minutes > 0).map((s) => s.date));
  const now = today();

  // Allow the streak to "start" at today or yesterday, so it survives the day.
  const anchor = studied.has(toISODate(now))
    ? 0
    : studied.has(toISODate(addDays(now, -1)))
      ? 1
      : -1;
  if (anchor === -1) return 0;

  let streak = 0;
  for (let d = anchor; studied.has(toISODate(addDays(now, -d))); d++) {
    streak++;
  }
  return streak;
}

/** Days remaining until the target exam date (never negative). */
export function daysUntilExam(targetExamDateIso: string): number {
  return Math.max(0, daysBetween(today(), fromISODate(targetExamDateIso)));
}
