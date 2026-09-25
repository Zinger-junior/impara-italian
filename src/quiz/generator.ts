// =============================================================================
// src/quiz/generator.ts
// Generates a mixed quiz (all question types) from the curriculum + verb
// lexicon + the Phase 1 conjugation engine. Deterministic under a seed.
//
// CEFR gating: only tenses/moods a learner has met by their level are drilled.
// =============================================================================

import type { CefrLevel, Mood, Paradigm, Verb } from "../types/index.js";
import { PERSONS, CEFR_ORDER } from "../types/index.js";
import { conjugateAll } from "../engine/conjugator.js";
import { VERB_LIST, verbsUpToLevel } from "../data/verbs.js";
import { CURRICULUM } from "../data/curriculum.js";
import { createRng } from "./rng.js";
import type {
  ConjugationQuestion,
  FillBlankQuestion,
  ListeningQuestion,
  MultipleChoiceQuestion,
  PronunciationQuestion,
  Question,
  QuestionType,
  QuizSpec,
} from "./types.js";

interface TenseSlot {
  mood: Mood;
  tense: string;
  label: string;
}

/** Tense/mood slots unlocked at each level (cumulative). */
const SLOTS_BY_LEVEL: Record<CefrLevel, TenseSlot[]> = (() => {
  const a1: TenseSlot[] = [{ mood: "indicativo", tense: "presente", label: "presente" }];
  const a2: TenseSlot[] = [
    ...a1,
    { mood: "indicativo", tense: "passatoProssimo", label: "passato prossimo" },
    { mood: "indicativo", tense: "imperfetto", label: "imperfetto" },
    { mood: "indicativo", tense: "futuroSemplice", label: "futuro semplice" },
  ];
  const b1: TenseSlot[] = [
    ...a2,
    { mood: "condizionale", tense: "presente", label: "condizionale presente" },
    { mood: "congiuntivo", tense: "presente", label: "congiuntivo presente" },
  ];
  const b2: TenseSlot[] = [
    ...b1,
    { mood: "congiuntivo", tense: "imperfetto", label: "congiuntivo imperfetto" },
    { mood: "condizionale", tense: "passato", label: "condizionale passato" },
  ];
  return { A0: a1, A1: a1, A2: a2, B1: b1, B2: b2 };
})();

/** Subject word to front a fill-blank carrier sentence, by person index. */
const SUBJECTS = ["Io", "Tu", "Lei", "Noi", "Voi", "Loro"] as const;

/** Read a paradigm out of the full conjugation without fighting the overloads. */
function paradigmOf(verb: Verb, mood: Mood, tense: string): Paradigm {
  const full = conjugateAll(verb);
  const group = (full as unknown as Record<string, Record<string, Paradigm>>)[mood];
  return group?.[tense] ?? (["", "", "", "", "", ""] as Paradigm);
}

/** Collect vocabulary lemmas introduced up to and including a level. */
function vocabUpToLevel(level: CefrLevel): string[] {
  const maxIdx = CEFR_ORDER.indexOf(level);
  const out: string[] = [];
  for (const lvl of CURRICULUM.levels) {
    if (CEFR_ORDER.indexOf(lvl.code) > maxIdx) continue;
    for (const unit of lvl.units) for (const lesson of unit.lessons) out.push(...lesson.vocabulary);
  }
  return [...new Set(out)];
}

interface SpeechItem {
  text: string;
  translation?: string;
}

function speechPool(level: CefrLevel): SpeechItem[] {
  const verbs = verbsUpToLevel(level).map((v) => ({ text: v.infinitive, translation: v.translation }));
  const vocab = vocabUpToLevel(level).map((text) => ({ text }));
  return [...verbs, ...vocab];
}

// ---- Per-type generators ----------------------------------------------------

type Gen = (rng: ReturnType<typeof createRng>, level: CefrLevel, id: string) => Question | null;

const genConjugation: Gen = (rng, level, id) => {
  const verbs = verbsUpToLevel(level);
  const slots = SLOTS_BY_LEVEL[level];
  if (verbs.length === 0 || slots.length === 0) return null;

  const verb = rng.pick(verbs);
  const slot = rng.pick(slots);
  const person = rng.int(0, 5);
  const answer = paradigmOf(verb, slot.mood, slot.tense)[person] ?? "";
  if (!answer) return null;

  const q: ConjugationQuestion = {
    id,
    type: "conjugation",
    prompt: `Coniuga «${verb.infinitive}» — ${slot.label}, ${PERSONS[person]}`,
    cefrLevel: level,
    infinitive: verb.infinitive,
    mood: slot.mood,
    tense: slot.tense,
    person,
    answer,
    acceptable: [answer],
    explanation: `${PERSONS[person]} · ${slot.label}: ${answer} (${verb.translation})`,
  };
  return q;
};

