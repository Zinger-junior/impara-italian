// =============================================================================
// src/exam/grader.ts
// Grades an exam. Objective sections (ascolto, lettura, strutture) grade against
// a key; production sections (scritta, orale) are scored heuristically from
// output length against the prompt's minimum, with an optional self-assessment
// override. Section scores are weighted into a final mark vs. the pass mark.
// =============================================================================

import { gradeAnswer } from "../quiz/grader.js";
import type { Response as QuizResponse } from "../quiz/types.js";
import type { Exam, ExamItem, ExamResponse, ExamResult, SectionResult } from "./types.js";

/** Count words in a free-text/transcript response. */
export function wordCount(text: string): number {
  const trimmed = text.trim();
  return trimmed === "" ? 0 : trimmed.split(/\s+/).length;
}

/**
 * Heuristic score (0..100) for a production item: proportional to how close the
 * output length is to the prompt's minimum word count, capped at 100. This is
 * an engagement/coverage proxy, NOT an examiner's judgement of quality.
 */
export function productionScore(text: string, minWords: number): number {
  if (minWords <= 0) return text.trim() ? 100 : 0;
  return Math.max(0, Math.min(100, Math.round((wordCount(text) / minWords) * 100)));
}

function gradeObjectiveItem(item: ExamItem, response: ExamResponse | undefined): { correct: boolean } {
  switch (item.skill) {
    case "ascolto":
    case "lettura":
      return { correct: response?.kind === "choice" && response.index === item.correctIndex };
    case "strutture": {
      // Delegate to the quiz grader (handles choice + typed).
      const graded = gradeAnswer(item.question, response as QuizResponse | undefined);
      return { correct: graded.correct };
    }
    default:
      return { correct: false };
  }
}

/**
 * Grade the whole exam.
 * @param overrides optional self-assessed section scores (0..100) for production,
 *   keyed by skill — lets a learner or teacher replace the heuristic.
 */
export function gradeExam(
  exam: Exam,
  responses: Map<string, ExamResponse>,
  overrides: Partial<Record<SectionResult["skill"], number>> = {},
): ExamResult {
  const sections: SectionResult[] = exam.sections.map((section) => {
    const heuristic = section.skill === "produzione_scritta" || section.skill === "produzione_orale";
    let scorePct: number;
    let itemsGraded = 0;
    let itemsCorrect = 0;

    if (heuristic) {
      const override = overrides[section.skill];
      if (typeof override === "number") {
        scorePct = Math.max(0, Math.min(100, Math.round(override)));
      } else {
        // Average the production items' length-based scores.
        const scores = section.items.map((item) => {
          const r = responses.get(item.id);
          const text = r?.kind === "text" ? r.value : r?.kind === "speech" ? r.transcript : "";
          const minWords = "minWords" in item ? item.minWords : 0;
          return productionScore(text, minWords);
        });
        scorePct = scores.length === 0 ? 0 : Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      }
    } else {
      for (const item of section.items) {
        itemsGraded++;
        if (gradeObjectiveItem(item, responses.get(item.id)).correct) itemsCorrect++;
      }
      scorePct = itemsGraded === 0 ? 0 : Math.round((itemsCorrect / itemsGraded) * 100);
    }

    return {
      skill: section.skill,
      title: section.title,
      weightPct: section.weightPct,
      scorePct,
      weighted: Math.round((scorePct * section.weightPct) / 100),
      itemsGraded,
      itemsCorrect,
      heuristic,
    };
  });

  const overallPct = Math.round(
    sections.reduce((sum, s) => sum + (s.scorePct * s.weightPct) / 100, 0),
  );

  return {
    level: exam.level,
    overallPct,
    passed: overallPct >= exam.passThresholdPct,
    passThresholdPct: exam.passThresholdPct,
    sections,
  };
}
