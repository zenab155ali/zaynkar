import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** True once real Supabase credentials are present (see .env.example). */
export const isSupabaseConfigured = Boolean(url && anonKey)

/**
 * The ADMIN logs in with a plain username ("zenabkareem"), but Supabase Auth needs an
 * email. We map that one fixed username to a real (but non-mailable) email address
 * internally — the actual password check still happens securely inside Supabase, never
 * in this client code. See supabase/README.md for how the admin account is created.
 */
export const ADMIN_USERNAME = 'zenabkareem'
export const ADMIN_INTERNAL_EMAIL = 'zenabkareem@zaynkar-admin.internal'

/**
 * `null` until real credentials are provided. Every place that uses this checks for
 * `null` first and shows a friendly "not connected yet" state instead of crashing —
 * see `RequireSupabase` in context/AuthContext.tsx.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured ? createClient(url as string, anonKey as string) : null

export const PRODUCT_MEDIA_BUCKET = 'product-media'
