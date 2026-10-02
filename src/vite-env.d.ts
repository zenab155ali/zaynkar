/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  /** The real email behind the admin login's username — set once in .env.local, never committed. */
  readonly VITE_ADMIN_EMAIL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
