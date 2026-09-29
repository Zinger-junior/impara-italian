// =============================================================================
// src/data/culture.ts
// Daily-life and culture notes — the unwritten rules that trip up learners more
// than grammar does. Practical, not touristy. Body text may use **bold**.
// =============================================================================

export interface CultureNote {
  title: string;
  body: string;
}

export interface CultureSection {
  title: string;
  blurb: string;
  notes: CultureNote[];
}

export const CULTURE_SECTIONS: CultureSection[] = [
  {
    title: "Coffee & the bar",
    blurb: "The bar is the centre of Italian daily life — and it runs on unspoken rules.",
    notes: [
      { title: "Un caffè is an espresso", body: "Ask for **un caffè** and you get an espresso, drunk standing at the counter in about a minute. Want a longer one? **un caffè lungo** or **un americano**. A **macchiato** is an espresso 'stained' with a little milk." },
      { title: "Pay first, or pay after — know which", body: "In many bars you **pay at the till first** (la cassa), take the receipt (lo scontrino) to the counter, and order from it. In smaller places you order first and pay on the way out. Watch what locals do." },
      { title: "The cappuccino clock", body: "Italians drink **cappuccino only in the morning** — a milky coffee after lunch is a mild curiosity. Nobody will stop you, but an espresso is the after-meal norm." },
      { title: "Standing vs sitting", body: "Drinking **al banco** (at the counter) is cheapest. Sitting at a table (**al tavolo**) often costs more — that's the service, not a scam." },
    ],
  },
  {
    title: "Meals & eating out",
    blurb: "Meal times are later and more structured than you may be used to.",
    notes: [
      { title: "When Italians eat", body: "Lunch is roughly **13:00–14:30**, dinner rarely before **20:00**. Kitchens often close between services, so a restaurant may not serve food at 17:00." },
      { title: "Il coperto", body: "A small per-person **cover charge (il coperto)** is normal and legal — it pays for the table, bread and setting. Tipping on top is optional and modest; rounding up is plenty." },
      { title: "Water and the bill", body: "You'll be asked **naturale o frizzante?** (still or sparkling). Tap water isn't usually offered. Ask for the bill — it won't come automatically: **il conto, per favore.**" },
      { title: "Course by course", body: "A full meal runs **antipasto → primo (pasta/rice) → secondo (meat/fish) + contorno (side) → dolce**. You don't have to order every course; one or two is fine." },
    ],
  },
  {
    title: "Greetings & formality (tu vs Lei)",
    blurb: "Choosing tu or Lei is the social decision you make in every new interaction.",
    notes: [
      { title: "Lei with strangers and officials", body: "Use the formal **Lei** (third-person singular) with people you don't know, older people, professors, officials and in shops. It signals respect. Switching too early to **tu** can read as familiar." },
      { title: "Who offers the tu", body: "Usually the **older or more senior person** offers to switch: 'Diamoci del tu?' Until then, stay on Lei. Among students and peers, tu is immediate and normal." },
      { title: "Greet on entering", body: "Say **buongiorno / buonasera** when you walk into a shop, waiting room or lift, and **arrivederci** or **buona giornata** on the way out. Silence reads as cold." },
      { title: "Salve as a safe default", body: "**Salve** is neither formal nor informal — a useful hedge when you're unsure whether to use ciao or buongiorno." },
    ],
  },
  {
    title: "Bureaucracy & daily admin",
    blurb: "La burocrazia is a rite of passage. Patience, paper and appointments.",
    notes: [
      { title: "Everything is an appointment", body: "Offices (la segreteria, l'anagrafe, la questura) largely run on **appuntamenti** booked online and fixed opening windows. Turning up cold often means being turned away." },
      { title: "Codice fiscale", body: "The **codice fiscale** is your tax/ID code — needed for a phone contract, a bank account, a rental, almost anything. Get it early from the Agenzia delle Entrate." },
      { title: "Keep every receipt", body: "Keep the **scontrino / ricevuta** for anything official. 'Ho già consegnato il modulo' (I already handed in the form) is a sentence you'll use." },
      { title: "Marca da bollo", body: "Some official requests need a **marca da bollo** — a revenue stamp bought at a tabaccheria. Odd, but expected." },
    ],
  },
  {
    title: "Getting around",
    blurb: "Public transport is cheap and good — with a couple of rules worth knowing.",
    notes: [
      { title: "Stamp your ticket", body: "On buses and regional trains you must **validate (timbrare/convalidare)** your ticket in the machine as you board. An unstamped ticket counts as no ticket, and inspectors do fine." },
      { title: "Tickets from the tabaccheria", body: "Bus tickets are often bought **before** boarding — at a **tabaccheria** (tobacconist), newsstand or machine, not always from the driver." },
      { title: "Regionale vs Frecce", body: "**Regionale** trains are cheap, slow and don't need a seat reservation; **Frecciarossa/Italo** are fast, booked to a specific seat and time. Different rules, different apps." },
    ],
  },
  {
    title: "Social life & making friends",
    blurb: "How connections actually form — slower, warmer, and around food.",
    notes: [
      { title: "The aperitivo", body: "The **aperitivo** (early-evening drink, often with snacks or a buffet) is the default social invitation. 'Ci prendiamo un aperitivo?' is how a lot of friendships start." },
      { title: "La bella figura", body: "**Fare bella figura** — making a good impression, dressing and behaving well in public — is a real cultural value. Casual is fine; sloppy is noticed." },
      { title: "Punctuality is flexible (socially)", body: "For dinner at a friend's, arriving **10–15 minutes late** is normal and even polite. For trains, lectures and appointments, be on time." },
    ],
  },
  {
    title: "Regional Italy & the language",
    blurb: "There is no single 'Italy' — and standard Italian sits on top of a patchwork.",
    notes: [
      { title: "Dialects are real languages", body: "What locals call **dialetti** (Napoletano, Siciliano, Veneto…) are often distinct languages, not accents. You'll learn standard Italian; you'll *hear* far more variety, especially with older people." },
      { title: "Accents shift the vowels", body: "Northern, central and southern speakers open and close vowels differently and vary the double consonants. Standard (roughly Tuscan/RAI) Italian is what courses teach and what you should aim to produce." },
      { title: "Campanilismo", body: "Strong local pride (**campanilismo**, from the town bell-tower) means food, football and customs are fiercely local. Asking someone about their città or region is reliably good small talk." },
    ],
  },
  {
    title: "Gestures & everyday etiquette",
    blurb: "A little body language and a few social reflexes go a long way.",
    notes: [
      { title: "The hand gestures are real", body: "The pinched-fingers **'ma che vuoi?'** gesture, the hand-flick for 'go on', the chin-flick for 'nothing/couldn't care' — they carry meaning. Watch them; you'll start reading conversations faster." },
      { title: "Buon appetito & cin cin", body: "Say **buon appetito** before eating and **cin cin** or **salute** when clinking glasses (make eye contact). Small rituals, warmly expected." },
      { title: "Permesso", body: "Say **permesso** when entering someone's home or squeezing past people. **Prego** is the all-purpose 'please, go ahead / you're welcome / here you are'." },
    ],
  },
];
