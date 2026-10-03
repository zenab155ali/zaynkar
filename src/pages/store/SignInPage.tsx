import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { RequireSupabase } from '@/components/ui/RequireSupabase'
import { TextField } from '@/components/ui/TextField'
import { useAuth } from '@/context/AuthContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function SignInPage() {
  useDocumentTitle('تسجيل الدخول')
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
      <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
        <div className="w-full max-w-sm border border-line bg-white p-8">
          <h1 className="display text-2xl">تسجيل الدخول</h1>
          <p className="mt-1 text-sm text-muted">مرحبًا بعودتكِ.</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <TextField label="البريد الإلكتروني" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <TextField label="كلمة المرور" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && (
              <p role="alert" className="text-sm text-sale">
                {error}
              </p>
            )}
            <button type="submit" disabled={submitting} className="btn btn-primary w-full">
              {submitting ? 'جارٍ تسجيل الدخول…' : 'تسجيل الدخول'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-muted">
            حساب جديد؟{' '}
            <Link to="/signup" className="font-medium text-ink underline underline-offset-2">
              إنشاء حساب
            </Link>
          </p>
        </div>
      </div>
    </RequireSupabase>
  )
}
