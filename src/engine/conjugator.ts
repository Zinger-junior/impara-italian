// =============================================================================
// src/engine/conjugator.ts
// Italian verb conjugation engine.
//
// Pure, deterministic, dependency-free. Runs identically in the browser and
// Node. Handles the three regular classes (-are, -ere, -ire), the -isc- infix
// class, -care/-gare/-ciare/-giare/-iare orthographic rules, and a 16-verb
// irregular override table. Compound tenses are assembled from the correct
// auxiliary (essere/avere) + past participle, with optional agreement.
// =============================================================================

import type {
  Agreement,
  Auxiliary,
  ConjugationClass,
  FullConjugation,
  IrregularVerb,
  NonFiniteForms,
  Paradigm,
  SimpleTense,
  Verb,
} from "../types/index.js";
import { IRREGULARS } from "../data/irregulars.js";

// -----------------------------------------------------------------------------
// Errors
// -----------------------------------------------------------------------------

/** Thrown when a verb cannot be conjugated (bad infinitive, unknown request). */
export class ConjugationError extends Error {
  constructor(
    message: string,
    public readonly infinitive: string,
  ) {
    super(message);
    this.name = "ConjugationError";
  }
}

// -----------------------------------------------------------------------------
// Regular ending tables (6-tuples: io, tu, lui/lei, noi, voi, loro)
// futuroSemplice + condizionalePresente are handled separately via the future
// stem, so they are intentionally absent here.
// -----------------------------------------------------------------------------

type SimpleSlotNoFuture = Exclude<
  SimpleTense,
  "futuroSemplice" | "condizionalePresente"
>;

const ENDINGS: Record<ConjugationClass, Record<SimpleSlotNoFuture, Paradigm>> = {
  are: {
    presente: ["o", "i", "a", "iamo", "ate", "ano"],
    imperfetto: ["avo", "avi", "ava", "avamo", "avate", "avano"],
    passatoRemoto: ["ai", "asti", "ò", "ammo", "aste", "arono"],
    congiuntivoPresente: ["i", "i", "i", "iamo", "iate", "ino"],
    congiuntivoImperfetto: ["assi", "assi", "asse", "assimo", "aste", "assero"],
    imperativoPresente: ["", "a", "i", "iamo", "ate", "ino"],
  },
  ere: {
    presente: ["o", "i", "e", "iamo", "ete", "ono"],
    imperfetto: ["evo", "evi", "eva", "evamo", "evate", "evano"],
    passatoRemoto: ["ei", "esti", "é", "emmo", "este", "erono"],
    congiuntivoPresente: ["a", "a", "a", "iamo", "iate", "ano"],
    congiuntivoImperfetto: ["essi", "essi", "esse", "essimo", "este", "essero"],
    imperativoPresente: ["", "i", "a", "iamo", "ete", "ano"],
  },
  ire: {
    presente: ["o", "i", "e", "iamo", "ite", "ono"],
    imperfetto: ["ivo", "ivi", "iva", "ivamo", "ivate", "ivano"],
    passatoRemoto: ["ii", "isti", "ì", "immo", "iste", "irono"],
    congiuntivoPresente: ["a", "a", "a", "iamo", "iate", "ano"],
    congiuntivoImperfetto: ["issi", "issi", "isse", "issimo", "iste", "issero"],
    imperativoPresente: ["", "i", "a", "iamo", "ite", "ano"],
  },
  "ire-isc": {
    // The -isc- infix appears in the three singular persons and the 3rd plural.
    presente: ["isco", "isci", "isce", "iamo", "ite", "iscono"],
    imperfetto: ["ivo", "ivi", "iva", "ivamo", "ivate", "ivano"],
    passatoRemoto: ["ii", "isti", "ì", "immo", "iste", "irono"],
    congiuntivoPresente: ["isca", "isca", "isca", "iamo", "iate", "iscano"],
    congiuntivoImperfetto: ["issi", "issi", "isse", "issimo", "iste", "issero"],
    imperativoPresente: ["", "isci", "isca", "iamo", "ite", "iscano"],
  },
};

