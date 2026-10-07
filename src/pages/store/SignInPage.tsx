import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { RequireSupabase } from '@/components/ui/RequireSupabase'
import { TextField } from '@/components/ui/TextField'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function SignInPage() {
  const { t } = useLanguage()
  useDocumentTitle(t('signIn'))
  const { user, loading: authLoading, signInCustomer } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/store'

  if (authLoading) return null
  if (user) return <Navigate to={redirectTo} replace />

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const result = await signInCustomer(email, password)
    setSubmitting(false)
    if (result.error) {
      setError(result.error)
      return
    }
    navigate(redirectTo)
  }

  return (
    <RequireSupabase>
      <div className="flex min-h-[80vh] flex-col items-center justify-center bg-gradient-to-b from-sand/70 to-ivory px-4 py-16">
        <Logo className="mb-8 !text-3xl text-mocha sm:!text-4xl" />
        <div className="w-full max-w-sm border border-line bg-white p-8 shadow-sm">
          <h1 className="display text-2xl">{t('signIn')}</h1>
          <p className="mt-1 text-sm text-muted">{t('welcomeBack')}</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <TextField label={t('email')} type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <TextField label={t('password')} type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && (
              <p role="alert" className="text-sm text-sale">
                {error}
              </p>
            )}
            <button type="submit" disabled={submitting} className="btn btn-primary w-full">
              {submitting ? t('signingIn') : t('signIn')}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-muted">
            {t('newAccountQuestion')}{' '}
            <Link to="/signup" className="font-medium text-ink underline underline-offset-2">
              {t('createAccount')}
            </Link>
          </p>
        </div>
      </div>
    </RequireSupabase>
  )
}
