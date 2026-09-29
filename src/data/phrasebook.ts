// =============================================================================
// src/data/phrasebook.ts
// Situational phrasebook. Grouped by the situation you'll actually be standing
// in. Each entry: Italian, English, and an optional literal/usage note so you
// understand it rather than just parroting it.
// =============================================================================

export interface Phrase {
  it: string;
  en: string;
  /** Optional literal gloss or usage tip. */
  note?: string;
}

export interface PhraseGroup {
  title: string;
  blurb: string;
  phrases: Phrase[];
}

export const PHRASE_GROUPS: PhraseGroup[] = [
  {
    title: "Repair your own Italian",
    blurb: "The single most useful category. These keep a conversation alive when you don't understand — memorise them first.",
    phrases: [
      { it: "Come si dice… in italiano?", en: "How do you say… in Italian?" },
      { it: "Cosa significa…?", en: "What does… mean?" },
      { it: "Puoi parlare più lentamente, per favore?", en: "Can you speak more slowly, please?" },
      { it: "Puoi ripetere, per favore?", en: "Can you repeat, please?" },
      { it: "Non ho capito bene.", en: "I didn't quite understand." },
      { it: "Come si scrive?", en: "How do you spell it?" },
      { it: "Sto imparando l'italiano.", en: "I'm learning Italian." },
      { it: "Scusa, ho sbagliato.", en: "Sorry, I made a mistake." },
      { it: "Puoi correggermi?", en: "Can you correct me?", note: "Ask for corrections — most people are happy to help." },
      { it: "Si dice così?", en: "Is that how you say it?" },
    ],
  },
  {
    title: "Greetings & courtesy",
    blurb: "Italians greet more than English speakers do. Say buongiorno on the way into a shop and it changes the whole exchange.",
    phrases: [
      { it: "Buongiorno / Buonasera", en: "Good morning / Good evening", note: "Switch to buonasera from mid-afternoon." },
      { it: "Ciao / Salve", en: "Hi (informal) / Hello (neutral-formal)", note: "Salve is a safe middle ground with strangers." },
      { it: "Come sta? / Come stai?", en: "How are you? (formal / informal)" },
      { it: "Piacere di conoscerti.", en: "Nice to meet you." },
      { it: "Per favore / Grazie / Prego", en: "Please / Thank you / You're welcome" },
      { it: "Mille grazie! / Grazie mille!", en: "Thanks a lot!" },
      { it: "Scusa / Scusi", en: "Sorry, excuse me (informal / formal)" },
      { it: "A dopo / A domani / A presto", en: "See you later / tomorrow / soon" },
      { it: "Buona giornata!", en: "Have a good day!" },
    ],
  },
  {
    title: "University & bureaucracy",
    blurb: "If you're studying in Italy, this matters more than the tourist phrases. Offices run on appointments and forms.",
    phrases: [
      { it: "Ho un appuntamento in segreteria.", en: "I have an appointment at the admin office." },
      { it: "Devo iscrivermi al corso.", en: "I need to enrol on the course." },
      { it: "Dov'è l'aula?", en: "Where is the lecture room?" },
      { it: "Quando c'è la lezione?", en: "When is the lecture?" },
      { it: "Devo consegnare questo modulo.", en: "I have to hand in this form." },
      { it: "Ho bisogno di un certificato.", en: "I need a certificate." },
      { it: "Quando sono gli esami?", en: "When are the exams?" },
      { it: "Mi può aiutare con la domanda?", en: "Can you help me with the application?" },
      { it: "Mangio alla mensa.", en: "I eat at the canteen." },
      { it: "A che ora apre lo sportello?", en: "What time does the counter open?" },
    ],
  },
  {
    title: "Bar, mensa & shops",
    blurb: "Order standing at the bar like a local: short, direct, polite. You often pay first, then take the receipt to the counter.",
    phrases: [
      { it: "Un caffè, per favore.", en: "A coffee, please.", note: "'Un caffè' means an espresso." },
      { it: "Vorrei…", en: "I'd like…", note: "Softer and more polite than 'voglio'." },
      { it: "Cosa mi consiglia?", en: "What do you recommend?" },
      { it: "Prendo questo.", en: "I'll take this one." },
      { it: "Il conto, per favore.", en: "The bill, please." },
      { it: "Posso pagare con la carta?", en: "Can I pay by card?" },
      { it: "Quant'è? / Quanto costa?", en: "How much is it?" },
      { it: "Sto solo guardando, grazie.", en: "I'm just looking, thanks." },
      { it: "È tutto, grazie.", en: "That's everything, thanks." },
      { it: "Era buonissimo!", en: "That was delicious!" },
    ],
  },
  {
    title: "Getting around the city",
    blurb: "Stamp your bus ticket when you board or you can be fined. Ask for directions to places you already know, to train your ear.",
    phrases: [
      { it: "Dov'è…?", en: "Where is…?" },
      { it: "Quanto è lontano?", en: "How far is it?" },
      { it: "A destra / a sinistra / dritto", en: "Right / left / straight on" },
      { it: "Un biglietto per…, per favore.", en: "A ticket to…, please." },
      { it: "A che ora parte il prossimo treno?", en: "What time does the next train leave?" },
      { it: "Da quale binario parte?", en: "Which platform does it leave from?" },
      { it: "Devo scendere qui?", en: "Do I get off here?" },
      { it: "Mi sono perso / persa.", en: "I'm lost.", note: "Ending agrees with your gender." },
      { it: "Devo timbrare il biglietto?", en: "Do I need to stamp the ticket?" },
    ],
  },
  {
    title: "Renting & housing",
    blurb: "Finding a room involves a lot of these. Bills (le bollette) and the deposit (la caparra) are where misunderstandings happen.",
    phrases: [
      { it: "Cerco una stanza / un appartamento.", en: "I'm looking for a room / a flat." },
      { it: "Quant'è l'affitto al mese?", en: "How much is the rent per month?" },
      { it: "Le bollette sono incluse?", en: "Are the bills included?" },
      { it: "Quanto è la caparra?", en: "How much is the deposit?" },
      { it: "Posso vedere la stanza?", en: "Can I see the room?" },
      { it: "C'è il riscaldamento?", en: "Is there heating?" },
      { it: "Il contratto è di quanti mesi?", en: "How many months is the contract?" },
      { it: "Non funziona il riscaldamento.", en: "The heating isn't working." },
    ],
  },
  {
    title: "Doctor & pharmacy",
    blurb: "The pharmacy (la farmacia) handles minor problems and advice. For anything real, learn to describe symptoms simply.",
    phrases: [
      { it: "Non mi sento bene.", en: "I don't feel well." },
      { it: "Ho mal di testa / di gola / di stomaco.", en: "I have a headache / sore throat / stomach ache." },
      { it: "Ho la febbre.", en: "I have a fever." },
      { it: "Mi fa male qui.", en: "It hurts here." },
      { it: "Sono allergico / allergica a…", en: "I'm allergic to…" },
      { it: "Avete qualcosa per il raffreddore?", en: "Do you have something for a cold?" },
      { it: "Ho bisogno di un medico.", en: "I need a doctor." },
      { it: "Dov'è la farmacia più vicina?", en: "Where's the nearest pharmacy?" },
    ],
  },
  {
    title: "Phone, internet & problems",
    blurb: "For when something breaks. 'Non funziona' is one of the highest-value phrases you'll learn.",
    phrases: [
      { it: "Non funziona.", en: "It doesn't work." },
      { it: "C'è un problema con…", en: "There's a problem with…" },
      { it: "Ho perso il documento / il telefono.", en: "I've lost my ID / phone." },
      { it: "Vorrei una scheda SIM.", en: "I'd like a SIM card." },
      { it: "Quanti giga ha l'offerta?", en: "How much data does the plan have?" },
      { it: "La connessione è lenta.", en: "The connection is slow." },
      { it: "Aiuto!", en: "Help!" },
      { it: "Chiami un'ambulanza!", en: "Call an ambulance!" },
    ],
  },
  {
    title: "Holding a conversation",
    blurb: "The connective tissue of real speech. Using fillers while you think sounds far more fluent than going silent.",
    phrases: [
      { it: "Allora…", en: "So… / Right…", note: "The all-purpose 'let me think' opener." },
      { it: "Cioè…", en: "I mean… / that is…" },
      { it: "Secondo me…", en: "In my opinion…" },
      { it: "Sono d'accordo. / Non sono d'accordo.", en: "I agree. / I disagree." },
      { it: "Dipende.", en: "It depends." },
      { it: "Che ne pensi?", en: "What do you think?" },
      { it: "Davvero?", en: "Really?" },
      { it: "Ha senso.", en: "That makes sense." },
      { it: "Non ne sono sicuro / sicura.", en: "I'm not sure about that." },
      { it: "Come dicevo…", en: "As I was saying…" },
      { it: "Insomma…", en: "Well… / in short…" },
    ],
  },
  {
    title: "Making plans & small talk",
    blurb: "How friendships actually start. Invitations, weekends, and the weather carry a surprising amount of early conversation.",
    phrases: [
      { it: "Che fai di bello?", en: "What are you up to?" },
      { it: "Ti va di prendere un caffè?", en: "Fancy grabbing a coffee?" },
      { it: "Sei libero / libera stasera?", en: "Are you free tonight?" },
      { it: "Ci vediamo alle otto?", en: "Shall we meet at eight?" },
      { it: "Va bene per te?", en: "Does that work for you?" },
      { it: "Magari un'altra volta.", en: "Maybe another time." },
      { it: "Che tempo fa oggi?", en: "What's the weather like today?" },
      { it: "Buon fine settimana!", en: "Have a good weekend!" },
    ],
  },
  {
    title: "At the bar & restaurant",
    blurb: "Ordering is fast and standing at the bar is cheaper. Say what you want plainly — “vorrei” or “prendo” both work.",
    phrases: [
      { it: "Un caffè, per favore.", en: "A coffee, please.", note: "At the bar this means an espresso." },
      { it: "Prendo un cornetto.", en: "I'll have a croissant." },
      { it: "Vorrei prenotare un tavolo per due.", en: "I'd like to book a table for two." },
      { it: "Il menù, per favore.", en: "The menu, please." },
      { it: "Cosa mi consiglia?", en: "What do you recommend?" },
      { it: "Sono vegetariano / vegetariana.", en: "I'm vegetarian." },
      { it: "Il conto, per favore.", en: "The bill, please." },
      { it: "Posso pagare con la carta?", en: "Can I pay by card?" },
      { it: "Era tutto buonissimo.", en: "It was all delicious." },
    ],
  },
  {
    title: "Getting around",
    blurb: "Trains, buses and directions. Remember to validate (timbrare) regional train tickets before boarding.",
    phrases: [
      { it: "Un biglietto per Firenze, per favore.", en: "A ticket to Florence, please." },
      { it: "A che ora parte il prossimo treno?", en: "What time does the next train leave?" },
      { it: "Da quale binario parte?", en: "Which platform does it leave from?" },
      { it: "Devo cambiare?", en: "Do I have to change?" },
      { it: "Dov'è la fermata dell'autobus?", en: "Where's the bus stop?" },
      { it: "Scusi, come arrivo al centro?", en: "Excuse me, how do I get to the centre?" },
      { it: "È lontano da qui?", en: "Is it far from here?" },
      { it: "Giri a destra / a sinistra.", en: "Turn right / left.", note: "You'll hear this in replies." },
    ],
  },
  {
    title: "Emergencies & help",
    blurb: "Low-frequency, high-stakes. Worth knowing cold. The single European emergency number is 112.",
    phrases: [
      { it: "Aiuto!", en: "Help!" },
      { it: "Ho bisogno di aiuto.", en: "I need help." },
      { it: "Chiami un'ambulanza!", en: "Call an ambulance!" },
      { it: "Mi sono perso / persa.", en: "I'm lost." },
      { it: "Ho perso il portafoglio.", en: "I've lost my wallet." },
      { it: "Non mi sento bene.", en: "I don't feel well." },
      { it: "Dov'è l'ospedale più vicino?", en: "Where's the nearest hospital?" },
      { it: "Può aiutarmi, per favore?", en: "Can you help me, please?" },
    ],
  },
];

export const ALL_PHRASES: Phrase[] = PHRASE_GROUPS.flatMap((g) => g.phrases);
