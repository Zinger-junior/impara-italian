// =============================================================================
// src/data/canDo.ts
// "Can-do" self-assessment statements, CEFR-aligned. Tick one only after you've
// actually done it once, for real. Grouped by level via the `level` field.
// =============================================================================

import type { CefrLevel } from "../types/index.js";

export interface CanDoItem {
  id: string;
  text: string;
  level: CefrLevel;
}

export const CAN_DO: CanDoItem[] = [
  // A1
  { id: "a1-1", text: "I can introduce myself and say where I'm from, what I do and where I live.", level: "A1" },
  { id: "a1-2", text: "I can order food and drink and ask how much something costs.", level: "A1" },
  { id: "a1-3", text: "I can understand and give simple directions and times.", level: "A1" },
  { id: "a1-4", text: "I can ask someone to repeat, slow down, or say how something is spelled.", level: "A1" },
  { id: "a1-5", text: "I can conjugate regular present-tense verbs and use essere and avere.", level: "A1" },

  // A2
  { id: "a2-1", text: "I can talk about what I did yesterday using the passato prossimo.", level: "A2" },
  { id: "a2-2", text: "I can describe habits and the past with the imperfetto.", level: "A2" },
  { id: "a2-3", text: "I can handle a routine transaction — a shop, a ticket, a booking — start to finish.", level: "A2" },
  { id: "a2-4", text: "I can talk about future plans using the present or the futuro.", level: "A2" },
  { id: "a2-5", text: "I can write a short connected text about everyday topics.", level: "A2" },

  // B1
  { id: "b1-1", text: "I can follow the main points of clear standard speech on familiar topics.", level: "B1" },
  { id: "b1-2", text: "I can follow a slow, clear native podcast without a transcript.", level: "B1" },
  { id: "b1-3", text: "I can handle an unexpected problem — a delay, a wrong order, a form I don't understand.", level: "B1" },
  { id: "b1-4", text: "I can start, hold and end a conversation with someone who isn't paid to be patient.", level: "B1" },
  { id: "b1-5", text: "I can tell a story in the past, switching between the two past tenses correctly.", level: "B1" },
  { id: "b1-6", text: "I can give reasons for an opinion and answer a follow-up question.", level: "B1" },
  { id: "b1-7", text: "I can use the congiuntivo after penso che, spero che and è importante che.", level: "B1" },
  { id: "b1-8", text: "I can write a polite formal email to an office or a professor.", level: "B1" },

  // B2
  { id: "b2-1", text: "I can follow native speech at natural speed on most topics, including debate.", level: "B2" },
  { id: "b2-2", text: "I can argue a position, concede points and hedge without switching to English.", level: "B2" },
  { id: "b2-3", text: "I can read a newspaper article or opinion piece and summarise its argument.", level: "B2" },
  { id: "b2-4", text: "I can use the congiuntivo imperfetto and build counterfactual (se) sentences.", level: "B2" },
  { id: "b2-5", text: "I can write a clear, structured text presenting and defending a viewpoint.", level: "B2" },
  { id: "b2-6", text: "I know roughly 1,500+ words and can retrieve them while speaking, not just reading.", level: "B2" },
];

export const CAN_DO_LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2"];
