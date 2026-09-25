// =============================================================================
// src/quiz/grader.ts
// Grades a learner Response against a Question and rolls answers into a summary.
// Pure and DOM-free (pronunciation scoring reuses the pure text similarity).
// =============================================================================

import type {
  GradedAnswer,
  Question,
  QuestionType,
  QuizResultSummary,
  Response,
} from "./types.js";
import { matchAny, similarity } from "./text.js";

/** Minimum pronunciation score (0..100) counted as correct. */
export const PRONUNCIATION_PASS = 75;
/** Overall quiz pass threshold (percent). */
export const QUIZ_PASS_PCT = 70;

/** Score a spoken attempt 0..100 from transcript similarity + recognizer confidence. */
export function scoreSpeech(target: string, transcript: string, confidence: number): number {
  const sim = similarity(target, transcript);
  const conf = confidence > 0 ? confidence : 1;
  return Math.round(sim * (0.7 + 0.3 * conf));
}

function optionText(question: Extract<Question, { options: string[] }>, index: number): string {
  return question.options[index] ?? "";
}

/** Grade one answer. `response` may be undefined for a skipped question. */
export function gradeAnswer(question: Question, response: Response | undefined): GradedAnswer {
  const base = { questionId: question.id };

  switch (question.type) {
    case "multiple_choice":
    case "listening": {
      const expected = optionText(question, question.correctIndex);
      if (!response || response.kind !== "choice") {
        return { ...base, correct: false, score: 0, feedback: "No answer selected.", expected, given: "—" };
      }
      const given = optionText(question, response.index);
      const correct = response.index === question.correctIndex;
      return {
        ...base,
        correct,
        score: correct ? 100 : 0,
        feedback: correct ? "Correct!" : `The answer was «${expected}».`,
        expected,
        given: given || "—",
      };
    }

    case "conjugation":
    case "fill_blank": {
      const expected = question.answer;
      if (!response || response.kind !== "text") {
        return { ...base, correct: false, score: 0, feedback: "No answer entered.", expected, given: "—" };
      }
      const quality = matchAny(response.value, question.acceptable);
      switch (quality) {
        case "exact":
          return { ...base, correct: true, score: 100, feedback: "Correct!", expected, given: response.value };
        case "accent":
          return {
            ...base,
            correct: true,
            score: 90,
            feedback: `Right word — mind the accent: «${expected}».`,
            expected,
            given: response.value,
          };
        case "close":
          return {
            ...base,
            correct: false,
            score: Math.max(0, similarity(response.value, expected)),
            feedback: `So close — the answer was «${expected}».`,
            expected,
            given: response.value,
          };
        default:
          return { ...base, correct: false, score: 0, feedback: `The answer was «${expected}».`, expected, given: response.value };
      }
    }

    case "pronunciation": {
      const expected = question.targetText;
      if (!response || response.kind !== "speech") {
        return { ...base, correct: false, score: 0, feedback: "No speech captured.", expected, given: "—" };
      }
      const score = scoreSpeech(question.targetText, response.transcript, response.confidence);
      const correct = score >= PRONUNCIATION_PASS;
      return {
        ...base,
        correct,
        score,
        feedback: correct
          ? `Great — ${score}% match.`
          : `Heard «${response.transcript || "…"}». Aim for «${expected}» (${score}%).`,
        expected,
        given: response.transcript || "—",
      };
    }
  }
}

const ALL_TYPES: QuestionType[] = [
  "multiple_choice",
  "conjugation",
  "fill_blank",
  "pronunciation",
  "listening",
];

/** Roll a set of questions + responses into a full result summary. */
export function summarize(
  questions: Question[],
  responses: Map<string, Response>,
): QuizResultSummary {
  const answers = questions.map((q) => gradeAnswer(q, responses.get(q.id)));
  const correct = answers.filter((a) => a.correct).length;
  const total = questions.length;

  const byType = Object.fromEntries(
    ALL_TYPES.map((t) => [t, { total: 0, correct: 0 }]),
  ) as QuizResultSummary["byType"];

  questions.forEach((q, i) => {
    const bucket = byType[q.type];
    bucket.total++;
    if (answers[i]!.correct) bucket.correct++;
  });

  const scorePct = total === 0 ? 0 : Math.round((correct / total) * 100);
  return {
    total,
    correct,
    scorePct,
    passed: scorePct >= QUIZ_PASS_PCT,
    answers,
    byType,
  };
}
