import { Link } from 'react-router-dom'
import { Camera, ChevronDown, Heart, Inbox, ShoppingBag, User, X } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { Flag } from '@/components/ui/Flag'
import { Logo } from '@/components/ui/Logo'
import { COUNTRY_LIST } from '@/data/countries'
import { NAV_ITEMS } from '@/data/navigation'
import { useAuth } from '@/context/AuthContext'
import { useUI } from '@/context/UIContext'

export function MobileMenu() {
  const { menuOpen, setMenuOpen, setImageSearchOpen } = useUI()
  const { user } = useAuth()
  const close = () => setMenuOpen(false)

  return (
    <Dialog open={menuOpen} onClose={close} label="Menu" variant="left">
      <div className="flex min-h-full flex-col">
        <div className="flex h-14 items-center justify-between border-b border-line px-4">
          <Logo onNavigate={close} className="!text-[1.35rem]" />
          <button type="button" onClick={close} aria-label="Close menu" className="-mr-2 grid h-11 w-11 place-items-center hover:bg-sand">
            <X size={22} />
          </button>
        </div>

        <nav aria-label="Mobile" className="flex-1 px-4 py-2">
          <Link to="/store" onClick={close} className="my-2 flex min-h-[3rem] items-center justify-center gap-2 bg-ink text-sm font-medium uppercase tracking-[0.14em] text-ivory">
            <ShoppingBag size={16} aria-hidden="true" /> Shop Dresses
          </Link>
          <ul className="divide-y divide-line">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                {item.groups ? (
                  <details className="group">
                    <summary className="flex min-h-[3.25rem] items-center justify-between text-[0.8125rem] font-medium uppercase tracking-[0.14em]">
                      {item.label}
                      <ChevronDown size={16} className="text-muted transition-transform group-open:rotate-180" aria-hidden="true" />
                    </summary>
                    <ul className="pb-4 pl-1">
                      <li>
                        <Link to={item.to} onClick={close} className="block py-2 text-sm font-medium underline underline-offset-4">
                          Shop all {item.label}
                        </Link>
                      </li>
                      {item.groups.flatMap((g) => g.links).filter((l) => l.to !== item.to && !l.label.startsWith('All ')).map((link) => (
                        <li key={link.to + link.label}>
                          <Link to={link.to} onClick={close} className="flex items-center gap-2 py-2 text-sm text-muted hover:text-ink">
                            {link.country && <Flag code={link.country} size={11} />}
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  <Link to={item.to} onClick={close} className="flex min-h-[3.25rem] items-center text-[0.8125rem] font-medium uppercase tracking-[0.14em] text-mocha">
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t border-line pt-5">
            <p className="eyebrow mb-3">Shop by country</p>
            <ul className="grid grid-cols-2 gap-2">
              {COUNTRY_LIST.map((c) => (
                <li key={c.code}>
                  <Link to={`/country/${c.code}`} onClick={close} className="flex items-center gap-2 border border-line bg-white px-3 py-2.5 text-sm">
                    <Flag code={c.code} size={12} />
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="space-y-1 border-t border-line bg-sand/60 px-4 py-4 text-sm">
          <Link to={user ? '/my-requests' : '/signin'} onClick={close} className="flex items-center gap-3 py-2">
            <Inbox size={18} strokeWidth={1.6} aria-hidden="true" /> {user ? 'My Requests' : 'Sign In / Sign Up'}
          </Link>
          <Link to="/account" onClick={close} className="flex items-center gap-3 py-2">
            <User size={18} strokeWidth={1.6} aria-hidden="true" /> My Account (demo)
          </Link>
          <Link to="/favorites" onClick={close} className="flex items-center gap-3 py-2">
            <Heart size={18} strokeWidth={1.6} aria-hidden="true" /> Favorites
          </Link>
          <button
            type="button"
            onClick={() => {
              close()
              setImageSearchOpen(true)
            }}
            className="flex w-full items-center gap-3 py-2 text-left"
          >
            <Camera size={18} strokeWidth={1.6} aria-hidden="true" /> Search by image
          </button>
        </div>
      </div>
    </Dialog>
  )
}
