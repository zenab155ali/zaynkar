import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LogOut, Package, Inbox, Tag } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { RequireSupabase } from '@/components/ui/RequireSupabase'
import { useAuth } from '@/context/AuthContext'

const TABS = [
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Tag },
  { to: '/admin/requests', label: 'Customer Requests', icon: Inbox },
]

function AdminShell() {
  const { loading, user, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()

  if (loading) return <div className="container-page py-20 text-center text-sm text-muted">Loading…</div>
  if (!user || !isAdmin) return <Navigate to="/admin/login" replace />

  return (
    <div className="min-h-dvh bg-sand/40">
      <header className="border-b border-line bg-ivory">
        <div className="container-page flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo className="!text-lg" />
            <span className="hidden text-xs uppercase tracking-[0.14em] text-muted sm:inline">Store Management</span>
          </div>
          <button
            type="button"
            onClick={async () => {
              await signOut()
              navigate('/admin/login')
            }}
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.1em] text-muted hover:text-ink"
          >
            <LogOut size={15} aria-hidden="true" /> Sign out
          </button>
        </div>
        <nav aria-label="Admin" className="container-page flex gap-1 border-t border-line/70">
          {TABS.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                `flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  isActive ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'
                }`
              }
            >
              <t.icon size={15} aria-hidden="true" /> {t.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="container-page py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default function AdminLayout() {
  return (
    <RequireSupabase>
      <AdminShell />
    </RequireSupabase>
  )
}
