// =============================================================================
// src/quiz/quiz.test.ts
// Tests for the Phase 3 core: text matching, quiz generation (deterministic +
// engine-accurate), and grading.
// =============================================================================

import { describe, it, expect } from "vitest";
import { levenshtein, matchAnswer, normalizeAnswer, similarity } from "./text.js";
import { generateQuiz } from "./generator.js";
import { gradeAnswer, scoreSpeech, summarize } from "./grader.js";
import type {
  ConjugationQuestion,
  MultipleChoiceQuestion,
  Question,
  QuestionType,
  Response,
} from "./types.js";
import { conjugateAll } from "../engine/conjugator.js";
import { VERBS } from "../data/verbs.js";
import type { Mood, Paradigm } from "../types/index.js";

describe("text utilities", () => {
  it("levenshtein distance", () => {
    expect(levenshtein("kitten", "sitting")).toBe(3);
    expect(levenshtein("parlo", "parlo")).toBe(0);
    expect(levenshtein("", "abc")).toBe(3);
  });

  it("normalises whitespace, case, and apostrophes", () => {
    expect(normalizeAnswer("  Ho   Parlato ")).toBe("ho parlato");
    expect(normalizeAnswer("va’")).toBe("va'");
  });

  it("similarity is 100 for identical, lower for different", () => {
    expect(similarity("parlo", "parlo")).toBe(100);
    expect(similarity("parlo", "parli")).toBeLessThan(100);
    expect(similarity("parlo", "parli")).toBeGreaterThan(50);
  });

  it("matchAnswer classifies quality", () => {
    expect(matchAnswer("parlo", "parlo")).toBe("exact");
    expect(matchAnswer("e", "è")).toBe("accent"); // right letters, missing accent
    expect(matchAnswer("parlp", "parlo")).toBe("close"); // typo
    expect(matchAnswer("xyz", "parlo")).toBe("wrong");
  });
});

describe("quiz generation", () => {
  const spec = {
    level: "A1" as const,
    length: 10,
    types: ["multiple_choice", "conjugation", "fill_blank", "pronunciation", "listening"] as QuestionType[],
    seed: 42,
  };

  it("produces the requested number of questions", () => {
    expect(generateQuiz(spec)).toHaveLength(10);
  });

  it("is deterministic under a fixed seed", () => {
    const a = generateQuiz(spec);
    const b = generateQuiz(spec);
    expect(a.map((q) => q.prompt)).toEqual(b.map((q) => q.prompt));
  });

  it("includes every requested type in the mix", () => {
    const present = new Set(generateQuiz(spec).map((q) => q.type));
    for (const t of spec.types) expect(present.has(t)).toBe(true);
  });

  it("conjugation answers match the Phase 1 engine", () => {
    const qs = generateQuiz(spec).filter((q): q is ConjugationQuestion => q.type === "conjugation");
    expect(qs.length).toBeGreaterThan(0);
    for (const q of qs) {
      const verb = VERBS[q.infinitive]!;
      const full = conjugateAll(verb) as unknown as Record<string, Record<string, Paradigm>>;
      const expected = full[q.mood as Mood]?.[q.tense]?.[q.person];
      expect(q.answer).toBe(expected);
    }
  });

  it("multiple-choice options contain the correct answer at correctIndex", () => {
    const qs = generateQuiz(spec).filter((q): q is MultipleChoiceQuestion => q.type === "multiple_choice");
    for (const q of qs) {
      expect(q.options[q.correctIndex]).toBeTruthy();
      expect(new Set(q.options).size).toBe(q.options.length); // no duplicate options
    }
  });
});

describe("grading", () => {
  const mc: MultipleChoiceQuestion = {
    id: "m1",
    type: "multiple_choice",
    prompt: "?",
    cefrLevel: "A1",
    options: ["parlo", "parli", "parla", "parlano"],
    correctIndex: 0,
  };

  it("grades multiple choice", () => {
    expect(gradeAnswer(mc, { kind: "choice", index: 0 }).correct).toBe(true);
    expect(gradeAnswer(mc, { kind: "choice", index: 2 }).correct).toBe(false);
    expect(gradeAnswer(mc, undefined).correct).toBe(false);
  });

  const conj: ConjugationQuestion = {
    id: "c1",
    type: "conjugation",
    prompt: "?",
    cefrLevel: "A1",
    infinitive: "parlare",
    mood: "indicativo",
    tense: "presente",
    person: 0,
    answer: "parlo",
    acceptable: ["parlo"],
  };

  it("grades typed answers with accent tolerance", () => {
    expect(gradeAnswer(conj, { kind: "text", value: "parlo" }).score).toBe(100);
    const accent = gradeAnswer({ ...conj, answer: "è", acceptable: ["è"] }, { kind: "text", value: "e" });
    expect(accent.correct).toBe(true);
    expect(accent.score).toBe(90);
    expect(gradeAnswer(conj, { kind: "text", value: "xyz" }).correct).toBe(false);
  });

  it("scores pronunciation by similarity", () => {
    expect(scoreSpeech("buongiorno", "buongiorno", 0.9)).toBeGreaterThanOrEqual(90);
    expect(scoreSpeech("buongiorno", "buonasera", 0.9)).toBeLessThan(75);
  });

  it("summarises a mixed set", () => {
    const questions: Question[] = [mc, conj];
    const responses = new Map<string, Response>([
      ["m1", { kind: "choice", index: 0 }],
      ["c1", { kind: "text", value: "parlo" }],
    ]);
    const summary = summarize(questions, responses);
    expect(summary.total).toBe(2);
    expect(summary.correct).toBe(2);
    expect(summary.scorePct).toBe(100);
    expect(summary.passed).toBe(true);
    expect(summary.byType.multiple_choice).toEqual({ total: 1, correct: 1 });
  });
});
