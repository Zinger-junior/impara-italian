// =============================================================================
// src/data/lessonDetail.ts
// Deeper context for each curriculum lesson, keyed by lesson slug. Kept separate
// from curriculum.ts so the core tree stays lean and this can grow freely.
// Text may use **bold** for inline emphasis. Links point at grammar cheat-sheet
// ids (see data/grammar.ts) and resource ids (see data/resources.ts).
// =============================================================================

export interface LessonExample {
  it: string;
  en: string;
}

export interface LessonDetail {
  /** Short explanation of the lesson's grammar focus. */
  grammarNote?: string;
  /** The mistake English speakers reliably make here. */
  trap?: string;
  examples?: LessonExample[];
  /** A concrete real-world task for the day. */
  mission?: string;
  /** A daily-life / culture note tied to the lesson. */
  culture?: string;
  /** The "say it from memory" test line. */
  proof?: LessonExample;
  /** Links to a grammar cheat-sheet (data/grammar.ts id). */
  grammarTopicId?: string;
  /** Suggested free resources (data/resources.ts ids). */
  resourceIds?: string[];
}

export const LESSON_DETAIL: Record<string, LessonDetail> = {
  // ---------------- A0 ----------------
  alfabeto: {
    grammarNote: "Italian has **21 native letters** (j, k, w, x, y appear only in loanwords). The five vowels never change their sound. Read every rule out loud — the spelling tells you exactly how to speak.",
    trap: "There's no schwa and no vowel reduction: **e** is always 'eh', **o** always 'oh'. Don't swallow unstressed vowels the way English does.",
    examples: [
      { it: "a, e, i, o, u", en: "ah, eh, ee, oh, oo" },
      { it: "casa, sole, vino", en: "house, sun, wine" },
    ],
    mission: "Say the alphabet out loud, then spell your own name and your street in Italian.",
    proof: { it: "Come si scrive il tuo nome?", en: "How do you spell your name?" },
    grammarTopicId: "pronunciation",
    resourceIds: ["lt", "forvo"],
  },
  "suoni-difficili": {
    grammarNote: "**c/g** are hard before a, o, u and soft before e, i. **ch/gh** restore the hard sound; **gli** ≈ 'lli' in million, **gn** ≈ 'ny' in canyon.",
    trap: "**Double consonants are meaningful.** nonno (grandad) ≠ nono (ninth); la pizza has a real double z. Hold the consonant.",
    examples: [
      { it: "gli gnocchi, la famiglia", en: "gnocchi, the family" },
      { it: "chiesa, spaghetti, gelato", en: "church, spaghetti, ice cream" },
    ],
    mission: "Find five shop or street signs and read them aloud, watching the c/g and double consonants.",
    proof: { it: "La famiglia mangia gli gnocchi.", en: "The family is eating gnocchi." },
    grammarTopicId: "pronunciation",
    resourceIds: ["forvo", "ime"],
  },
  saluti: {
    grammarNote: "Greetings carry the formality choice: **ciao** (informal), **salve** (neutral), **buongiorno / buonasera** (safe with anyone). Greet on the way in and out.",
    trap: "Don't use **ciao** with a professor or an official on first meeting — it reads as too familiar. Reach for salve or buongiorno.",
    examples: [
      { it: "Buongiorno, come sta?", en: "Good morning, how are you? (formal)" },
      { it: "Ciao, come stai?", en: "Hi, how are you? (informal)" },
    ],
    mission: "Greet three people today in Italian — a barista, a classmate, a shopkeeper — and say goodbye properly.",
    culture: "Say buongiorno when you enter a shop or waiting room and arrivederci on the way out. Silence reads as cold in Italy.",
    proof: { it: "Buongiorno! Come sta? — Tutto bene, grazie.", en: "Good morning! How are you? — All good, thanks." },
    resourceIds: ["lucrezia"],
  },
  "mi-chiamo": {
    grammarNote: "Introduce yourself with **essere** and **chiamarsi**: mi chiamo…, sono…, ho … anni, studio / lavoro… Subject pronouns (io, tu, lui/lei) exist but are usually dropped.",
    trap: "Age uses **avere**, not essere: **ho vent'anni**, never 'sono venti anni'.",
    examples: [
      { it: "Mi chiamo Luca e sono di Bologna.", en: "My name is Luca and I'm from Bologna." },
      { it: "Ho ventidue anni e studio ingegneria.", en: "I'm 22 and I study engineering." },
    ],
    mission: "Introduce yourself to one real person in Italian and ask them two questions back.",
    proof: { it: "Ciao, mi chiamo ___ e sono uno studente / una studentessa qui.", en: "Hi, my name is ___ and I'm a student here." },
    grammarTopicId: "essere-avere",
    resourceIds: ["lucrezia", "langcorrect"],
  },

  // ---------------- A1 ----------------
  "presente-essere": {
    grammarNote: "**essere** describes identity, origin and states: sono, sei, è, siamo, siete, sono. Adjectives agree with the subject: sono stanco / stanca.",
    trap: "Many English 'I am + adjective' feelings use **avere** in Italian: ho fame, ho freddo, ho sonno. Save essere for what you *are*, not what you feel physically.",
    examples: [
      { it: "Sono italiano ma sono nato in Germania.", en: "I'm Italian but I was born in Germany." },
      { it: "Siamo studenti e siamo un po' stanchi.", en: "We're students and we're a bit tired." },
    ],
    mission: "Describe five people you know in one sentence each, out loud, using essere.",
    proof: { it: "Sono uno studente e oggi sono molto stanco.", en: "I'm a student and today I'm very tired." },
    grammarTopicId: "essere-avere",
  },
  "presente-avere": {
    grammarNote: "**avere** covers possession, age and a set of fixed 'have' expressions: ho fame (hungry), ho sete (thirsty), ho freddo (cold), ho fretta (in a hurry), ho ragione (right).",
    trap: "The h in ho/hai/ha/hanno is **silent** — it only distinguishes them from o, ai, a, anno.",
    examples: [
      { it: "Ho vent'anni e ho due fratelli.", en: "I'm 20 and I have two brothers." },
      { it: "Hai fame? Io ho solo sete.", en: "Are you hungry? I'm just thirsty." },
    ],
    mission: "Tell someone three things you have and two things you feel (fame, freddo…), all with avere.",
    proof: { it: "Ho vent'anni e ho due fratelli.", en: "I'm twenty and I have two brothers." },
    grammarTopicId: "essere-avere",
  },
  "verbi-are": {
    grammarNote: "Regular **-are** verbs: -o, -i, -a, -iamo, -ate, -ano. This is the biggest verb family, so these endings pay off constantly.",
    trap: "Spelling keeps the sound: cercare → cerchi, cerchiamo; mangiare → mangi, mangiamo (drop the extra i); studiare → studi, not studii.",
    examples: [
      { it: "Studio all'università e lavoro la sera.", en: "I study at university and work in the evening." },
      { it: "Parliamo italiano ogni giorno.", en: "We speak Italian every day." },
    ],
    mission: "Describe your typical day out loud using at least six -are verbs.",
    proof: { it: "Studio all'università e lavoro la sera.", en: "I study at university and I work in the evening." },
    grammarTopicId: "present",
  },
  "verbi-ere-ire": {
    grammarNote: "Regular **-ere** (-o, -i, -e, -iamo, -ete, -ono) and **-ire** (dormo…). The **-isc-** group (capire, finire, preferire) inserts -isc- in the singular and third plural: capisco, capisci, capisce, capiamo, capite, capiscono.",
    trap: "Not every -ire verb takes -isc-. dormire and sentire don't; capire and finire do. Learn which is which as you meet them.",
    examples: [
      { it: "Non capisco, puoi ripetere?", en: "I don't understand, can you repeat?" },
      { it: "Dormo poco ma leggo molto.", en: "I sleep little but read a lot." },
    ],
    mission: "Ask three people a question and make sure you understand the reply before moving on.",
    proof: { it: "Non capisco bene — puoi parlare più lentamente?", en: "I don't understand well — can you speak more slowly?" },
    grammarTopicId: "present",
  },
  "irregolari-frequenti": {
    grammarNote: "The high-frequency irregulars you'll use hourly: **fare, andare, venire, stare, dare, dire, uscire.** Learn them as whole paradigms, not rules.",
    trap: "andare and venire are different verbs — andare = go (away from here), venire = come (toward the speaker). Don't map them one-to-one onto English.",
    examples: [
      { it: "Domani vado a lezione, poi faccio la spesa.", en: "Tomorrow I go to class, then I do the shopping." },
      { it: "Vieni con noi? Usciamo alle otto.", en: "Are you coming with us? We're going out at eight." },
    ],
    mission: "Ask someone what time something starts (a lecture, a bus), and repeat the time back to confirm.",
    proof: { it: "Domani vado a lezione, poi faccio la spesa.", en: "Tomorrow I'm going to class, then doing the shopping." },
    grammarTopicId: "present",
  },
  modali: {
    grammarNote: "The modals **potere (can), volere (want), dovere (must)** are followed by an infinitive: posso pagare, voglio andare, devo studiare.",
    trap: "For polite requests, drop volere for the conditional **vorrei** ('I'd like'). 'Voglio un caffè' is blunt; 'Vorrei un caffè' is normal.",
    examples: [
      { it: "Posso pagare con la carta?", en: "Can I pay by card?" },
      { it: "Devo andare, ma vorrei restare.", en: "I have to go, but I'd like to stay." },
    ],
    mission: "Order something and ask a follow-up with a modal: 'Posso…?' / 'Vorrei…'.",
    culture: "At the bar, order short and polite. 'Un caffè, per favore' at the counter is the whole ritual.",
    proof: { it: "Vorrei un caffè. Posso pagare con la carta?", en: "I'd like a coffee. Can I pay by card?" },
    grammarTopicId: "present",
  },

  // ---------------- A2 ----------------
  "passato-avere": {
    grammarNote: "**passato prossimo with avere** = present of avere + past participle. Regular participles: -ato, -uto, -ito. With avere, the participle doesn't change.",
    trap: "Learn the irregular participles now — you'll use them constantly: fatto, detto, preso, visto, letto, scritto, chiesto, risposto.",
    examples: [
      { it: "Ieri ho mangiato alla mensa e ho studiato tre ore.", en: "Yesterday I ate at the canteen and studied for three hours." },
      { it: "Hai visto il film? Sì, l'ho visto.", en: "Did you see the film? Yes, I saw it." },
    ],
    mission: "Ask a real person 'Cosa hai fatto ieri?' and keep the conversation going for three turns.",
    proof: { it: "Ieri ho mangiato alla mensa e ho studiato per tre ore.", en: "Yesterday I ate at the canteen and studied for three hours." },
    grammarTopicId: "passato-prossimo",
  },
  "passato-essere": {
    grammarNote: "Movement and change verbs take **essere**, and the participle **agrees** with the subject: sono andato / andata / andati / andate.",
    trap: "The essere verbs are a closed set — andare, venire, uscire, entrare, arrivare, partire, tornare, stare, nascere, morire, and reflexives. Memorise the list; everything else takes avere.",
    examples: [
      { it: "Stamattina sono uscito presto e sono arrivato tardi.", en: "This morning I left early and arrived late." },
      { it: "Maria è andata a casa; noi siamo rimasti.", en: "Maria went home; we stayed." },
    ],
    mission: "Ask two people 'Dove sei andato/a nel weekend?' and follow up twice each.",
    proof: { it: "Stamattina sono uscito presto e sono arrivato tardi.", en: "This morning I went out early and arrived late." },
    grammarTopicId: "passato-prossimo",
  },
  imperfetto: {
    grammarNote: "The **imperfetto** is the 'was doing / used to' past — habits, background, age, weather. Nearly regular; only essere, fare, dire, bere misbehave.",
    trap: "Choosing the past is the real skill: imperfetto paints the scene, passato prossimo reports the single event. *Pioveva quando sono uscito.*",
    examples: [
      { it: "Quando ero piccolo, abitavo in un altro paese.", en: "When I was little, I lived in another country." },
      { it: "Faceva freddo e non c'era nessuno.", en: "It was cold and there was no one." },
    ],
    mission: "Ask an Italian what the city was like twenty years ago, and listen for imperfetto.",
    proof: { it: "Quando ero piccolo, abitavo in un altro paese.", en: "When I was little, I used to live in another country." },
    grammarTopicId: "imperfetto",
  },
  "futuro-semplice": {
    grammarNote: "The **futuro semplice** for plans and predictions. Regular endings on a shared stem, plus irregular stems: sarò, avrò, farò, andrò, verrò, potrò, vorrò.",
    trap: "For near-certain plans Italians often just use the present: 'domani vado a Roma'. Keep the future for predictions and guesses: 'sarà stanco'.",
    examples: [
      { it: "L'anno prossimo comincerò un corso di laurea.", en: "Next year I'll start a degree course." },
      { it: "Sarà vero? Non lo so.", en: "Could it be true? I don't know." },
    ],
    mission: "Tell someone your plans for the next three months and ask about theirs.",
    proof: { it: "L'anno prossimo comincerò un corso di laurea qui.", en: "Next year I'll start a degree course here." },
    grammarTopicId: "futuro",
  },

  // ---------------- B1 ----------------
  "condizionale-presente": {
    grammarNote: "The **condizionale** makes you sound civil and expresses wishes: vorrei, potresti, mi piacerebbe, dovresti. Same stems as the future.",
    trap: "One m vs two: **parleremo** (future, 'we will speak') vs **parleremmo** (conditional, 'we would speak'). Hold the double m.",
    examples: [
      { it: "Vorrei parlare meglio — potresti correggermi?", en: "I'd like to speak better — could you correct me?" },
      { it: "Mi piacerebbe venire, ma dovrei studiare.", en: "I'd love to come, but I should study." },
    ],
    mission: "Ask someone to correct your Italian for ten minutes — using the conditional to ask politely.",
    proof: { it: "Vorrei parlare meglio — potresti correggermi?", en: "I'd like to speak better — could you correct me?" },
    grammarTopicId: "condizionale",
  },
  "condizionale-passato": {
    grammarNote: "The **condizionale passato** (avrei/sarei + participle) expresses unrealised past intentions and regrets, and 'the future in the past' in reported speech.",
    trap: "Italian uses the *past* conditional where English uses 'would' for a future-in-the-past: 'Ha detto che sarebbe arrivato tardi' — He said he would arrive late.",
    examples: [
      { it: "Sarei venuto, ma non ho avuto tempo.", en: "I would have come, but I didn't have time." },
      { it: "Avrei dovuto studiare di più.", en: "I should have studied more." },
    ],
    mission: "Tell someone about one thing you would have done differently this year.",
    proof: { it: "Sarei venuto, ma non ho avuto tempo.", en: "I would have come, but I didn't have time." },
    grammarTopicId: "condizionale",
  },
  "congiuntivo-presente": {
    grammarNote: "The **congiuntivo** follows doubt, opinion, emotion and will: penso che, credo che, spero che, è importante che, benché. Mostly regular forms.",
    trap: "The three singular forms are identical (che io/tu/lui sia), so the **pronoun becomes obligatory**. And with the same subject, skip it: 'penso di andare', not 'penso che io vada'.",
    examples: [
      { it: "Penso che l'esame sia difficile.", en: "I think the exam is difficult." },
      { it: "Spero che tu stia bene.", en: "I hope you're well." },
    ],
    mission: "Use 'penso che' and 'spero che' with a real person five times, and survive the corrections.",
    proof: { it: "Penso che l'esame sia difficile.", en: "I think the exam is difficult." },
    grammarTopicId: "congiuntivo",
  },

  // ---------------- B2 ----------------
  "congiuntivo-imperfetto": {
    grammarNote: "The **congiuntivo imperfetto** appears after a past-tense trigger and in unreal 'if' clauses: credevo che fosse…, se avessi tempo… The sequence of tenses (concordanza) is the B2 skill.",
    trap: "A past opinion pushes the subjunctive back: 'Penso che sia' → 'Pensavo che **fosse**'. Don't leave it in the present.",
    examples: [
      { it: "Credevo che tu fossi a casa.", en: "I thought you were at home." },
      { it: "Volevo che venisse anche lui.", en: "I wanted him to come too." },
    ],
    mission: "React to something someone tells you with 'Credevo che…' + imperfetto subjunctive.",
    proof: { it: "Credevo che tu fossi già partito.", en: "I thought you had already left." },
    grammarTopicId: "congiuntivo",
  },
  "ipotetico-irrealta": {
    grammarNote: "The **periodo ipotetico dell'irrealtà**: se + congiuntivo imperfetto → condizionale presente (present-unreal), and se + trapassato → condizionale passato (past-unreal).",
    trap: "**Never** put a conditional directly after 'se'. Not 'se avrei tempo' — it's 'se avessi tempo, verrei'.",
    examples: [
      { it: "Se avessi più tempo, studierei di più.", en: "If I had more time, I'd study more." },
      { it: "Se avessi studiato, avrei passato l'esame.", en: "If I'd studied, I'd have passed the exam." },
    ],
    mission: "Answer three 'Cosa faresti se…?' questions out loud with full if-then sentences.",
    proof: { it: "Se avessi più tempo, studierei di più.", en: "If I had more time, I'd study more." },
    grammarTopicId: "periodo-ipotetico",
  },
  "discorso-indiretto": {
    grammarNote: "**Reported speech**: tenses and pronouns shift back. 'Vengo domani' → 'Ha detto che sarebbe venuto il giorno dopo.' Present → imperfetto, future → condizionale passato.",
    trap: "Time words shift too: oggi → quel giorno, domani → il giorno dopo, ieri → il giorno prima. Forgetting these gives you away.",
    examples: [
      { it: "Ha detto che sarebbe arrivato tardi.", en: "He said he would arrive late." },
      { it: "Mi ha chiesto se avessi tempo.", en: "She asked me if I had time." },
    ],
    mission: "Report back to a friend, in Italian, three things someone else said to you today.",
    proof: { it: "Ha detto che sarebbe arrivato tardi.", en: "He said (that) he would arrive late." },
    grammarTopicId: "congiuntivo",
  },
};
