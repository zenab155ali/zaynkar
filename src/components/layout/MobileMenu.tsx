import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Heart, Inbox, LogOut, ShoppingBag, X } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { Logo } from '@/components/ui/Logo'
import { useAuth } from '@/context/AuthContext'
import { useUI } from '@/context/UIContext'

export function MobileMenu() {
  const { menuOpen, setMenuOpen } = useUI()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const close = () => setMenuOpen(false)
  const handleSignOut = async () => {
    close()
    await signOut()
    navigate('/')
  }

  return (
    <Dialog open={menuOpen} onClose={close} label="القائمة" variant="right">
      <div className="flex min-h-full flex-col">
        <div className="flex h-14 items-center justify-between border-b border-line px-4">
          <Logo onNavigate={close} className="!text-[1.35rem]" />
          <button type="button" onClick={close} aria-label="إغلاق القائمة" className="-me-2 grid h-11 w-11 place-items-center hover:bg-sand">
            <X size={22} />
          </button>
        </div>

        <nav aria-label="الرئيسية" className="flex-1 px-4 py-4">
          <Link to="/store" onClick={close} className="flex min-h-[3rem] items-center justify-center gap-2 bg-ink text-sm font-medium uppercase tracking-[0.14em] text-ivory">
            <ShoppingBag size={16} aria-hidden="true" /> تسوقي الفساتين
          </Link>
        </nav>

        <div className="space-y-1 border-t border-line bg-sand/60 px-4 py-4 text-sm">
          <Link to={user ? '/my-requests' : '/signin'} onClick={close} className="flex items-center gap-3 py-2">
            <Inbox size={18} strokeWidth={1.6} aria-hidden="true" /> {user ? 'سلة مشترياتي' : 'تسجيل الدخول / حساب جديد'}
          </Link>
          <Link to="/liked" onClick={close} className="flex items-center gap-3 py-2">
            <Heart size={18} strokeWidth={1.6} aria-hidden="true" /> المفضلة
          </Link>
          <Link to="/selections" onClick={close} className="flex items-center gap-3 py-2">
            <ShoppingBag size={18} strokeWidth={1.6} aria-hidden="true" /> سلة التسوق
          </Link>
          {user && (
            <button type="button" onClick={handleSignOut} className="flex w-full items-center gap-3 py-2 text-start text-sale">
              <LogOut size={18} strokeWidth={1.6} aria-hidden="true" /> تسجيل الخروج
            </button>
          )}
        </div>
      </div>
    </Dialog>
  )
}
