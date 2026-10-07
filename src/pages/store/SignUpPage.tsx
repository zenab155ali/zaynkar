import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { RequireSupabase } from '@/components/ui/RequireSupabase'
import { TextField } from '@/components/ui/TextField'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function SignUpPage() {
  const { t } = useLanguage()
  useDocumentTitle(t('createAccount'))
  const { user, loading: authLoading, signUpCustomer } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [confirmNeeded, setConfirmNeeded] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (authLoading) return null
  if (user) return <Navigate to="/store" replace />

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const result = await signUpCustomer({ email, password, fullName, phone })
    setSubmitting(false)
    if (result.error) {
      setError(result.error)
      return
    }
    if (result.needsEmailConfirmation) {
      setConfirmNeeded(true)
      return
    }
    navigate('/store')
  }

  return (
    <RequireSupabase>
      <div className="flex min-h-[80vh] flex-col items-center justify-center bg-gradient-to-b from-sand/70 to-ivory px-4 py-16">
        <Logo className="mb-8 !text-3xl text-mocha sm:!text-4xl" />
        <div className="w-full max-w-sm border border-line bg-white p-8 shadow-sm">
          <h1 className="display text-2xl">{t('createAccount')}</h1>
          <p className="mt-1 text-sm text-muted">{t('signUpHint')}</p>

          {confirmNeeded ? (
            <p className="mt-6 text-sm leading-relaxed">
              {t('confirmEmailHint1')}{' '}
              <Link to="/signin" className="underline underline-offset-2">
                {t('signInHere')}
              </Link>
              .
            </p>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <TextField label={t('fullName')} required autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <TextField label={t('phoneNumber')} type="tel" required autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <TextField label={t('email')} type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <TextField label={t('password')} type="password" required autoComplete="new-password" minLength={6} hint={t('passwordHint')} value={password} onChange={(e) => setPassword(e.target.value)} />
              {error && (
                <p role="alert" className="text-sm text-sale">
                  {error}
                </p>
              )}
              <button type="submit" disabled={submitting} className="btn btn-primary w-full">
                {submitting ? t('creatingAccount') : t('createAccount')}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted">
            {t('alreadyHaveAccount')}{' '}
            <Link to="/signin" className="font-medium text-ink underline underline-offset-2">
              {t('signIn')}
            </Link>
          </p>
        </div>
      </div>
    </RequireSupabase>
  )
}
