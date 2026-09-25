// =============================================================================
// src/quiz/rng.ts
// A tiny seedable PRNG (mulberry32) so quiz generation is reproducible in
// tests and shareable via a seed. Not for cryptographic use.
// =============================================================================

export interface Rng {
  /** Float in [0, 1). */
  next(): number;
  /** Integer in [min, max]. */
  int(min: number, max: number): number;
  /** Pick one element (throws on empty array). */
  pick<T>(arr: readonly T[]): T;
  /** Return a shuffled copy (Fisher–Yates). */
  shuffle<T>(arr: readonly T[]): T[];
  /** Pick up to n distinct elements. */
  sample<T>(arr: readonly T[], n: number): T[];
}

export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  const next = (): number => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const int = (min: number, max: number): number => min + Math.floor(next() * (max - min + 1));

  const pick = <T>(arr: readonly T[]): T => {
    if (arr.length === 0) throw new Error("Cannot pick from an empty array.");
    return arr[int(0, arr.length - 1)]!;
  };

  const shuffle = <T>(arr: readonly T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = int(0, i);
      [copy[i], copy[j]] = [copy[j]!, copy[i]!];
    }
    return copy;
  };

  const sample = <T>(arr: readonly T[], n: number): T[] => shuffle(arr).slice(0, Math.max(0, n));

  return { next, int, pick, shuffle, sample };
}
