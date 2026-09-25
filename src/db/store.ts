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
// First run seeds a demo learner with a 1-year plan and a modest, clearly
// labelled sample of real progress so the dashboard and timeline render with
// data. resetAll() (in repositories) wipes it back to a clean seed.
// =============================================================================

import type { CefrLevel } from "../types/index.js";
import { CURRICULUM } from "../data/curriculum.js";
import { openDatabase, get, putMany, put } from "./idb.js";
import { addDays, daysBetween, toISODate, today } from "../util/date.js";

export const DB_NAME = "impara";
export const DB_VERSION = 2;
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
}

export type LessonStatus = "not_started" | "in_progress" | "completed";

export interface LessonProgressRecord {
  lessonSlug: string;
  levelCode: CefrLevel;
  status: LessonStatus;
  scorePct?: number;
  /** ISO date the lesson was completed (present when status === completed). */
  completedAt?: string;
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

  const start = addDays(today(), -21); // plan began 3 weeks ago
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

  // --- Sample completed lessons: the first A0 unit + a couple of A1 lessons,
  //     with completion dates spread across the past three weeks. ---
  const seededLessons: { levelCode: CefrLevel; slug: string; daysAgo: number; score: number }[] = [
    { levelCode: "A0", slug: "alfabeto", daysAgo: 20, score: 100 },
    { levelCode: "A0", slug: "suoni-difficili", daysAgo: 18, score: 90 },
    { levelCode: "A0", slug: "saluti", daysAgo: 15, score: 95 },
    { levelCode: "A0", slug: "mi-chiamo", daysAgo: 13, score: 88 },
    { levelCode: "A1", slug: "presente-essere", daysAgo: 9, score: 92 },
    { levelCode: "A1", slug: "presente-avere", daysAgo: 6, score: 84 },
    { levelCode: "A1", slug: "verbi-are", daysAgo: 2, score: 78 },
  ];

  const progress: LessonProgressRecord[] = seededLessons.map((s) => ({
    lessonSlug: s.slug,
    levelCode: s.levelCode,
    status: "completed",
    scorePct: s.score,
    completedAt: toISODate(addDays(today(), -s.daysAgo)),
    timeSpentSeconds: 20 * 60,
  }));
  await putMany(db, "lessonProgress", progress);

  // --- Study sessions: most days over the past three weeks. ---
  const sessions: StudySessionRecord[] = [];
  for (let d = 21; d >= 0; d--) {
    // Skip a few days to make the streak realistic rather than perfect.
    if (d === 17 || d === 12 || d === 5) continue;
    const date = toISODate(addDays(today(), -d));
    const minutes = 15 + ((d * 7) % 30); // deterministic 15–44 min
    sessions.push({ date, minutes, xp: minutes * 3 });
  }
  await putMany(db, "studySessions", sessions);

  // --- Milestones: end-of-level checkpoints across the 1-year plan. ---
  const ends = levelEndDates(start);
  const milestones: MilestoneRecord[] = ends.map(({ level, date }) => {
    const record: MilestoneRecord = {
      label: `Complete ${level}`,
      targetLevel: level,
      targetDate: toISODate(date),
    };
    // Mark A0 achieved (its sample lessons are all done and its date has passed).
    if (level === "A0" && daysBetween(date, today()) >= 0) {
      record.achievedAt = toISODate(addDays(today(), -12));
    }
    return record;
  });
  await putMany(db, "milestones", milestones);
}
