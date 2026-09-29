// =============================================================================
// src/data/listening.ts
// Content for the Listening lab. Two exercise types:
//   • Dictation      — hear a sentence, type it back (trains the ear + spelling).
//   • Comprehension  — hear a short passage, answer a question about it.
// The app speaks these with the Web Speech API, so no audio files are shipped.
// =============================================================================

import type { CefrLevel } from "../types/index.js";

export interface DictationItem {
  it: string;
  en: string;
  level: CefrLevel;
}

export interface ComprehensionItem {
  id: string;
  script: string;
  en: string;
  level: CefrLevel;
  question: string;
  options: string[];
  answer: string;
}

export const DICTATION: DictationItem[] = [
  // --- A1 ---
  { it: "Mi chiamo Marco e sono italiano.", en: "My name is Marco and I'm Italian.", level: "A1" },
  { it: "Buongiorno, come stai?", en: "Good morning, how are you?", level: "A1" },
  { it: "Ho due fratelli e una sorella.", en: "I have two brothers and a sister.", level: "A1" },
  { it: "Abito a Roma da tre anni.", en: "I've lived in Rome for three years.", level: "A1" },
  { it: "Vorrei un caffè, per favore.", en: "I'd like a coffee, please.", level: "A1" },
  { it: "Che ore sono adesso?", en: "What time is it now?", level: "A1" },
  // --- A2 ---
  { it: "Ieri sono andato al mercato con mia madre.", en: "Yesterday I went to the market with my mother.", level: "A2" },
  { it: "Il treno parte alle otto e mezza.", en: "The train leaves at half past eight.", level: "A2" },
  { it: "Non ho capito, puoi ripetere più lentamente?", en: "I didn't understand, can you repeat more slowly?", level: "A2" },
  { it: "Da bambino giocavo sempre a calcio.", en: "As a child I always played football.", level: "A2" },
  { it: "Domani andremo al mare se fa bel tempo.", en: "Tomorrow we'll go to the sea if the weather is nice.", level: "A2" },
  // --- B1 ---
  { it: "Penso che tu abbia ragione, ma non ne sono sicuro.", en: "I think you're right, but I'm not sure about it.", level: "B1" },
  { it: "Se avessi più tempo, studierei un'altra lingua.", en: "If I had more time, I'd study another language.", level: "B1" },
  { it: "Vorrei prenotare un tavolo per due persone stasera.", en: "I'd like to book a table for two people tonight.", level: "B1" },
  { it: "Mi dispiace, ma non sono d'accordo con te.", en: "I'm sorry, but I don't agree with you.", level: "B1" },
  // --- B2 ---
  { it: "Credevo che fosse già partito, invece era ancora a casa.", en: "I thought he'd already left, but he was still at home.", level: "B2" },
  { it: "Nonostante la pioggia, siamo riusciti a finire la gita.", en: "Despite the rain, we managed to finish the trip.", level: "B2" },
  { it: "Disse che sarebbe tornato il giorno seguente.", en: "He said he would come back the following day.", level: "B2" },
];

export const COMPREHENSION: ComprehensionItem[] = [
  {
    id: "c-bar",
    level: "A2",
    script: "Allora, io prendo un cappuccino e un cornetto. Tu cosa vuoi? Un tè? Va bene, lo ordino subito.",
    en: "So, I'll have a cappuccino and a croissant. What do you want? A tea? OK, I'll order it right away.",
    question: "What does the speaker order for themselves?",
    options: ["A cappuccino and a croissant", "A tea and a croissant", "Two coffees", "Only a tea"],
    answer: "A cappuccino and a croissant",
  },
  {
    id: "c-treno",
    level: "A2",
    script: "Attenzione: il treno per Firenze delle nove e dieci partirà dal binario sette, non dal binario tre.",
    en: "Attention: the nine-ten train to Florence will leave from platform seven, not platform three.",
    question: "Which platform does the train actually leave from?",
    options: ["Platform seven", "Platform three", "Platform nine", "Platform ten"],
    answer: "Platform seven",
  },
  {
    id: "c-weekend",
    level: "B1",
    script: "Questo fine settimana volevo andare in montagna, ma hanno detto che pioverà, quindi resto a casa a studiare.",
    en: "This weekend I wanted to go to the mountains, but they said it'll rain, so I'm staying home to study.",
    question: "What will the speaker do this weekend?",
    options: ["Stay home and study", "Go to the mountains", "Visit family", "Go to the sea"],
    answer: "Stay home and study",
  },
  {
    id: "c-lavoro",
    level: "B1",
    script: "Scusi, la riunione di lunedì è stata spostata a martedì alle tre, perché il direttore non c'era.",
    en: "Sorry, Monday's meeting has been moved to Tuesday at three, because the director wasn't there.",
    question: "When is the meeting now?",
    options: ["Tuesday at three", "Monday at three", "Tuesday at one", "Monday morning"],
    answer: "Tuesday at three",
  },
  {
    id: "c-ricetta",
    level: "B2",
    script: "Per fare un buon sugo ci vuole pazienza: dopo aver soffritto la cipolla, aggiungi i pomodori e lascia cuocere a fuoco lento per almeno un'ora.",
    en: "To make a good sauce you need patience: after sautéing the onion, add the tomatoes and let it simmer for at least an hour.",
    question: "How long should the sauce simmer?",
    options: ["At least an hour", "Ten minutes", "Half an hour", "Two hours"],
    answer: "At least an hour",
  },
];

export const LISTENING_LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2"];
