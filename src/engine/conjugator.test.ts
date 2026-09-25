// =============================================================================
// src/engine/conjugator.test.ts
// Golden-value test suite for the conjugation engine.
//
// Run with:  npm test   (vitest run)
//
// Every expected form here was verified against standard Italian reference
// paradigms. These lock the engine's behaviour so later phases can refactor
// safely.
// =============================================================================

import { describe, it, expect } from "vitest";
import {
  conjugate,
  conjugateAll,
  conjugateForm,
  safeConjugateAll,
  ConjugationError,
  detectClass,
} from "./conjugator.js";
import { VERBS } from "../data/verbs.js";
import type { Verb } from "../types/index.js";

describe("regular -ARE (parlare)", () => {
  const parlare = VERBS.parlare!;

  it("presente", () => {
    expect(conjugate(parlare, { mood: "indicativo", tense: "presente" })).toEqual([
      "parlo", "parli", "parla", "parliamo", "parlate", "parlano",
    ]);
  });

  it("imperfetto", () => {
    expect(conjugate(parlare, { mood: "indicativo", tense: "imperfetto" })).toEqual([
      "parlavo", "parlavi", "parlava", "parlavamo", "parlavate", "parlavano",
    ]);
  });

  it("passato remoto", () => {
    expect(conjugate(parlare, { mood: "indicativo", tense: "passatoRemoto" })).toEqual([
      "parlai", "parlasti", "parlò", "parlammo", "parlaste", "parlarono",
    ]);
  });

  it("futuro semplice", () => {
    expect(conjugate(parlare, { mood: "indicativo", tense: "futuroSemplice" })).toEqual([
      "parlerò", "parlerai", "parlerà", "parleremo", "parlerete", "parleranno",
    ]);
  });

  it("condizionale presente", () => {
    expect(conjugate(parlare, { mood: "condizionale", tense: "presente" })).toEqual([
      "parlerei", "parleresti", "parlerebbe", "parleremmo", "parlereste", "parlerebbero",
    ]);
  });

  it("congiuntivo presente", () => {
    expect(conjugate(parlare, { mood: "congiuntivo", tense: "presente" })).toEqual([
      "parli", "parli", "parli", "parliamo", "parliate", "parlino",
    ]);
  });

  it("congiuntivo imperfetto", () => {
    expect(conjugate(parlare, { mood: "congiuntivo", tense: "imperfetto" })).toEqual([
      "parlassi", "parlassi", "parlasse", "parlassimo", "parlaste", "parlassero",
    ]);
  });

  it("imperativo (no 1sg)", () => {
    expect(conjugate(parlare, { mood: "imperativo", tense: "presente" })).toEqual([
      "", "parla", "parli", "parliamo", "parlate", "parlino",
    ]);
  });

  it("passato prossimo (avere)", () => {
    expect(conjugate(parlare, { mood: "indicativo", tense: "passatoProssimo" })).toEqual([
      "ho parlato", "hai parlato", "ha parlato",
      "abbiamo parlato", "avete parlato", "hanno parlato",
    ]);
  });

  it("non-finite forms", () => {
    const full = conjugateAll(parlare);
    expect(full.nonFinite).toEqual({
      infinitive: "parlare",
      gerund: "parlando",
      pastParticiple: "parlato",
      presentParticiple: "parlante",
    });
    expect(full.isRegular).toBe(true);
  });
});

describe("regular -ERE (credere)", () => {
  const credere = VERBS.credere!;
  it("presente", () => {
    expect(conjugate(credere, { mood: "indicativo", tense: "presente" })).toEqual([
      "credo", "credi", "crede", "crediamo", "credete", "credono",
    ]);
  });
  it("past participle", () => {
    expect(conjugateAll(credere).nonFinite.pastParticiple).toBe("creduto");
  });
});

describe("regular -IRE with essere agreement (partire)", () => {
  const partire = VERBS.partire!;

  it("presente", () => {
    expect(conjugate(partire, { mood: "indicativo", tense: "presente" })).toEqual([
      "parto", "parti", "parte", "partiamo", "partite", "partono",
    ]);
  });

  it("passato prossimo — default masculine agreement", () => {
    expect(conjugate(partire, { mood: "indicativo", tense: "passatoProssimo" })).toEqual([
      "sono partito", "sei partito", "è partito",
      "siamo partiti", "siete partiti", "sono partiti",
    ]);
  });

  it("passato prossimo — feminine agreement", () => {
    expect(
      conjugate(partire, {
        mood: "indicativo",
        tense: "passatoProssimo",
        agreement: { gender: "f", number: "singular" },
      }),
    ).toEqual([
      "sono partita", "sei partita", "è partita",
      "siamo partite", "siete partite", "sono partite",
    ]);
  });
});

