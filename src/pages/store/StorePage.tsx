import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Search, Shirt, SlidersHorizontal, X } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { RequireSupabase } from '@/components/ui/RequireSupabase'
import { LikeButton } from '@/components/store/LikeButton'
import { ProductCardMedia } from '@/components/store/ProductCardMedia'
import { useCurrency } from '@/context/CurrencyContext'
import { useLanguage } from '@/context/LanguageContext'
import { useProducts } from '@/context/ProductsContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { CatalogProduct } from '@/types/catalog'

type SortKey = 'recent' | 'picked' | 'price-asc' | 'price-desc'

interface Filters {
  sizes: string[]
  colors: string[]
  priceMin: number | null
  priceMax: number | null
}
const EMPTY_FILTERS: Filters = { sizes: [], colors: [], priceMin: null, priceMax: null }

// Lets "الرجوع لصفحة التسوق" put the customer back exactly where they left off,
// instead of dropping them at the top of a long product list every time.
const SCROLL_KEY = 'zaynkar:store-scroll'

function sortProducts(list: CatalogProduct[], sort: SortKey): CatalogProduct[] {
  const copy = [...list]
  switch (sort) {
    case 'picked':
      return copy.sort((a, b) => b.pickCount - a.pickCount)
    case 'price-asc':
      return copy.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return copy.sort((a, b) => b.price - a.price)
    default:
      return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
}

function FilterControls({ sizes, colors, filters, onChange }: { sizes: string[]; colors: string[]; filters: Filters; onChange: (f: Filters) => void }) {
  const { t } = useLanguage()
  const toggle = (key: 'sizes' | 'colors', value: string) => {
    const list = filters[key]
    onChange({ ...filters, [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] })
  }

  return (
    <div className="space-y-6">
      {sizes.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">{t('size')}</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={filters.sizes.includes(s)}
                onClick={() => toggle('sizes', s)}
                className={`h-10 min-w-11 border px-3 text-sm transition-colors ${filters.sizes.includes(s) ? 'border-ink bg-ink text-ivory' : 'border-line bg-white hover:border-ink'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
      {colors.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">{t('color')}</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={filters.colors.includes(c)}
                onClick={() => toggle('colors', c)}
                className={`border px-3 py-2 text-sm transition-colors ${filters.colors.includes(c) ? 'border-ink bg-ink text-ivory' : 'border-line bg-white hover:border-ink'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">{t('price')}</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            inputMode="numeric"
            placeholder={t('priceMin')}
            value={filters.priceMin ?? ''}
            onChange={(e) => onChange({ ...filters, priceMin: e.target.value ? Number(e.target.value) : null })}
            className="field !h-10"
          />
          <span className="text-muted">–</span>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            placeholder={t('priceMax')}
            value={filters.priceMax ?? ''}
            onChange={(e) => onChange({ ...filters, priceMax: e.target.value ? Number(e.target.value) : null })}
            className="field !h-10"
          />
        </div>
      </div>
    </div>
  )
}

function StoreGrid() {
  const { format } = useCurrency()
  const { t, pick } = useLanguage()
  const { loading, error, products, categories } = useProducts()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryId = searchParams.get('category')
  const selectedCategory = categoryId ? categories.find((c) => c.id === categoryId) : null
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState<string | null>(null)
  const [sort, setSort] = useState<SortKey>('price-asc')
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const restoredScrollRef = useRef(false)

  const SORT_OPTIONS: { value: SortKey; label: string }[] = [
    { value: 'recent', label: t('sortRecent') },
    { value: 'picked', label: t('sortPicked') },
    { value: 'price-asc', label: t('sortPriceAsc') },
    { value: 'price-desc', label: t('sortPriceDesc') },
  ]

  useEffect(() => {
    const onScroll = () => {
      try {
        sessionStorage.setItem(SCROLL_KEY, String(window.scrollY))
      } catch {
        // ignore (private browsing / blocked storage)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (loading || restoredScrollRef.current) return
    restoredScrollRef.current = true
    try {
      const saved = sessionStorage.getItem(SCROLL_KEY)
      if (saved) requestAnimationFrame(() => window.scrollTo(0, Number(saved)))
    } catch {
      // ignore
    }
  }, [loading])

  const active = useMemo(
    () => products.filter((p) => p.isActive && (!categoryId || p.categoryId === categoryId)),
    [products, categoryId],
  )
  const allSizes = useMemo(() => [...new Set(active.flatMap((p) => p.sizes))], [active])
  const allColors = useMemo(() => [...new Set(active.flatMap((p) => p.colors.map((c) => c.colorName)))], [active])

  const filtered = useMemo(() => {
    const result = active.filter((p) => {
      if (filters.sizes.length && !p.sizes.some((s) => filters.sizes.includes(s))) return false
      if (filters.colors.length && !p.colors.some((c) => filters.colors.includes(c.colorName))) return false
      if (filters.priceMin !== null && p.price < filters.priceMin) return false
      if (filters.priceMax !== null && p.price > filters.priceMax) return false
      return true
    })
    return sortProducts(result, sort)
  }, [active, filters, sort])

  const activeFilterCount = filters.sizes.length + filters.colors.length + (filters.priceMin !== null || filters.priceMax !== null ? 1 : 0)

  const onSearchCode = (e: FormEvent) => {
    e.preventDefault()
    const match = active.find((p) => p.code.toLowerCase() === code.trim().toLowerCase())
    if (match) {
      navigate(`/store/${match.code}`)
    } else {
      setCodeError(`${t('noProductWithCode')} "${code.trim()}".`)
    }
  }

  return (
    <div className="container-page py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-2">{t('chooseYourLook')}</p>
          <h1 className="display text-4xl sm:text-5xl">{selectedCategory ? pick(selectedCategory.name, selectedCategory.nameHe) : t('dressesTitle')}</h1>
          {selectedCategory && (
            <button type="button" onClick={() => setSearchParams({})} className="mt-1 text-xs text-muted underline underline-offset-2">
              {t('showAllCategories')}
            </button>
          )}
        </div>
        <form onSubmit={onSearchCode} className="flex w-full max-w-xs gap-2">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setCodeError(null)
              }}
              placeholder={t('searchByCode')}
              className="field !ps-9"
            />
          </div>
          <button type="submit" className="btn btn-outline btn-sm shrink-0">
            {t('search')}
          </button>
        </form>
      </div>
      {codeError && <p className="mb-6 text-sm text-sale">{codeError}</p>}

      {!loading && !error && active.length > 0 && (
        <div className="mb-6 flex items-center justify-between gap-3 border-y border-line py-3">
          <button type="button" onClick={() => setDrawerOpen(true)} className="inline-flex h-10 items-center gap-2 border border-ink px-4 text-xs font-medium uppercase tracking-wider lg:hidden">
            <SlidersHorizontal size={15} aria-hidden="true" />
            {t('filters')}
            {activeFilterCount > 0 && ` (${activeFilterCount})`}
          </button>
          <p className="hidden text-sm text-muted lg:block">
            {filtered.length} {t('pieces')}
          </p>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="field !h-10 !w-auto pe-8 text-sm">
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted">{t('loading')}</p>
      ) : error ? (
        <p className="text-sm text-sale">{error}</p>
      ) : active.length === 0 ? (
        <EmptyState icon={<Shirt size={26} strokeWidth={1.3} />} title={t('noProductsYet')} description={t('newDressesSoon')} />
      ) : (
        <div className="gap-10 lg:grid lg:grid-cols-[14rem_1fr]">
          <aside className="hidden lg:block">
            <FilterControls sizes={allSizes} colors={allColors} filters={filters} onChange={setFilters} />
          </aside>
          <div>
            {filtered.length === 0 ? (
              <EmptyState icon={<SlidersHorizontal size={24} strokeWidth={1.3} />} title={t('noResults')} description={t('tryRemovingFilter')}>
                <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className="btn btn-outline">
                  {t('clearFilters')}
                </button>
              </EmptyState>
            ) : (
              <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3">
                {filtered.map((p) => {
                  return (
                    <article key={p.id} className="group relative">
                      <Link to={`/store/${p.code}`} className="block">
                        <ProductCardMedia product={p} />
                      </Link>
                      <LikeButton productId={p.id} productName={pick(p.name, p.nameHe)} className="absolute end-2 top-2" />
                      <Link to={`/store/${p.code}`} className="mt-3 block">
                        <p className="font-mono text-[0.6875rem] text-muted" dir="ltr">
                          {p.code}
                        </p>
                        <h2 className="text-sm leading-snug group-hover:underline">{pick(p.name, p.nameHe)}</h2>
                        <p className="mt-1 text-sm font-medium">{format(p.price)}</p>
                      </Link>
                    </article>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <Dialog open={drawerOpen} onClose={() => setDrawerOpen(false)} label={t('filters')} variant="right">
        <div className="flex h-full flex-col">
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4">
            <h2 className="display text-2xl">{t('filters')}</h2>
            <button type="button" onClick={() => setDrawerOpen(false)} aria-label={t('closeFilters')} className="-me-2 grid h-11 w-11 place-items-center hover:bg-sand">
              <X size={22} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <FilterControls sizes={allSizes} colors={allColors} filters={filters} onChange={setFilters} />
          </div>
          <div className="flex shrink-0 gap-3 border-t border-line bg-ivory p-4">
            <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} disabled={activeFilterCount === 0} className="btn btn-outline flex-1">
              {t('clearAll')}
            </button>
            <button type="button" onClick={() => setDrawerOpen(false)} className="btn btn-primary flex-[1.4]">
              {t('showResults')} {filtered.length} {t('results')}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default function StorePage() {
  const { t } = useLanguage()
  useDocumentTitle(t('dressesTitle'))
  return (
    <RequireSupabase>
      <StoreGrid />
    </RequireSupabase>
  )
}
