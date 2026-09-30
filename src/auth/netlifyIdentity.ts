// =============================================================================
// src/auth/netlifyIdentity.ts
// Thin, typed wrapper around the Netlify Identity widget (netlify-identity-widget).
//
// The widget gives us a complete, hosted signup / login / password-recovery /
// email-confirmation UI as a modal — we never build auth forms ourselves. It
// talks to the GoTrue instance that Netlify provisions when you enable Identity
// on your site (Site configuration → Identity → Enable Identity).
//
// Storage model ("Identity profile"): each learner's full progress snapshot is
// stored inside their own Identity account, in `user_metadata`, via the
// GoTrue user's `update({ data })` call. No database or serverless functions
// are needed. See src/cloud/sync.ts for the snapshot shape and read/write flow.
//
// IMPORTANT: Netlify Identity only works on the deployed HTTPS site (and deploy
// previews). It does NOT work under `npm run dev` / localhost — there is no
// Identity endpoint there. The app therefore only requires login in production
// builds; see src/auth/Gate.tsx.
// =============================================================================

import netlifyIdentity from "netlify-identity-widget";

/** The minimal shape of a signed-in user that the rest of the app cares about. */
export interface IdentityUser {
  id: string;
  email: string;
}

export type IdentityEvent = "init" | "login" | "logout" | "error" | "open" | "close";

let initialized = false;

/** Initialise the widget once. Safe to call repeatedly. */
export function initIdentity(): void {
  if (initialized) return;
  // No APIUrl passed → the widget auto-detects `${origin}/.netlify/identity`,
  // which is exactly what we want on the deployed Netlify site.
  netlifyIdentity.init();
  initialized = true;
}

function mapUser(u: unknown): IdentityUser | null {
  if (!u) return null;
  const raw = u as { id?: string; email?: string };
  return { id: raw.id ?? "", email: raw.email ?? "" };
}

/** The currently signed-in user, or null. */
export function currentUser(): IdentityUser | null {
  return mapUser(netlifyIdentity.currentUser?.());
}

/** Open the widget's modal on the login or signup tab. */
export function openIdentity(tab: "login" | "signup" = "login"): void {
  netlifyIdentity.open(tab);
}

/** Close the widget modal. */
export function closeIdentity(): void {
  netlifyIdentity.close?.();
}

/** Sign the current user out (fires a "logout" event when done). */
export async function logoutIdentity(): Promise<void> {
  await netlifyIdentity.logout?.();
}

/** Subscribe to a widget event; the callback receives the mapped user (or null). */
export function onIdentity(event: IdentityEvent, cb: (user: IdentityUser | null) => void): () => void {
  const handler = (u?: unknown) => cb(mapUser(u));
  netlifyIdentity.on(event, handler);
  return () => netlifyIdentity.off?.(event, handler);
}

// ---- Progress snapshot in user_metadata ------------------------------------

/**
 * Read the progress snapshot stored on the signed-in user's Identity profile.
 * Returns null when the user is new (no snapshot saved yet) or signed out.
 */
export function readRemoteSnapshot(): unknown | null {
  const u = netlifyIdentity.currentUser?.() as { user_metadata?: Record<string, unknown> } | null;
  return u?.user_metadata?.impara ?? null;
}

/**
 * Save the progress snapshot onto the signed-in user's Identity profile.
 * GoTrue merges the top-level keys under `data` into `user_metadata`, so we
 * namespace everything under a single `impara` key and leave other metadata
 * (e.g. full_name) untouched. No-ops when signed out.
 */
export async function writeRemoteSnapshot(snapshot: unknown): Promise<void> {
  const u = netlifyIdentity.currentUser?.() as { update?: (o: { data: unknown }) => Promise<unknown> } | null;
  if (!u?.update) return;
  await u.update({ data: { impara: snapshot } });
}
