// =============================================================================
// src/types/index.ts
// Domain types for the Impara Italian A0→B2 platform.
// These mirror the SQL schema but are the runtime contract for the TypeScript
// layer (curriculum data, verb lexicon, conjugation engine).
// =============================================================================

/** CEFR levels covered by the CLI Pisa track. A0 is our pre-A1 foundation. */
export type CefrLevel = "A0" | "A1" | "A2" | "B1" | "B2";

export const CEFR_ORDER: readonly CefrLevel[] = ["A0", "A1", "A2", "B1", "B2"] as const;

// -----------------------------------------------------------------------------
// Curriculum tree
// -----------------------------------------------------------------------------

export interface CefrLevelInfo {
  code: CefrLevel;
  title: string;
  description: string;
  recommendedHours: number;
}

export interface Curriculum {
  levels: LevelNode[];
}

export interface LevelNode {
  code: CefrLevel;
  title: string;
  description: string;
  recommendedHours: number;
  units: UnitNode[];
}

export interface UnitNode {
  slug: string;
  title: string;
  summary: string;
  lessons: LessonNode[];
}

export interface LessonNode {
  slug: string;
  title: string;
  /** "Can-do" objective, phrased as a learner competency. */
  objective: string;
  estimatedMinutes: number;
  /** Grammar topic slugs introduced in this lesson. */
  grammarTopics: string[];
  /** Verb infinitives introduced or drilled in this lesson. */
  verbs: string[];
  /** Vocabulary lemmas introduced in this lesson. */
  vocabulary: string[];
}

// -----------------------------------------------------------------------------
// Verb lexicon
// -----------------------------------------------------------------------------

export type ConjugationClass = "are" | "ere" | "ire" | "ire-isc";
export type Auxiliary = "avere" | "essere" | "both";

export interface Verb {
  infinitive: string;
  translation: string;
  conjugationClass: ConjugationClass;
  auxiliary: Auxiliary;
  isIrregular: boolean;
  isReflexive: boolean;
  cefrLevel: CefrLevel;
  /** Corpus frequency rank (1 = most frequent). Optional. */
  frequencyRank?: number;
}

// -----------------------------------------------------------------------------
// Morphology: moods, tenses, persons
// -----------------------------------------------------------------------------

export type Mood =
  | "indicativo"
  | "congiuntivo"
  | "condizionale"
  | "imperativo";

/** Simple (single-word) tenses generated directly by the engine. */
export type SimpleTense =
  | "presente"
  | "imperfetto"
  | "passatoRemoto"
  | "futuroSemplice"
  | "congiuntivoPresente"
  | "congiuntivoImperfetto"
  | "condizionalePresente"
  | "imperativoPresente";

/** Compound (auxiliary + participle) tenses. */
export type CompoundTense =
  | "passatoProssimo"
  | "trapassatoProssimo"
  | "trapassatoRemoto"
  | "futuroAnteriore"
  | "congiuntivoPassato"
  | "congiuntivoTrapassato"
  | "condizionalePassato";

export type Tense = SimpleTense | CompoundTense;

/**
 * Six morphological persons, indexed 0..5:
 * 0: io (1sg), 1: tu (2sg), 2: lui/lei (3sg),
 * 3: noi (1pl), 4: voi (2pl), 5: loro (3pl).
 */
export const PERSONS = ["io", "tu", "lui/lei", "noi", "voi", "loro"] as const;
export type Person = (typeof PERSONS)[number];

/** A tense paradigm: exactly six forms, one per person. Empty string = no such form. */
export type Paradigm = [string, string, string, string, string, string];

/** Gender/number for essere-auxiliary past-participle agreement. */
export interface Agreement {
  gender: "m" | "f";
  number: "singular" | "plural";
}

// -----------------------------------------------------------------------------
// Conjugation request / result
// -----------------------------------------------------------------------------

export interface ConjugateOptions {
  mood: Mood;
  tense: Tense;
  /**
   * For essere-auxiliary compound tenses, controls past-participle agreement.
   * Ignored for avere-auxiliary verbs. Defaults to masculine, matching the
   * grammatical number of each person.
   */
  agreement?: Agreement;
}

/** Non-finite forms of a verb, computed once. */
export interface NonFiniteForms {
  infinitive: string;
  gerund: string;
  pastParticiple: string;
  presentParticiple: string;
}

/** Full conjugation of a verb across every supported mood/tense. */
export interface FullConjugation {
  infinitive: string;
  auxiliary: Auxiliary;
  isRegular: boolean;
  nonFinite: NonFiniteForms;
  indicativo: Record<
    | "presente"
    | "imperfetto"
    | "passatoRemoto"
    | "futuroSemplice"
    | "passatoProssimo"
    | "trapassatoProssimo"
    | "trapassatoRemoto"
    | "futuroAnteriore",
    Paradigm
  >;
  congiuntivo: Record<
    "presente" | "imperfetto" | "passato" | "trapassato",
    Paradigm
  >;
  condizionale: Record<"presente" | "passato", Paradigm>;
  imperativo: Record<"presente", Paradigm>;
}

// -----------------------------------------------------------------------------
// Irregular verb override table
// -----------------------------------------------------------------------------

/**
 * An irregular verb is defined by the forms that deviate from the regular
 * pattern. Anything not supplied here is generated by the regular engine, so
 * each entry stays minimal and auditable.
 */
export interface IrregularVerb {
  infinitive: string;
  auxiliary: Auxiliary;
  /** Irregular past participle (e.g. "fatto"). If omitted, generated regularly. */
  pastParticiple?: string;
  /** Irregular gerund (e.g. "facendo"). If omitted, generated regularly. */
  gerund?: string;
  /**
   * Irregular future/conditional stem (shared by both), ending in "r"
   * (e.g. "avr", "andr", "verr"). If omitted, generated regularly.
   */
  futureStem?: string;
  /**
   * Full six-person overrides for simple tenses that are irregular.
   * Key = SimpleTense. Use an empty string in a slot when a person has no form
   * (e.g. imperativo io/1sg).
   */
  overrides?: Partial<Record<SimpleTense, Paradigm>>;
}