/** Endings applied to the future stem (which already ends in "r"). */
const FUTURE_ENDINGS: Paradigm = ["ò", "ai", "à", "emo", "ete", "anno"];
const CONDITIONAL_ENDINGS: Paradigm = ["ei", "esti", "ebbe", "emmo", "este", "ebbero"];

// -----------------------------------------------------------------------------
// Internal auxiliary verb descriptors (essere / avere)
// -----------------------------------------------------------------------------

const AUX_VERBS: Record<"essere" | "avere", Verb> = {
  essere: {
    infinitive: "essere",
    translation: "to be",
    conjugationClass: "ere",
    auxiliary: "essere",
    isIrregular: true,
    isReflexive: false,
    cefrLevel: "A0",
  },
  avere: {
    infinitive: "avere",
    translation: "to have",
    conjugationClass: "ere",
    auxiliary: "avere",
    isIrregular: true,
    isReflexive: false,
    cefrLevel: "A0",
  },
};

// -----------------------------------------------------------------------------
// Low-level helpers
// -----------------------------------------------------------------------------

/** Strip the 3-character infinitive ending (-are/-ere/-ire) to get the stem. */
function getStem(infinitive: string): string {
  return infinitive.slice(0, -3);
}

/** Validate & detect the regular class from an infinitive suffix. */
export function detectClass(infinitive: string): "are" | "ere" | "ire" {
  if (infinitive.endsWith("are")) return "are";
  if (infinitive.endsWith("ere")) return "ere";
  if (infinitive.endsWith("ire")) return "ire";
  throw new ConjugationError(
    `Infinitive "${infinitive}" does not end in -are/-ere/-ire.`,
    infinitive,
  );
}

/**
 * Attach an ending to an -ARE stem, applying Italian orthographic rules that
 * preserve the stem's consonant sound before a front vowel (i/e):
 *   - stems in -c/-g gain an "h"     (cerc + i  → cerchi ; pag + er → pagher)
 *   - stems in -ci/-gi drop the "i"  (mangi + iamo → mangiamo ; mangi + er → manger)
 *   - stems in -i drop a colliding i (studi + iamo → studiamo ; studi + i → studi)
 */
function joinAre(stem: string, ending: string): string {
  const first = ending.charAt(0);
  const frontVowel = first === "i" || first === "e";
  if (frontVowel) {
    if (stem.endsWith("ci") || stem.endsWith("gi")) {
      return stem.slice(0, -1) + ending; // drop the softening i
    }
    if (stem.endsWith("i")) {
      // Only collapse a doubled i; keep studi + er → studier.
      return first === "i" ? stem.slice(0, -1) + ending : stem + ending;
    }
    if (stem.endsWith("c") || stem.endsWith("g")) {
      return stem + "h" + ending; // preserve the hard sound
    }
  }
  return stem + ending;
}

/** Plain concatenation used for -ere/-ire classes (no orthographic changes). */
function plainJoin(stem: string, ending: string): string {
  return stem + ending;
}

/** Compute the future/conditional stem (ends in "r"), honoring irregulars. */
function futureStemOf(verb: Verb, irr: IrregularVerb | undefined): string {
  if (irr?.futureStem) return irr.futureStem;
  const stem = getStem(verb.infinitive);
  switch (verb.conjugationClass) {
    case "are":
      return joinAre(stem, "er");
    case "ere":
      return stem + "er";
    case "ire":
    case "ire-isc":
      return stem + "ir";
  }
}

// -----------------------------------------------------------------------------
// Simple-tense generation
// -----------------------------------------------------------------------------

function genSimple(
  verb: Verb,
  irr: IrregularVerb | undefined,
  slot: SimpleTense,
): Paradigm {
  if (slot === "futuroSemplice") {
    const s = futureStemOf(verb, irr);
    return FUTURE_ENDINGS.map((e) => s + e) as Paradigm;
  }
  if (slot === "condizionalePresente") {
    const s = futureStemOf(verb, irr);
    return CONDITIONAL_ENDINGS.map((e) => s + e) as Paradigm;
  }

  const stem = getStem(verb.infinitive);
  const endings = ENDINGS[verb.conjugationClass][slot];
  const join = verb.conjugationClass === "are" ? joinAre : plainJoin;
  return endings.map((e) => (e === "" ? "" : join(stem, e))) as Paradigm;
}

