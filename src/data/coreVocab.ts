// =============================================================================
// src/data/coreVocab.ts
// A core seed pack of high-frequency Italian, grouped by theme and CEFR-tagged.
// The first few hundred words do most of the work; load this, then add words you
// actually meet. Nouns are stored with their article so gender sticks.
// =============================================================================

import type { CefrLevel } from "../types/index.js";

export interface CoreWord {
  it: string;
  en: string;
  theme: string;
  level: CefrLevel;
}

export const CORE_VOCAB: CoreWord[] = [
  // --- Time & sequence ---
  { it: "il giorno", en: "day", theme: "Time & sequence", level: "A1" },
  { it: "la settimana", en: "week", theme: "Time & sequence", level: "A1" },
  { it: "il mese", en: "month", theme: "Time & sequence", level: "A1" },
  { it: "l'anno", en: "year", theme: "Time & sequence", level: "A1" },
  { it: "oggi", en: "today", theme: "Time & sequence", level: "A1" },
  { it: "domani", en: "tomorrow", theme: "Time & sequence", level: "A1" },
  { it: "ieri", en: "yesterday", theme: "Time & sequence", level: "A1" },
  { it: "adesso, ora", en: "now", theme: "Time & sequence", level: "A1" },
  { it: "sempre", en: "always", theme: "Time & sequence", level: "A1" },
  { it: "mai", en: "never", theme: "Time & sequence", level: "A1" },
  { it: "spesso", en: "often", theme: "Time & sequence", level: "A2" },
  { it: "a volte", en: "sometimes", theme: "Time & sequence", level: "A2" },
  { it: "presto", en: "early, soon", theme: "Time & sequence", level: "A2" },
  { it: "tardi", en: "late", theme: "Time & sequence", level: "A2" },
  { it: "subito", en: "right away", theme: "Time & sequence", level: "A2" },
  { it: "già", en: "already", theme: "Time & sequence", level: "A2" },
  { it: "ancora", en: "still, again, yet", theme: "Time & sequence", level: "A2" },
  { it: "poi", en: "then, afterwards", theme: "Time & sequence", level: "A1" },
  { it: "prima", en: "before, first", theme: "Time & sequence", level: "A2" },
  { it: "dopo", en: "after, later", theme: "Time & sequence", level: "A1" },

  // --- Home ---
  { it: "la casa", en: "house, home", theme: "Home", level: "A1" },
  { it: "la stanza", en: "room", theme: "Home", level: "A1" },
  { it: "la camera", en: "bedroom", theme: "Home", level: "A1" },
  { it: "la porta", en: "door", theme: "Home", level: "A1" },
  { it: "la finestra", en: "window", theme: "Home", level: "A1" },
  { it: "il tavolo", en: "table", theme: "Home", level: "A1" },
  { it: "la sedia", en: "chair", theme: "Home", level: "A1" },
  { it: "il letto", en: "bed", theme: "Home", level: "A1" },
  { it: "la cucina", en: "kitchen", theme: "Home", level: "A1" },
  { it: "il bagno", en: "bathroom", theme: "Home", level: "A1" },
  { it: "la chiave", en: "key", theme: "Home", level: "A1" },
  { it: "l'affitto", en: "rent", theme: "Home", level: "A2" },

  // --- Food & drink ---
  { it: "l'acqua", en: "water", theme: "Food & drink", level: "A1" },
  { it: "il pane", en: "bread", theme: "Food & drink", level: "A1" },
  { it: "il vino", en: "wine", theme: "Food & drink", level: "A1" },
  { it: "il caffè", en: "coffee", theme: "Food & drink", level: "A1" },
  { it: "la birra", en: "beer", theme: "Food & drink", level: "A1" },
  { it: "la colazione", en: "breakfast", theme: "Food & drink", level: "A1" },
  { it: "il pranzo", en: "lunch", theme: "Food & drink", level: "A1" },
  { it: "la cena", en: "dinner", theme: "Food & drink", level: "A1" },
  { it: "la mensa", en: "canteen", theme: "Food & drink", level: "A2" },
  { it: "il conto", en: "the bill", theme: "Food & drink", level: "A2" },
  { it: "la frutta", en: "fruit", theme: "Food & drink", level: "A1" },
  { it: "la verdura", en: "vegetables", theme: "Food & drink", level: "A1" },

  // --- University ---
  { it: "l'università", en: "university", theme: "University", level: "A1" },
  { it: "la lezione", en: "lesson, lecture", theme: "University", level: "A1" },
  { it: "l'esame", en: "exam", theme: "University", level: "A1" },
  { it: "il corso", en: "course", theme: "University", level: "A1" },
  { it: "lo studente", en: "student (m)", theme: "University", level: "A1" },
  { it: "la studentessa", en: "student (f)", theme: "University", level: "A1" },
  { it: "il professore", en: "professor (m)", theme: "University", level: "A1" },
  { it: "l'aula", en: "classroom", theme: "University", level: "A1" },
  { it: "la segreteria", en: "admin office", theme: "University", level: "A2" },
  { it: "il libro", en: "book", theme: "University", level: "A1" },
  { it: "il compito", en: "homework, task", theme: "University", level: "A1" },
  { it: "il voto", en: "grade, mark", theme: "University", level: "A2" },

  // --- City & transport ---
  { it: "la città", en: "city", theme: "City & transport", level: "A1" },
  { it: "la strada", en: "street, road", theme: "City & transport", level: "A1" },
  { it: "la piazza", en: "square", theme: "City & transport", level: "A1" },
  { it: "il negozio", en: "shop", theme: "City & transport", level: "A1" },
  { it: "il mercato", en: "market", theme: "City & transport", level: "A1" },
  { it: "la stazione", en: "station", theme: "City & transport", level: "A1" },
  { it: "l'autobus", en: "bus", theme: "City & transport", level: "A1" },
  { it: "il treno", en: "train", theme: "City & transport", level: "A1" },
  { it: "la macchina", en: "car", theme: "City & transport", level: "A1" },
  { it: "la bicicletta", en: "bicycle", theme: "City & transport", level: "A1" },
  { it: "la farmacia", en: "pharmacy", theme: "City & transport", level: "A1" },
  { it: "il biglietto", en: "ticket", theme: "City & transport", level: "A1" },

  // --- People & life ---
  { it: "il lavoro", en: "work, job", theme: "People & life", level: "A1" },
  { it: "i soldi", en: "money", theme: "People & life", level: "A1" },
  { it: "il tempo", en: "time; weather", theme: "People & life", level: "A1" },
  { it: "la gente", en: "people", theme: "People & life", level: "A2" },
  { it: "l'amico", en: "friend (m)", theme: "People & life", level: "A1" },
  { it: "l'amica", en: "friend (f)", theme: "People & life", level: "A1" },
  { it: "la famiglia", en: "family", theme: "People & life", level: "A1" },
  { it: "il ragazzo", en: "boy, boyfriend", theme: "People & life", level: "A1" },
  { it: "la ragazza", en: "girl, girlfriend", theme: "People & life", level: "A1" },
  { it: "il problema", en: "problem", theme: "People & life", level: "A1" },
  { it: "la cosa", en: "thing", theme: "People & life", level: "A1" },
  { it: "il nome", en: "name", theme: "People & life", level: "A1" },

  // --- Core verbs ---
  { it: "essere", en: "to be", theme: "Core verbs", level: "A1" },
  { it: "avere", en: "to have", theme: "Core verbs", level: "A1" },
  { it: "fare", en: "to do, to make", theme: "Core verbs", level: "A1" },
  { it: "andare", en: "to go", theme: "Core verbs", level: "A1" },
  { it: "venire", en: "to come", theme: "Core verbs", level: "A1" },
  { it: "stare", en: "to stay, to be (health)", theme: "Core verbs", level: "A1" },
  { it: "dare", en: "to give", theme: "Core verbs", level: "A1" },
  { it: "dire", en: "to say", theme: "Core verbs", level: "A1" },
  { it: "potere", en: "to be able to", theme: "Core verbs", level: "A1" },
  { it: "volere", en: "to want", theme: "Core verbs", level: "A1" },
  { it: "dovere", en: "to have to", theme: "Core verbs", level: "A2" },
  { it: "sapere", en: "to know (facts)", theme: "Core verbs", level: "A2" },
  { it: "conoscere", en: "to know (people, places)", theme: "Core verbs", level: "A2" },
  { it: "vedere", en: "to see", theme: "Core verbs", level: "A1" },
  { it: "sentire", en: "to hear, to feel", theme: "Core verbs", level: "A1" },
  { it: "parlare", en: "to speak", theme: "Core verbs", level: "A1" },
  { it: "capire", en: "to understand", theme: "Core verbs", level: "A1" },
  { it: "pensare", en: "to think", theme: "Core verbs", level: "A1" },
  { it: "credere", en: "to believe", theme: "Core verbs", level: "A2" },
  { it: "trovare", en: "to find", theme: "Core verbs", level: "A2" },
  { it: "prendere", en: "to take", theme: "Core verbs", level: "A1" },
  { it: "mettere", en: "to put", theme: "Core verbs", level: "A2" },
  { it: "portare", en: "to bring, to carry", theme: "Core verbs", level: "A2" },
  { it: "partire", en: "to depart", theme: "Core verbs", level: "A2" },
  { it: "tornare", en: "to come back", theme: "Core verbs", level: "A2" },
  { it: "arrivare", en: "to arrive", theme: "Core verbs", level: "A1" },
  { it: "uscire", en: "to go out", theme: "Core verbs", level: "A2" },
  { it: "chiedere", en: "to ask", theme: "Core verbs", level: "A2" },
  { it: "rispondere", en: "to answer", theme: "Core verbs", level: "A2" },
  { it: "aspettare", en: "to wait", theme: "Core verbs", level: "A2" },
  { it: "lavorare", en: "to work", theme: "Core verbs", level: "A1" },
  { it: "studiare", en: "to study", theme: "Core verbs", level: "A1" },
  { it: "imparare", en: "to learn", theme: "Core verbs", level: "A1" },
  { it: "ricordare", en: "to remember", theme: "Core verbs", level: "A2" },
  { it: "mangiare", en: "to eat", theme: "Core verbs", level: "A1" },
  { it: "bere", en: "to drink", theme: "Core verbs", level: "A1" },

  // --- Adjectives ---
  { it: "buono", en: "good (taste, quality)", theme: "Adjectives", level: "A1" },
  { it: "bravo", en: "good (at something)", theme: "Adjectives", level: "A1" },
  { it: "bello", en: "beautiful, nice", theme: "Adjectives", level: "A1" },
  { it: "brutto", en: "ugly, bad", theme: "Adjectives", level: "A1" },
  { it: "grande", en: "big", theme: "Adjectives", level: "A1" },
  { it: "piccolo", en: "small", theme: "Adjectives", level: "A1" },
  { it: "nuovo", en: "new", theme: "Adjectives", level: "A1" },
  { it: "vecchio", en: "old", theme: "Adjectives", level: "A1" },
  { it: "facile", en: "easy", theme: "Adjectives", level: "A1" },
  { it: "difficile", en: "difficult", theme: "Adjectives", level: "A1" },
  { it: "stanco", en: "tired", theme: "Adjectives", level: "A2" },
  { it: "contento", en: "happy, pleased", theme: "Adjectives", level: "A2" },
  { it: "importante", en: "important", theme: "Adjectives", level: "A2" },
  { it: "giusto", en: "right, correct", theme: "Adjectives", level: "A2" },
  { it: "sbagliato", en: "wrong", theme: "Adjectives", level: "A2" },

  // --- Quantity & function ---
  { it: "tutto", en: "all, everything", theme: "Quantity & function", level: "A1" },
  { it: "molto", en: "a lot, very", theme: "Quantity & function", level: "A1" },
  { it: "poco", en: "little, few", theme: "Quantity & function", level: "A1" },
  { it: "abbastanza", en: "enough, quite", theme: "Quantity & function", level: "A2" },
  { it: "troppo", en: "too much", theme: "Quantity & function", level: "A2" },
  { it: "niente", en: "nothing", theme: "Quantity & function", level: "A1" },
  { it: "qualcosa", en: "something", theme: "Quantity & function", level: "A2" },
  { it: "altro", en: "other", theme: "Quantity & function", level: "A2" },
  { it: "stesso", en: "same", theme: "Quantity & function", level: "A2" },

  // --- Opinion & discourse ---
  { it: "perché", en: "because, why", theme: "Opinion & discourse", level: "A1" },
  { it: "quindi", en: "so, therefore", theme: "Opinion & discourse", level: "A2" },
  { it: "però", en: "but, however", theme: "Opinion & discourse", level: "A2" },
  { it: "anche", en: "also, too", theme: "Opinion & discourse", level: "A1" },
  { it: "invece", en: "instead, whereas", theme: "Opinion & discourse", level: "A2" },
  { it: "allora", en: "so, then, well", theme: "Opinion & discourse", level: "A1" },
  { it: "magari", en: "maybe, I wish", theme: "Opinion & discourse", level: "B1" },
  { it: "almeno", en: "at least", theme: "Opinion & discourse", level: "B1" },
  { it: "comunque", en: "anyway", theme: "Opinion & discourse", level: "B1" },
  { it: "insomma", en: "in short, well", theme: "Opinion & discourse", level: "B1" },
  { it: "secondo me", en: "in my opinion", theme: "Opinion & discourse", level: "A2" },
  { it: "mi sembra che", en: "it seems to me that", theme: "Opinion & discourse", level: "B1" },
  { it: "per esempio", en: "for example", theme: "Opinion & discourse", level: "A2" },
  { it: "in realtà", en: "actually", theme: "Opinion & discourse", level: "B1" },
  { it: "d'accordo", en: "agreed", theme: "Opinion & discourse", level: "A2" },

  // --- Useful chunks ---
  { it: "ho bisogno di", en: "I need", theme: "Useful chunks", level: "A2" },
  { it: "mi piace", en: "I like", theme: "Useful chunks", level: "A1" },
  { it: "ci vuole", en: "it takes (time)", theme: "Useful chunks", level: "B1" },
  { it: "va bene", en: "all right, OK", theme: "Useful chunks", level: "A1" },
  { it: "non importa", en: "it doesn't matter", theme: "Useful chunks", level: "A2" },
  { it: "vorrei", en: "I would like", theme: "Useful chunks", level: "A2" },
  { it: "mi dispiace", en: "I'm sorry", theme: "Useful chunks", level: "A1" },

  // --- Body & health ---
  { it: "la testa", en: "head", theme: "Body & health", level: "A2" },
  { it: "la mano", en: "hand", theme: "Body & health", level: "A2" },
  { it: "l'occhio", en: "eye", theme: "Body & health", level: "A2" },
  { it: "il medico", en: "doctor", theme: "Body & health", level: "A2" },
  { it: "la febbre", en: "fever", theme: "Body & health", level: "A2" },
  { it: "il dolore", en: "pain", theme: "Body & health", level: "B1" },

  // --- Nature & weather ---
  { it: "il sole", en: "sun", theme: "Nature & weather", level: "A1" },
  { it: "la pioggia", en: "rain", theme: "Nature & weather", level: "A2" },
  { it: "il freddo", en: "cold", theme: "Nature & weather", level: "A1" },
  { it: "il caldo", en: "heat", theme: "Nature & weather", level: "A1" },
  { it: "il mare", en: "sea", theme: "Nature & weather", level: "A1" },
  { it: "la montagna", en: "mountain", theme: "Nature & weather", level: "A2" },

  // --- Numbers & counting ---
  { it: "uno", en: "one", theme: "Numbers & counting", level: "A1" },
  { it: "due", en: "two", theme: "Numbers & counting", level: "A1" },
  { it: "tre", en: "three", theme: "Numbers & counting", level: "A1" },
  { it: "dieci", en: "ten", theme: "Numbers & counting", level: "A1" },
  { it: "cento", en: "hundred", theme: "Numbers & counting", level: "A1" },
  { it: "mille", en: "thousand", theme: "Numbers & counting", level: "A1" },
  { it: "il numero", en: "number", theme: "Numbers & counting", level: "A1" },
  { it: "primo", en: "first", theme: "Numbers & counting", level: "A1" },
  { it: "ultimo", en: "last", theme: "Numbers & counting", level: "A2" },
  { it: "metà", en: "half", theme: "Numbers & counting", level: "A2" },

  // --- Days & months ---
  { it: "lunedì", en: "Monday", theme: "Days & months", level: "A1" },
  { it: "venerdì", en: "Friday", theme: "Days & months", level: "A1" },
  { it: "domenica", en: "Sunday", theme: "Days & months", level: "A1" },
  { it: "il fine settimana", en: "weekend", theme: "Days & months", level: "A1" },
  { it: "gennaio", en: "January", theme: "Days & months", level: "A1" },
  { it: "agosto", en: "August", theme: "Days & months", level: "A1" },
  { it: "l'estate", en: "summer", theme: "Days & months", level: "A1" },
  { it: "l'inverno", en: "winter", theme: "Days & months", level: "A1" },

  // --- Clothing & shopping ---
  { it: "i vestiti", en: "clothes", theme: "Clothing & shopping", level: "A2" },
  { it: "la maglia", en: "sweater, shirt", theme: "Clothing & shopping", level: "A2" },
  { it: "i pantaloni", en: "trousers", theme: "Clothing & shopping", level: "A2" },
  { it: "le scarpe", en: "shoes", theme: "Clothing & shopping", level: "A2" },
  { it: "la taglia", en: "size", theme: "Clothing & shopping", level: "A2" },
  { it: "il prezzo", en: "price", theme: "Clothing & shopping", level: "A2" },
  { it: "lo sconto", en: "discount", theme: "Clothing & shopping", level: "B1" },
  { it: "il saldo", en: "sale", theme: "Clothing & shopping", level: "B1" },
  { it: "provare", en: "to try on", theme: "Clothing & shopping", level: "A2" },
  { it: "costare", en: "to cost", theme: "Clothing & shopping", level: "A2" },

  // --- Emotions & states ---
  { it: "felice", en: "happy", theme: "Emotions & states", level: "A1" },
  { it: "triste", en: "sad", theme: "Emotions & states", level: "A2" },
  { it: "arrabbiato", en: "angry", theme: "Emotions & states", level: "A2" },
  { it: "preoccupato", en: "worried", theme: "Emotions & states", level: "B1" },
  { it: "annoiato", en: "bored", theme: "Emotions & states", level: "B1" },
  { it: "nervoso", en: "nervous, edgy", theme: "Emotions & states", level: "B1" },
  { it: "sorpreso", en: "surprised", theme: "Emotions & states", level: "B1" },
  { it: "avere paura", en: "to be afraid", theme: "Emotions & states", level: "A2" },
  { it: "sentirsi", en: "to feel (a way)", theme: "Emotions & states", level: "A2" },

  // --- Work & office ---
  { it: "l'ufficio", en: "office", theme: "Work & office", level: "A1" },
  { it: "il capo", en: "boss", theme: "Work & office", level: "A2" },
  { it: "il collega", en: "colleague", theme: "Work & office", level: "A2" },
  { it: "la riunione", en: "meeting", theme: "Work & office", level: "B1" },
  { it: "il progetto", en: "project", theme: "Work & office", level: "B1" },
  { it: "la scadenza", en: "deadline", theme: "Work & office", level: "B1" },
  { it: "lo stipendio", en: "salary", theme: "Work & office", level: "B1" },
  { it: "l'appuntamento", en: "appointment", theme: "Work & office", level: "A2" },

  // --- Directions & place ---
  { it: "destra", en: "right", theme: "Directions & place", level: "A1" },
  { it: "sinistra", en: "left", theme: "Directions & place", level: "A1" },
  { it: "dritto", en: "straight on", theme: "Directions & place", level: "A2" },
  { it: "vicino", en: "near", theme: "Directions & place", level: "A1" },
  { it: "lontano", en: "far", theme: "Directions & place", level: "A1" },
  { it: "qui, qua", en: "here", theme: "Directions & place", level: "A1" },
  { it: "lì, là", en: "there", theme: "Directions & place", level: "A1" },
  { it: "sopra", en: "above, on top", theme: "Directions & place", level: "A2" },
  { it: "sotto", en: "under, below", theme: "Directions & place", level: "A2" },
  { it: "l'angolo", en: "corner", theme: "Directions & place", level: "A2" },

  // --- Technology & communication ---
  { it: "il telefono", en: "phone", theme: "Technology & communication", level: "A1" },
  { it: "il computer", en: "computer", theme: "Technology & communication", level: "A1" },
  { it: "la mail", en: "email", theme: "Technology & communication", level: "A2" },
  { it: "il messaggio", en: "message", theme: "Technology & communication", level: "A1" },
  { it: "la rete, il wifi", en: "network, wifi", theme: "Technology & communication", level: "A2" },
  { it: "lo schermo", en: "screen", theme: "Technology & communication", level: "A2" },
  { it: "scaricare", en: "to download", theme: "Technology & communication", level: "B1" },
  { it: "chiamare", en: "to call", theme: "Technology & communication", level: "A1" },

  // --- Question words ---
  { it: "chi?", en: "who?", theme: "Question words", level: "A1" },
  { it: "che cosa?, cosa?", en: "what?", theme: "Question words", level: "A1" },
  { it: "quando?", en: "when?", theme: "Question words", level: "A1" },
  { it: "dove?", en: "where?", theme: "Question words", level: "A1" },
  { it: "come?", en: "how?", theme: "Question words", level: "A1" },
  { it: "quanto?", en: "how much?", theme: "Question words", level: "A1" },
  { it: "quale?", en: "which?", theme: "Question words", level: "A2" },
  { it: "perché?", en: "why?", theme: "Question words", level: "A1" },
];

/** Distinct themes in declaration order. */
export const VOCAB_THEMES: string[] = [...new Set(CORE_VOCAB.map((w) => w.theme))];
