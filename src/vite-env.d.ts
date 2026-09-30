/// <reference types="vite/client" />

// Extra typing for the Supabase env vars this app reads via import.meta.env.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
