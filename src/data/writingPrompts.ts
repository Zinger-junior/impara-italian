// =============================================================================
// src/data/writingPrompts.ts
// Guided composition prompts by level. Free writing can't be auto-graded, so each
// prompt ships with a "make sure you include" checklist and a model answer to
// compare against once you've written your own.
// =============================================================================

import type { CefrLevel } from "../types/index.js";

export interface WritingPrompt {
  id: string;
  level: CefrLevel;
  title: string;
  prompt: string;
  /** Concrete things a good answer includes — a self-check rubric. */
  include: string[];
  /** Rough target length. */
  minWords: number;
  /** A model answer to compare against (revealed on demand). */
  model: string;
}

export const WRITING_PROMPTS: WritingPrompt[] = [
  {
    id: "w-presentazione",
    level: "A1",
    title: "Introduce yourself",
    prompt: "Write a short introduction: your name, where you're from, where you live, and one thing you like.",
    include: ["Use essere for identity (sono…)", "Use avere or abitare (ho… / abito a…)", "One thing with mi piace", "At least 3 sentences"],
    minWords: 25,
    model:
      "Ciao! Mi chiamo Sara e sono spagnola, di Madrid. Abito a Bologna da un anno perché studio all'università. Mi piace molto la cucina italiana, soprattutto la pizza.",
  },
  {
    id: "w-giornata",
    level: "A1",
    title: "A normal day",
    prompt: "Describe a typical day: what you do in the morning, afternoon, and evening.",
    include: ["Present-tense verbs", "A time expression (la mattina, alle otto…)", "At least 4 verbs", "Connectors: poi, dopo"],
    minWords: 30,
    model:
      "La mattina mi sveglio alle sette e faccio colazione. Poi vado all'università e studio fino alle due. Il pomeriggio lavoro in un bar. La sera torno a casa, ceno e guardo un film.",
  },
  {
    id: "w-weekend",
    level: "A2",
    title: "Last weekend",
    prompt: "Write about what you did last weekend. Use the past tense.",
    include: ["Passato prossimo (ho…/sono…)", "At least one essere-auxiliary verb", "A time marker (sabato, ieri)", "Say if you liked it"],
    minWords: 40,
    model:
      "Sabato sono andata al mare con due amici. Abbiamo preso il treno la mattina presto e siamo tornati la sera. Ho mangiato un gelato enorme e ho fatto il bagno. È stato un weekend bellissimo.",
  },
  {
    id: "w-citta",
    level: "A2",
    title: "Your city",
    prompt: "Describe the city or town where you live. What is there, and what do you like or dislike about it?",
    include: ["c'è / ci sono", "At least two adjectives (with agreement)", "An opinion (secondo me, mi piace)", "A contrast (però, ma)"],
    minWords: 45,
    model:
      "Abito a Torino, una città grande nel nord Italia. Ci sono molti musei e un bel fiume. Secondo me è tranquilla e comoda, però in inverno fa molto freddo. Mi piace perché ci sono tanti caffè storici.",
  },
  {
    id: "w-opinione",
    level: "B1",
    title: "Give an opinion",
    prompt: "Do you think it's better to live in a big city or a small town? Explain your reasons.",
    include: ["penso che / credo che + subjunctive", "At least two reasons", "A comparative (più… di / meno… di)", "A conclusion (quindi, insomma)"],
    minWords: 60,
    model:
      "Penso che vivere in una piccola città sia più tranquillo, ma credo che una grande città offra più opportunità. Da un lato, in un paese piccolo tutti si conoscono e la vita costa meno. Dall'altro, in una metropoli ci sono più lavoro e più cultura. Insomma, dipende da cosa cerchi nella vita.",
  },
  {
    id: "w-email",
    level: "B1",
    title: "A polite email",
    prompt: "Write a short email to a landlord asking to visit an apartment. Be polite and ask two questions.",
    include: ["A greeting (Gentile…, Salve)", "condizionale for politeness (vorrei, potrei)", "Two questions", "A sign-off (Cordiali saluti)"],
    minWords: 55,
    model:
      "Gentile Signor Rossi,\nho visto il suo annuncio e sarei interessata all'appartamento in via Verdi. Vorrei sapere se è ancora disponibile e quando potrei venire a vederlo. Inoltre, le spese sono incluse nell'affitto?\nLa ringrazio in anticipo.\nCordiali saluti,\nAnna",
  },
  {
    id: "w-racconto",
    level: "B2",
    title: "Tell a story",
    prompt: "Narrate a memorable event from your past: set the scene, then say what happened.",
    include: ["Imperfetto for the background", "Passato prossimo (or remoto) for events", "A time clause (mentre, quando)", "Some detail and emotion"],
    minWords: 80,
    model:
      "Era una sera d'estate e faceva ancora caldo. Camminavo per il centro con dei vecchi amici quando, all'improvviso, abbiamo sentito della musica. Ci siamo avvicinati e abbiamo scoperto un concerto gratuito in piazza. Non lo avevamo programmato, ma ci siamo fermati fino a mezzanotte a ballare. È uno dei ricordi più belli di quell'anno.",
  },
  {
    id: "w-argomentazione",
    level: "B2",
    title: "Argue a position",
    prompt: "Some people say technology isolates us; others say it connects us. Argue one side, acknowledging the other.",
    include: ["A clear thesis", "Concessive structure (sebbene, nonostante + subjunctive)", "Connectors (tuttavia, d'altra parte)", "A firm conclusion"],
    minWords: 90,
    model:
      "Sebbene molti sostengano che la tecnologia ci isoli, sono convinto che ci avvicini più di quanto ci allontani. È vero che a volte passiamo troppo tempo davanti allo schermo, tuttavia gli stessi strumenti ci permettono di mantenere rapporti che altrimenti si perderebbero. D'altra parte, il problema non è la tecnologia in sé, ma l'uso che ne facciamo. Per questo credo che la soluzione non sia rifiutarla, bensì imparare a gestirla con equilibrio.",
  },
];

export const WRITING_LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2"];