/** Resolve a single simple-tense paradigm, preferring an irregular override. */
function simpleParadigm(
  verb: Verb,
  irr: IrregularVerb | undefined,
  slot: SimpleTense,
): Paradigm {
  const override = irr?.overrides?.[slot];
  if (override) return [...override] as Paradigm;
  return genSimple(verb, irr, slot);
}

// -----------------------------------------------------------------------------
// Non-finite forms
// -----------------------------------------------------------------------------

function nonFiniteForms(verb: Verb, irr: IrregularVerb | undefined): NonFiniteForms {
  const stem = getStem(verb.infinitive);
  const cls = verb.conjugationClass;

  const pastParticiple =
    irr?.pastParticiple ??
    (cls === "are" ? stem + "ato" : cls === "ere" ? stem + "uto" : stem + "ito");

  const gerund = irr?.gerund ?? (cls === "are" ? stem + "ando" : stem + "endo");

  const presentParticiple = cls === "are" ? stem + "ante" : stem + "ente";

  return {
    infinitive: verb.infinitive,
    gerund,
    pastParticiple,
    presentParticiple,
  };
}

// -----------------------------------------------------------------------------
// Compound-tense assembly
// -----------------------------------------------------------------------------

/** Agree a past participle (ending in -o) for essere-auxiliary compounds. */
function agreeParticiple(pp: string, personIndex: number, agreement?: Agreement): string {
  const number = personIndex <= 2 ? "singular" : "plural";
  const gender = agreement?.gender ?? "m";
  const stem = pp.slice(0, -1); // drop the final vowel
  if (gender === "m") return number === "singular" ? stem + "o" : stem + "i";
  return number === "singular" ? stem + "a" : stem + "e";
}

/** Build a compound paradigm: auxiliary form + (agreeing) past participle. */
function compound(
  auxParadigm: Paradigm,
  pastParticiple: string,
  effectiveAux: "essere" | "avere",
  agreement?: Agreement,
): Paradigm {
  return auxParadigm.map((auxForm, i) => {
    if (!auxForm) return "";
    const participle =
      effectiveAux === "essere"
        ? agreeParticiple(pastParticiple, i, agreement)
        : pastParticiple; // avere: participle is invariant here
    return `${auxForm} ${participle}`;
  }) as Paradigm;
}

/** Conjugate one simple slot of an auxiliary verb. */
function auxSlot(aux: "essere" | "avere", slot: SimpleTense): Paradigm {
  return simpleParadigm(AUX_VERBS[aux], IRREGULARS[aux], slot);
}

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

export interface ConjugateAllOptions {
  /** Past-participle agreement for essere-auxiliary compound tenses. */
  agreement?: Agreement;
}

/**
 * Fully conjugate a verb across every supported mood and tense.
 * This is the primary, fully-typed entry point.
 */
