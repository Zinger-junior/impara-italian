// =============================================================================
// src/data/achievements.ts
// Lightweight achievement badges, derived purely from progress/study data. No
// storage of their own — they're recomputed from the numbers you already have,
// so they can never drift out of sync. Callers build the context and call
// computeAchievements().
// =============================================================================

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface AchievementCtx {
  lessonsPassed: number;
  levelsCompleted: number;
  streakDays: number;
  vocabCount: number;
  vocabMastered: number;
  mistakesLogged: number;
  totalMinutes: number;
}

export interface EarnedAchievement extends Achievement {
  earned: boolean;
}

interface AchievementDef extends Achievement {
  test: (c: AchievementCtx) => boolean;
}

const DEFS: AchievementDef[] = [
  { id: "first-lesson", icon: "👟", title: "Primo passo", description: "Pass your first lesson.", test: (c) => c.lessonsPassed >= 1 },
  { id: "five-lessons", icon: "🚶", title: "In cammino", description: "Pass 5 lessons.", test: (c) => c.lessonsPassed >= 5 },
  { id: "ten-lessons", icon: "🏃", title: "A buon ritmo", description: "Pass 10 lessons.", test: (c) => c.lessonsPassed >= 10 },
  { id: "level-one", icon: "🅰️", title: "Livello completo", description: "Finish an entire CEFR level.", test: (c) => c.levelsCompleted >= 1 },
  { id: "level-three", icon: "🏅", title: "A metà strada", description: "Finish three levels.", test: (c) => c.levelsCompleted >= 3 },
  { id: "all-levels", icon: "🏆", title: "Traguardo B2", description: "Finish every level, A0 to B2.", test: (c) => c.levelsCompleted >= 5 },
  { id: "streak-3", icon: "🔥", title: "Tre di fila", description: "Study three days in a row.", test: (c) => c.streakDays >= 3 },
  { id: "streak-7", icon: "🗓️", title: "Una settimana", description: "Keep a 7-day streak.", test: (c) => c.streakDays >= 7 },
  { id: "streak-30", icon: "🌟", title: "Un mese intero", description: "Keep a 30-day streak.", test: (c) => c.streakDays >= 30 },
  { id: "vocab-50", icon: "📇", title: "Cinquanta parole", description: "Log 50 vocabulary words.", test: (c) => c.vocabCount >= 50 },
  { id: "vocab-200", icon: "📚", title: "Duecento parole", description: "Log 200 vocabulary words.", test: (c) => c.vocabCount >= 200 },
  { id: "vocab-master", icon: "🧠", title: "In testa", description: "Master 20 words (Leitner box 5).", test: (c) => c.vocabMastered >= 20 },
  { id: "mistakes-10", icon: "🩹", title: "Impara dagli errori", description: "Log 10 mistakes to review.", test: (c) => c.mistakesLogged >= 10 },
  { id: "hours-10", icon: "⏱️", title: "Dieci ore", description: "Study for 10 hours in total.", test: (c) => c.totalMinutes >= 600 },
  { id: "hours-50", icon: "⛰️", title: "Cinquanta ore", description: "Study for 50 hours in total.", test: (c) => c.totalMinutes >= 3000 },
];

/** All achievements with an `earned` flag, earned ones first. */
export function computeAchievements(ctx: AchievementCtx): EarnedAchievement[] {
  const scored = DEFS.map((d) => ({ id: d.id, icon: d.icon, title: d.title, description: d.description, earned: d.test(ctx) }));
  return scored.sort((a, b) => Number(b.earned) - Number(a.earned));
}

export function earnedCount(ctx: AchievementCtx): { earned: number; total: number } {
  const earned = DEFS.filter((d) => d.test(ctx)).length;
  return { earned, total: DEFS.length };
}
