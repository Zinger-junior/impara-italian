// =============================================================================
// src/progress/review.ts
// A lightweight spaced-review scheduler for *passed* lessons. Each pass bumps a
// reviewCount and stamps lastReviewedAt (see recordLessonCheck). From those two
// numbers we compute an expanding interval (1 → 3 → 7 → 16 → 35 → 90 days) and
// surface the lessons whose interval has elapsed, so knowledge you've unlocked
// gets refreshed before it fades. Pure: callers pass the progress map.
// =============================================================================

import type { CefrLevel } from "../types/index.js";
import type { LessonProgressRecord } from "../db/store.js";
import { daysBetween, fromISODate, today } from "../util/date.js";
import { flatLessons, PASS_THRESHOLD } from "./gating.js";

/** Expanding review intervals in days, indexed by (reviewCount - 1). */
export const REVIEW_INTERVALS = [1, 3, 7, 16, 35, 90];

export interface DueReview {
  slug: string;
  title: string;
  level: CefrLevel;
  /** Days past the ideal review date (0 = due today). */
  daysOverdue: number;
  /** How many times it's been passed. */
  reviewCount: number;
}

function intervalFor(reviewCount: number): number {
  const idx = Math.min(Math.max(reviewCount - 1, 0), REVIEW_INTERVALS.length - 1);
  return REVIEW_INTERVALS[idx] ?? 1;
}

function isPassed(rec: LessonProgressRecord | undefined): boolean {
  return !!rec && rec.status === "completed" && (rec.scorePct ?? 100) >= PASS_THRESHOLD;
}

/** Passed lessons whose review interval has elapsed, most overdue first. */
export function dueReviews(progress: Map<string, LessonProgressRecord>): DueReview[] {
  const now = today();
  const out: DueReview[] = [];

  for (const ref of flatLessons()) {
    const rec = progress.get(ref.slug);
    if (!isPassed(rec) || !rec) continue;

    const base = rec.lastReviewedAt ?? rec.completedAt;
    if (!base) continue; // legacy record with no date — skip rather than nag

    const reviewCount = rec.reviewCount ?? 1;
    const elapsed = daysBetween(fromISODate(base), now);
    const daysOverdue = elapsed - intervalFor(reviewCount);
    if (daysOverdue >= 0) {
      out.push({ slug: ref.slug, title: ref.title, level: ref.level, daysOverdue, reviewCount });
    }
  }

  return out.sort((a, b) => b.daysOverdue - a.daysOverdue);
}

/** Set of slugs currently due, for quick lookups in the curriculum view. */
export function dueSlugSet(progress: Map<string, LessonProgressRecord>): Set<string> {
  return new Set(dueReviews(progress).map((d) => d.slug));
}
