// =============================================================================
// src/cloud/supabase.ts
// The Supabase client, created only if the two env vars are present. When they're
// missing (e.g. local dev without keys), `supabase` is null and the app runs in
// local-only mode — no login, data stays in this browser. Set the vars in Netlify
// (and .env.local) to turn cloud accounts on. See README.
// =============================================================================

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  url && anon
    ? createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true } })
    : null;

/** True when Supabase is configured — i.e. cloud accounts are available. */
export const cloudEnabled: boolean = supabase !== null;