describe("-isc- infix class (capire)", () => {
  const capire = VERBS.capire!;
  it("presente", () => {
    expect(conjugate(capire, { mood: "indicativo", tense: "presente" })).toEqual([
      "capisco", "capisci", "capisce", "capiamo", "capite", "capiscono",
    ]);
  });
  it("congiuntivo presente", () => {
    expect(conjugate(capire, { mood: "congiuntivo", tense: "presente" })).toEqual([
      "capisca", "capisca", "capisca", "capiamo", "capiate", "capiscano",
    ]);
  });
  it("imperativo", () => {
    expect(conjugate(capire, { mood: "imperativo", tense: "presente" })).toEqual([
      "", "capisci", "capisca", "capiamo", "capite", "capiscano",
    ]);
  });
  it("futuro (no infix)", () => {
    expect(conjugateForm(capire, { mood: "indicativo", tense: "futuroSemplice", person: 0 })).toBe(
      "capirò",
    );
  });
});

describe("orthographic rules (-are)", () => {
  it("cercare: -care keeps hard c with an h", () => {
    const cercare = VERBS.cercare!;
    expect(conjugate(cercare, { mood: "indicativo", tense: "presente" })).toEqual([
      "cerco", "cerchi", "cerca", "cerchiamo", "cercate", "cercano",
    ]);
    expect(conjugateForm(cercare, { mood: "indicativo", tense: "futuroSemplice", person: 0 })).toBe(
      "cercherò",
    );
  });

  it("pagare: -gare keeps hard g with an h", () => {
    const pagare = VERBS.pagare!;
    expect(conjugateForm(pagare, { mood: "indicativo", tense: "presente", person: 1 })).toBe("paghi");
    expect(conjugateForm(pagare, { mood: "indicativo", tense: "futuroSemplice", person: 0 })).toBe(
      "pagherò",
    );
  });

  it("mangiare: -giare drops the softening i", () => {
    const mangiare = VERBS.mangiare!;
    expect(conjugate(mangiare, { mood: "indicativo", tense: "presente" })).toEqual([
      "mangio", "mangi", "mangia", "mangiamo", "mangiate", "mangiano",
    ]);
    expect(conjugateForm(mangiare, { mood: "indicativo", tense: "futuroSemplice", person: 0 })).toBe(
      "mangerò",
    );
  });

  it("cominciare: -ciare drops the softening i", () => {
    const cominciare = VERBS.cominciare!;
    expect(conjugateForm(cominciare, { mood: "indicativo", tense: "presente", person: 1 })).toBe(
      "cominci",
    );
    expect(
      conjugateForm(cominciare, { mood: "indicativo", tense: "futuroSemplice", person: 0 }),
    ).toBe("comincerò");
  });

  it("studiare: -iare avoids a doubled i but keeps it before -er", () => {
    const studiare = VERBS.studiare!;
    expect(conjugate(studiare, { mood: "indicativo", tense: "presente" })).toEqual([
      "studio", "studi", "studia", "studiamo", "studiate", "studiano",
    ]);
    expect(conjugateForm(studiare, { mood: "indicativo", tense: "futuroSemplice", person: 0 })).toBe(
      "studierò",
    );
  });
});

