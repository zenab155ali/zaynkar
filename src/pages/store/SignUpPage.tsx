import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { RequireSupabase } from '@/components/ui/RequireSupabase'
import { TextField } from '@/components/ui/TextField'
import { useAuth } from '@/context/AuthContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function SignUpPage() {
  useDocumentTitle('إنشاء حساب')
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
      <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
        <div className="w-full max-w-sm border border-line bg-white p-8">
          <h1 className="display text-2xl">إنشاء حساب</h1>
          <p className="mt-1 text-sm text-muted">سجّلي لاختيار ما يعجبكِ وإرسال قائمتكِ إلينا.</p>

          {confirmNeeded ? (
            <p className="mt-6 text-sm leading-relaxed">
              تحققي من بريدكِ الإلكتروني لتأكيد حسابكِ، ثم عودي و{' '}
              <Link to="/signin" className="underline underline-offset-2">
                سجّلي الدخول
              </Link>
              .
            </p>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <TextField label="الاسم الكامل" required autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <TextField label="رقم الهاتف" type="tel" required autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <TextField label="البريد الإلكتروني" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <TextField label="كلمة المرور" type="password" required autoComplete="new-password" minLength={6} hint="٦ أحرف على الأقل." value={password} onChange={(e) => setPassword(e.target.value)} />
              {error && (
                <p role="alert" className="text-sm text-sale">
                  {error}
                </p>
              )}
              <button type="submit" disabled={submitting} className="btn btn-primary w-full">
                {submitting ? 'جارٍ إنشاء الحساب…' : 'إنشاء حساب'}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted">
            لديكِ حساب بالفعل؟{' '}
            <Link to="/signin" className="font-medium text-ink underline underline-offset-2">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </RequireSupabase>
  )
}