export function conjugateAll(verb: Verb, opts: ConjugateAllOptions = {}): FullConjugation {
  // Validate the infinitive shape unless we have an explicit irregular paradigm.
  const irr = IRREGULARS[verb.infinitive];
  if (!irr) detectClass(verb.infinitive);

  const { agreement } = opts;
  const isRegular = !irr;

  // Auxiliary used for compound tenses ("both" defaults to avere).
  const effAux: "essere" | "avere" = verb.auxiliary === "essere" ? "essere" : "avere";

  const nonFinite = nonFiniteForms(verb, irr);
  const pp = nonFinite.pastParticiple;

  // --- Simple tenses ---------------------------------------------------------
  const indPresente = simpleParadigm(verb, irr, "presente");
  const indImperfetto = simpleParadigm(verb, irr, "imperfetto");
  const indPassatoRemoto = simpleParadigm(verb, irr, "passatoRemoto");
  const indFuturoSemplice = simpleParadigm(verb, irr, "futuroSemplice");
  const congPresente = simpleParadigm(verb, irr, "congiuntivoPresente");
  const congImperfetto = simpleParadigm(verb, irr, "congiuntivoImperfetto");
  const condPresente = simpleParadigm(verb, irr, "condizionalePresente");
  const impPresente = simpleParadigm(verb, irr, "imperativoPresente");

  // --- Auxiliary paradigms needed for compounds ------------------------------
  const auxPresente = auxSlot(effAux, "presente");
  const auxImperfetto = auxSlot(effAux, "imperfetto");
  const auxPassatoRemoto = auxSlot(effAux, "passatoRemoto");
  const auxFuturo = auxSlot(effAux, "futuroSemplice");
  const auxCongPresente = auxSlot(effAux, "congiuntivoPresente");
  const auxCongImperfetto = auxSlot(effAux, "congiuntivoImperfetto");
  const auxCondPresente = auxSlot(effAux, "condizionalePresente");

  return {
    infinitive: verb.infinitive,
    auxiliary: verb.auxiliary,
    isRegular,
    nonFinite,
    indicativo: {
      presente: indPresente,
      imperfetto: indImperfetto,
      passatoRemoto: indPassatoRemoto,
      futuroSemplice: indFuturoSemplice,
      passatoProssimo: compound(auxPresente, pp, effAux, agreement),
      trapassatoProssimo: compound(auxImperfetto, pp, effAux, agreement),
      trapassatoRemoto: compound(auxPassatoRemoto, pp, effAux, agreement),
      futuroAnteriore: compound(auxFuturo, pp, effAux, agreement),
    },
    congiuntivo: {
      presente: congPresente,
      imperfetto: congImperfetto,
      passato: compound(auxCongPresente, pp, effAux, agreement),
      trapassato: compound(auxCongImperfetto, pp, effAux, agreement),
    },
    condizionale: {
      presente: condPresente,
      passato: compound(auxCondPresente, pp, effAux, agreement),
    },
    imperativo: {
      presente: impPresente,
    },
  };
}

// --- conjugate(): typed convenience returning a single paradigm --------------

export function conjugate(
  verb: Verb,
  opts: { mood: "indicativo"; tense: keyof FullConjugation["indicativo"]; agreement?: Agreement },
): Paradigm;
export function conjugate(
  verb: Verb,
  opts: { mood: "congiuntivo"; tense: keyof FullConjugation["congiuntivo"]; agreement?: Agreement },
): Paradigm;
export function conjugate(
  verb: Verb,
  opts: { mood: "condizionale"; tense: keyof FullConjugation["condizionale"]; agreement?: Agreement },
): Paradigm;
export function conjugate(
  verb: Verb,
  opts: { mood: "imperativo"; tense: keyof FullConjugation["imperativo"]; agreement?: Agreement },
): Paradigm;
export function conjugate(
  verb: Verb,
  opts: { mood: string; tense: string; agreement?: Agreement },
): Paradigm {
  const full = conjugateAll(verb, opts.agreement ? { agreement: opts.agreement } : {});
  const group = (full as unknown as Record<string, Record<string, Paradigm>>)[opts.mood];
  const paradigm = group?.[opts.tense];
  if (!paradigm) {
    throw new ConjugationError(
      `No conjugation for mood="${opts.mood}", tense="${opts.tense}".`,
      verb.infinitive,
    );
  }
  return paradigm;
}

/** Return a single inflected form by person index (0..5). */
export function conjugateForm(
  verb: Verb,
  opts: { mood: string; tense: string; person: number; agreement?: Agreement },
): string {
  if (opts.person < 0 || opts.person > 5) {
    throw new ConjugationError(`Person index out of range: ${opts.person}`, verb.infinitive);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paradigm = conjugate(verb, opts as any);
  return paradigm[opts.person] ?? "";
}

/**
 * Non-throwing wrapper for the Phase 4 stress-test harness. Returns a tagged
 * result instead of raising, so batch conjugation can continue past bad inputs.
 */
export function safeConjugateAll(
  verb: Verb,
  opts: ConjugateAllOptions = {},
): { ok: true; value: FullConjugation } | { ok: false; error: string } {
  try {
    return { ok: true, value: conjugateAll(verb, opts) };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}
