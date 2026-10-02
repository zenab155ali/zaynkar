import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { ADMIN_INTERNAL_EMAIL, ADMIN_USERNAME, supabase } from '@/lib/supabase'
import type { CustomerProfile } from '@/types/catalog'

interface SignUpInput {
  email: string
  password: string
  fullName: string
  phone: string
}

interface AuthResult {
  error?: string
  /** True when Supabase requires email confirmation before the account can sign in. */
  needsEmailConfirmation?: boolean
}

interface AuthContextValue {
  /** Still checking for an existing session on first load. */
  loading: boolean
  user: User | null
  profile: CustomerProfile | null
  isAdmin: boolean
  signUpCustomer: (input: SignUpInput) => Promise<AuthResult>
  signInCustomer: (email: string, password: string) => Promise<AuthResult>
  signInAdmin: (username: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

/** Signup details cached only long enough to create the profile row after the customer's first real sign-in (see note below). */
const PENDING_PROFILE_KEY = 'zaynkar:pending-profile'

const friendlyAuthError = (message: string): string => {
  if (/invalid login credentials/i.test(message)) return 'Incorrect email/username or password.'
  if (/already registered|already exists/i.test(message)) return 'An account with this email already exists — try signing in instead.'
  if (/password/i.test(message) && /least/i.test(message)) return message
  return message
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  const loadProfileAndRole = useCallback(async (current: User | null) => {
    if (!supabase || !current) {
      setProfile(null)
      setIsAdmin(false)
      return
    }

    const [{ data: profileRow }, { data: adminRows }] = await Promise.all([
      supabase.from('customer_profiles').select('user_id, full_name, phone').eq('user_id', current.id).maybeSingle(),
      supabase.from('admin_users').select('user_id').eq('user_id', current.id),
    ])

    setIsAdmin(Boolean(adminRows && adminRows.length > 0))

    if (profileRow) {
      setProfile({ userId: profileRow.user_id, fullName: profileRow.full_name, phone: profileRow.phone })
      return
    }

    // Safety net: if signup couldn't create the profile row yet (e.g. email confirmation
    // was required first), finish the job now that we have a real authenticated session.
    const pendingRaw = sessionStorage.getItem(PENDING_PROFILE_KEY)
    if (pendingRaw) {
      try {
        const pending = JSON.parse(pendingRaw) as { fullName: string; phone: string }
        const { data: inserted } = await supabase
          .from('customer_profiles')
          .insert({ user_id: current.id, full_name: pending.fullName, phone: pending.phone })
          .select('user_id, full_name, phone')
          .single()
        sessionStorage.removeItem(PENDING_PROFILE_KEY)
        if (inserted) setProfile({ userId: inserted.user_id, fullName: inserted.full_name, phone: inserted.phone })
      } catch {
        sessionStorage.removeItem(PENDING_PROFILE_KEY)
      }
    } else {
      setProfile(null)
    }
  }, [])

  const applySession = useCallback(
    async (session: Session | null) => {
      setUser(session?.user ?? null)
      await loadProfileAndRole(session?.user ?? null)
    },
    [loadProfileAndRole],
  )

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      applySession(data.session).finally(() => setLoading(false))
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session)
    })
    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [applySession])

  const signUpCustomer = useCallback(async ({ email, password, fullName, phone }: SignUpInput): Promise<AuthResult> => {
    if (!supabase) return { error: 'Not connected to a database yet.' }
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: friendlyAuthError(error.message) }
    if (!data.user) return { error: 'Something went wrong creating your account. Please try again.' }

    if (data.session) {
      // Confirmation disabled (recommended setup) — we're signed in immediately, create the profile now.
      const { error: profileError } = await supabase
        .from('customer_profiles')
        .insert({ user_id: data.user.id, full_name: fullName, phone })
      if (profileError) return { error: friendlyAuthError(profileError.message) }
      await loadProfileAndRole(data.user)
      return {}
    }

    // Email confirmation required: remember the details and finish setup on first sign-in.
    sessionStorage.setItem(PENDING_PROFILE_KEY, JSON.stringify({ fullName, phone }))
    return { needsEmailConfirmation: true }
  }, [loadProfileAndRole])

  const signInCustomer = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!supabase) return { error: 'Not connected to a database yet.' }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: friendlyAuthError(error.message) }
    return {}
  }, [])

  const signInAdmin = useCallback(async (username: string, password: string): Promise<AuthResult> => {
    if (!supabase) return { error: 'Not connected to a database yet.' }
    if (username.trim().toLowerCase() !== ADMIN_USERNAME) return { error: 'Incorrect username or password.' }
    const { error } = await supabase.auth.signInWithPassword({ email: ADMIN_INTERNAL_EMAIL, password })
    if (error) return { error: 'Incorrect username or password.' }
    return {}
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }, [])

  const refreshProfile = useCallback(() => loadProfileAndRole(user), [loadProfileAndRole, user])

  const value = useMemo<AuthContextValue>(
    () => ({ loading, user, profile, isAdmin, signUpCustomer, signInCustomer, signInAdmin, signOut, refreshProfile }),
    [loading, user, profile, isAdmin, signUpCustomer, signInCustomer, signInAdmin, signOut, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
