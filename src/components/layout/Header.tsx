import { Link, NavLink } from 'react-router-dom'
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

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ivory/95 backdrop-blur supports-[backdrop-filter]:bg-ivory/85">
      {/* Top row */}
      <div className="container-page grid h-14 grid-cols-[1fr_auto_1fr] items-center sm:h-16 lg:h-[4.25rem]">
        <div className="flex items-center">
          <button type="button" onClick={() => setMenuOpen(true)} aria-label="فتح القائمة" className={`${iconButton} -ms-2.5 lg:hidden`}>
            <Menu size={22} strokeWidth={1.6} />
          </button>
          <nav aria-label="الرئيسية" className="hidden lg:block">
            <NavLink
              to="/store"
              className={({ isActive }) =>
                `flex h-10 items-center border-b-2 px-1 text-[0.75rem] font-medium uppercase tracking-[0.14em] transition-colors ${isActive ? 'border-ink' : 'border-transparent hover:border-ink/40'}`
              }
            >
              تسوقي الفساتين
            </NavLink>
          </nav>
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
          <Link to="/selections" aria-label={`مختاراتي${selectionsCount ? `، ${selectionsCount} عناصر` : ''}`} className={`${iconButton} -me-2.5 lg:me-0`}>
            <ShoppingBag size={21} strokeWidth={1.6} />
            <CountBadge count={selectionsCount} />
          </Link>
        </div>
      </div>
    </header>
  )
}
