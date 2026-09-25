// =============================================================================
// src/stress/harness.ts
// Error-handling stress test. Pure and DOM-free so it runs in the browser page
// AND under Vitest. It exercises every subsystem with bulk, edge, and malformed
// inputs, asserting nothing throws and every output is well-formed. Returns a
// structured report the in-app page renders.
// =============================================================================

import type { CefrLevel, Verb } from "../types/index.js";
import { CEFR_ORDER } from "../types/index.js";
import { conjugateAll, safeConjugateAll } from "../engine/conjugator.js";
import { VERB_LIST } from "../data/verbs.js";
import { generateQuiz } from "../quiz/generator.js";
import { gradeAnswer } from "../quiz/grader.js";
import { matchAny, normalizeAnswer, similarity, stripAccents } from "../quiz/text.js";
import type { Question, QuestionType, Response } from "../quiz/types.js";
import { createRng } from "../quiz/rng.js";
import { buildExam } from "../exam/builder.js";
import { gradeExam } from "../exam/grader.js";
import type { ExamResponse } from "../exam/types.js";
import { buildTimeline, planStatus } from "../progress/timeline.js";
import type { UserRecord } from "../db/store.js";
import { toISODate, addDays, today } from "../util/date.js";

export interface StressFailure {
  case: string;
  error: string;
}
export interface SuiteResult {
  name: string;
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
  failures: StressFailure[];
}
export interface StressReport {
  suites: SuiteResult[];
  totalChecks: number;
  totalFailed: number;
  durationMs: number;
  timestamp: string;
}

const MAX_FAILURES_KEPT = 25;

/** Collector for a single suite. Each check is guarded — a throw is a failure. */
function collector(name: string) {
  const failures: StressFailure[] = [];
  let total = 0;
  let passed = 0;
  const t0 = Date.now();
  return {
    check(caseName: string, predicate: () => boolean): void {
      total++;
      try {
        if (predicate()) {
          passed++;
        } else if (failures.length < MAX_FAILURES_KEPT) {
          failures.push({ case: caseName, error: "assertion failed" });
        }
      } catch (err) {
        if (failures.length < MAX_FAILURES_KEPT) {
          failures.push({ case: caseName, error: err instanceof Error ? err.message : String(err) });
        }
      }
    },
    result(): SuiteResult {
      return { name, total, passed, failed: total - passed, durationMs: Date.now() - t0, failures };
    },
  };
}

const NON_META_KEYS = new Set(["infinitive", "auxiliary", "isRegular", "nonFinite"]);

/** Suite 1: every verb conjugates fully; every paradigm is a 6-tuple of strings. */
function suiteConjugationCoverage(): SuiteResult {
  const c = collector("Conjugation coverage");
  for (const verb of VERB_LIST) {
    c.check(`${verb.infinitive}:conjugateAll`, () => {
      const full = conjugateAll(verb) as unknown as Record<string, unknown>;
      for (const [mood, group] of Object.entries(full)) {
        if (NON_META_KEYS.has(mood)) continue;
        for (const paradigm of Object.values(group as Record<string, unknown>)) {
          if (!Array.isArray(paradigm) || paradigm.length !== 6) return false;
          if (!paradigm.every((f) => typeof f === "string")) return false;
        }
      }
      return true;
    });
  }
  return c.result();
}

/** Suite 2: malformed infinitives fail gracefully (no throw; invalid → ok:false). */
function suiteMalformedVerbs(): SuiteResult {
  const c = collector("Malformed verbs");
  const bad: { infinitive: string; expectFail: boolean }[] = [
    { infinitive: "", expectFail: true },
    { infinitive: "x", expectFail: true },
    { infinitive: "xyz", expectFail: true },
    { infinitive: "12345", expectFail: true },
    { infinitive: "corr€re", expectFail: true },
    { infinitive: "parlare", expectFail: false }, // control
  ];
  for (const b of bad) {
    const verb: Verb = {
      infinitive: b.infinitive,
      translation: "n/a",
      conjugationClass: "are",
      auxiliary: "avere",
      isIrregular: false,
      isReflexive: false,
      cefrLevel: "A1",
    };
    c.check(`safeConjugateAll("${b.infinitive}")`, () => {
      const res = safeConjugateAll(verb); // must never throw
      return b.expectFail ? res.ok === false : res.ok === true;
    });
  }
  return c.result();
}

