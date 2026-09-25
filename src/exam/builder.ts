// =============================================================================
// src/exam/builder.ts
// Assembles a CLI-Pisa-style exam for a level: five weighted skill sections
// (Ascolto 25, Lettura 25, Strutture 25, Produzione scritta 15, Produzione
// orale 10), timed, with a 60% pass mark. Strutture items come from the quiz
// generator; the rest come from authored content.
// =============================================================================

import type { CefrLevel } from "../types/index.js";
import { generateQuiz } from "../quiz/generator.js";
import { contentForLevel } from "./content.js";
import type { Exam, ExamItem, ExamSection, ReadingPassage } from "./types.js";

export const EXAM_PASS_PCT = 60;

const SECTION_META: { skill: ExamSection["skill"]; title: string; weightPct: number; timeMinutes: number }[] = [
  { skill: "ascolto", title: "Ascolto", weightPct: 25, timeMinutes: 15 },
  { skill: "lettura", title: "Lettura", weightPct: 25, timeMinutes: 20 },
  { skill: "strutture", title: "Analisi delle strutture", weightPct: 25, timeMinutes: 20 },
  { skill: "produzione_scritta", title: "Produzione scritta", weightPct: 15, timeMinutes: 25 },
  { skill: "produzione_orale", title: "Produzione orale", weightPct: 10, timeMinutes: 10 },
];

/** Build a full exam. Pass a seed to make the strutture section reproducible. */
export function buildExam(level: CefrLevel, seed?: number): Exam {
  const content = contentForLevel(level);
  const sections: ExamSection[] = [];

  for (const meta of SECTION_META) {
    const items: ExamItem[] = [];
    let passage: ReadingPassage | undefined;

    switch (meta.skill) {
      case "ascolto":
        content.ascolto.forEach((a, i) => {
          items.push({
            id: `ascolto-${i}`,
            skill: "ascolto",
            audioText: a.audioText,
            question: a.question,
            options: a.options,
            correctIndex: a.correctIndex,
          });
        });
        break;

      case "lettura":
        passage = { id: `passage-${level}`, title: content.passage.title, level, text: content.passage.text };
        content.lettura.forEach((q, i) => {
          items.push({
            id: `lettura-${i}`,
            skill: "lettura",
            passageId: passage!.id,
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex,
          });
        });
        break;

      case "strutture": {
        // Structural grammar only: no speech/listening in this section.
        const questions = generateQuiz({
          level,
          length: 6,
          types: ["conjugation", "fill_blank", "multiple_choice"],
          ...(seed !== undefined ? { seed } : {}),
        });
        questions.forEach((q, i) => {
          items.push({ id: `strutture-${i}`, skill: "strutture", question: q });
        });
        break;
      }

      case "produzione_scritta":
        items.push({
          id: "scritta-0",
          skill: "produzione_scritta",
          prompt: content.scritta.prompt,
          minWords: content.scritta.minWords,
        });
        break;

      case "produzione_orale":
        items.push({
          id: "orale-0",
          skill: "produzione_orale",
          prompt: content.orale.prompt,
          minWords: content.orale.minWords,
        });
        break;
    }

    sections.push({
      skill: meta.skill,
      title: meta.title,
      weightPct: meta.weightPct,
      timeMinutes: meta.timeMinutes,
      items,
      ...(passage ? { passage } : {}),
    });
  }

  const totalMinutes = SECTION_META.reduce((s, m) => s + m.timeMinutes, 0);

  return {
    id: `exam-${level}-${seed ?? "rnd"}`,
    level,
    title: `Esame CLI Pisa — livello ${level}`,
    totalMinutes,
    passThresholdPct: EXAM_PASS_PCT,
    sections,
  };
}

/** Flatten all items across sections in order (for a single-item-per-screen runner). */
export function examItemsFlat(exam: Exam): { section: ExamSection; item: ExamItem; sectionIndex: number }[] {
  const out: { section: ExamSection; item: ExamItem; sectionIndex: number }[] = [];
  exam.sections.forEach((section, sectionIndex) => {
    for (const item of section.items) out.push({ section, item, sectionIndex });
  });
  return out;
}
