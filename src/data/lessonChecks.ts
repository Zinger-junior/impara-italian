// =============================================================================
// src/data/lessonChecks.ts
// A short graded check for every lesson. Passing one (>= its `pass` %) is what
// unlocks the next lesson — see src/progress/gating.ts.
//
// Two question shapes, kept deliberately simple so they render without the full
// quiz engine:
//   • multiple choice — set `options`; the correct one must equal `answer`.
//   • typed           — omit `options`; graded against `answer` + `accept`,
//                       case/accent/apostrophe-insensitive (see `norm` below).
// =============================================================================

export interface CheckQuestion {
  /** Shown to the learner. */
  prompt: string;
  /** Optional helper line under the prompt. */
  hint?: string;
  /** The correct answer. For MC this must be one of `options` verbatim. */
  answer: string;
  /** Present → multiple choice. Absent → typed input. */
  options?: string[];
  /** Extra accepted typed answers (already lenient on case/accents). */
  accept?: string[];
  /** Listening question: play `answer` aloud and type what you hear (no options). */
  listen?: boolean;
}

export interface LessonCheck {
  /** Pass mark, as a percentage. */
  pass: number;
  questions: CheckQuestion[];
}

// ---- Grading ----------------------------------------------------------------

/** Lenient normaliser for typed answers: lowercase, no accents/apostrophes/punctuation. */
function norm(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’`]/g, "")
    .replace(/[.,!?;:]/g, "")
    .replace(/\s+/g, " ");
}

export function isCorrect(q: CheckQuestion, given: string | undefined): boolean {
  if (given == null || given.trim() === "") return false;
  if (q.options && q.options.length > 0) return given === q.answer; // exact option match
  const g = norm(given);
  if (g === norm(q.answer)) return true;
  return (q.accept ?? []).some((a) => norm(a) === g);
}

export interface CheckGrade {
  correct: number;
  total: number;
  pct: number;
  results: boolean[];
}

export function gradeCheck(check: LessonCheck, answers: Record<number, string>): CheckGrade {
  const results = check.questions.map((q, i) => isCorrect(q, answers[i]));
  const correct = results.filter(Boolean).length;
  const total = check.questions.length;
  return { correct, total, pct: total ? Math.round((correct / total) * 100) : 0, results };
}

// ---- Content ----------------------------------------------------------------

const PASS = 70;

/** Keyed by lesson slug (matches src/data/curriculum.ts). */
export const LESSON_CHECKS: Record<string, LessonCheck> = {
  // ---- A0 -------------------------------------------------------------------
  alfabeto: {
    pass: PASS,
    questions: [
      { prompt: "The letter H in Italian is called…", answer: "acca", options: ["acca", "hotel", "acqua", "elle"] },
      { prompt: "The letter J is called…", answer: "i lunga", options: ["i lunga", "gei", "iota", "ji"] },
      { prompt: "How many letters are in the standard Italian alphabet?", answer: "21", options: ["21", "24", "26", "19"] },
      { prompt: "Write the Italian for “thank you”.", answer: "grazie" },
    ],
  },
  "suoni-difficili": {
    pass: PASS,
    questions: [
      { prompt: "“ci” in ciao sounds like…", answer: "ch in chip", options: ["ch in chip", "k in kite", "sh in shoe", "ts in cats"] },
      { prompt: "“gli” in famiglia sounds most like…", answer: "lli / ly", options: ["lli / ly", "hard g + l", "guttural g", "j in jam"] },
      { prompt: "“gn” in gnocchi sounds like…", answer: "ny in canyon", options: ["ny in canyon", "g + n separately", "ng in sing", "hard g"] },
      { prompt: "“sci” in sciare sounds like…", answer: "sh in ship", options: ["sh in ship", "sk in sky", "s + ch", "ts"] },
      { prompt: "“che” is pronounced…", answer: "ke", options: ["ke", "che (as in church)", "she", "tse"] },
    ],
  },
  saluti: {
    pass: PASS,
    questions: [
      { prompt: "You greet someone at 6 pm. You say…", answer: "Buonasera", options: ["Buonasera", "Buongiorno", "Buonanotte", "Ciao ciao"] },
      { prompt: "Someone says “Grazie”. You reply…", answer: "Prego", options: ["Prego", "Scusa", "Salve", "Ciao"] },
      { prompt: "Translate “goodbye” (neutral / polite).", answer: "arrivederci" },
      { prompt: "“Ciao” is…", answer: "informal — hello or bye", options: ["informal — hello or bye", "formal only", "only goodbye", "written only"] },
      { prompt: "Listen and type what you hear.", answer: "buongiorno", listen: true },
    ],
  },
  "mi-chiamo": {
    pass: PASS,
    questions: [
      { prompt: "Complete: “Mi ___ Marco.” (my name is Marco)", answer: "chiamo" },
      { prompt: "“Come ti chiami?” means…", answer: "What's your name? (informal)", options: ["What's your name? (informal)", "How are you?", "Where are you from?", "How old are you?"] },
      { prompt: "“I am” = “io ___”.", answer: "sono" },
      { prompt: "To ask a stranger their name politely:", answer: "Come si chiama?", options: ["Come si chiama?", "Come ti chiami?", "Chi sei?", "Che nome?"] },
    ],
  },

  // ---- A1 -------------------------------------------------------------------
  "presente-essere": {
    pass: PASS,
    questions: [
      { prompt: "io ___ (essere)", answer: "sono" },
      { prompt: "tu ___ italiano? (essere)", answer: "sei" },
      { prompt: "noi ___ (essere)", answer: "siamo" },
      { prompt: "voi ___ (essere)", answer: "siete" },
      { prompt: "“Loro sono” means…", answer: "they are", options: ["they are", "we are", "you are (pl)", "he is"] },
      { prompt: "Listen and type what you hear.", answer: "io sono italiano", listen: true },
    ],
  },
  "presente-avere": {
    pass: PASS,
    questions: [
      { prompt: "io ___ (avere)", answer: "ho" },
      { prompt: "lei ___ fame (avere)", answer: "ha" },
      { prompt: "noi ___ (avere)", answer: "abbiamo" },
      { prompt: "loro ___ (avere)", answer: "hanno" },
      { prompt: "To say “I'm 20 years old”:", answer: "Ho vent'anni", options: ["Ho vent'anni", "Sono vent'anni", "Ho venti", "Sto vent'anni"] },
      { prompt: "Listen and type what you hear.", answer: "ho fame", listen: true },
    ],
  },
  "verbi-are": {
    pass: PASS,
    questions: [
      { prompt: "io (parlare) → ___", answer: "parlo" },
      { prompt: "tu (abitare) → ___", answer: "abiti" },
      { prompt: "noi (lavorare) → ___", answer: "lavoriamo" },
      { prompt: "loro (mangiare) → ___", answer: "mangiano" },
      { prompt: "The -are ending for lui/lei is…", answer: "-a", options: ["-a", "-e", "-i", "-o"] },
    ],
  },
  "verbi-ere-ire": {
    pass: PASS,
    questions: [
      { prompt: "io (credere) → ___", answer: "credo" },
      { prompt: "noi (dormire) → ___", answer: "dormiamo" },
      { prompt: "io (capire) → ___", hint: "an -isc- verb", answer: "capisco" },
      { prompt: "loro (capire) → ___", answer: "capiscono" },
      { prompt: "Which verb takes -isc- in the present?", answer: "capire", options: ["capire", "dormire", "credere", "partire"] },
    ],
  },
  "irregolari-frequenti": {
    pass: PASS,
    questions: [
      { prompt: "io (fare) → ___", answer: "faccio" },
      { prompt: "io (andare) → ___", answer: "vado" },
      { prompt: "io (venire) → ___", answer: "vengo" },
      { prompt: "tu (stare) → ___", answer: "stai" },
      { prompt: "loro (dire) → ___", answer: "dicono" },
    ],
  },
  modali: {
    pass: PASS,
    questions: [
      { prompt: "io (potere) → ___", answer: "posso" },
      { prompt: "io (volere) → ___", answer: "voglio" },
      { prompt: "noi (potere) → ___", answer: "possiamo" },
      { prompt: "A modal verb is followed by…", answer: "the infinitive", options: ["the infinitive", "the gerund", "a participle", "the subjunctive"] },
      { prompt: "“I want to eat” = “Voglio ___.”", answer: "mangiare" },
    ],
  },

  // ---- A2 -------------------------------------------------------------------
  "passato-avere": {
    pass: PASS,
    questions: [
      { prompt: "Passato prossimo: io (parlare) → “ho ___”", answer: "parlato" },
      { prompt: "noi (mangiare) → “abbiamo ___”", answer: "mangiato" },
      { prompt: "io (credere) → “ho ___”", answer: "creduto" },
      { prompt: "loro (capire) → “hanno ___”", answer: "capito" },
      { prompt: "The auxiliary in “ho mangiato” is…", answer: "avere", options: ["avere", "essere", "stare", "fare"] },
      { prompt: "Listen and type what you hear.", answer: "ho mangiato", listen: true },
    ],
  },
  "passato-essere": {
    pass: PASS,
    questions: [
      { prompt: "Marco è ___ (andare) — masculine", answer: "andato" },
      { prompt: "Maria è ___ (partire) — feminine", answer: "partita" },
      { prompt: "Le ragazze sono ___ (tornare)", answer: "tornate" },
      { prompt: "I ragazzi sono ___ (uscire)", answer: "usciti" },
      { prompt: "With essere, the participle agrees in…", answer: "gender and number", options: ["gender and number", "tense", "person only", "nothing"] },
    ],
  },
  imperfetto: {
    pass: PASS,
    questions: [
      { prompt: "io (parlare) imperfetto → ___", answer: "parlavo" },
      { prompt: "noi (avere) imperfetto → ___", answer: "avevamo" },
      { prompt: "io (essere) imperfetto → ___", answer: "ero" },
      { prompt: "tu (bere) imperfetto → ___", answer: "bevevi" },
      { prompt: "The imperfetto is used for…", answer: "habits / background in the past", options: ["habits / background in the past", "a single finished action", "the future", "commands"] },
    ],
  },
  "futuro-semplice": {
    pass: PASS,
    questions: [
      { prompt: "io (parlare) futuro → ___", answer: "parlerò", accept: ["parlero"] },
      { prompt: "io (essere) futuro → ___", answer: "sarò", accept: ["saro"] },
      { prompt: "io (avere) futuro → ___", answer: "avrò", accept: ["avro"] },
      { prompt: "io (andare) futuro → ___", answer: "andrò", accept: ["andro"] },
      { prompt: "“cercare” in the future keeps the hard c with…", answer: "an h: cercherò", options: ["an h: cercherò", "nothing: cercerò", "a double c", "dropping the c"] },
    ],
  },

  // ---- B1 -------------------------------------------------------------------
  "condizionale-presente": {
    pass: PASS,
    questions: [
      { prompt: "io (volere) condizionale → ___", answer: "vorrei" },
      { prompt: "io (potere) condizionale → ___", answer: "potrei" },
      { prompt: "io (essere) condizionale → ___", answer: "sarei" },
      { prompt: "noi (avere) condizionale → ___", answer: "avremmo" },
      { prompt: "“Vorrei un caffè” is…", answer: "a polite request", options: ["a polite request", "a command", "the past tense", "a question word"] },
      { prompt: "Listen and type what you hear.", answer: "vorrei un caffè", listen: true, accept: ["vorrei un caffe"] },
    ],
  },
  "condizionale-passato": {
    pass: PASS,
    questions: [
      { prompt: "Condizionale passato = ___ + participle.", answer: "condizionale of essere/avere", options: ["condizionale of essere/avere", "imperfetto", "futuro", "the present"] },
      { prompt: "“I would have eaten” = “avrei ___”.", answer: "mangiato" },
      { prompt: "“I would have gone” (masc.) = “sarei ___”.", answer: "andato" },
      { prompt: "“Avrei dovuto studiare” expresses…", answer: "past regret / obligation", options: ["past regret / obligation", "a future plan", "present ability", "a question"] },
    ],
  },
  "congiuntivo-presente": {
    pass: PASS,
    questions: [
      { prompt: "Penso che lui ___ (essere) stanco.", answer: "sia" },
      { prompt: "Credo che loro ___ (avere) ragione.", answer: "abbiano" },
      { prompt: "Voglio che tu ___ (fare) i compiti.", answer: "faccia" },
      { prompt: "Spero che tu ___ (capire).", answer: "capisca" },
      { prompt: "The subjunctive appears after…", answer: "penso che / credo che", options: ["penso che / credo che", "perché (because)", "quando + a fact", "the future"] },
    ],
  },

  // ---- B2 -------------------------------------------------------------------
  "congiuntivo-imperfetto": {
    pass: PASS,
    questions: [
      { prompt: "Credevo che lui ___ (essere) qui.", answer: "fosse" },
      { prompt: "Volevo che tu ___ (venire).", answer: "venissi" },
      { prompt: "Pensavo che loro ___ (avere) tempo.", answer: "avessero" },
      { prompt: "Congiuntivo imperfetto follows a main verb in the…", answer: "past / conditional", options: ["past / conditional", "present", "future", "imperative"] },
    ],
  },
  "ipotetico-irrealta": {
    pass: PASS,
    questions: [
      { prompt: "Type 3 (irreality): “Se ___, sarei venuto.”", answer: "avessi saputo", options: ["avessi saputo", "so", "saprò", "sapevo"] },
      { prompt: "Se io ___ (essere) ricco, viaggerei.", hint: "congiuntivo imperfetto", answer: "fossi" },
      { prompt: "The third-conditional pattern is…", answer: "se + cong. trapassato, condizionale passato", options: ["se + cong. trapassato, condizionale passato", "se + presente, futuro", "se + imperfetto, presente", "se + passato prossimo"] },
      { prompt: "Se avessi studiato, “avrei ___” l'esame (passare).", answer: "passato" },
    ],
  },
  "discorso-indiretto": {
    pass: PASS,
    questions: [
      { prompt: "Direct “Sono stanco” → reported “Disse che ___”.", answer: "era stanco", options: ["era stanco", "è stanco", "sarà stanco", "fosse stanco"] },
      { prompt: "In reported speech, presente shifts to…", answer: "imperfetto", options: ["imperfetto", "futuro", "passato remoto", "condizionale"] },
      { prompt: "“Vengo domani” → “Disse che ___ il giorno dopo.” (venire)", hint: "imperfetto", answer: "veniva" },
      { prompt: "“Chiese se…” introduces…", answer: "a reported yes/no question", options: ["a reported yes/no question", "a command", "an exclamation", "a greeting"] },
    ],
  },
};

/** Whether a lesson has an authored check. */
export function hasCheck(slug: string): boolean {
  return slug in LESSON_CHECKS;
}