/** Suite 3: bulk quiz generation across levels/seeds yields well-formed questions. */
function suiteQuizFuzz(seed: number): SuiteResult {
  const c = collector("Quiz generation fuzz");
  const rng = createRng(seed);
  const allTypes: QuestionType[] = ["multiple_choice", "conjugation", "fill_blank", "pronunciation", "listening"];

  for (const level of CEFR_ORDER) {
    for (let s = 0; s < 15; s++) {
      const types = allTypes.filter(() => rng.next() > 0.35);
      if (types.length === 0) types.push("conjugation");
      const length = rng.int(3, 12);
      c.check(`gen ${level} seed=${s}`, () => {
        const qs = generateQuiz({ level, length, types, seed: s });
        return qs.every(isWellFormedQuestion);
      });
    }
  }
  return c.result();
}

function isWellFormedQuestion(q: Question): boolean {
  switch (q.type) {
    case "multiple_choice":
    case "listening":
      return (
        q.options.length >= 2 &&
        q.options.every((o) => o.length > 0) &&
        q.correctIndex >= 0 &&
        q.correctIndex < q.options.length
      );
    case "conjugation":
    case "fill_blank":
      return q.answer.length > 0 && q.acceptable.includes(q.answer);
    case "pronunciation":
      return q.targetText.length > 0;
  }
}

/** Suite 4: the grader tolerates every response shape without throwing. */
function suiteGraderRobustness(): SuiteResult {
  const c = collector("Grader robustness");
  const samples: Question[] = [
    { id: "s-mc", type: "multiple_choice", prompt: "?", cefrLevel: "A1", options: ["a", "b"], correctIndex: 0 },
    { id: "s-cj", type: "conjugation", prompt: "?", cefrLevel: "A1", infinitive: "parlare", mood: "indicativo", tense: "presente", person: 0, answer: "parlo", acceptable: ["parlo"] },
    { id: "s-fb", type: "fill_blank", prompt: "?", cefrLevel: "A1", answer: "casa", acceptable: ["casa"] },
    { id: "s-pr", type: "pronunciation", prompt: "?", cefrLevel: "A1", targetText: "ciao" },
    { id: "s-li", type: "listening", prompt: "?", cefrLevel: "A1", audioText: "x", options: ["a", "b"], correctIndex: 1 },
  ];
  const responses: (Response | undefined)[] = [
    undefined,
    { kind: "choice", index: 0 },
    { kind: "choice", index: 999 },
    { kind: "choice", index: -1 },
    { kind: "text", value: "" },
    { kind: "text", value: "🎉🎉🎉" },
    { kind: "text", value: "x".repeat(5000) },
    { kind: "speech", transcript: "", confidence: 0 },
    { kind: "speech", transcript: "ciao", confidence: 1 },
  ];
  for (const q of samples) {
    for (let i = 0; i < responses.length; i++) {
      c.check(`grade ${q.type} <- r${i}`, () => {
        const g = gradeAnswer(q, responses[i]);
        return typeof g.correct === "boolean" && g.score >= 0 && g.score <= 100 && typeof g.feedback === "string";
      });
    }
  }
  return c.result();
}

