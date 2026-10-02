import { useMemo } from 'react'
import { Link, Navigate, NavLink, useParams } from 'react-router-dom'
import { Clock, Heart, MapPin, Package, User } from 'lucide-react'
import { AddressesTab } from '@/components/account/AddressesTab'
import { OrdersTab } from '@/components/account/OrdersTab'
import { ProfileTab } from '@/components/account/ProfileTab'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProductGrid } from '@/components/product/ProductGrid'
import { STORAGE_KEYS } from '@/config'
import { useFavorites } from '@/context/FavoritesContext'
import { getProductsByIds } from '@/data/products'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import { MOCK_PROFILE } from '@/utils/orders'
import type { UserProfile } from '@/types'

const TABS = [
  { id: 'orders', label: 'My Orders', icon: Package },
  { id: 'favorites', label: 'Favorites', icon: Heart },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'recently-viewed', label: 'Recently Viewed', icon: Clock },
] as const

type TabId = (typeof TABS)[number]['id']
const isTab = (v: string): v is TabId => TABS.some((t) => t.id === v)

function FavoritesTab() {
  const { ids } = useFavorites()
  const products = useMemo(() => getProductsByIds(ids), [ids])
  if (!products.length)
    return (
      <EmptyState icon={<Heart size={26} strokeWidth={1.3} />} title="No favorites yet" description="Tap the heart on any product to save it.">
        <Link to="/shop/new-in" className="btn btn-primary">
          Discover new in
        </Link>
      </EmptyState>
    )
  return (
    <>
      <ProductGrid products={products} className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5" />
      <Link to="/favorites" className="mt-8 inline-block text-xs font-medium uppercase tracking-[0.14em]">
        <span className="link-underline">Open full favorites page →</span>
      </Link>
    </>
  )
}

function RecentlyViewedTab() {
  const { ids, clear } = useRecentlyViewed()
  const products = useMemo(() => getProductsByIds(ids), [ids])
  if (!products.length)
    return (
      <EmptyState icon={<Clock size={26} strokeWidth={1.3} />} title="Nothing viewed yet" description="Products you look at will show up here so you can find them again.">
        <Link to="/shop/women" className="btn btn-primary">
          Start browsing
        </Link>
      </EmptyState>
    )
  return (
    <>
      <div className="mb-6 flex justify-end">
        <button type="button" onClick={clear} className="text-xs text-muted underline underline-offset-4 hover:text-ink">
          Clear history
        </button>
      </div>
      <ProductGrid products={products} className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5" />
    </>
  )
}

export default function AccountPage() {
  const { tab } = useParams()
  const [profile] = useLocalStorage<UserProfile>(STORAGE_KEYS.profile, MOCK_PROFILE)
  const active: TabId = tab && isTab(tab) ? tab : 'orders'
  const label = TABS.find((t) => t.id === active)?.label ?? 'My Account'
  useDocumentTitle(label)

  if (tab && !isTab(tab)) return <Navigate to="/account" replace />

  return (
    <div className="container-page pt-4 sm:pt-6">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Account', to: '/account' }, { label }]} />

      <div className="mt-6 flex flex-col gap-1 sm:mt-8">
        <p className="eyebrow">Demo account</p>
        <h1 className="display text-4xl sm:text-5xl">Hello, {profile.firstName}</h1>
        <p className="text-sm text-muted">No sign-in is needed in this prototype — everything is stored on this device.</p>
      </div>

      <div className="mt-8 grid gap-8 pb-4 lg:grid-cols-[15rem_1fr] lg:gap-14">
        <nav aria-label="Account" className="scrollbar-none -mx-4 overflow-x-auto border-b border-line px-4 lg:mx-0 lg:border-0 lg:px-0">
          <ul className="flex gap-1 lg:flex-col">
            {TABS.map(({ id, label: tabLabel, icon: Icon }) => (
              <li key={id} className="shrink-0">
                <NavLink
                  to={`/account/${id}`}
                  className={() =>
                    `flex items-center gap-3 whitespace-nowrap border-b-2 px-3 py-3 text-sm transition-colors lg:border-b-0 lg:border-l-2 ${
                      active === id ? 'border-ink font-medium' : 'border-transparent text-muted hover:text-ink'
                    }`
                  }
                  aria-current={active === id ? 'page' : undefined}
                >
                  <Icon size={17} strokeWidth={1.5} aria-hidden="true" />
                  {tabLabel}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <section aria-labelledby="account-tab-heading" className="min-w-0">
          <h2 id="account-tab-heading" className="display mb-6 text-3xl">
            {label}
          </h2>
          {active === 'orders' && <OrdersTab />}
          {active === 'favorites' && <FavoritesTab />}
          {active === 'addresses' && <AddressesTab />}
          {active === 'profile' && <ProfileTab />}
          {active === 'recently-viewed' && <RecentlyViewedTab />}
        </section>
      </div>
    </div>
  )
}
