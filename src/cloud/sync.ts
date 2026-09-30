// =============================================================================
// src/cloud/sync.ts
// Per-user cloud sync. The whole local dataset (IndexedDB stores + a few
// localStorage keys) is serialised into one JSON snapshot and stored per user in
// a Supabase `profiles` table. On login we pull that snapshot into the local DB;
// as the user works we push it back (debounced + on tab hide + on an interval).
// Local IndexedDB stays the working store — nothing else in the app changes.
// =============================================================================

import { supabase } from "./supabase.js";
import { getDb, seedFresh } from "../db/store.js";
import { clearStore, getAll, putMany } from "../db/idb.js";
import type { StoreName } from "../db/idb.js";

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

// localStorage-backed state that should travel with the account.
const LOCAL_KEYS = ["impara.cando", "impara.missions", "impara.writing"];

export interface Snapshot {
  version: number;
  stores: Record<string, unknown[]>;
  local: Record<string, string>;
}

// The user whose data we're currently syncing (null = don't push).
let activeUid: string | null = null;
export function setSyncUser(uid: string | null): void {
  activeUid = uid;
}

// ---- Local (IndexedDB + localStorage) --------------------------------------

export async function exportSnapshot(): Promise<Snapshot> {
  const db = await getDb();
  const stores: Record<string, unknown[]> = {};
  for (const s of STORES) stores[s] = await getAll<unknown>(db, s);
  const local: Record<string, string> = {};
  for (const k of LOCAL_KEYS) {
    const v = localStorage.getItem(k);
    if (v !== null) local[k] = v;
  }
  return { version: 1, stores, local };
}

export async function importSnapshot(snap: Snapshot): Promise<void> {
  const db = await getDb();
  for (const s of STORES) {
    await clearStore(db, s);
    const rows = snap.stores?.[s] ?? [];
    if (rows.length) await putMany(db, s, rows);
  }
  for (const k of LOCAL_KEYS) {
    const v = snap.local?.[k];
    if (v === undefined) localStorage.removeItem(k);
    else localStorage.setItem(k, v);
  }
}

export async function clearLocal(): Promise<void> {
  const db = await getDb();
  for (const s of STORES) await clearStore(db, s);
  for (const k of LOCAL_KEYS) localStorage.removeItem(k);
}

// ---- Remote (Supabase) ------------------------------------------------------

export async function pullSnapshot(uid: string): Promise<Snapshot | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from("profiles").select("data").eq("id", uid).maybeSingle();
  if (error) {
    console.warn("[sync] pull failed:", error.message);
    return null;
  }
  return (data?.data as Snapshot | undefined) ?? null;
}

export async function pushSnapshot(uid?: string): Promise<void> {
  const id = uid ?? activeUid;
  if (!supabase || !id) return;
  try {
    const snap = await exportSnapshot();
    const { error } = await supabase
      .from("profiles")
      .upsert({ id, data: snap, updated_at: new Date().toISOString() });
    if (error) console.warn("[sync] push failed:", error.message);
  } catch (err) {
    console.warn("[sync] push threw:", err);
  }
}

// ---- Login hydration --------------------------------------------------------

/**
 * Make the local database reflect this user: pull their cloud snapshot and load
 * it, or (first time) start them fresh and create their cloud row. Called by the
 * Gate right after sign-in, before the app renders.
 */
export async function hydrateForUser(uid: string): Promise<void> {
  setSyncUser(null); // don't push while we're loading
  const snap = await pullSnapshot(uid);
  if (snap) {
    await importSnapshot(snap);
  } else {
    const db = await getDb();
    await clearLocal();
    await seedFresh(db); // clean starting state for a brand-new account
  }
  setSyncUser(uid);
  if (!snap) await pushSnapshot(uid); // create their initial cloud row
}

// ---- Debounced background sync ---------------------------------------------

let timer: ReturnType<typeof setTimeout> | null = null;

/** Schedule a push a moment from now, collapsing bursts of activity into one. */
export function scheduleSync(): void {
  if (!supabase || !activeUid) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    void pushSnapshot();
  }, 2000);
}