describe("irregular verbs", () => {
  it("essere presente + passato prossimo (essere + agreeing stato)", () => {
    const essere = VERBS.essere!;
    expect(conjugate(essere, { mood: "indicativo", tense: "presente" })).toEqual([
      "sono", "sei", "è", "siamo", "siete", "sono",
    ]);
    expect(conjugate(essere, { mood: "indicativo", tense: "passatoProssimo" })).toEqual([
      "sono stato", "sei stato", "è stato",
      "siamo stati", "siete stati", "sono stati",
    ]);
    expect(conjugate(essere, { mood: "indicativo", tense: "futuroSemplice" })).toEqual([
      "sarò", "sarai", "sarà", "saremo", "sarete", "saranno",
    ]);
  });

  it("avere presente + regular imperfetto", () => {
    const avere = VERBS.avere!;
    expect(conjugate(avere, { mood: "indicativo", tense: "presente" })).toEqual([
      "ho", "hai", "ha", "abbiamo", "avete", "hanno",
    ]);
    expect(conjugate(avere, { mood: "indicativo", tense: "imperfetto" })).toEqual([
      "avevo", "avevi", "aveva", "avevamo", "avevate", "avevano",
    ]);
  });

  it("fare presente, futuro, passato prossimo", () => {
    const fare = VERBS.fare!;
    expect(conjugate(fare, { mood: "indicativo", tense: "presente" })).toEqual([
      "faccio", "fai", "fa", "facciamo", "fate", "fanno",
    ]);
    expect(conjugateForm(fare, { mood: "indicativo", tense: "futuroSemplice", person: 0 })).toBe(
      "farò",
    );
    expect(conjugateForm(fare, { mood: "indicativo", tense: "passatoProssimo", person: 0 })).toBe(
      "ho fatto",
    );
  });

  it("andare presente + passato prossimo with feminine plural agreement", () => {
    const andare = VERBS.andare!;
    expect(conjugate(andare, { mood: "indicativo", tense: "presente" })).toEqual([
      "vado", "vai", "va", "andiamo", "andate", "vanno",
    ]);
    expect(
      conjugate(andare, {
        mood: "indicativo",
        tense: "passatoProssimo",
        agreement: { gender: "f", number: "plural" },
      }),
    ).toEqual([
      "sono andata", "sei andata", "è andata",
      "siamo andate", "siete andate", "sono andate",
    ]);
  });

  it("modal verbs presente", () => {
    expect(conjugate(VERBS.potere!, { mood: "indicativo", tense: "presente" })).toEqual([
      "posso", "puoi", "può", "possiamo", "potete", "possono",
    ]);
    expect(conjugate(VERBS.volere!, { mood: "indicativo", tense: "presente" })).toEqual([
      "voglio", "vuoi", "vuole", "vogliamo", "volete", "vogliono",
    ]);
    expect(conjugate(VERBS.dovere!, { mood: "indicativo", tense: "presente" })).toEqual([
      "devo", "devi", "deve", "dobbiamo", "dovete", "devono",
    ]);
  });

  it("potere has no imperative", () => {
    expect(conjugate(VERBS.potere!, { mood: "imperativo", tense: "presente" })).toEqual([
      "", "", "", "", "", "",
    ]);
  });

  it("bere presente + imperfetto (derived from bev- stem)", () => {
    const bere = VERBS.bere!;
    expect(conjugate(bere, { mood: "indicativo", tense: "presente" })).toEqual([
      "bevo", "bevi", "beve", "beviamo", "bevete", "bevono",
    ]);
    expect(conjugate(bere, { mood: "indicativo", tense: "imperfetto" })).toEqual([
      "bevevo", "bevevi", "beveva", "bevevamo", "bevevate", "bevevano",
    ]);
  });

  it("uscire presente + regular future", () => {
    const uscire = VERBS.uscire!;
    expect(conjugate(uscire, { mood: "indicativo", tense: "presente" })).toEqual([
      "esco", "esci", "esce", "usciamo", "uscite", "escono",
    ]);
    expect(conjugateForm(uscire, { mood: "indicativo", tense: "futuroSemplice", person: 0 })).toBe(
      "uscirò",
    );
  });

  it("sapere passato remoto", () => {
    expect(conjugate(VERBS.sapere!, { mood: "indicativo", tense: "passatoRemoto" })).toEqual([
      "seppi", "sapesti", "seppe", "sapemmo", "sapeste", "seppero",
    ]);
  });

  it("flags irregular verbs as not regular", () => {
    expect(conjugateAll(VERBS.fare!).isRegular).toBe(false);
  });
});

describe("error handling", () => {
  it("detectClass rejects a malformed infinitive", () => {
    expect(() => detectClass("xyz")).toThrow(ConjugationError);
  });

  it("conjugate throws on an unknown mood/tense pair", () => {
    expect(() =>
      // @ts-expect-error deliberately invalid combination
      conjugate(VERBS.parlare!, { mood: "indicativo", tense: "nonexistent" }),
    ).toThrow(ConjugationError);
  });

  it("safeConjugateAll returns a tagged failure instead of throwing", () => {
    const bad: Verb = {
      infinitive: "blorp",
      translation: "n/a",
      conjugationClass: "are",
      auxiliary: "avere",
      isIrregular: false,
      isReflexive: false,
      cefrLevel: "A1",
    };
    const result = safeConjugateAll(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/does not end in/);
  });

  it("conjugateForm rejects an out-of-range person", () => {
    expect(() =>
      conjugateForm(VERBS.parlare!, { mood: "indicativo", tense: "presente", person: 9 }),
    ).toThrow(ConjugationError);
  });
});
