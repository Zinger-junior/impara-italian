// =============================================================================
// src/vocab/srs.ts
// Leitner spaced-repetition helpers. Pure and DOM-free. A word lives in a box
// 1..5; lower boxes are shown more often. Knowing a word promotes it; missing
// it sends it back to box 1.
// =============================================================================

import type { VocabRecord } from "../db/store.js";

/** New box after a review: +1 (max 5) if known, back to 1 if missed. */
export function boxAfter(box: number, knew: boolean): number {
  if (!knew) return 1;
  return Math.min(5, box + 1);
}

/** Words that still need work (box 1–2). */
export function weakWords(words: VocabRecord[]): VocabRecord[] {
  return words.filter((w) => (w.box || 1) <= 2);
}

/** Average mastery as a percentage (box 1 → 0%, box 5 → 100%). */
export function masteryPct(words: VocabRecord[]): number {
  if (words.length === 0) return 0;
  const avg = words.reduce((s, w) => s + (w.box || 1), 0) / words.length;
  return Math.round(((avg - 1) / 4) * 100);
}

/**
 * Pick the next word to quiz, weighting toward lower boxes so weak words come
 * up more often. `rand` defaults to Math.random (injectable for tests).
 */
export function pickWeighted(
  words: VocabRecord[],
  rand: () => number = Math.random,
): VocabRecord | null {
  if (words.length === 0) return null;
  const weights = words.map((w) => 1 / (w.box || 1));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < words.length; i++) {
    r -= weights[i]!;
    if (r <= 0) return words[i]!;
  }
  return words[words.length - 1]!;
}

/** Count of words per box, index 0 = box 1 … index 4 = box 5. */
export function boxCounts(words: VocabRecord[]): [number, number, number, number, number] {
  const counts: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  for (const w of words) {
    const b = Math.max(1, Math.min(5, w.box || 1));
    counts[b - 1]++;
  }
  return counts;
}
