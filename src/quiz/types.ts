// =============================================================================
// src/quiz/types.ts
// The quiz domain model: the discriminated union of question types, learner
// responses, and graded results. Shared by the generator, grader, and UI.
// =============================================================================

import type { CefrLevel, Mood } from "../types/index.js";

export type QuestionType =
  | "multiple_choice"
  | "conjugation"
  | "fill_blank"
  | "pronunciation"
  | "listening";

interface BaseQuestion {
  id: string;
  type: QuestionType;
  /** Instruction or carrier sentence shown to the learner. */
  prompt: string;
  cefrLevel: CefrLevel;
  /** Shown after answering. */
  explanation?: string;
}

/** Pick the correct option. */
export interface MultipleChoiceQuestion extends BaseQuestion {
  type: "multiple_choice";
  options: string[];
  correctIndex: number;
}

/** Produce a specific conjugated form (graded via the Phase 1 engine's answer). */
export interface ConjugationQuestion extends BaseQuestion {
  type: "conjugation";
  infinitive: string;
  mood: Mood;
  tense: string;
  /** Person index 0..5 (io..loro). */
  person: number;
  answer: string;
  acceptable: string[];
}

/** Fill the blank in a carrier sentence. */
export interface FillBlankQuestion extends BaseQuestion {
  type: "fill_blank";
  answer: string;
  acceptable: string[];
}

/** Say the target aloud; scored by STT similarity. */
export interface PronunciationQuestion extends BaseQuestion {
  type: "pronunciation";
  targetText: string;
  translation?: string;
}

/** Hear a phrase (TTS), then choose what was said / its meaning. */
export interface ListeningQuestion extends BaseQuestion {
  type: "listening";
  audioText: string;
  options: string[];
  correctIndex: number;
}

export type Question =
  | MultipleChoiceQuestion
  | ConjugationQuestion
  | FillBlankQuestion
  | PronunciationQuestion
  | ListeningQuestion;

// ---- Responses --------------------------------------------------------------

export type Response =
  | { kind: "choice"; index: number }
  | { kind: "text"; value: string }
  | { kind: "speech"; transcript: string; confidence: number };

// ---- Graded result ----------------------------------------------------------

export interface GradedAnswer {
  questionId: string;
  correct: boolean;
  /** 0..100. For most types this is 0 or 100; pronunciation is continuous. */
  score: number;
  /** Human-readable feedback (e.g. "Right word, check the accent"). */
  feedback: string;
  /** The expected answer, for review. */
  expected: string;
  /** What the learner supplied, for review. */
  given: string;
}

// ---- Quiz spec + session ----------------------------------------------------

export interface QuizSpec {
  level: CefrLevel;
  /** How many questions to generate. */
  length: number;
  /** Which types to include in the mix. */
  types: QuestionType[];
  /** Seed for reproducibility; omit for a random quiz. */
  seed?: number;
}

export interface QuizResultSummary {
  total: number;
  correct: number;
  scorePct: number;
  passed: boolean;
  answers: GradedAnswer[];
  byType: Record<QuestionType, { total: number; correct: number }>;
}
