import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { RequireSupabase } from '@/components/ui/RequireSupabase'
import { TextField } from '@/components/ui/TextField'
import { useAuth } from '@/context/AuthContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function SignUpPage() {
  useDocumentTitle('Create your account')
  const { user, signUpCustomer } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [confirmNeeded, setConfirmNeeded] = useState(false)
  const [submitting, setSubmitting] = useState(false)

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
      <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
        <div className="w-full max-w-sm border border-line bg-white p-8">
          <h1 className="display text-2xl">Create your account</h1>
          <p className="mt-1 text-sm text-muted">Sign up to pick items and send us your list.</p>

          {confirmNeeded ? (
            <p className="mt-6 text-sm leading-relaxed">
              Check your email to confirm your account, then come back and{' '}
              <Link to="/signin" className="underline underline-offset-2">
                sign in
              </Link>
              .
            </p>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <TextField label="Full name" required autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <TextField label="Phone number" type="tel" required autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <TextField label="Email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <TextField label="Password" type="password" required autoComplete="new-password" minLength={6} hint="At least 6 characters." value={password} onChange={(e) => setPassword(e.target.value)} />
              {error && (
                <p role="alert" className="text-sm text-sale">
                  {error}
                </p>
              )}
              <button type="submit" disabled={submitting} className="btn btn-primary w-full">
                {submitting ? 'Creating account…' : 'Sign up'}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{' '}
            <Link to="/signin" className="font-medium text-ink underline underline-offset-2">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </RequireSupabase>
  )
}
