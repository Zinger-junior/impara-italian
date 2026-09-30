// =============================================================================
// src/db/store.ts
// Database bootstrap: object stores, opening, and first-run seeding.
//
// Persistence model (client-side mirror of the SQL schema's shape):
//   meta            key -> arbitrary record (holds the current user, seed flag)
//   lessonProgress  lessonSlug -> LessonProgressRecord
//   studySessions   date (YYYY-MM-DD) -> StudySessionRecord
//   milestones      id (autoIncrement) -> MilestoneRecord
//
// First run seeds a fresh learner: a 1-year plan starting today, the end-of-level
// milestone checkpoints, and zero progress. Lessons are unlocked by passing their
// checks. resetAll() (in repositories) wipes back to this same clean state.
// =============================================================================

import type { CefrLevel } from "../types/index.js";
import { CURRICULUM } from "../data/curriculum.js";
import { openDatabase, get, putMany, put } from "./idb.js";
import { addDays, toISODate, today } from "../util/date.js";

export const DB_NAME = "impara";
export const DB_VERSION = 3;
export const PLAN_LENGTH_DAYS = 365;

// ---- Record types -----------------------------------------------------------

export interface UserRecord {
  key: "user";
  id: number;
  displayName: string;
  email: string;
  entryCefr: CefrLevel;
  /** ISO date the learner began the plan. */
  startDate: string;
  /** ISO date of the target CLI Pisa exam. */
  targetExamDate: string;
  timezone: string;
  /** Why they're learning (from onboarding). */
  goal?: string;
  /** Daily study intention in minutes (from onboarding). */
  minutesPerDay?: number;
  /** ISO date the onboarding survey was completed. Absent = not yet onboarded. */
  onboardedAt?: string;
}

export type LessonStatus = "not_started" | "in_progress" | "completed";

export interface LessonProgressRecord {
  lessonSlug: string;
  levelCode: CefrLevel;
  status: LessonStatus;
  scorePct?: number;
  /** ISO date the lesson was completed (present when status === completed). */
  completedAt?: string;
  /** ISO date of the most recent passing check (for spaced review). */
  lastReviewedAt?: string;
  /** Number of times the lesson check has been passed (drives review spacing). */
  reviewCount?: number;
  timeSpentSeconds: number;
}

export interface StudySessionRecord {
  date: string; // YYYY-MM-DD
  minutes: number;
  xp: number;
}

export interface MilestoneRecord {
  id?: number; // autoIncrement
  label: string;
  targetLevel: CefrLevel;
  targetDate: string; // ISO date
  achievedAt?: string; // ISO date
}

export interface QuizResultRecord {
  id?: number; // autoIncrement
  /** ISO datetime the quiz was submitted. */
  takenAt: string;
  level: CefrLevel;
  total: number;
  correct: number;
  scorePct: number;
  passed: boolean;
  /** Per-type breakdown, serialised. */
  byTypeJson: string;
}

export interface PronunciationAttemptRecord {
  id?: number; // autoIncrement
  takenAt: string;
  targetText: string;
  recognizedText: string;
  accuracyPct: number;
}

/** A vocabulary card with a Leitner box (1 = new/weak … 5 = mastered). */
export interface VocabRecord {
  id?: number; // autoIncrement
  it: string;
  en: string;
  /** Leitner box, 1..5. */
  box: number;
  /** Optional theme (from the core pack) or "custom". */
  theme?: string;
  addedAt: string; // ISO date
  lastReviewedAt?: string;
}

/** A logged mistake to review later. */
export interface MistakeRecord {
  id?: number; // autoIncrement
  bad: string;
  good: string;
  note?: string;
  addedAt: string; // ISO date
}

// ---- Open -------------------------------------------------------------------

let dbPromise: Promise<IDBDatabase> | null = null;

/** Open the database (memoised) and ensure first-run seed data exists. */
export async function getDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = openDatabase(DB_NAME, DB_VERSION, (db) => {
      if (!db.objectStoreNames.contains("meta")) {
        db.createObjectStore("meta", { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains("lessonProgress")) {
        db.createObjectStore("lessonProgress", { keyPath: "lessonSlug" });
      }
      if (!db.objectStoreNames.contains("studySessions")) {
        db.createObjectStore("studySessions", { keyPath: "date" });
      }
      if (!db.objectStoreNames.contains("milestones")) {
        db.createObjectStore("milestones", { keyPath: "id", autoIncrement: true });
      }
      // v2: quiz + pronunciation history (Phase 3).
      if (!db.objectStoreNames.contains("quizResults")) {
        db.createObjectStore("quizResults", { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("pronunciationAttempts")) {
        db.createObjectStore("pronunciationAttempts", { keyPath: "id", autoIncrement: true });
      }
      // v3: vocabulary (Leitner) + mistake log.
      if (!db.objectStoreNames.contains("vocab")) {
        db.createObjectStore("vocab", { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("mistakes")) {
        db.createObjectStore("mistakes", { keyPath: "id", autoIncrement: true });
      }
    });
  }
  const db = await dbPromise;
  await seedIfEmpty(db);
  return db;
}

// ---- Seeding ----------------------------------------------------------------

/** Compute a milestone target date for the END of each level, from study-hour weight. */
export function levelEndDates(startDate: Date): { level: CefrLevel; date: Date }[] {
  const levels = CURRICULUM.levels;
  const totalHours = levels.reduce((sum, l) => sum + l.recommendedHours, 0) || 1;
  let cumulativeHours = 0;
  return levels.map((level) => {
    cumulativeHours += level.recommendedHours;
    const fraction = cumulativeHours / totalHours;
    return { level: level.code, date: addDays(startDate, Math.round(PLAN_LENGTH_DAYS * fraction)) };
  });
}

async function seedIfEmpty(db: IDBDatabase): Promise<void> {
  const existing = await get<UserRecord>(db, "meta", "user");
  if (existing) return;

  // A genuine clean start: the plan begins today with zero progress.
  const start = today();
  const target = addDays(start, PLAN_LENGTH_DAYS);

  const user: UserRecord = {
    key: "user",
    id: 1,
    displayName: "Studente",
    email: "studente@example.com",
    entryCefr: "A0",
    startDate: toISODate(start),
    targetExamDate: toISODate(target),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Rome",
  };
  await put(db, "meta", user);

  // Plan checkpoints only — end-of-level target dates, none achieved yet.
  // No lessons, scores, study sessions, or streaks are fabricated: a new
  // learner starts at zero and unlocks lessons by passing their checks.
  const ends = levelEndDates(start);
  const milestones: MilestoneRecord[] = ends.map(({ level, date }) => ({
    label: `Complete ${level}`,
    targetLevel: level,
    targetDate: toISODate(date),
  }));
  await putMany(db, "milestones", milestones);
}

/** Re-create the clean starting state after a wipe. Exported for resetAll(). */
export async function seedFresh(db: IDBDatabase): Promise<void> {
  await seedIfEmpty(db);
}
