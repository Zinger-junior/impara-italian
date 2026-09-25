// =============================================================================
// src/data/irregulars.ts
// Irregular verb override table.
//
// Each entry lists ONLY the forms that deviate from the regular pattern. The
// conjugation engine fills everything else regularly, so these tables stay
// small and auditable. Paradigms are 6-tuples indexed:
//   [0]=io  [1]=tu  [2]=lui/lei  [3]=noi  [4]=voi  [5]=loro
//
// For imperativoPresente, index 0 (io) is always "" (no 1sg imperative);
// index 2 is the formal "Lei" form, index 5 the formal "Loro" form.
// =============================================================================

import type { IrregularVerb } from "../types/index.js";

/** Keyed by infinitive for O(1) lookup by the engine. */
export const IRREGULARS: Record<string, IrregularVerb> = {
  // ---- essere (to be) --------------------------------------------------------
  essere: {
    infinitive: "essere",
    auxiliary: "essere",
    pastParticiple: "stato",
    gerund: "essendo",
    futureStem: "sar",
    overrides: {
      presente: ["sono", "sei", "è", "siamo", "siete", "sono"],
      imperfetto: ["ero", "eri", "era", "eravamo", "eravate", "erano"],
      passatoRemoto: ["fui", "fosti", "fu", "fummo", "foste", "furono"],
      congiuntivoPresente: ["sia", "sia", "sia", "siamo", "siate", "siano"],
      congiuntivoImperfetto: ["fossi", "fossi", "fosse", "fossimo", "foste", "fossero"],
      imperativoPresente: ["", "sii", "sia", "siamo", "siate", "siano"],
    },
  },

  // ---- avere (to have) -------------------------------------------------------
  avere: {
    infinitive: "avere",
    auxiliary: "avere",
    pastParticiple: "avuto",
    futureStem: "avr",
    overrides: {
      presente: ["ho", "hai", "ha", "abbiamo", "avete", "hanno"],
      passatoRemoto: ["ebbi", "avesti", "ebbe", "avemmo", "aveste", "ebbero"],
      congiuntivoPresente: ["abbia", "abbia", "abbia", "abbiamo", "abbiate", "abbiano"],
      imperativoPresente: ["", "abbi", "abbia", "abbiamo", "abbiate", "abbiano"],
    },
  },

  // ---- fare (to do/make) -----------------------------------------------------
  fare: {
    infinitive: "fare",
    auxiliary: "avere",
    pastParticiple: "fatto",
    gerund: "facendo",
    futureStem: "far",
    overrides: {
      presente: ["faccio", "fai", "fa", "facciamo", "fate", "fanno"],
      imperfetto: ["facevo", "facevi", "faceva", "facevamo", "facevate", "facevano"],
      passatoRemoto: ["feci", "facesti", "fece", "facemmo", "faceste", "fecero"],
      congiuntivoPresente: ["faccia", "faccia", "faccia", "facciamo", "facciate", "facciano"],
      congiuntivoImperfetto: ["facessi", "facessi", "facesse", "facessimo", "faceste", "facessero"],
      imperativoPresente: ["", "fa'", "faccia", "facciamo", "fate", "facciano"],
    },
  },

  // ---- andare (to go) --------------------------------------------------------
  andare: {
    infinitive: "andare",
    auxiliary: "essere",
    pastParticiple: "andato",
    futureStem: "andr",
    overrides: {
      presente: ["vado", "vai", "va", "andiamo", "andate", "vanno"],
      congiuntivoPresente: ["vada", "vada", "vada", "andiamo", "andiate", "vadano"],
      imperativoPresente: ["", "va'", "vada", "andiamo", "andate", "vadano"],
    },
  },

  // ---- stare (to stay/be) ----------------------------------------------------
  stare: {
    infinitive: "stare",
    auxiliary: "essere",
    pastParticiple: "stato",
    futureStem: "star",
    overrides: {
      presente: ["sto", "stai", "sta", "stiamo", "state", "stanno"],
      passatoRemoto: ["stetti", "stesti", "stette", "stemmo", "steste", "stettero"],
      congiuntivoPresente: ["stia", "stia", "stia", "stiamo", "stiate", "stiano"],
      congiuntivoImperfetto: ["stessi", "stessi", "stesse", "stessimo", "steste", "stessero"],
      imperativoPresente: ["", "sta'", "stia", "stiamo", "state", "stiano"],
    },
  },

  // ---- dare (to give) --------------------------------------------------------
  dare: {
    infinitive: "dare",
    auxiliary: "avere",
    pastParticiple: "dato",
    futureStem: "dar",
    overrides: {
      presente: ["do", "dai", "dà", "diamo", "date", "danno"],
      passatoRemoto: ["diedi", "desti", "diede", "demmo", "deste", "diedero"],
      congiuntivoPresente: ["dia", "dia", "dia", "diamo", "diate", "diano"],
      congiuntivoImperfetto: ["dessi", "dessi", "desse", "dessimo", "deste", "dessero"],
      imperativoPresente: ["", "da'", "dia", "diamo", "date", "diano"],
    },
  },

  // ---- dire (to say/tell) ----------------------------------------------------
  dire: {
    infinitive: "dire",
    auxiliary: "avere",
    pastParticiple: "detto",
    gerund: "dicendo",
    futureStem: "dir",
    overrides: {
      presente: ["dico", "dici", "dice", "diciamo", "dite", "dicono"],
      imperfetto: ["dicevo", "dicevi", "diceva", "dicevamo", "dicevate", "dicevano"],
      passatoRemoto: ["dissi", "dicesti", "disse", "dicemmo", "diceste", "dissero"],
      congiuntivoPresente: ["dica", "dica", "dica", "diciamo", "diciate", "dicano"],
      congiuntivoImperfetto: ["dicessi", "dicessi", "dicesse", "dicessimo", "diceste", "dicessero"],
      imperativoPresente: ["", "di'", "dica", "diciamo", "dite", "dicano"],
    },
  },

  // ---- venire (to come) ------------------------------------------------------
  venire: {
    infinitive: "venire",
    auxiliary: "essere",
    pastParticiple: "venuto",
    futureStem: "verr",
    overrides: {
      presente: ["vengo", "vieni", "viene", "veniamo", "venite", "vengono"],
      passatoRemoto: ["venni", "venisti", "venne", "venimmo", "veniste", "vennero"],
      congiuntivoPresente: ["venga", "venga", "venga", "veniamo", "veniate", "vengano"],
      imperativoPresente: ["", "vieni", "venga", "veniamo", "venite", "vengano"],
    },
  },

  // ---- potere (can/to be able) ----------------------------------------------
  potere: {
    infinitive: "potere",
    auxiliary: "avere",
    pastParticiple: "potuto",
    futureStem: "potr",
    overrides: {
      presente: ["posso", "puoi", "può", "possiamo", "potete", "possono"],
      congiuntivoPresente: ["possa", "possa", "possa", "possiamo", "possiate", "possano"],
      // No imperative for modal potere.
      imperativoPresente: ["", "", "", "", "", ""],
    },
  },

  // ---- volere (to want) ------------------------------------------------------
  volere: {
    infinitive: "volere",
    auxiliary: "avere",
    pastParticiple: "voluto",
    futureStem: "vorr",
    overrides: {
      presente: ["voglio", "vuoi", "vuole", "vogliamo", "volete", "vogliono"],
      passatoRemoto: ["volli", "volesti", "volle", "volemmo", "voleste", "vollero"],
      congiuntivoPresente: ["voglia", "voglia", "voglia", "vogliamo", "vogliate", "vogliano"],
      imperativoPresente: ["", "vogli", "voglia", "vogliamo", "vogliate", "vogliano"],
    },
  },

  // ---- dovere (must/to have to) ---------------------------------------------
  dovere: {
    infinitive: "dovere",
    auxiliary: "avere",
    pastParticiple: "dovuto",
    futureStem: "dovr",
    overrides: {
      presente: ["devo", "devi", "deve", "dobbiamo", "dovete", "devono"],
      congiuntivoPresente: ["debba", "debba", "debba", "dobbiamo", "dobbiate", "debbano"],
      // No imperative for modal dovere.
      imperativoPresente: ["", "", "", "", "", ""],
    },
  },

  // ---- sapere (to know) ------------------------------------------------------
  sapere: {
    infinitive: "sapere",
    auxiliary: "avere",
    pastParticiple: "saputo",
    futureStem: "sapr",
    overrides: {
      presente: ["so", "sai", "sa", "sappiamo", "sapete", "sanno"],
      passatoRemoto: ["seppi", "sapesti", "seppe", "sapemmo", "sapeste", "seppero"],
      congiuntivoPresente: ["sappia", "sappia", "sappia", "sappiamo", "sappiate", "sappiano"],
      imperativoPresente: ["", "sappi", "sappia", "sappiamo", "sappiate", "sappiano"],
    },
  },

  // ---- bere (to drink) -------------------------------------------------------
  bere: {
    infinitive: "bere",
    auxiliary: "avere",
    pastParticiple: "bevuto",
    gerund: "bevendo",
    futureStem: "berr",
    overrides: {
      presente: ["bevo", "bevi", "beve", "beviamo", "bevete", "bevono"],
      imperfetto: ["bevevo", "bevevi", "beveva", "bevevamo", "bevevate", "bevevano"],
      passatoRemoto: ["bevvi", "bevesti", "bevve", "bevemmo", "beveste", "bevvero"],
      congiuntivoPresente: ["beva", "beva", "beva", "beviamo", "beviate", "bevano"],
      congiuntivoImperfetto: ["bevessi", "bevessi", "bevesse", "bevessimo", "beveste", "bevessero"],
      imperativoPresente: ["", "bevi", "beva", "beviamo", "bevete", "bevano"],
    },
  },

  // ---- uscire (to go out) ----------------------------------------------------
  // Future/conditional are regular (uscir-), so no futureStem override.
  uscire: {
    infinitive: "uscire",
    auxiliary: "essere",
    pastParticiple: "uscito",
    overrides: {
      presente: ["esco", "esci", "esce", "usciamo", "uscite", "escono"],
      congiuntivoPresente: ["esca", "esca", "esca", "usciamo", "usciate", "escano"],
      imperativoPresente: ["", "esci", "esca", "usciamo", "uscite", "escano"],
    },
  },

  // ---- tenere (to hold/keep) -------------------------------------------------
  tenere: {
    infinitive: "tenere",
    auxiliary: "avere",
    pastParticiple: "tenuto",
    futureStem: "terr",
    overrides: {
      presente: ["tengo", "tieni", "tiene", "teniamo", "tenete", "tengono"],
      passatoRemoto: ["tenni", "tenesti", "tenne", "tenemmo", "teneste", "tennero"],
      congiuntivoPresente: ["tenga", "tenga", "tenga", "teniamo", "teniate", "tengano"],
      imperativoPresente: ["", "tieni", "tenga", "teniamo", "tenete", "tengano"],
    },
  },

  // ---- rimanere (to remain) --------------------------------------------------
  rimanere: {
    infinitive: "rimanere",
    auxiliary: "essere",
    pastParticiple: "rimasto",
    futureStem: "rimarr",
    overrides: {
      presente: ["rimango", "rimani", "rimane", "rimaniamo", "rimanete", "rimangono"],
      passatoRemoto: ["rimasi", "rimanesti", "rimase", "rimanemmo", "rimaneste", "rimasero"],
      congiuntivoPresente: ["rimanga", "rimanga", "rimanga", "rimaniamo", "rimaniate", "rimangano"],
      imperativoPresente: ["", "rimani", "rimanga", "rimaniamo", "rimanete", "rimangano"],
    },
  },
};

/** True if the engine has an irregular paradigm for this infinitive. */
export function isIrregular(infinitive: string): boolean {
  return Object.prototype.hasOwnProperty.call(IRREGULARS, infinitive);
}
