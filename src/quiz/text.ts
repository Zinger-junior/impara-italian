// =============================================================================
// src/quiz/text.ts
// Pure text utilities for grading typed answers and scoring pronunciation.
// No DOM — fully unit-testable.
// =============================================================================

/**
 * Normalise a learner answer for comparison:
 *  - trim + collapse internal whitespace
 *  - lowercase
 *  - normalise apostrophes/quotes to a plain '
 * Accents are PRESERVED (they are meaningful in Italian); use stripAccents()
 * separately when you want an accent-insensitive comparison for hints.
 */
export function normalizeAnswer(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[‘’ʼ`´]/g, "'") // curly/backtick apostrophes -> '
    .replace(/\s+/g, " ");
}

/** Remove diacritics (a-grave->a, e-grave->e, ...) for accent-insensitive "close" matching. */
export function stripAccents(input: string): string {
  return input.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** Levenshtein edit distance between two strings. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  let curr = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(
        prev[j]! + 1, // deletion
        curr[j - 1]! + 1, // insertion
        prev[j - 1]! + cost, // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length]!;
}

/**
 * Similarity ratio in [0,100] based on normalised Levenshtein distance.
 * 100 = identical after normalisation.
 */
export function similarity(a: string, b: string): number {
  const na = normalizeAnswer(a);
  const nb = normalizeAnswer(b);
  if (na.length === 0 && nb.length === 0) return 100;
  const dist = levenshtein(na, nb);
  const maxLen = Math.max(na.length, nb.length);
  return Math.round((1 - dist / maxLen) * 100);
}

/**
 * How a typed answer matches an expected value.
 *  - "exact":   equal after normalisation (accents included)
 *  - "accent":  equal only when accents are ignored (right word, wrong accent)
 *  - "close":   similarity ≥ closeThreshold (likely a typo)
 *  - "wrong":   otherwise
 */
export type MatchQuality = "exact" | "accent" | "close" | "wrong";

export function matchAnswer(
  given: string,
  expected: string,
  closeThreshold = 80,
): MatchQuality {
  const g = normalizeAnswer(given);
  const e = normalizeAnswer(expected);
  if (g === e) return "exact";
  if (stripAccents(g) === stripAccents(e)) return "accent";
  if (similarity(g, e) >= closeThreshold) return "close";
  return "wrong";
}

/** Best match quality against a list of acceptable answers. */
export function matchAny(given: string, acceptable: string[], closeThreshold = 80): MatchQuality {
  const order: MatchQuality[] = ["wrong", "close", "accent", "exact"];
  let best: MatchQuality = "wrong";
  for (const candidate of acceptable) {
    const q = matchAnswer(given, candidate, closeThreshold);
    if (order.indexOf(q) > order.indexOf(best)) best = q;
    if (best === "exact") break;
  }
  return best;
}