/** Suite 5: text utilities survive unicode/empty/huge inputs. */
function suiteTextFuzz(seed: number): SuiteResult {
  const c = collector("Text matching");
  const rng = createRng(seed ^ 0x9e3779b9);
  const charset = "abcdeàèéìòù ' -🎉".split("");
  for (let i = 0; i < 60; i++) {
    const len = rng.int(0, 20);
    const s = Array.from({ length: len }, () => rng.pick(charset)).join("");
    c.check(`similarity self #${i}`, () => (normalizeAnswer(s).length === 0 ? true : similarity(s, s) === 100));
    c.check(`matchAny empty #${i}`, () => matchAny(s, []) === "wrong");
    c.check(`stripAccents #${i}`, () => typeof stripAccents(s) === "string");
  }
  return c.result();
}

/** Suite 6: exams build for every level and grade without throwing. */
function suiteExam(seed: number): SuiteResult {
  const c = collector("Exam build & grade");
  const rng = createRng(seed);
  for (const level of CEFR_ORDER) {
    c.check(`build ${level}`, () => {
      const exam = buildExam(level, 7);
      const weightSum = exam.sections.reduce((s, x) => s + x.weightPct, 0);
      if (weightSum !== 100) return false;

      const empty = gradeExam(exam, new Map());
      if (empty.overallPct < 0 || empty.overallPct > 100) return false;

      // Random responses across all items.
      const responses = new Map<string, ExamResponse>();
      for (const section of exam.sections) {
        for (const item of section.items) {
          if (item.skill === "produzione_scritta" || item.skill === "produzione_orale") {
            responses.set(item.id, { kind: "text", value: "parola ".repeat(rng.int(0, 40)) });
          } else if (item.skill === "strutture") {
            responses.set(item.id, rng.next() > 0.5 ? { kind: "choice", index: rng.int(0, 3) } : { kind: "text", value: "parlo" });
          } else {
            responses.set(item.id, { kind: "choice", index: rng.int(0, 3) });
          }
        }
      }
      const graded = gradeExam(exam, responses);
      return graded.overallPct >= 0 && graded.overallPct <= 100;
    });
  }
  return c.result();
}

/** Suite 7: timeline handles degenerate plan windows. */
function suiteTimelineEdge(): SuiteResult {
  const c = collector("Timeline edge cases");
  const base: Omit<UserRecord, "startDate" | "targetExamDate"> = {
    key: "user",
    id: 1,
    displayName: "Test",
    email: "t@e.co",
    entryCefr: "A0",
    timezone: "Europe/Rome",
  };
  const cases: { name: string; start: string; target: string }[] = [
    { name: "same day", start: toISODate(today()), target: toISODate(today()) },
    { name: "target in past", start: toISODate(today()), target: toISODate(addDays(today(), -30)) },
    { name: "one week", start: toISODate(today()), target: toISODate(addDays(today(), 7)) },
    { name: "two years", start: toISODate(addDays(today(), -10)), target: toISODate(addDays(today(), 720)) },
  ];
  for (const tc of cases) {
    c.check(`timeline ${tc.name}`, () => {
      const user: UserRecord = { ...base, startDate: tc.start, targetExamDate: tc.target };
      const points = buildTimeline(user, []);
      const status = planStatus(points);
      return Array.isArray(points) && points.length >= 2 && typeof status.label === "string";
    });
  }
  c.check("planStatus empty", () => planStatus([]).label === "on track");
  return c.result();
}

/** Run the full stress test. Deterministic under `seed`. */
export function runStressTest(seed = 1234): StressReport {
  const t0 = Date.now();
  const suites: SuiteResult[] = [
    suiteConjugationCoverage(),
    suiteMalformedVerbs(),
    suiteQuizFuzz(seed),
    suiteGraderRobustness(),
    suiteTextFuzz(seed),
    suiteExam(seed),
    suiteTimelineEdge(),
  ];
  const totalChecks = suites.reduce((s, x) => s + x.total, 0);
  const totalFailed = suites.reduce((s, x) => s + x.failed, 0);
  return {
    suites,
    totalChecks,
    totalFailed,
    durationMs: Date.now() - t0,
    timestamp: new Date().toISOString(),
  };
}
