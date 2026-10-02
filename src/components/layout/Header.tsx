import { Link, NavLink } from 'react-router-dom'
import { Camera, Heart, Menu, Search, ShoppingBag, User } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Flag } from '@/components/ui/Flag'
import { SmartImage } from '@/components/ui/SmartImage'
import { NAV_ITEMS, type NavItem } from '@/data/navigation'
import { useCart } from '@/context/CartContext'
import { useFavorites } from '@/context/FavoritesContext'
import { useUI } from '@/context/UIContext'
import { keyImage } from '@/utils/images'

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <span aria-hidden="true" className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[0.625rem] font-medium leading-none text-ivory">
      {count > 99 ? '99+' : count}
    </span>
  )
}

const iconButton = 'relative grid h-11 w-10 place-items-center transition-colors hover:bg-sand min-[400px]:w-11'

function MegaMenu({ item }: { item: NavItem }) {
  if (!item.groups) return null
  return (
    <div className="invisible absolute inset-x-0 top-full border-b border-t border-line bg-ivory opacity-0 shadow-lg transition-[opacity,visibility] duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
      <div className="container-page flex justify-center gap-16 py-9">
        {item.groups.map((group) => (
          <div key={group.title} className="min-w-40">
            <p className="eyebrow mb-4">{group.title}</p>
            <ul className="space-y-2.5">
              {group.links.map((link) => (
                <li key={link.to + link.label}>
                  <Link to={link.to} className="inline-flex items-center gap-2 text-sm transition-colors hover:text-mocha hover:underline hover:underline-offset-4">
                    {link.country && <Flag code={link.country} size={11} />}
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {item.feature && (
          <Link to={item.feature.to} className="group/feature relative hidden w-56 shrink-0 xl:block">
            <div className="relative aspect-[4/3] overflow-hidden bg-sand">
              <SmartImage
                image={keyImage(item.feature.image, { x: 0.5, y: item.feature.focusY ?? 0.45, zoom: 1 })}
                alt=""
                ratio={4 / 3}
                widths={[320, 480]}
                sizes="224px"
                className="transition-transform duration-500 group-hover/feature:scale-105"
              />
            </div>
            <p className="mt-2 text-sm font-medium underline-offset-4 group-hover/feature:underline">{item.feature.title}</p>
          </Link>
        )}
      </div>
    </div>
  )
}

export function Header() {
  const { openSearch, setMenuOpen, setImageSearchOpen } = useUI()
  const { count: bagCount } = useCart()
  const { count: favCount } = useFavorites()

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ivory/95 backdrop-blur supports-[backdrop-filter]:bg-ivory/85">
      {/* Top row */}
      <div className="container-page grid h-14 grid-cols-[1fr_auto_1fr] items-center sm:h-16 lg:h-[4.25rem]">
        <div className="flex items-center">
          <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu" className={`${iconButton} -ml-2.5 lg:hidden`}>
            <Menu size={22} strokeWidth={1.6} />
          </button>
          {/* Desktop search trigger + visual search */}
          <div className="hidden items-center gap-1 lg:flex">
            <button
              type="button"
              onClick={openSearch}
              className="flex h-10 w-64 items-center gap-2.5 border border-line bg-white/70 px-3 text-left text-sm text-muted transition-colors hover:border-ink xl:w-72"
            >
              <Search size={16} aria-hidden="true" />
              Search ZAYNKAR
            </button>
            <div className="group/tip relative">
              <button type="button" onClick={() => setImageSearchOpen(true)} aria-label="Search by image" className={iconButton}>
                <Camera size={20} strokeWidth={1.6} />
              </button>
              <span
                role="tooltip"
                className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 -translate-x-1/2 whitespace-nowrap bg-ink px-2.5 py-1.5 text-[0.6875rem] text-ivory opacity-0 transition-opacity group-focus-within/tip:opacity-100 group-hover/tip:opacity-100"
              >
                Search by image
              </span>
            </div>
          </div>
        </div>

        <Logo />

        <div className="flex items-center justify-end">
          <button type="button" onClick={openSearch} aria-label="Search" className={`${iconButton} lg:hidden`}>
            <Search size={21} strokeWidth={1.6} />
          </button>
          <Link to="/account" aria-label="Account" className={`${iconButton} hidden lg:grid`}>
            <User size={21} strokeWidth={1.6} />
          </Link>
          <Link to="/favorites" aria-label={`Favorites${favCount ? `, ${favCount} items` : ''}`} className={iconButton}>
            <Heart size={21} strokeWidth={1.6} />
            <CountBadge count={favCount} />
          </Link>
          <Link to="/bag" aria-label={`Shopping bag${bagCount ? `, ${bagCount} items` : ', empty'}`} className={`${iconButton} -mr-2.5 lg:mr-0`}>
            <ShoppingBag size={21} strokeWidth={1.6} />
            <CountBadge count={bagCount} />
          </Link>
        </div>
      </div>

      {/* Desktop navigation */}
      <nav aria-label="Main" className="relative hidden border-t border-line/70 lg:block">
        <ul className="container-page flex h-11 items-stretch justify-center gap-9 xl:gap-11">
          {NAV_ITEMS.map((item) => (
            <li key={item.label} className="group flex items-stretch">
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center border-b-2 text-[0.75rem] font-medium uppercase tracking-[0.14em] transition-colors ${
                    isActive ? 'border-ink' : 'border-transparent hover:border-ink/40'
                  } ${item.label === 'New In' ? 'text-mocha' : ''}`
                }
              >
                {item.label}
              </NavLink>
              <MegaMenu item={item} />
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
