// =============================================================================
// src/exam/exam.test.ts
// Tests for exam assembly and grading.
// =============================================================================

import { describe, it, expect } from "vitest";
import { buildExam, EXAM_PASS_PCT } from "./builder.js";
import { gradeExam, productionScore, wordCount } from "./grader.js";
import type { ExamResponse } from "./types.js";

describe("exam builder", () => {
  const exam = buildExam("B1", 7);

  it("has five weighted sections summing to 100", () => {
    expect(exam.sections).toHaveLength(5);
    expect(exam.sections.reduce((s, x) => s + x.weightPct, 0)).toBe(100);
  });

  it("covers all skills and attaches a reading passage", () => {
    const skills = exam.sections.map((s) => s.skill);
    expect(skills).toEqual([
      "ascolto",
      "lettura",
      "strutture",
      "produzione_scritta",
      "produzione_orale",
    ]);
    const lettura = exam.sections.find((s) => s.skill === "lettura");
    expect(lettura?.passage?.text.length).toBeGreaterThan(0);
  });

  it("is reproducible for the strutture section under a seed", () => {
    const a = buildExam("B1", 7);
    const b = buildExam("B1", 7);
    const sa = a.sections.find((s) => s.skill === "strutture")!;
    const sb = b.sections.find((s) => s.skill === "strutture")!;
    expect(sa.items.map((i) => i.id)).toEqual(sb.items.map((i) => i.id));
  });
});

describe("production scoring", () => {
  it("counts words", () => {
    expect(wordCount("")).toBe(0);
    expect(wordCount("  ciao   mondo ")).toBe(2);
  });

  it("scores proportionally to the minimum, capped at 100", () => {
    expect(productionScore("a b c", 3)).toBe(100);
    expect(productionScore("", 10)).toBe(0);
    expect(productionScore("a b", 4)).toBe(50);
    expect(productionScore("a b c d e", 3)).toBe(100); // capped
  });
});

describe("exam grading", () => {
  const exam = buildExam("A2", 7);

  it("grades an empty submission to a valid range", () => {
    const result = gradeExam(exam, new Map());
    expect(result.sections).toHaveLength(5);
    expect(result.overallPct).toBeGreaterThanOrEqual(0);
    expect(result.overallPct).toBeLessThanOrEqual(100);
    expect(result.passThresholdPct).toBe(EXAM_PASS_PCT);
  });

  it("awards full marks to correct objective answers", () => {
    const responses = new Map<string, ExamResponse>();
    for (const section of exam.sections) {
      for (const item of section.items) {
        if (item.skill === "ascolto" || item.skill === "lettura") {
          responses.set(item.id, { kind: "choice", index: item.correctIndex });
        } else if (item.skill === "strutture") {
          const q = item.question;
          if (q.type === "multiple_choice" || q.type === "listening") {
            responses.set(item.id, { kind: "choice", index: q.correctIndex });
          } else if (q.type === "conjugation" || q.type === "fill_blank") {
            responses.set(item.id, { kind: "text", value: q.answer });
          }
        }
      }
    }
    const result = gradeExam(exam, responses);
    const objective = result.sections.filter((s) => !s.heuristic);
    for (const s of objective) expect(s.scorePct).toBe(100);
  });

  it("honours a production self-assessment override", () => {
    const result = gradeExam(exam, new Map(), { produzione_scritta: 80 });
    const scritta = result.sections.find((s) => s.skill === "produzione_scritta")!;
    expect(scritta.scorePct).toBe(80);
  });
});
