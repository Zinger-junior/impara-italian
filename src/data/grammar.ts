// =============================================================================
// src/data/grammar.ts
// Grammar cheat-sheets, A1→B2. Modelled as structured blocks (paragraphs,
// lists, tables, "traps", tips) so they render as real React — no raw HTML.
// Paragraph/list/trap/tip text may use **bold** for inline emphasis.
// Each verb-tense topic links to the conjugation drill via `drillTense`.
// =============================================================================

import type { CefrLevel, Mood } from "../types/index.js";

export type GrammarBlock =
  | { kind: "p"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "table"; headers: string[]; rows: string[][] }
  | { kind: "trap"; text: string }
  | { kind: "tip"; text: string };

export interface GrammarTopic {
  id: string;
  title: string;
  level: CefrLevel;
  summary: string;
  drillTense?: { mood: Mood; tense: string };
  blocks: GrammarBlock[];
}

export const GRAMMAR_TOPICS: GrammarTopic[] = [
  {
    id: "pronunciation",
    title: "Pronunciation & spelling",
    level: "A0",
    summary: "Italian is spelled how it sounds. Get the five vowels and the c/g rules and you can read anything aloud.",
    blocks: [
      { kind: "p", text: "**Five vowels, always the same:** a=ah, e=eh, i=ee, o=oh, u=oo. No reduction, no schwa, no silent letters." },
      { kind: "list", items: [
        "**c / g + a, o, u** = hard: casa, gatto, cura.",
        "**c / g + e, i** = soft: cena (chair-na), gelato (jel-ato).",
        "**ch / gh** restore the hard sound before e, i: chi (kee), spaghetti.",
        "**gli** ≈ the lli in 'million'; **gn** ≈ the ny in 'canyon'.",
        "**sc + e/i** = sh: pesce, sciare. **sc + a/o/u** = sk: scuola.",
      ] },
      { kind: "p", text: "Stress usually lands on the **second-to-last syllable**. When it doesn't, a written accent marks it: città, perché, università." },
      { kind: "trap", text: "**Double consonants are not decoration.** nonno (grandad) vs nono (ninth); pizza vs piza; sete (thirst) vs sette (seven). Hold the consonant and shorten the vowel before it." },
    ],
  },
  {
    id: "present",
    title: "Present tense (regular)",
    level: "A1",
    summary: "Three verb families plus the -isc- group. Learn the endings cold — everything else is built on them.",
    drillTense: { mood: "indicativo", tense: "presente" },
    blocks: [
      { kind: "table", headers: ["", "-are parlare", "-ere credere", "-ire dormire", "-ire (-isc) capire"], rows: [
        ["io", "parlo", "credo", "dormo", "capisco"],
        ["tu", "parli", "credi", "dormi", "capisci"],
        ["lui/lei", "parla", "crede", "dorme", "capisce"],
        ["noi", "parliamo", "crediamo", "dormiamo", "capiamo"],
        ["voi", "parlate", "credete", "dormite", "capite"],
        ["loro", "parlano", "credono", "dormono", "capiscono"],
      ] },
      { kind: "trap", text: "**Spelling shifts in -are verbs:** cercare → cerchi, cerchiamo (keep the hard c); pagare → paghi; mangiare → mangi, mangiamo (drop the extra i); studiare → studi, not studii." },
      { kind: "tip", text: "The -isc- group (capire, finire, preferire, pulire, spedire) adds -isc- in all singular persons and the third plural — never in noi/voi." },
    ],
  },
  {
    id: "essere-avere",
    title: "Essere & avere",
    level: "A1",
    summary: "The two verbs everything else leans on. The trap is where Italian uses 'have' and English uses 'be'.",
    blocks: [
      { kind: "table", headers: ["", "essere (to be)", "avere (to have)"], rows: [
        ["io", "sono", "ho"],
        ["tu", "sei", "hai"],
        ["lui/lei", "è", "ha"],
        ["noi", "siamo", "abbiamo"],
        ["voi", "siete", "avete"],
        ["loro", "sono", "hanno"],
      ] },
      { kind: "trap", text: "**Italian 'has' where English 'is'.** ho vent'anni (I'm 20), ho fame (I'm hungry), ho sete, ho freddo, ho ragione, ho sonno. Saying 'sono venti anni' marks you as a beginner instantly." },
      { kind: "tip", text: "The h in ho/hai/ha/hanno is silent — it only exists to tell them apart from o (or), ai, a, anno (year)." },
    ],
  },
  {
    id: "passato-prossimo",
    title: "Passato prossimo",
    level: "A2",
    summary: "The everyday past: auxiliary + participle. The whole skill is choosing avere vs essere and making essere agree.",
    drillTense: { mood: "indicativo", tense: "passatoProssimo" },
    blocks: [
      { kind: "p", text: "**avere or essere in the present + past participle.** Participles: -are → -ato, -ere → -uto, -ire → -ito." },
      { kind: "list", items: [
        "Most verbs take **avere**, and nothing agrees: ho mangiato, abbiamo visto.",
        "Movement/change verbs take **essere**, and the participle agrees with the subject: sono andato, siamo andati, è andata.",
        "Irregular participles to memorise: fatto, detto, preso, visto, letto, scritto, aperto, chiuso, messo, chiesto, risposto, stato.",
      ] },
      { kind: "trap", text: "**After lo, la, li, le the participle agrees anyway.** Hai visto Maria? Sì, l'ho vista — not l'ho visto." },
    ],
  },
  {
    id: "imperfetto",
    title: "Imperfetto & choosing the past",
    level: "A2",
    summary: "The 'was doing / used to' past. Nearly regular — the real skill is knowing when to use it instead of the passato prossimo.",
    drillTense: { mood: "indicativo", tense: "imperfetto" },
    blocks: [
      { kind: "table", headers: ["", "parlare", "essere"], rows: [
        ["io", "parlavo", "ero"],
        ["tu", "parlavi", "eri"],
        ["lui/lei", "parlava", "era"],
        ["noi", "parlavamo", "eravamo"],
        ["voi", "parlavate", "eravate"],
        ["loro", "parlavano", "erano"],
      ] },
      { kind: "p", text: "Only **essere, fare (facevo), dire (dicevo), bere (bevevo)** are irregular." },
      { kind: "trap", text: "**Which past?** Imperfetto paints the scene — habits, weather, age, what was going on. Passato prossimo reports what happened once. *Pioveva quando sono uscito*: it was raining (scene) when I went out (event)." },
    ],
  },
  {
    id: "futuro",
    title: "Futuro semplice",
    level: "A2",
    summary: "Regular endings on all three families, plus a short list of irregular stems shared with the conditional.",
    drillTense: { mood: "indicativo", tense: "futuroSemplice" },
    blocks: [
      { kind: "table", headers: ["", "parlare", "prendere", "dormire"], rows: [
        ["io", "parlerò", "prenderò", "dormirò"],
        ["tu", "parlerai", "prenderai", "dormirai"],
        ["lui/lei", "parlerà", "prenderà", "dormirà"],
        ["noi", "parleremo", "prenderemo", "dormiremo"],
        ["voi", "parlerete", "prenderete", "dormirete"],
        ["loro", "parleranno", "prenderanno", "dormiranno"],
      ] },
      { kind: "p", text: "Irregular stems: essere→sar-, avere→avr-, fare→far-, andare→andr-, venire→verr-, potere→potr-, volere→vorr-, dovere→dovr-, sapere→sapr-, bere→berr-." },
      { kind: "trap", text: "**Italians often skip the future.** For near-certain plans the present does the job: domani vado a Roma. Use the future for predictions and guesses: sarà stanco — he must be tired." },
    ],
  },
  {
    id: "condizionale",
    title: "Condizionale",
    level: "B1",
    summary: "The tense of politeness and hypotheticals. Same stems as the future — learn them once, use them twice.",
    drillTense: { mood: "condizionale", tense: "presente" },
    blocks: [
      { kind: "table", headers: ["", "parlare"], rows: [
        ["io", "parlerei"],
        ["tu", "parleresti"],
        ["lui/lei", "parlerebbe"],
        ["noi", "parleremmo"],
        ["voi", "parlereste"],
        ["loro", "parlerebbero"],
      ] },
      { kind: "p", text: "Daily workhorses: **vorrei** (I'd like), **potresti** (could you), **mi piacerebbe** (I'd love to), **dovrei** (I should)." },
      { kind: "trap", text: "**parleremo vs parleremmo.** One m is the future ('we will speak'), two is the conditional ('we would speak'). Italians hear the difference — hold the double m." },
    ],
  },
  {
    id: "congiuntivo",
    title: "Congiuntivo presente",
    level: "B1",
    summary: "The mood of doubt, opinion and emotion. Feared, but mostly regular — and the triggers are a fixed list.",
    drillTense: { mood: "congiuntivo", tense: "presente" },
    blocks: [
      { kind: "table", headers: ["", "parlare", "credere", "essere", "avere"], rows: [
        ["che io", "parli", "creda", "sia", "abbia"],
        ["che tu", "parli", "creda", "sia", "abbia"],
        ["che lui/lei", "parli", "creda", "sia", "abbia"],
        ["che noi", "parliamo", "crediamo", "siamo", "abbiamo"],
        ["che voi", "parliate", "crediate", "siate", "abbiate"],
        ["che loro", "parlino", "credano", "siano", "abbiano"],
      ] },
      { kind: "p", text: "Triggered by doubt, opinion, emotion and will: **penso che, credo che, spero che, voglio che, è importante che, benché, prima che, sebbene.**" },
      { kind: "trap", text: "**Same subject? Skip it.** penso di andare, not penso che io vada. And because the three singular forms are identical, keep the pronoun: penso che **tu** sia stanco." },
    ],
  },
  {
    id: "pronouns",
    title: "Object pronouns, ci & ne",
    level: "B1",
    summary: "What turns textbook Italian into normal Italian: stop repeating the noun, and put ci and ne to work.",
    blocks: [
      { kind: "table", headers: ["", "direct", "indirect"], rows: [
        ["me", "mi", "mi"],
        ["you", "ti", "ti"],
        ["him / her / it", "lo / la", "gli / le"],
        ["us", "ci", "ci"],
        ["you (pl)", "vi", "vi"],
        ["them", "li / le", "gli"],
      ] },
      { kind: "p", text: "They sit **before** the conjugated verb — lo vedo, ti scrivo — but attach to an infinitive: voglio vederlo." },
      { kind: "trap", text: "**ci and ne earn their keep:** ci vuole un'ora (it takes an hour), ci penso io (I'll handle it), ne ho due (I have two of them), non ne posso più (I've had enough)." },
    ],
  },
  {
    id: "articles-prepositions",
    title: "Articles & merged prepositions",
    level: "A1",
    summary: "Get the article right and the preposition merges follow. Learn each noun with its article attached.",
    blocks: [
      { kind: "p", text: "**Definite:** il / lo / l' · la / l' → i / gli · le. **Indefinite:** un / uno · una / un'." },
      { kind: "table", headers: ["+", "il", "la", "i", "le"], rows: [
        ["di", "del", "della", "dei", "delle"],
        ["a", "al", "alla", "ai", "alle"],
        ["da", "dal", "dalla", "dai", "dalle"],
        ["in", "nel", "nella", "nei", "nelle"],
        ["su", "sul", "sulla", "sui", "sulle"],
      ] },
      { kind: "trap", text: "**lo and gli** go before s+consonant, z, ps, gn, y: lo studente, gli zaini, lo psicologo, lo gnomo." },
      { kind: "tip", text: "Store every new noun with its article — il libro, la casa, lo studente — or you'll guess the gender wrong for a year." },
    ],
  },
  {
    id: "reflexives",
    title: "Reflexive verbs",
    level: "A2",
    summary: "Daily-routine verbs where the action comes back on you. In the past they always take essere.",
    blocks: [
      { kind: "p", text: "Add the reflexive pronoun before the verb: **mi sveglio, ti alzi, si veste, ci laviamo, vi vestite, si svegliano.**" },
      { kind: "list", items: [
        "svegliarsi (wake up), alzarsi (get up), lavarsi (wash), vestirsi (get dressed), chiamarsi (be called), sentirsi (feel), divertirsi (have fun), riposarsi (rest).",
      ] },
      { kind: "trap", text: "**In the past, reflexives always use essere, and the participle agrees:** mi sono svegliato / mi sono svegliata." },
    ],
  },
  {
    id: "comparatives",
    title: "Comparatives & superlatives",
    level: "B1",
    summary: "More than, less than, the most. A couple of irregular forms do a lot of the talking.",
    blocks: [
      { kind: "list", items: [
        "**più / meno … di** before nouns and pronouns: più alto di me.",
        "**più / meno … che** when comparing two qualities or in other cases: più intelligente che simpatico.",
        "**il più / il meno …** for the superlative: la città più bella d'Italia.",
        "Irregulars: buono → migliore, cattivo → peggiore, grande → maggiore, piccolo → minore.",
      ] },
      { kind: "trap", text: "**come and quanto** mean 'as … as': alto come te. Don't use 'di' there." },
    ],
  },
  {
    id: "connectors",
    title: "Connectors & longer sentences",
    level: "B1",
    summary: "B1 is measured in sentence length as much as vocabulary. Chain clauses and buy thinking time.",
    blocks: [
      { kind: "list", items: [
        "**perché** because / why · **siccome** since (first in the sentence) · **quindi, allora** so",
        "**mentre** while · **appena** as soon as · **finché** until",
        "**però, ma, invece** but, whereas · **anche se** even if · **benché** although (+ subjunctive)",
        "**infatti** indeed · **comunque** anyway · **cioè** that is · **insomma** in short",
      ] },
      { kind: "tip", text: "**Fillers buy you time.** allora…, diciamo…, insomma…, come dire… — using them while you think sounds far more fluent than silence." },
    ],
  },
  {
    id: "periodo-ipotetico",
    title: "Periodo ipotetico (if-sentences)",
    level: "B2",
    summary: "The three conditional types. Types 1 and 2 carry almost all real conversation.",
    blocks: [
      { kind: "list", items: [
        "**Type 1 — real:** se + present → present/future. Se ho tempo, vengo. / Se studi, passerai.",
        "**Type 2 — unreal present:** se + congiuntivo imperfetto → condizionale presente. Se avessi tempo, verrei.",
        "**Type 3 — unreal past:** se + congiuntivo trapassato → condizionale passato. Se avessi studiato, avrei passato.",
      ] },
      { kind: "trap", text: "**Never put a conditional after 'se'.** Not 'se avrei tempo'. The condition takes the subjunctive; the result takes the conditional." },
    ],
  },
  {
    id: "articoli",
    title: "Articles (definite & indefinite)",
    level: "A0",
    summary: "Which of il/lo/la/l' to use is pure phonetics — it depends on the sound the noun starts with, not its meaning.",
    blocks: [
      { kind: "table", headers: ["", "before consonant", "before s+cons / z / gn / ps", "before vowel"], rows: [
        ["masc. sing.", "il", "lo", "l'"],
        ["masc. plur.", "i", "gli", "gli"],
        ["fem. sing.", "la", "la", "l'"],
        ["fem. plur.", "le", "le", "le"],
      ] },
      { kind: "p", text: "**Indefinite (a/an):** masculine **un** (un libro), **uno** before s+consonant/z/gn (uno studente, uno zaino); feminine **una** (una casa), **un'** before a vowel (un'amica)." },
      { kind: "trap", text: "**lo / uno / gli** aren't rare — they trigger on s+consonant, z, gn, ps, x, y: lo studente, lo zio, gli gnocchi, uno psicologo." },
      { kind: "tip", text: "Italian uses the definite article far more than English: with likes (mi piace **il** caffè), possessives (**la** mia casa), and general nouns (**gli** italiani)." },
    ],
  },
  {
    id: "plurali",
    title: "Noun & adjective plurals",
    level: "A1",
    summary: "Most plurals are a single vowel swap. Learn the three patterns and the handful that fight back.",
    blocks: [
      { kind: "table", headers: ["singular ends in", "plural", "example"], rows: [
        ["-o (usu. masc.)", "-i", "il libro → i libri"],
        ["-a (usu. fem.)", "-e", "la casa → le case"],
        ["-e (m or f)", "-i", "la chiave → le chiavi"],
      ] },
      { kind: "list", items: [
        "**-co / -go:** keep the hard sound with an h if stress is near the end: gioco → giochi, but amico → amici (irregular).",
        "**-ca / -ga:** always add h: amica → amiche, riga → righe.",
        "**-cia / -gia:** drop the i after a consonant (arancia → arance), keep it after a vowel (camicia → camicie).",
      ] },
      { kind: "trap", text: "**Invariable & irregular:** accented finals (la città → le città), foreign words (il bar → i bar), la mano → le mani, l'uovo → le uova, il dito → le dita." },
    ],
  },
  {
    id: "aggettivi",
    title: "Adjective agreement",
    level: "A1",
    summary: "Adjectives copy the gender and number of their noun. Two families: four-ending and two-ending.",
    blocks: [
      { kind: "table", headers: ["", "masc.", "fem."], rows: [
        ["singular (-o type)", "alto", "alta"],
        ["plural (-o type)", "alti", "alte"],
        ["singular (-e type)", "grande", "grande"],
        ["plural (-e type)", "grandi", "grandi"],
      ] },
      { kind: "p", text: "Most descriptive adjectives follow the noun: una macchina **rossa**, un ragazzo **simpatico**. A few common ones usually precede: bello, buono, grande, piccolo, nuovo, vecchio." },
      { kind: "trap", text: "**Mixed groups go masculine plural:** Marco e Maria sono **stanchi**. One man in a group of women flips the whole adjective to -i." },
      { kind: "tip", text: "bello and quello behave like the article before the noun: bel libro, bello studente, bei libri, begli studenti." },
    ],
  },
  {
    id: "preposizioni",
    title: "Prepositions (simple & articulated)",
    level: "A2",
    summary: "The small words that never translate one-to-one. Get the articulated forms and the a/in split for places.",
    blocks: [
      { kind: "p", text: "**The simple set:** di, a, da, in, con, su, per, tra/fra." },
      { kind: "table", headers: ["+ il", "+ lo", "+ la", "+ i", "+ gli", "+ le"], rows: [
        ["di → del", "dello", "della", "dei", "degli", "delle"],
        ["a → al", "allo", "alla", "ai", "agli", "alle"],
        ["da → dal", "dallo", "dalla", "dai", "dagli", "dalle"],
        ["in → nel", "nello", "nella", "nei", "negli", "nelle"],
        ["su → sul", "sullo", "sulla", "sui", "sugli", "sulle"],
      ] },
      { kind: "trap", text: "**Cities take a, countries/regions take in:** a Roma, a Milano, but in Italia, in Toscana. And da means 'at someone's place': vado da Marco = I'm going to Marco's." },
      { kind: "tip", text: "**di** shows possession and material (il libro **di** Marco, una tazza **di** vetro); **da** shows origin and purpose (vengo **da** Napoli, occhiali **da** sole)." },
    ],
  },
  {
    id: "pronomi-diretti",
    title: "Direct object pronouns",
    level: "A2",
    summary: "mi, ti, lo, la, ci, vi, li, le — they replace the thing the verb acts on and sit before the verb.",
    blocks: [
      { kind: "table", headers: ["person", "pronoun", "example"], rows: [
        ["me / you", "mi / ti", "Mi vedi? — Do you see me?"],
        ["him/it, her/it", "lo / la", "Lo compro. / La conosco."],
        ["us / you (pl)", "ci / vi", "Ci aiuti?"],
        ["them (m / f)", "li / le", "Li mangio. / Le compro."],
      ] },
      { kind: "p", text: "**lo** and **la** elide before a vowel or h: l'ho visto (I saw him/it), l'ascolto." },
      { kind: "trap", text: "**With the passato prossimo, the participle agrees with lo/la/li/le:** Li ho visti. L'ho vista. This agreement is optional with mi/ti/ci/vi but obligatory with the third person." },
      { kind: "tip", text: "With modal + infinitive the pronoun can go either side: **La** voglio vedere = Voglio veder**la**. Both are correct." },
    ],
  },
  {
    id: "ci-ne",
    title: "The particles ci and ne",
    level: "B1",
    summary: "Two tiny words that carry a lot. ci often means 'there / about it'; ne means 'of it / of them / some'.",
    blocks: [
      { kind: "list", items: [
        "**ci = there (a place):** Vai a Roma? — Sì, **ci** vado domani.",
        "**ci = about/on it (with certain verbs):** Ci penso io. Non **ci** credo.",
        "**ne = of it / of them (quantity):** Quanti caffè bevi? — **Ne** bevo tre.",
        "**ne = about it (with di-verbs):** Parliamo del film? — Sì, parliamo**ne**.",
      ] },
      { kind: "trap", text: "**ne triggers participle agreement by quantity:** Ho comprato tre mele → **Ne** ho comprat**e** tre. The participle agrees with what 'ne' stands for." },
    ],
  },
  {
    id: "comparativi",
    title: "Comparatives & superlatives",
    level: "A2",
    summary: "più / meno for 'more / less', plus the irregular set (migliore, peggiore) you'll actually hear.",
    blocks: [
      { kind: "list", items: [
        "**More/less than a noun:** più / meno … **di**. Marco è più alto **di** Luca.",
        "**Comparing two qualities or before a verb/prep:** use **che**. È più simpatico **che** intelligente.",
        "**As … as:** (così) … **come** / (tanto) … **quanto**. È alto **come** te.",
        "**Relative superlative:** il/la più … (di). È **il più** bravo della classe.",
        "**Absolute superlative:** -issimo. bello → bell**issimo**; molto bello.",
      ] },
      { kind: "trap", text: "**Irregulars you can't avoid:** buono → migliore / il migliore; cattivo → peggiore; grande → maggiore; piccolo → minore. 'Più buono' exists for taste, but 'migliore' is safer for quality." },
    ],
  },
  {
    id: "imperativo",
    title: "The imperative (commands)",
    level: "A2",
    summary: "Telling people to do things. The tu, noi and voi forms are easy; the negative tu and formal Lei are the traps.",
    blocks: [
      { kind: "table", headers: ["", "parlare", "prendere", "dormire"], rows: [
        ["tu", "parla!", "prendi!", "dormi!"],
        ["noi", "parliamo!", "prendiamo!", "dormiamo!"],
        ["voi", "parlate!", "prendete!", "dormite!"],
      ] },
      { kind: "trap", text: "**Negative tu = non + the infinitive:** Non parlare! Non toccare! (not 'non parla'). The noi/voi negatives are just non + the normal form." },
      { kind: "tip", text: "**Formal (Lei) commands use the present subjunctive:** Parli! Prenda! Mi scusi! Pronouns attach to informal commands (dimmi!, andiamo**ci**!) but go before formal ones (mi dica)." },
    ],
  },
  {
    id: "passato-vs-imperfetto",
    title: "Passato prossimo vs imperfetto",
    level: "A2",
    summary: "Both are past tenses — the choice is about how you frame the action, not when it happened.",
    blocks: [
      { kind: "list", items: [
        "**Passato prossimo** = a completed, bounded event: Ieri **ho visto** un film.",
        "**Imperfetto** = ongoing background, habit, or description: Da bambino **giocavo** a calcio. **Era** una bella giornata.",
        "**Together:** the imperfetto sets the scene, the passato prossimo interrupts it: **Guardavo** la TV quando **è arrivato** Marco.",
      ] },
      { kind: "trap", text: "**Some verbs change meaning:** sapevo = I knew (state) vs ho saputo = I found out (event); conoscevo = I knew (someone) vs ho conosciuto = I met." },
      { kind: "tip", text: "Time signals help: sempre, spesso, ogni giorno, mentre → imperfetto; ieri, l'altro giorno, due volte, all'improvviso → passato prossimo." },
    ],
  },
];