const genMultipleChoice: Gen = (rng, level, id) => {
  const verbs = verbsUpToLevel(level);
  const slots = SLOTS_BY_LEVEL[level];
  if (verbs.length === 0) return null;

  const verb = rng.pick(verbs);
  const slot = rng.pick(slots);
  const person = rng.int(0, 5);
  const paradigm = paradigmOf(verb, slot.mood, slot.tense);
  const correct = paradigm[person] ?? "";
  if (!correct) return null;

  // Distractors: this verb's other persons, then other verbs' same slot.
  const pool = new Set<string>();
  paradigm.forEach((f, i) => {
    if (f && i !== person) pool.add(f);
  });
  for (const other of rng.sample(verbs, 4)) {
    const f = paradigmOf(other, slot.mood, slot.tense)[person];
    if (f && f !== correct) pool.add(f);
  }
  pool.delete(correct);
  const distractors = rng.sample([...pool], 3);
  if (distractors.length < 2) return null; // not enough contrast

  const options = rng.shuffle([correct, ...distractors]);
  const q: MultipleChoiceQuestion = {
    id,
    type: "multiple_choice",
    prompt: `Qual è la forma «${PERSONS[person]}» di «${verb.infinitive}» (${slot.label})?`,
    cefrLevel: level,
    options,
    correctIndex: options.indexOf(correct),
    explanation: `${verb.infinitive} → ${correct} (${verb.translation})`,
  };
  return q;
};

const genFillBlank: Gen = (rng, level, id) => {
  const verbs = verbsUpToLevel(level);
  const slots = SLOTS_BY_LEVEL[level];
  if (verbs.length === 0) return null;

  const verb = rng.pick(verbs);
  const slot = rng.pick(slots);
  const person = rng.int(0, 5);
  const answer = paradigmOf(verb, slot.mood, slot.tense)[person] ?? "";
  if (!answer) return null;

  const q: FillBlankQuestion = {
    id,
    type: "fill_blank",
    prompt: `${SUBJECTS[person]} ______ (${verb.infinitive}) — ${slot.label}.`,
    cefrLevel: level,
    answer,
    acceptable: [answer],
    explanation: `${SUBJECTS[person]} ${answer}. (${verb.translation})`,
  };
  return q;
};

const genPronunciation: Gen = (rng, level, id) => {
  const pool = speechPool(level);
  if (pool.length === 0) return null;
  const item = rng.pick(pool);
  const q: PronunciationQuestion = {
    id,
    type: "pronunciation",
    prompt: "Pronuncia ad alta voce:",
    cefrLevel: level,
    targetText: item.text,
    ...(item.translation ? { translation: item.translation } : {}),
    explanation: `Target: «${item.text}»${item.translation ? ` — ${item.translation}` : ""}`,
  };
  return q;
};

const genListening: Gen = (rng, level, id) => {
  const pool = speechPool(level).map((i) => i.text);
  const unique = [...new Set(pool)];
  if (unique.length < 4) return null;
  const correct = rng.pick(unique);
  const distractors = rng.sample(unique.filter((t) => t !== correct), 3);
  if (distractors.length < 3) return null;
  const options = rng.shuffle([correct, ...distractors]);
  const q: ListeningQuestion = {
    id,
    type: "listening",
    prompt: "Ascolta e scegli la parola che hai sentito:",
    cefrLevel: level,
    audioText: correct,
    options,
    correctIndex: options.indexOf(correct),
    explanation: `You heard: «${correct}»`,
  };
  return q;
};

const GENERATORS: Record<QuestionType, Gen> = {
  conjugation: genConjugation,
  multiple_choice: genMultipleChoice,
  fill_blank: genFillBlank,
  pronunciation: genPronunciation,
  listening: genListening,
};

/**
 * Generate a quiz. Round-robins through the requested types so the mix is even,
 * retrying with other types if a particular generator can't produce a question.
 */
export function generateQuiz(spec: QuizSpec): Question[] {
  const seed = spec.seed ?? Math.floor(Math.random() * 2 ** 31);
  const rng = createRng(seed);
  const types = spec.types.length > 0 ? spec.types : (Object.keys(GENERATORS) as QuestionType[]);
  const questions: Question[] = [];

  let attempts = 0;
  const maxAttempts = spec.length * 8 + 20;

  while (questions.length < spec.length && attempts < maxAttempts) {
    const type = types[questions.length % types.length]!;
    const id = `q${questions.length + 1}-${attempts}`;
    const q = GENERATORS[type](rng, spec.level, id);
    attempts++;
    if (q) {
      questions.push(q);
      continue;
    }
    // Fallback: try any other requested type this round.
    for (const alt of types) {
      const fq = GENERATORS[alt](rng, spec.level, id);
      if (fq) {
        questions.push(fq);
        break;
      }
    }
  }
  return questions;
}

/** Total number of verbs available (useful for UI hints). */
export function verbCount(): number {
  return VERB_LIST.length;
}
