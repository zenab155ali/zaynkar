import { Link, useLocation } from 'react-router-dom'
import { Heart, Languages, Menu, ShoppingBag, User } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
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
  const { lang, setLang, t } = useLanguage()
  const location = useLocation()
  const onStoreListing = location.pathname === '/store'
  const onHomePage = location.pathname === '/'

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ivory/95 backdrop-blur supports-[backdrop-filter]:bg-ivory/85">
      {/* Top row */}
      <div className="container-page grid h-14 grid-cols-[1fr_auto_1fr] items-center sm:h-16 lg:h-[4.25rem]">
        <div className="flex items-center">
          <button type="button" onClick={() => setMenuOpen(true)} aria-label={t('openMenu')} className={`${iconButton} -ms-2.5 lg:hidden`}>
            <Menu size={22} strokeWidth={1.6} />
          </button>
          {!onHomePage && (
            <nav aria-label={t('home')} className="flex items-center">
              <Link
                to={onStoreListing ? '/' : '/store'}
                className={`flex h-8 items-center whitespace-nowrap px-3 text-[0.68rem] font-medium uppercase tracking-[0.1em] transition-colors sm:h-9 sm:px-4 sm:text-[0.75rem] sm:tracking-[0.14em] ${
                  onStoreListing ? 'bg-ink text-ivory' : 'bg-mocha text-ivory hover:bg-ink'
                }`}
              >
                {onStoreListing ? (
                  <>
                    <span className="sm:hidden">{t('backToHomeShort')}</span>
                    <span className="hidden sm:inline">{t('backToHome')}</span>
                  </>
                ) : (
                  <>
                    <span className="sm:hidden">{t('backToShopShort')}</span>
                    <span className="hidden sm:inline">{t('backToShop')}</span>
                  </>
                )}
              </Link>
            </nav>
          )}
        </div>

        <Logo />

        <div className="flex items-center justify-end">
          <button type="button" onClick={() => setLang(lang === 'ar' ? 'he' : 'ar')} aria-label={t('languageSwitch')} title={t('languageSwitch')} className={iconButton}>
            <Languages size={20} strokeWidth={1.6} aria-hidden="true" />
          </button>
          <Link to={user ? '/my-requests' : '/signin'} aria-label={user ? t('myCart') : t('signIn')} className={iconButton}>
            <User size={21} strokeWidth={1.6} />
          </Link>
          <Link to="/liked" aria-label={`${t('liked')}${likedIds.size ? `، ${likedIds.size}` : ''}`} className={iconButton}>
            <Heart size={21} strokeWidth={1.6} />
            <CountBadge count={likedIds.size} />
          </Link>
          <Link to="/selections" aria-label={`${t('myCart')}${selectionsCount ? `، ${selectionsCount}` : ''}`} className={`${iconButton} -me-2.5 lg:me-0`}>
            <ShoppingBag size={21} strokeWidth={1.6} />
            <CountBadge count={selectionsCount} />
          </Link>
        </div>
      </div>
    </header>
  )
}
