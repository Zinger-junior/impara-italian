// =============================================================================
// src/db/repositories.ts
// Application-facing data access. UI and progress logic call these, never IDB
// directly. Every function opens the (memoised) db and seeds on first use.
// =============================================================================

import { getDb } from "./store.js";
import type {
  LessonProgressRecord,
  MilestoneRecord,
  MistakeRecord,
  PronunciationAttemptRecord,
  QuizResultRecord,
  StudySessionRecord,
  UserRecord,
  VocabRecord,
} from "./store.js";
import { get, getAll, put, putMany, del, clearStore } from "./idb.js";
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

/**
 * Record a lesson-check attempt. A pass (scorePct >= passThreshold) marks the
 * lesson completed and unlocks the next; a fail is stored as in_progress so it
 * neither unlocks the next lesson nor inflates completion counts. Retaking never
 * relocks: a previous pass and the best score are always kept.
 */
export async function recordLessonCheck(
  lessonSlug: string,
  levelCode: LessonProgressRecord["levelCode"],
  scorePct: number,
  opts: { minutes?: number; passThreshold?: number } = {},
): Promise<{ passed: boolean; bestScore: number }> {
  const db = await getDb();
  const existing = await get<LessonProgressRecord>(db, "lessonProgress", lessonSlug);
  const threshold = opts.passThreshold ?? 70;
  const minutes = opts.minutes ?? 15;

  const prevPassed = existing?.status === "completed" && (existing.scorePct ?? 0) >= threshold;
  const passed = prevPassed || scorePct >= threshold;
  const bestScore = Math.max(scorePct, existing?.scorePct ?? 0);

  const record: LessonProgressRecord = {
    lessonSlug,
    levelCode,
    status: passed ? "completed" : "in_progress",
    scorePct: bestScore,
    timeSpentSeconds: (existing?.timeSpentSeconds ?? 0) + minutes * 60,
    ...(passed
      ? {
          completedAt: existing?.completedAt ?? toISODate(today()),
          lastReviewedAt: toISODate(today()),
          reviewCount: (existing?.reviewCount ?? 0) + 1,
        }
      : {}),
  };
  await put(db, "lessonProgress", record);
  await addStudyMinutes(minutes);

  return { passed, bestScore };
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

// ---- Vocabulary (Leitner SRS) ----------------------------------------------

export async function getVocab(): Promise<VocabRecord[]> {
  const db = await getDb();
  return getAll<VocabRecord>(db, "vocab");
}

/** Add one word. Returns false if the Italian side already exists (case-insensitive). */
export async function addVocabWord(it: string, en: string, theme?: string): Promise<boolean> {
  const db = await getDb();
  const existing = await getAll<VocabRecord>(db, "vocab");
  const key = it.trim().toLowerCase();
  if (!key || existing.some((v) => v.it.trim().toLowerCase() === key)) return false;
  const record: VocabRecord = {
    it: it.trim(),
    en: en.trim(),
    box: 1,
    addedAt: toISODate(today()),
    ...(theme ? { theme } : {}),
  };
  await put(db, "vocab", record);
  return true;
}

/** Bulk add (for the core pack), skipping duplicates. Returns how many were added. */
export async function addVocabWords(
  words: { it: string; en: string; theme?: string }[],
): Promise<number> {
  const db = await getDb();
  const existing = await getAll<VocabRecord>(db, "vocab");
  const seen = new Set(existing.map((v) => v.it.trim().toLowerCase()));
  const fresh: VocabRecord[] = [];
  for (const w of words) {
    const key = w.it.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    fresh.push({
      it: w.it.trim(),
      en: w.en.trim(),
      box: 1,
      addedAt: toISODate(today()),
      ...(w.theme ? { theme: w.theme } : {}),
    });
  }
  if (fresh.length) await putMany(db, "vocab", fresh);
  return fresh.length;
}

/** Update a word's Leitner box after a review (clamped 1..5). */
export async function setVocabBox(record: VocabRecord, box: number): Promise<void> {
  const db = await getDb();
  const updated: VocabRecord = {
    ...record,
    box: Math.max(1, Math.min(5, box)),
    lastReviewedAt: toISODate(today()),
  };
  await put(db, "vocab", updated);
}

export async function deleteVocabWord(id: number): Promise<void> {
  const db = await getDb();
  await del(db, "vocab", id);
}

// ---- Mistake log ------------------------------------------------------------

export async function getMistakes(): Promise<MistakeRecord[]> {
  const db = await getDb();
  const rows = await getAll<MistakeRecord>(db, "mistakes");
  return rows.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
}

export async function addMistake(bad: string, good: string, note?: string): Promise<void> {
  const db = await getDb();
  const record: MistakeRecord = {
    bad: bad.trim(),
    good: good.trim(),
    addedAt: toISODate(today()),
    ...(note && note.trim() ? { note: note.trim() } : {}),
  };
  await put(db, "mistakes", record);
}

export async function deleteMistake(id: number): Promise<void> {
  const db = await getDb();
  await del(db, "mistakes", id);
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
  await clearStore(db, "vocab");
  await clearStore(db, "mistakes");
}
