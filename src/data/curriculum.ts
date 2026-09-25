// =============================================================================
// src/data/curriculum.ts
// The A0→B2 curriculum tree for the CLI Pisa track.
//
// structure: levels → units → lessons. Each lesson carries a "can-do"
// objective, an estimate for the timeline planner (Phase 2), and references to
// the grammar topics, verbs, and vocabulary it introduces. Most verb references
// resolve against src/data/verbs.ts; a few (e.g. chiamarsi, chiedere) are named
// as upcoming targets and will be added to the lexicon as their paradigms land.
// =============================================================================

import type { Curriculum } from "../types/index.js";

export const CURRICULUM: Curriculum = {
  levels: [
    // =========================================================================
    // A0 — Principiante assoluto
    // =========================================================================
    {
      code: "A0",
      title: "Principiante assoluto",
      description: "Alphabet, sounds, greetings, and survival basics.",
      recommendedHours: 40,
      units: [
        {
          slug: "alfabeto-e-suoni",
          title: "Alfabeto e suoni",
          summary: "The Italian alphabet, pronunciation, and stress.",
          lessons: [
            {
              slug: "alfabeto",
              title: "L'alfabeto italiano",
              objective: "Can recognise and name every letter of the alphabet.",
              estimatedMinutes: 20,
              grammarTopics: ["alphabet"],
              verbs: [],
              vocabulary: ["ciao", "sì", "no", "grazie", "per favore"],
            },
            {
              slug: "suoni-difficili",
              title: "Suoni difficili: c, g, gl, gn, sc",
              objective: "Can pronounce the tricky consonant clusters correctly.",
              estimatedMinutes: 25,
              grammarTopics: ["phonetics-cg"],
              verbs: [],
              vocabulary: ["gnocchi", "gelato", "sciare", "famiglia"],
            },
          ],
        },
        {
          slug: "saluti-e-presentazioni",
          title: "Saluti e presentazioni",
          summary: "Greetings, courtesy, and introducing yourself.",
          lessons: [
            {
              slug: "saluti",
              title: "Saluti e cortesia",
              objective: "Can greet people and use basic courtesy formulas.",
              estimatedMinutes: 20,
              grammarTopics: ["formal-informal"],
              verbs: [],
              vocabulary: ["buongiorno", "buonasera", "arrivederci", "prego"],
            },
            {
              slug: "mi-chiamo",
              title: "Come ti chiami?",
              objective: "Can state your name, origin, and ask others theirs.",
              estimatedMinutes: 30,
              grammarTopics: ["subject-pronouns"],
              verbs: ["essere", "chiamarsi"],
              vocabulary: ["nome", "cognome", "città"],
            },
          ],
        },
      ],
    },

    // =========================================================================
    // A1 — Contatto
    // =========================================================================
    {
      code: "A1",
      title: "Contatto",
      description: "Everyday phrases, introductions, present tense of regular verbs.",
      recommendedHours: 90,
      units: [
        {
          slug: "essere-e-avere",
          title: "Essere e avere",
          summary: "The two core auxiliary verbs and their uses.",
          lessons: [
            {
              slug: "presente-essere",
              title: "Il presente di essere",
              objective: "Can describe identity, origin, and states with essere.",
              estimatedMinutes: 25,
              grammarTopics: ["present-essere"],
              verbs: ["essere"],
              vocabulary: ["studente", "italiano", "stanco", "felice"],
            },
            {
              slug: "presente-avere",
              title: "Il presente di avere",
              objective: "Can express possession, age, and needs with avere.",
              estimatedMinutes: 25,
              grammarTopics: ["present-avere"],
              verbs: ["avere"],
              vocabulary: ["anni", "fame", "sete", "fretta"],
            },
          ],
        },
        {
          slug: "presente-regolari",
          title: "Il presente indicativo regolare",
          summary: "Present tense of -are, -ere, -ire verbs.",
          lessons: [
            {
              slug: "verbi-are",
              title: "Verbi in -ARE",
              objective: "Can conjugate and use regular -are verbs in the present.",
              estimatedMinutes: 30,
              grammarTopics: ["present-are"],
              verbs: ["parlare", "abitare", "lavorare", "mangiare", "studiare"],
              vocabulary: ["casa", "ufficio", "lingua"],
            },
            {
              slug: "verbi-ere-ire",
              title: "Verbi in -ERE e -IRE",
              objective: "Can conjugate regular -ere and -ire verbs, incl. -isc-.",
              estimatedMinutes: 35,
              grammarTopics: ["present-ere", "present-ire", "present-ire-isc"],
              verbs: ["credere", "dormire", "capire"],
              vocabulary: ["notte", "idea", "problema"],
            },
            {
              slug: "irregolari-frequenti",
              title: "Irregolari frequenti: fare, andare, venire",
              objective: "Can use the most common irregular verbs in the present.",
              estimatedMinutes: 35,
              grammarTopics: ["present-irregular"],
              verbs: ["fare", "andare", "venire", "dire", "stare", "dare"],
              vocabulary: ["mercato", "stazione", "lavoro"],
            },
            {
              slug: "modali",
              title: "Verbi modali: potere, volere",
              objective: "Can express ability and desire with modal verbs.",
              estimatedMinutes: 30,
              grammarTopics: ["modal-verbs"],
              verbs: ["potere", "volere"],
              vocabulary: ["aiuto", "biglietto"],
            },
          ],
        },
      ],
    },

    // =========================================================================
    // A2 — Sopravvivenza
    // =========================================================================
    {
      code: "A2",
      title: "Sopravvivenza",
      description: "Past and future tenses, routines, and immediate needs.",
      recommendedHours: 120,
      units: [
        {
          slug: "passato-prossimo",
          title: "Il passato prossimo",
          summary: "Talking about completed past actions.",
          lessons: [
            {
              slug: "passato-avere",
              title: "Passato prossimo con avere",
              objective: "Can narrate past actions using avere + participle.",
              estimatedMinutes: 35,
              grammarTopics: ["passato-prossimo-avere", "past-participle"],
              verbs: ["mangiare", "parlare", "credere", "capire"],
              vocabulary: ["ieri", "settimana", "mese"],
            },
            {
              slug: "passato-essere",
              title: "Passato prossimo con essere",
              objective: "Can use essere-auxiliary verbs with correct agreement.",
              estimatedMinutes: 35,
              grammarTopics: ["passato-prossimo-essere", "participle-agreement"],
              verbs: ["andare", "arrivare", "partire", "tornare", "uscire"],
              vocabulary: ["treno", "aeroporto", "vacanza"],
            },
          ],
        },
        {
          slug: "imperfetto-e-futuro",
          title: "Imperfetto e futuro",
          summary: "Describing the past and planning the future.",
          lessons: [
            {
              slug: "imperfetto",
              title: "L'imperfetto",
              objective: "Can describe habits and backgrounds in the past.",
              estimatedMinutes: 35,
              grammarTopics: ["imperfetto"],
              verbs: ["essere", "avere", "parlare", "bere"],
              vocabulary: ["sempre", "spesso", "da bambino"],
            },
            {
              slug: "futuro-semplice",
              title: "Il futuro semplice",
              objective: "Can talk about plans and make predictions.",
              estimatedMinutes: 30,
              grammarTopics: ["futuro-semplice"],
              verbs: ["essere", "avere", "andare", "fare", "cercare", "pagare"],
              vocabulary: ["domani", "prossimo", "forse"],
            },
          ],
        },
      ],
    },

    // =========================================================================
    // B1 — Soglia
    // =========================================================================
    {
      code: "B1",
      title: "Soglia",
      description: "Subjunctive, conditional, opinions, and articulated experiences.",
      recommendedHours: 180,
      units: [
        {
          slug: "condizionale",
          title: "Il condizionale",
          summary: "Politeness, hypotheticals, and reported future.",
          lessons: [
            {
              slug: "condizionale-presente",
              title: "Condizionale presente",
              objective: "Can make polite requests and express wishes.",
              estimatedMinutes: 35,
              grammarTopics: ["condizionale-presente"],
              verbs: ["volere", "potere", "dovere", "essere", "avere"],
              vocabulary: ["vorrei", "gentilmente", "magari"],
            },
            {
              slug: "condizionale-passato",
              title: "Condizionale passato",
              objective: "Can express unrealised past intentions and regrets.",
              estimatedMinutes: 35,
              grammarTopics: ["condizionale-passato"],
              verbs: ["andare", "fare", "dire", "rimanere"],
              vocabulary: ["avrei dovuto", "purtroppo"],
            },
          ],
        },
        {
          slug: "congiuntivo-intro",
          title: "Il congiuntivo presente",
          summary: "Expressing doubt, opinion, and emotion.",
          lessons: [
            {
              slug: "congiuntivo-presente",
              title: "Congiuntivo presente",
              objective: "Can express opinions and doubts with subordinate clauses.",
              estimatedMinutes: 40,
              grammarTopics: ["congiuntivo-presente"],
              verbs: ["essere", "avere", "fare", "andare", "capire"],
              vocabulary: ["penso che", "credo che", "sebbene"],
            },
          ],
        },
      ],
    },

    // =========================================================================
    // B2 — Progresso
    // =========================================================================
    {
      code: "B2",
      title: "Progresso",
      description: "Complex discourse, conditionals, formal register, argumentation.",
      recommendedHours: 220,
      units: [
        {
          slug: "congiuntivo-avanzato",
          title: "Congiuntivo imperfetto e trapassato",
          summary: "Past subjunctive and the sequence of tenses.",
          lessons: [
            {
              slug: "congiuntivo-imperfetto",
              title: "Congiuntivo imperfetto",
              objective: "Can use the past subjunctive in dependent clauses.",
              estimatedMinutes: 40,
              grammarTopics: ["congiuntivo-imperfetto", "concordanza-tempi"],
              verbs: ["essere", "avere", "fare", "dire", "venire"],
              vocabulary: ["credevo che", "come se", "affinché"],
            },
          ],
        },
        {
          slug: "periodo-ipotetico",
          title: "Il periodo ipotetico",
          summary: "The three types of conditional sentences.",
          lessons: [
            {
              slug: "ipotetico-irrealta",
              title: "Periodo ipotetico dell'irrealtà",
              objective: "Can construct counterfactual conditionals fluently.",
              estimatedMinutes: 45,
              grammarTopics: ["periodo-ipotetico-3"],
              verbs: ["essere", "avere", "potere", "volere", "sapere"],
              vocabulary: ["se avessi", "sarei stato", "avrei potuto"],
            },
            {
              slug: "discorso-indiretto",
              title: "Il discorso indiretto",
              objective: "Can report speech with correct tense shifts.",
              estimatedMinutes: 45,
              grammarTopics: ["discorso-indiretto", "concordanza-tempi"],
              verbs: ["dire", "chiedere", "rispondere"],
              vocabulary: ["disse che", "chiese se"],
            },
          ],
        },
      ],
    },
  ],
};

// -----------------------------------------------------------------------------
// Derived helpers
// -----------------------------------------------------------------------------

/** Total estimated study minutes for a level (sum of its lessons). */
export function levelMinutes(levelCode: Curriculum["levels"][number]["code"]): number {
  const level = CURRICULUM.levels.find((l) => l.code === levelCode);
  if (!level) return 0;
  return level.units
    .flatMap((u) => u.lessons)
    .reduce((sum, lesson) => sum + lesson.estimatedMinutes, 0);
}

/** Count of lessons in the entire curriculum. */
export function totalLessons(): number {
  return CURRICULUM.levels
    .flatMap((l) => l.units)
    .flatMap((u) => u.lessons).length;
}
