// =============================================================================
// src/exam/types.ts
// CLI-Pisa-style standardized exam model. An exam has weighted skill sections;
// each section holds items. Objective items (ascolto/lettura/strutture) grade
// automatically; production items (scritta/orale) are scored by rubric
// heuristics with an optional self-assessment override.
// =============================================================================

import type { CefrLevel } from "../types/index.js";
import type { Question } from "../quiz/types.js";

export type ExamSkill =
  | "ascolto"
  | "lettura"
  | "strutture"
  | "produzione_scritta"
  | "produzione_orale";

export interface ReadingPassage {
  id: string;
  title: string;
  level: CefrLevel;
  text: string;
}

interface ItemBase {
  id: string;
  skill: ExamSkill;
}

/** Listening comprehension: TTS reads `audioText`, learner answers `question`. */
export interface AscoltoItem extends ItemBase {
  skill: "ascolto";
  audioText: string;
  question: string;
  options: string[];
  correctIndex: number;
}

/** Reading comprehension against a passage. */
export interface LetturaItem extends ItemBase {
  skill: "lettura";
  passageId: string;
  question: string;
  options: string[];
  correctIndex: number;
}

/** Grammar under exam conditions — wraps a generated quiz Question. */
export interface StruttureItem extends ItemBase {
  skill: "strutture";
  question: Question;
}

/** Written production prompt. */
export interface ScrittaItem extends ItemBase {
  skill: "produzione_scritta";
  prompt: string;
  minWords: number;
}

/** Spoken production prompt (STT captures the attempt). */
export interface OraleItem extends ItemBase {
  skill: "produzione_orale";
  prompt: string;
  minWords: number;
}

export type ExamItem = AscoltoItem | LetturaItem | StruttureItem | ScrittaItem | OraleItem;

export interface ExamSection {
  skill: ExamSkill;
  title: string;
  /** Contribution to the final mark (all sections sum to 100). */
  weightPct: number;
  timeMinutes: number;
  items: ExamItem[];
  /** Present for the lettura section. */
  passage?: ReadingPassage;
}

export interface Exam {
  id: string;
  level: CefrLevel;
  title: string;
  totalMinutes: number;
  passThresholdPct: number;
  sections: ExamSection[];
}

// ---- Responses & grading ----------------------------------------------------

/** Learner responses, keyed by item id. Reuses the quiz response shapes. */
export type ExamResponse =
  | { kind: "choice"; index: number }
  | { kind: "text"; value: string }
  | { kind: "speech"; transcript: string; confidence: number };

export interface SectionResult {
  skill: ExamSkill;
  title: string;
  weightPct: number;
  /** 0..100 within the section. */
  scorePct: number;
  /** Weighted contribution to the final mark (scorePct * weight / 100). */
  weighted: number;
  itemsGraded: number;
  itemsCorrect: number;
  /** True for production sections scored heuristically, not by a key. */
  heuristic: boolean;
}

export interface ExamResult {
  level: CefrLevel;
  overallPct: number;
  passed: boolean;
  passThresholdPct: number;
  sections: SectionResult[];
}
