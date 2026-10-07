import { Link, useLocation } from 'react-router-dom'
import { Heart, Menu, ShoppingBag, User } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { useAuth } from '@/context/AuthContext'
import { useLikes } from '@/context/LikesContext'
import { useSelections } from '@/context/SelectionsContext'
import { useUI } from '@/context/UIContext'

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <span aria-hidden="true" className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[0.625rem] font-medium leading-none text-ivory">
      {count > 99 ? '99+' : count}
    </span>
  )
}

const iconButton = 'relative grid h-11 w-10 place-items-center transition-colors hover:bg-sand min-[400px]:w-11'

export function Header() {
  const { setMenuOpen } = useUI()
  const { count: selectionsCount } = useSelections()
  const { likedIds } = useLikes()
  const { user } = useAuth()
  const location = useLocation()
  const onStoreListing = location.pathname === '/store'
  const onHomePage = location.pathname === '/'

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ivory/95 backdrop-blur supports-[backdrop-filter]:bg-ivory/85">
      {/* Top row */}
      <div className="container-page grid h-14 grid-cols-[1fr_auto_1fr] items-center sm:h-16 lg:h-[4.25rem]">
        <div className="flex items-center">
          <button type="button" onClick={() => setMenuOpen(true)} aria-label="فتح القائمة" className={`${iconButton} -ms-2.5 lg:hidden`}>
            <Menu size={22} strokeWidth={1.6} />
          </button>
          {!onHomePage && (
            <nav aria-label="الرئيسية" className="flex items-center">
              <Link
                to={onStoreListing ? '/' : '/store'}
                className={`flex h-8 items-center whitespace-nowrap px-3 text-[0.68rem] font-medium uppercase tracking-[0.1em] transition-colors sm:h-9 sm:px-4 sm:text-[0.75rem] sm:tracking-[0.14em] ${
                  onStoreListing ? 'bg-ink text-ivory' : 'bg-mocha text-ivory hover:bg-ink'
                }`}
              >
                {onStoreListing ? (
                  <>
                    <span className="sm:hidden">الرئيسية</span>
                    <span className="hidden sm:inline">الرجوع للصفحة الرئيسية</span>
                  </>
                ) : (
                  <>
                    <span className="sm:hidden">رجوع للتسوق</span>
                    <span className="hidden sm:inline">الرجوع لصفحة التسوق</span>
                  </>
                )}
              </Link>
            </nav>
          )}
        </div>

        <Logo />

        <div className="flex items-center justify-end">
          <Link to={user ? '/my-requests' : '/signin'} aria-label={user ? 'سلة مشترياتي' : 'تسجيل الدخول'} className={iconButton}>
            <User size={21} strokeWidth={1.6} />
          </Link>
          <Link to="/liked" aria-label={`المفضلة${likedIds.size ? `، ${likedIds.size} عناصر` : ''}`} className={iconButton}>
            <Heart size={21} strokeWidth={1.6} />
            <CountBadge count={likedIds.size} />
          </Link>
          <Link to="/selections" aria-label={`سلة التسوق${selectionsCount ? `، ${selectionsCount} عناصر` : ''}`} className={`${iconButton} -me-2.5 lg:me-0`}>
            <ShoppingBag size={21} strokeWidth={1.6} />
            <CountBadge count={selectionsCount} />
          </Link>
        </div>
      </div>
    </header>
  )
}
