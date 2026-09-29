// =============================================================================
// src/data/missions.ts
// Real-world missions and activities — "things you can do" to turn study into
// contact with the language. Grouped by the skill they push. Missions are
// deliberately concrete and completable in a day.
// =============================================================================

import type { CefrLevel } from "../types/index.js";

export type MissionKind = "speak" | "listen" | "read" | "write" | "real-world";

export interface Mission {
  id: string;
  text: string;
  kind: MissionKind;
  level: CefrLevel;
}

export const MISSION_KIND_LABEL: Record<MissionKind, string> = {
  speak: "Speak",
  listen: "Listen",
  read: "Read",
  write: "Write",
  "real-world": "Out in the world",
};

export const MISSIONS: Mission[] = [
  // --- Speak ---
  { id: "sp1", text: "Record yourself saying your name, where you're from and what you study. Listen back once.", kind: "speak", level: "A0" },
  { id: "sp2", text: "Name twenty objects around you out loud, each with its article (il, la, lo, l').", kind: "speak", level: "A1" },
  { id: "sp3", text: "Describe your day so far, twice: once slowly and correctly, once at speed.", kind: "speak", level: "A1" },
  { id: "sp4", text: "Tell someone five things you did yesterday, then answer three follow-up questions.", kind: "speak", level: "A2" },
  { id: "sp5", text: "Give a two-minute opinion on something using at least five connectors (perché, quindi, però…). Count them.", kind: "speak", level: "B1" },
  { id: "sp6", text: "Tell a three-minute true story from your life. Record it and listen for tense mistakes.", kind: "speak", level: "B1" },
  { id: "sp7", text: "Debate a light topic for ten minutes and hold your position without switching to English.", kind: "speak", level: "B2" },

  // --- Listen ---
  { id: "li1", text: "Put Italian radio or a podcast on while you cook or walk. Just bathe in the sound.", kind: "listen", level: "A0" },
  { id: "li2", text: "Watch one Easy Italian street-interview clip with dual subtitles.", kind: "listen", level: "A1" },
  { id: "li3", text: "Listen to a graded podcast episode twice: once for gist, once with the transcript.", kind: "listen", level: "A2" },
  { id: "li4", text: "Re-watch a clip you saw last week with no subtitles. Measure how much more you catch.", kind: "listen", level: "A2" },
  { id: "li5", text: "Listen to a native-speed podcast, then summarise it out loud in your own words.", kind: "listen", level: "B1" },
  { id: "li6", text: "Watch 20 minutes of Italian TV with Italian subtitles — then five minutes with none.", kind: "listen", level: "B2" },

  // --- Read ---
  { id: "re1", text: "Read three product labels or signs you don't understand and look up one word from each.", kind: "read", level: "A1" },
  { id: "re2", text: "Read one short Vikidia article (encyclopedia for kids) to the end.", kind: "read", level: "A2" },
  { id: "re3", text: "Read one Il Post article and mine five genuinely useful words from it.", kind: "read", level: "B1" },
  { id: "re4", text: "Read a real news article to the end and explain it to somebody in Italian.", kind: "read", level: "B1" },
  { id: "re5", text: "Read the opinion section of an Italian paper and note how the argument is built.", kind: "read", level: "B2" },

  // --- Write ---
  { id: "wr1", text: "Write five sentences about yourself and post them for correction on LangCorrect.", kind: "write", level: "A1" },
  { id: "wr2", text: "Write your typical weekday in the present tense.", kind: "write", level: "A1" },
  { id: "wr3", text: "Write yesterday in six sentences, watching your auxiliary (avere/essere).", kind: "write", level: "A2" },
  { id: "wr4", text: "Write a one-paragraph opinion on something you believe, using connectors.", kind: "write", level: "B1" },
  { id: "wr5", text: "Write a formal email: a booking, a complaint, or a question to an office.", kind: "write", level: "B1" },
  { id: "wr6", text: "Write the case for and against a statement — one paragraph each side.", kind: "write", level: "B2" },

  // --- Real world ---
  { id: "rw1", text: "Order one thing at a bar entirely in Italian: 'Un caffè, per favore.' Pay, say grazie, leave.", kind: "real-world", level: "A0" },
  { id: "rw2", text: "Introduce yourself to one real person in Italian and ask them two questions back.", kind: "real-world", level: "A1" },
  { id: "rw3", text: "Ask a shop assistant where something is and understand the answer before leaving.", kind: "real-world", level: "A1" },
  { id: "rw4", text: "Buy something and understand the spoken price without looking at the screen.", kind: "real-world", level: "A1" },
  { id: "rw5", text: "Order a whole meal or do a full grocery run in Italian only, including the follow-ups.", kind: "real-world", level: "A2" },
  { id: "rw6", text: "Ask a stranger for directions to a place you already know, and actually follow the answer.", kind: "real-world", level: "A2" },
  { id: "rw7", text: "Sort out one real errand in Italian: the office, the bank, a phone shop, a landlord.", kind: "real-world", level: "B1" },
  { id: "rw8", text: "Have a five-minute Italian-only conversation with someone who isn't paid to be patient.", kind: "real-world", level: "B1" },
  { id: "rw9", text: "Send one real email in Italian — to a professor, an office, or a landlord.", kind: "real-world", level: "B1" },
  { id: "rw10", text: "Spend one whole day in Italian only. No switching, even when it's slow.", kind: "real-world", level: "B2" },
];

/** Missions at or below a given level. */
export function missionsUpToLevel(level: CefrLevel): Mission[] {
  const order: CefrLevel[] = ["A0", "A1", "A2", "B1", "B2"];
  const max = order.indexOf(level);
  return MISSIONS.filter((m) => order.indexOf(m.level) <= max);
}
