// =============================================================================
// src/cloud/sync.ts
// Bridges local progress (IndexedDB) with the signed-in user's Netlify Identity
// profile ("Identity profile" storage model).
//
//   • exportSnapshot()  – read every IndexedDB store into one JSON object.
//   • importSnapshot()  – replace every store from such an object.
//   • hydrateForUser()  – on login, pull the profile snapshot into IndexedDB
//                         (or start fresh + push, for a brand-new account).
//   • pushSnapshot()    – write current local state back to the profile.
//   • scheduleSync()    – debounced push, called after progress changes.
//
// The snapshot is stored in Netlify Identity `user_metadata` (see
// ../auth/netlifyIdentity.ts). That field is meant for small JSON; a learner's
// progress (lesson rows, scores, vocab, study days) stays well within practical
// limits, but we keep it compact and avoid storing anything derived.
// =============================================================================

import { getDb, seedFresh } from "../db/store.js";
import type { StoreName } from "../db/idb.js";
import { getAll, putMany, clearStore } from "../db/idb.js";
import { currentUser, readRemoteSnapshot, writeRemoteSnapshot } from "../auth/netlifyIdentity.js";

/** Every store we back up. Order matters only for readability. */
const STORES: StoreName[] = [
  "meta",
  "lessonProgress",
  "studySessions",
  "milestones",
  "quizResults",
  "pronunciationAttempts",
  "vocab",
  "mistakes",
];

export interface Snapshot {
  v: 1;
  savedAt: string;
  stores: Record<string, unknown[]>;
}

/** Read the full local state into a single snapshot object. */
export async function exportSnapshot(): Promise<Snapshot> {
  const db = await getDb();
  const stores: Record<string, unknown[]> = {};
  for (const name of STORES) {
    stores[name] = await getAll<unknown>(db, name);
  }
  return { v: 1, savedAt: new Date().toISOString(), stores };
}

/** Replace all local stores with the contents of a snapshot. */
export async function importSnapshot(snap: Snapshot): Promise<void> {
  const db = await getDb();
  for (const name of STORES) {
    const rows = snap.stores?.[name] ?? [];
    await clearStore(db, name);
    if (rows.length > 0) await putMany(db, name, rows);
  }
}

/** Wipe local state back to empty (used before seeding a fresh account). */
export async function clearLocal(): Promise<void> {
  const db = await getDb();
  for (const name of STORES) await clearStore(db, name);
}

function isSnapshot(x: unknown): x is Snapshot {
  return !!x && typeof x === "object" && (x as Snapshot).v === 1 && typeof (x as Snapshot).stores === "object";
}

// ---- Push (debounced) -------------------------------------------------------

let active = false;
let pending: ReturnType<typeof setTimeout> | null = null;

/** Enable/disable pushing. Kept off during hydrate so imports don't echo back. */
export function setSyncActive(on: boolean): void {
  active = on;
}

/** Immediately write current local state to the signed-in profile. */
export async function pushSnapshot(): Promise<void> {
  if (!currentUser()) return;
  const snap = await exportSnapshot();
  await writeRemoteSnapshot(snap);
}

/** Debounced push after progress changes (safe to call very often). */
export function scheduleSync(delayMs = 2500): void {
  if (!active || !currentUser()) return;
  if (pending) clearTimeout(pending);
  pending = setTimeout(() => {
    pending = null;
    void pushSnapshot();
  }, delayMs);
}

/** Flush any pending push right now (e.g. on tab hide / before logout). */
export async function flushSync(): Promise<void> {
  if (pending) {
    clearTimeout(pending);
    pending = null;
  }
  if (active) await pushSnapshot();
}

// ---- Hydrate on login -------------------------------------------------------

/**
 * Bring the signed-in user's data into IndexedDB.
 *  • Returning user (profile has a snapshot) → import it.
 *  • New account (no snapshot) → clear any leftover local data, seed a fresh
 *    start, then push that empty state up so the profile is initialised.
 * Leaves sync active so later changes are pushed.
 */
export async function hydrateForUser(): Promise<void> {
  setSyncActive(false);
  try {
    const remote = readRemoteSnapshot();
    if (isSnapshot(remote)) {
      await importSnapshot(remote);
    } else {
      await clearLocal();
      const db = await getDb();
      await seedFresh(db);
      await pushSnapshot();
    }
  } finally {
    setSyncActive(true);
  }
}
