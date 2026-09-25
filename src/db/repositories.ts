// =============================================================================
// src/db/repositories.ts
// Application-facing data access. UI and progress logic call these, never IDB
// directly. Every function opens the (memoised) db and seeds on first use.
// =============================================================================

import { getDb } from "./store.js";
import type {
  LessonProgressRecord,
  MilestoneRecord,
  PronunciationAttemptRecord,
  QuizResultRecord,
  StudySessionRecord,
  UserRecord,
} from "./store.js";
import { get, getAll, put, clearStore } from "./idb.js";
import { toISODate, today } from "../util/date.js";

// ---- User -------------------------------------------------------------------

export async function getUser(): Promise<UserRecord> {
  const db = await getDb();
  const user = await get<UserRecord>(db, "meta", "user");
  if (!user) throw new Error("User record missing after seed.");
  return user;
}

export async function saveUser(user: UserRecord): Promise<void> {
  const db = await getDb();
  await put(db, "meta", user);
}

/** Update the target exam date and persist. */
export async function setTargetExamDate(iso: string): Promise<UserRecord> {
  const user = await getUser();
  const updated: UserRecord = { ...user, targetExamDate: iso };
  await saveUser(updated);
  return updated;
}

// ---- Lesson progress --------------------------------------------------------

export async function getAllLessonProgress(): Promise<LessonProgressRecord[]> {
  const db = await getDb();
  return getAll<LessonProgressRecord>(db, "lessonProgress");
}

/** Map of lessonSlug -> record, for fast lookups in selectors/components. */
export async function getProgressMap(): Promise<Map<string, LessonProgressRecord>> {
  const rows = await getAllLessonProgress();
  return new Map(rows.map((r) => [r.lessonSlug, r]));
}

/**
 * Mark a lesson complete or reopen it. Completing stamps completedAt (today)
 * and logs the study time into today's session.
 */
export async function setLessonCompleted(
  lessonSlug: string,
  levelCode: LessonProgressRecord["levelCode"],
  completed: boolean,
  opts: { scorePct?: number; minutes?: number } = {},
): Promise<void> {
  const db = await getDb();
  const existing = await get<LessonProgressRecord>(db, "lessonProgress", lessonSlug);
  const minutes = opts.minutes ?? 15;

  const record: LessonProgressRecord = {
    lessonSlug,
    levelCode,
    status: completed ? "completed" : "not_started",
    timeSpentSeconds: existing?.timeSpentSeconds ?? minutes * 60,
    ...(completed
      ? { completedAt: toISODate(today()), scorePct: opts.scorePct ?? existing?.scorePct ?? 100 }
      : {}),
  };
  await put(db, "lessonProgress", record);

  if (completed) await addStudyMinutes(minutes);
}

// ---- Study sessions ---------------------------------------------------------

export async function getStudySessions(): Promise<StudySessionRecord[]> {
  const db = await getDb();
  return getAll<StudySessionRecord>(db, "studySessions");
}

/** Add minutes (and XP) to today's study session, creating it if needed. */
export async function addStudyMinutes(minutes: number): Promise<void> {
  const db = await getDb();
  const date = toISODate(today());
  const existing = await get<StudySessionRecord>(db, "studySessions", date);
  const record: StudySessionRecord = {
    date,
    minutes: (existing?.minutes ?? 0) + minutes,
    xp: (existing?.xp ?? 0) + minutes * 3,
  };
  await put(db, "studySessions", record);
}

// ---- Milestones -------------------------------------------------------------

export async function getMilestones(): Promise<MilestoneRecord[]> {
  const db = await getDb();
  const rows = await getAll<MilestoneRecord>(db, "milestones");
  return rows.sort((a, b) => a.targetDate.localeCompare(b.targetDate));
}

// ---- Quiz results & pronunciation (Phase 3) --------------------------------

export async function saveQuizResult(record: QuizResultRecord): Promise<void> {
  const db = await getDb();
  await put(db, "quizResults", record);
}

export async function getQuizResults(): Promise<QuizResultRecord[]> {
  const db = await getDb();
  const rows = await getAll<QuizResultRecord>(db, "quizResults");
  return rows.sort((a, b) => b.takenAt.localeCompare(a.takenAt));
}

export async function savePronunciationAttempt(record: PronunciationAttemptRecord): Promise<void> {
  const db = await getDb();
  await put(db, "pronunciationAttempts", record);
}

export async function getPronunciationAttempts(): Promise<PronunciationAttemptRecord[]> {
  const db = await getDb();
  const rows = await getAll<PronunciationAttemptRecord>(db, "pronunciationAttempts");
  return rows.sort((a, b) => b.takenAt.localeCompare(a.takenAt));
}

// ---- Maintenance ------------------------------------------------------------

/** Wipe all user data. The next getDb() call re-seeds from scratch. */
export async function resetAll(): Promise<void> {
  const db = await getDb();
  await clearStore(db, "meta");
  await clearStore(db, "lessonProgress");
  await clearStore(db, "studySessions");
  await clearStore(db, "milestones");
  await clearStore(db, "quizResults");
  await clearStore(db, "pronunciationAttempts");
}
