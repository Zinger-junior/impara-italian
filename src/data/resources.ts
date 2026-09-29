// =============================================================================
// src/data/resources.ts
// A curated toolkit of external Italian-learning resources. Everything here is
// usable for free. Each item carries an honest `cost` flag:
//   "free"         — fully free, no paywall for the core use
//   "free-account" — free but needs a (free) sign-up
//   "free-tier"    — freemium: the free tier is genuinely useful, paid unlocks more
// The few freemium entries are flagged so nothing is mis-sold as fully free.
// =============================================================================

export type ResourceCost = "free" | "free-account" | "free-tier";

export interface Resource {
  id: string;
  name: string;
  url: string;
  /** One line: what you'd open it for. */
  what: string;
  cost: ResourceCost;
  /** Optional caveat (platform limits, ads, geo, etc.). */
  note?: string;
}

export interface ResourceGroup {
  title: string;
  blurb: string;
  items: Resource[];
}

export const COST_LABEL: Record<ResourceCost, string> = {
  free: "Free",
  "free-account": "Free · sign-up",
  "free-tier": "Free tier",
};

export const RESOURCE_GROUPS: ResourceGroup[] = [
  {
    title: "Flashcards & daily review",
    blurb: "Build one deck of words you actually meet and review it every day. This is the habit that compounds.",
    items: [
      { id: "anki", name: "Anki", url: "https://apps.ankiweb.net/", what: "Spaced-repetition flashcards for your own words", cost: "free", note: "Desktop, web and Android are free; the iOS app is paid." },
      { id: "ankiweb", name: "AnkiWeb", url: "https://ankiweb.net/", what: "Free cloud sync + study in the browser", cost: "free-account" },
      { id: "tatoeba", name: "Tatoeba", url: "https://tatoeba.org/en/", what: "Millions of example sentences to mine for context cards", cost: "free" },
    ],
  },
  {
    title: "Grammar & structured courses",
    blurb: "Free courses and clear explanations. Language Transfer especially rewires how you think about Italian.",
    items: [
      { id: "lt", name: "Language Transfer — Complete Italian", url: "https://www.languagetransfer.org/", what: "A 90-track audio course that builds the grammar in your head", cost: "free", note: "100% free, no account, downloadable." },
      { id: "learnamo", name: "LearnAmo", url: "https://www.youtube.com/@LearnAmo", what: "Clear grammar lessons, mostly in Italian", cost: "free" },
      { id: "lucrezia", name: "Learn Italian with Lucrezia", url: "https://www.youtube.com/@lucreziaoddone", what: "Slow, very clear lessons for beginners up", cost: "free" },
      { id: "oneworld", name: "One World Italiano", url: "https://www.oneworlditaliano.com/english/italian.htm", what: "Free graded video lessons + exercises A1–C2", cost: "free" },
      { id: "iluss", name: "Iluss / Italiano gratis", url: "https://www.iluss.it/", what: "Free grammar exercises with answers", cost: "free" },
      { id: "europass", name: "Europass grammar", url: "https://www.europassitalian.com/learn/grammar/", what: "Concise grammar reference pages to skim", cost: "free" },
    ],
  },
  {
    title: "Listening — easiest first",
    blurb: "Start with comprehensible input you can almost follow, then climb. Listen twice: once for gist, once with the transcript.",
    items: [
      { id: "contesto", name: "Italiano in Contesto", url: "https://www.youtube.com/@italianoincontesto", what: "Comprehensible input from absolute zero", cost: "free" },
      { id: "ime", name: "Italy Made Easy", url: "https://www.youtube.com/@ItalyMadeEasy", what: "Beginner structure with English explanations", cost: "free" },
      { id: "easy", name: "Easy Italian", url: "https://www.youtube.com/@EasyItalian", what: "Real street interviews with dual subtitles", cost: "free" },
      { id: "pi", name: "Podcast Italiano", url: "https://www.youtube.com/@PodcastItaliano", what: "Graded podcast with full transcripts", cost: "free" },
      { id: "auto", name: "Italiano Automatico", url: "https://www.youtube.com/@ItalianoAutomatico", what: "Natural-speed storytelling", cost: "free" },
      { id: "coffee", name: "Coffee Break Italian", url: "https://coffeebreaklanguages.com/coffeebreakitalian/", what: "Structured audio course", cost: "free", note: "The podcast episodes are free; premium extras are paid." },
    ],
  },
  {
    title: "Real Italian (native content)",
    blurb: "Once you can follow graded audio, spend time in content made for Italians. Frustrating at first, then suddenly not.",
    items: [
      { id: "ilpost", name: "Il Post", url: "https://www.ilpost.it/", what: "Plainly-written, readable Italian news", cost: "free" },
      { id: "raisound", name: "RaiPlay Sound", url: "https://www.raiplaysound.it/", what: "National radio, audiobooks and podcasts", cost: "free-account", note: "Free; some content is geo-restricted outside Italy." },
      { id: "raiplay", name: "RaiPlay", url: "https://www.raiplay.it/", what: "Italian TV, films and series on demand", cost: "free-account", note: "Free with account; geo-restrictions may apply abroad." },
      { id: "wikinews", name: "Wikinotizie", url: "https://it.wikinews.org/", what: "Short, simple current-events articles", cost: "free" },
    ],
  },
  {
    title: "Reading & graded readers",
    blurb: "Read a little every day. Simple Wikipedia and children's encyclopedias are gold for early readers.",
    items: [
      { id: "vikidia", name: "Vikidia (it)", url: "https://it.vikidia.org/", what: "Encyclopedia written for 8–13 year-olds — perfect A2/B1 reading", cost: "free" },
      { id: "wikipediait", name: "Wikipedia in italiano", url: "https://it.wikipedia.org/", what: "Read about things you already know, in Italian", cost: "free" },
      { id: "gutenberg", name: "Project Gutenberg — Italian", url: "https://www.gutenberg.org/browse/languages/it", what: "Free public-domain Italian books", cost: "free" },
      { id: "liberliber", name: "Liber Liber", url: "https://www.liberliber.it/", what: "Free Italian ebooks and audiobooks", cost: "free" },
    ],
  },
  {
    title: "Dictionaries & conjugation",
    blurb: "Look words up in context, not just in isolation. Check every new verb's conjugation once, out loud.",
    items: [
      { id: "wr", name: "WordReference", url: "https://www.wordreference.com/enit/", what: "EN↔IT dictionary plus a usage forum", cost: "free", note: "Ad-supported." },
      { id: "treccani", name: "Treccani — Vocabolario", url: "https://www.treccani.it/vocabolario/", what: "The authoritative Italian monolingual dictionary", cost: "free" },
      { id: "wiktionary", name: "Wikizionario", url: "https://it.wiktionary.org/", what: "Free dictionary with inflection tables", cost: "free" },
      { id: "reverso", name: "Reverso Context", url: "https://context.reverso.net/translation/italian-english/", what: "See a word used across real bilingual sentences", cost: "free-tier", note: "Free tier is generous; ads." },
      { id: "coniugazione", name: "Coniugazione (Reverso)", url: "https://conjugator.reverso.net/conjugation-italian.html", what: "Full conjugation of any verb, any tense", cost: "free" },
    ],
  },
  {
    title: "Pronunciation",
    blurb: "Hear a native say the exact word before you commit it to memory. Then say it back and record yourself.",
    items: [
      { id: "forvo", name: "Forvo", url: "https://forvo.com/languages/it/", what: "Native recordings of individual words and names", cost: "free" },
      { id: "youglish", name: "YouGlish (Italian)", url: "https://youglish.com/italian", what: "Hear any word inside thousands of real video clips", cost: "free" },
    ],
  },
  {
    title: "Speaking & getting corrected",
    blurb: "You cannot get to B1 without producing language. Write daily and get it fixed; talk weekly with a real person.",
    items: [
      { id: "langcorrect", name: "LangCorrect", url: "https://langcorrect.com/", what: "Post your writing; natives correct it for free", cost: "free-account" },
      { id: "journaly", name: "Journaly", url: "https://www.journaly.com/", what: "Keep a journal in Italian and get corrections", cost: "free-account" },
      { id: "tandem", name: "Tandem", url: "https://www.tandem.net/", what: "Language-exchange chat and calls with natives", cost: "free-tier", note: "Core exchange is free; some features are paid." },
      { id: "hellotalk", name: "HelloTalk", url: "https://www.hellotalk.com/", what: "Text and voice with native speakers", cost: "free-tier", note: "Core use free; advanced features paid." },
      { id: "reddit", name: "r/italianlearning", url: "https://www.reddit.com/r/italianlearning/", what: "Ask questions, find partners, get resources", cost: "free" },
    ],
  },
  {
    title: "Words in context & games",
    blurb: "Fill gaps in real sentences and learn lyrics — low-effort ways to keep the streak alive on a tired day.",
    items: [
      { id: "clozemaster", name: "Clozemaster", url: "https://www.clozemaster.com/l/ita-eng", what: "Fill-the-gap drills inside real sentences", cost: "free-tier", note: "Free tier is enough for daily practice." },
      { id: "lyricstraining", name: "LyricsTraining", url: "https://lyricstraining.com/it", what: "Learn by filling in the words of Italian songs", cost: "free-tier" },
      { id: "genius", name: "Genius", url: "https://genius.com/", what: "Italian song lyrics to read along and mine", cost: "free" },
    ],
  },
];

/** Flat list of every resource, for search/linking. */
export const ALL_RESOURCES: Resource[] = RESOURCE_GROUPS.flatMap((g) => g.items);

/** Look up a resource by id (used to attach a tool to a lesson task). */
export function resourceById(id: string): Resource | undefined {
  return ALL_RESOURCES.find((r) => r.id === id);
}
