import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { RequireSupabase } from '@/components/ui/RequireSupabase'
import { TextField } from '@/components/ui/TextField'
import { useAuth } from '@/context/AuthContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function AdminLoginPage() {
  useDocumentTitle('Admin Login')
  const { loading, isAdmin, signInAdmin } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && isAdmin) return <Navigate to="/admin/products" replace />

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const result = await signInAdmin(username, password)
    setSubmitting(false)
    if (result.error) {
      setError(result.error)
      return
    }
    navigate('/admin/products')
  }

  return (
    <RequireSupabase>
      <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
        <form onSubmit={onSubmit} className="w-full max-w-sm border border-line bg-white p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <span className="mb-3 grid h-11 w-11 place-items-center rounded-full bg-sand">
              <Lock size={18} aria-hidden="true" />
            </span>
            <h1 className="display text-2xl">Admin sign in</h1>
            <p className="mt-1 text-xs text-muted">ZAYNKAR store management</p>
          </div>
          <div className="space-y-4">
            <TextField label="Username" required autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <TextField label="Password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && (
            <p role="alert" className="mt-4 text-sm text-sale">
              {error}
            </p>
          )}
          <button type="submit" disabled={submitting} className="btn btn-primary mt-6 w-full">
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </RequireSupabase>
  )
}
