// =============================================================================
// src/data/verbs.ts
// Verb lexicon, CEFR-tagged, with conjugation class + auxiliary selection.
//
// The conjugation engine generates full paradigms from this metadata, so this
// file stores lexical facts (class, auxiliary, irregularity), not inflections.
// `VERBS` is keyed by infinitive for direct access; `VERB_LIST` is the array
// form for iteration / seeding the database.
// =============================================================================

import type { Verb } from "../types/index.js";

/**
 * Helper to declare a verb with sensible defaults.
 * Defaults: avere auxiliary, regular, non-reflexive.
 */
function v(
  infinitive: string,
  translation: string,
  conjugationClass: Verb["conjugationClass"],
  cefrLevel: Verb["cefrLevel"],
  extra: Partial<Verb> = {},
): Verb {
  return {
    infinitive,
    translation,
    conjugationClass,
    cefrLevel,
    auxiliary: extra.auxiliary ?? "avere",
    isIrregular: extra.isIrregular ?? false,
    isReflexive: extra.isReflexive ?? false,
    ...(extra.frequencyRank !== undefined ? { frequencyRank: extra.frequencyRank } : {}),
  };
}

export const VERB_LIST: Verb[] = [
  // ---- A0 / A1 core irregulars (highest frequency) --------------------------
  v("essere", "to be", "ere", "A0", { auxiliary: "essere", isIrregular: true, frequencyRank: 1 }),
  v("avere", "to have", "ere", "A0", { isIrregular: true, frequencyRank: 2 }),
  v("fare", "to do/make", "are", "A1", { isIrregular: true, frequencyRank: 5 }),
  v("andare", "to go", "are", "A1", { auxiliary: "essere", isIrregular: true, frequencyRank: 8 }),
  v("stare", "to stay/be", "are", "A1", { auxiliary: "essere", isIrregular: true, frequencyRank: 12 }),
  v("dare", "to give", "are", "A1", { isIrregular: true, frequencyRank: 20 }),
  v("dire", "to say/tell", "ire", "A1", { isIrregular: true, frequencyRank: 6 }),
  v("venire", "to come", "ire", "A1", { auxiliary: "essere", isIrregular: true, frequencyRank: 15 }),

  // ---- A1 / A2 modal & high-frequency irregulars ----------------------------
  v("potere", "can / to be able", "ere", "A1", { isIrregular: true, frequencyRank: 7 }),
  v("volere", "to want", "ere", "A1", { isIrregular: true, frequencyRank: 9 }),
  v("dovere", "must / to have to", "ere", "A2", { isIrregular: true, frequencyRank: 10 }),
  v("sapere", "to know", "ere", "A2", { isIrregular: true, frequencyRank: 14 }),
  v("bere", "to drink", "ere", "A2", { isIrregular: true, frequencyRank: 60 }),
  v("uscire", "to go out", "ire", "A2", { auxiliary: "essere", isIrregular: true, frequencyRank: 40 }),
  v("tenere", "to hold/keep", "ere", "B1", { isIrregular: true, frequencyRank: 30 }),
  v("rimanere", "to remain", "ere", "B1", { auxiliary: "essere", isIrregular: true, frequencyRank: 45 }),

  // ---- Regular -ARE ---------------------------------------------------------
  v("parlare", "to speak", "are", "A1", { frequencyRank: 25 }),
  v("abitare", "to live/reside", "are", "A1"),
  v("lavorare", "to work", "are", "A1"),
  v("mangiare", "to eat", "are", "A1"), // orthographic: -giare
  v("studiare", "to study", "are", "A1"), // orthographic: -iare
  v("cominciare", "to begin", "are", "A2"), // orthographic: -ciare
  v("cercare", "to look for", "are", "A2"), // orthographic: -care
  v("pagare", "to pay", "are", "A2"), // orthographic: -gare
  v("arrivare", "to arrive", "are", "A1", { auxiliary: "essere" }),
  v("tornare", "to return", "are", "A2", { auxiliary: "essere" }),
  v("giocare", "to play (a game)", "are", "A2"), // orthographic: -care
  v("viaggiare", "to travel", "are", "B1"), // orthographic: -giare

  // ---- Regular -ERE ---------------------------------------------------------
  v("credere", "to believe", "ere", "A2"),
  v("vendere", "to sell", "ere", "A2"),
  v("ricevere", "to receive", "ere", "B1"),
  v("temere", "to fear", "ere", "B1"),
  v("cadere", "to fall", "ere", "B1", { auxiliary: "essere" }),

  // ---- Regular -IRE (no infix) ----------------------------------------------
  v("partire", "to leave/depart", "ire", "A2", { auxiliary: "essere" }),
  v("dormire", "to sleep", "ire", "A1"),
  v("aprire", "to open", "ire", "A2"),
  v("sentire", "to hear/feel", "ire", "A2"),
  v("offrire", "to offer", "ire", "B1"),
  v("seguire", "to follow", "ire", "B1"),

  // ---- -IRE with -isc- infix ------------------------------------------------
  v("capire", "to understand", "ire-isc", "A1"),
  v("finire", "to finish", "ire-isc", "A2", { auxiliary: "both" }),
  v("preferire", "to prefer", "ire-isc", "A2"),
  v("pulire", "to clean", "ire-isc", "A2"),
  v("spedire", "to send", "ire-isc", "B1"),
  v("costruire", "to build", "ire-isc", "B1"),
  v("restituire", "to give back", "ire-isc", "B2"),
];

/**
 * Keyed lookup by infinitive. Later duplicates overwrite earlier ones, which is
 * harmless here (identical entries), but we build defensively.
 */
export const VERBS: Record<string, Verb> = Object.fromEntries(
  VERB_LIST.map((verb) => [verb.infinitive, verb]),
);

/** All verbs at or below a given CEFR level, in declaration order. */
export function verbsUpToLevel(level: Verb["cefrLevel"]): Verb[] {
  const order: Verb["cefrLevel"][] = ["A0", "A1", "A2", "B1", "B2"];
  const max = order.indexOf(level);
  return VERB_LIST.filter((verb) => order.indexOf(verb.cefrLevel) <= max);
}
