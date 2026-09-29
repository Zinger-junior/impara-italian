// =============================================================================
// src/quiz/drill.ts
// Conjugation drill with diagnosis. Wraps the Phase 1 engine to generate random
// prompts and — crucially — to explain WHY a wrong answer is wrong (wrong
// person, wrong tense, missing accent, right stem/wrong ending, …) instead of
// just marking it incorrect. Pure and DOM-free.
// =============================================================================

import type { Mood, Paradigm, Verb } from "../types/index.js";
import { PERSONS } from "../types/index.js";
import { conjugateAll } from "../engine/conjugator.js";
import { VERB_LIST, VERBS } from "../data/verbs.js";
import { normalizeAnswer, stripAccents } from "./text.js";

export interface DrillTense {
  key: string;
  label: string;
  mood: Mood;
  tense: string;
  /** True for compound tenses (auxiliary + participle). */
  compound?: boolean;
}

export const DRILL_TENSES: DrillTense[] = [
  { key: "presente", label: "Present", mood: "indicativo", tense: "presente" },
  { key: "passatoProssimo", label: "Passato prossimo", mood: "indicativo", tense: "passatoProssimo", compound: true },
  { key: "imperfetto", label: "Imperfetto", mood: "indicativo", tense: "imperfetto" },
  { key: "futuroSemplice", label: "Future", mood: "indicativo", tense: "futuroSemplice" },
  { key: "condizionale", label: "Conditional", mood: "condizionale", tense: "presente" },
  { key: "congiuntivo", label: "Subjunctive", mood: "congiuntivo", tense: "presente" },
];

export interface DrillPrompt {
  verb: string;
  tenseKey: string;
  person: number; // 0..5
}

export interface Diagnosis {
  ok: boolean;
  /** The canonical answer(s) to show. */
  expected: string;
  /** Explanation of a wrong answer, or "" when correct. */
  message: string;
}

function tenseByKey(key: string): DrillTense {
  return DRILL_TENSES.find((t) => t.key === key) ?? DRILL_TENSES[0]!;
}

/** Read a paradigm out of the full conjugation by mood+tense. */
function paradigmOf(verb: Verb, mood: Mood, tense: string): Paradigm {
  const full = conjugateAll(verb) as unknown as Record<string, Record<string, Paradigm>>;
  return full[mood]?.[tense] ?? (["", "", "", "", "", ""] as Paradigm);
}

/** All accepted spellings for one form (adds essere-agreement variants). */
export function acceptedForms(verb: Verb, t: DrillTense, person: number): string[] {
  const base = paradigmOf(verb, t.mood, t.tense)[person] ?? "";
  if (!base) return [];
  if (t.compound && verb.auxiliary === "essere") {
    const [aux, part] = base.split(" ");
    if (aux && part) {
      const stem = part.slice(0, -1);
      const plural = person >= 3;
      return plural ? [`${aux} ${stem}i`, `${aux} ${stem}e`] : [`${aux} ${stem}o`, `${aux} ${stem}a`];
    }
  }
  return [base];
}

/** The display answer for a prompt (masculine default, joined variants). */
export function expectedDisplay(verb: Verb, t: DrillTense, person: number): string {
  const forms = acceptedForms(verb, t, person);
  return forms.join(" / ");
}

/** Pick a random drill prompt. `filter` = a tense key, or "all" for mixed. */
export function newPrompt(filter: string, rand: () => number = Math.random): DrillPrompt {
  const verb = VERB_LIST[Math.floor(rand() * VERB_LIST.length)]!;
  const t = filter === "all" ? DRILL_TENSES[Math.floor(rand() * DRILL_TENSES.length)]! : tenseByKey(filter);
  const person = Math.floor(rand() * 6);
  return { verb: verb.infinitive, tenseKey: t.key, person };
}

/**
 * Diagnose a typed answer. If `accentsOptional`, an accent-only error counts as
 * correct (but still says so). Returns a targeted message for wrong answers.
 */
export function diagnose(input: string, prompt: DrillPrompt, accentsOptional = false): Diagnosis {
  const verb = VERBS[prompt.verb]!;
  const t = tenseByKey(prompt.tenseKey);
  const person = prompt.person;
  const accepted = acceptedForms(verb, t, person);
  const expected = accepted.join(" / ");
  const inp = normalizeAnswer(input);

  // Exact (accent-sensitive) match.
  if (accepted.some((a) => inp === normalizeAnswer(a))) return { ok: true, expected, message: "" };

  // Accent-only mismatch.
  if (accepted.some((a) => stripAccents(inp) === stripAccents(normalizeAnswer(a)))) {
    return {
      ok: accentsOptional,
      expected,
      message: accentsOptional ? "" : `Right form, wrong accent — the accent is part of the spelling: ${expected}.`,
    };
  }

  // Same tense, wrong person?
  for (let p = 0; p < 6; p++) {
    if (p === person) continue;
    const other = acceptedForms(verb, t, p);
    if (other.some((o) => stripAccents(inp) === stripAccents(normalizeAnswer(o)))) {
      return { ok: false, expected, message: `That's the "${PERSONS[p]}" form. You were asked for "${PERSONS[person]}".` };
    }
  }

  // Right person, wrong tense?
  for (const ot of DRILL_TENSES) {
    if (ot.key === t.key) continue;
    const other = acceptedForms(verb, ot, person);
    if (other.some((o) => stripAccents(inp) === stripAccents(normalizeAnswer(o)))) {
      return { ok: false, expected, message: `Right person, wrong tense — that's the ${ot.label.toLowerCase()}.` };
    }
  }

  // Compound tense needs two words.
  if (t.compound && !inp.includes(" ")) {
    return { ok: false, expected, message: "The passato prossimo needs two words: auxiliary + participle (e.g. ho parlato)." };
  }

  // Right stem, wrong ending?
  const stem = stripAccents(prompt.verb.slice(0, -3));
  if (stem.length > 2 && stripAccents(inp).startsWith(stem.slice(0, 3))) {
    return { ok: false, expected, message: "Right stem, wrong ending. Say the whole set out loud, then retry." };
  }

  return { ok: false, expected, message: "Not close. Check the cheat sheet for this tense, then come back." };
}
