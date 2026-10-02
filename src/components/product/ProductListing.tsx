import { useMemo, useState, type ReactNode } from 'react'
import { Grid2x2, Grid3x3, SlidersHorizontal, X } from 'lucide-react'
import type { Product } from '@/types'
import { COUNTRIES } from '@/data/countries'
import { PRODUCTS_PER_PAGE } from '@/config'
import { Dialog } from '@/components/ui/Dialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProductGridSkeleton } from '@/components/ui/Skeleton'
import { FilterPanel } from '@/components/product/FilterPanel'
import { GRID_CLASSES, ProductGrid, type GridLayout } from '@/components/product/ProductGrid'
import { useCurrency } from '@/context/CurrencyContext'
import { EMPTY_FILTERS, SORT_OPTIONS, applyFilters, buildFacets, countActiveFilters, sortProducts, type Filters, type SortKey } from '@/utils/filters'

interface ProductListingProps {
  products: Product[]
  defaultSort?: SortKey
  loading?: boolean
  idPrefix: string
  /** Keep the given order when "Recommended" is selected (used for search relevance). */
  keepOrderForRecommended?: boolean
  /** Rendered instead of the listing when the base set is empty. */
  emptyBase?: ReactNode
}

interface Chip {
  key: string
  label: string
  next: Filters
}

export function ProductListing({ products, defaultSort = 'recommended', loading = false, idPrefix, keepOrderForRecommended = false, emptyBase }: ProductListingProps) {
  const { format } = useCurrency()
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [sort, setSort] = useState<SortKey>(defaultSort)
  const [layout, setLayout] = useState<GridLayout>('dense')
  const [visible, setVisible] = useState(PRODUCTS_PER_PAGE)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const facets = useMemo(() => buildFacets(products), [products])
  const results = useMemo(() => {
    const filtered = applyFilters(products, filters)
    return sort === 'recommended' && keepOrderForRecommended ? filtered : sortProducts(filtered, sort)
  }, [products, filters, sort, keepOrderForRecommended])

  const activeCount = countActiveFilters(filters)
  const updateFilters = (next: Filters) => {
    setFilters(next)
    setVisible(PRODUCTS_PER_PAGE)
  }

  const chips = useMemo<Chip[]>(() => {
    const out: Chip[] = []
    const without = <K extends keyof Filters>(key: K, value: Filters[K]): Filters => ({ ...filters, [key]: value })
    if (filters.modestOnly) out.push({ key: 'modest', label: 'Modest', next: without('modestOnly', false) })
    filters.categories.forEach((v) => out.push({ key: `cat-${v}`, label: v, next: without('categories', filters.categories.filter((x) => x !== v)) }))
    filters.sizes.forEach((v) => out.push({ key: `size-${v}`, label: `Size ${v}`, next: without('sizes', filters.sizes.filter((x) => x !== v)) }))
    filters.colors.forEach((v) => out.push({ key: `color-${v}`, label: v, next: without('colors', filters.colors.filter((x) => x !== v)) }))
    if (filters.priceMin !== null || filters.priceMax !== null) {
      const label = filters.priceMin !== null && filters.priceMax !== null ? `${format(filters.priceMin)} – ${format(filters.priceMax)}` : filters.priceMin !== null ? `From ${format(filters.priceMin)}` : `Up to ${format(filters.priceMax as number)}`
      out.push({ key: 'price', label, next: { ...filters, priceMin: null, priceMax: null } })
    }
    if (filters.minDiscount > 0) out.push({ key: 'discount', label: `${filters.minDiscount}%+ off`, next: without('minDiscount', 0) })
    filters.brands.forEach((v) => out.push({ key: `brand-${v}`, label: v, next: without('brands', filters.brands.filter((x) => x !== v)) }))
    filters.countries.forEach((v) => out.push({ key: `country-${v}`, label: COUNTRIES[v].name, next: without('countries', filters.countries.filter((x) => x !== v)) }))
    filters.styles.forEach((v) => out.push({ key: `style-${v}`, label: v, next: without('styles', filters.styles.filter((x) => x !== v)) }))
    return out
  }, [filters, format])

  if (!loading && products.length === 0 && emptyBase) return <>{emptyBase}</>

  const shown = results.slice(0, visible)

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-3 border-y border-line py-3 sm:flex-nowrap">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="order-1 inline-flex h-11 w-[calc(50%-0.375rem)] items-center justify-center gap-2 border border-ink px-4 text-[0.75rem] font-medium uppercase tracking-[0.12em] sm:h-10 sm:w-auto lg:hidden"
        >
          <SlidersHorizontal size={15} aria-hidden="true" />
          Filters{activeCount > 0 && ` (${activeCount})`}
        </button>

        <p aria-live="polite" className="order-3 mr-auto text-sm text-muted sm:order-2">
          {loading ? 'Loading…' : `${results.length} ${results.length === 1 ? 'product' : 'products'}`}
        </p>

        <div className="order-4 flex items-center sm:order-3">
          <div role="group" aria-label="Grid layout" className="flex">
            {([['roomy', Grid2x2, 'Larger product images'], ['dense', Grid3x3, 'Compact grid']] as const).map(([value, Icon, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={layout === value}
                aria-label={label}
                title={label}
                onClick={() => setLayout(value)}
                className={`grid h-10 w-10 place-items-center transition-colors ${layout === value ? 'bg-ink text-ivory' : 'text-muted hover:text-ink'}`}
              >
                <Icon size={18} strokeWidth={1.5} />
              </button>
            ))}
          </div>
        </div>

        <div className="order-2 flex w-[calc(50%-0.375rem)] items-center gap-2 sm:order-4 sm:w-auto">
          <label htmlFor={`${idPrefix}-sort`} className="hidden text-sm text-muted sm:block">
            Sort by
          </label>
          <select
            id={`${idPrefix}-sort`}
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as SortKey)
              setVisible(PRODUCTS_PER_PAGE)
            }}
            className="field !h-11 w-full min-w-0 !pl-3 pr-7 text-[0.8125rem] sm:!h-10 sm:!w-auto sm:!pl-3.5 sm:pr-8"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 gap-10 lg:grid lg:grid-cols-[15.5rem_1fr]">
        {/* Desktop sidebar */}
        <aside aria-label="Filters" className="scrollbar-none sticky top-36 hidden max-h-[calc(100dvh-10rem)] self-start overflow-y-auto pr-2 lg:block">
          <FilterPanel facets={facets} filters={filters} onChange={updateFilters} idPrefix={`${idPrefix}-side`} />
        </aside>

        <div>
          {chips.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2" aria-label="Active filters">
              {chips.map((chip) => (
                <button key={chip.key} type="button" onClick={() => updateFilters(chip.next)} className="inline-flex items-center gap-1.5 border border-line bg-white px-3 py-1.5 text-xs transition-colors hover:border-ink">
                  {chip.label}
                  <X size={12} aria-hidden="true" />
                  <span className="sr-only">Remove filter</span>
                </button>
              ))}
              <button type="button" onClick={() => updateFilters(EMPTY_FILTERS)} className="px-2 py-1.5 text-xs underline underline-offset-4">
                Clear all
              </button>
            </div>
          )}

          {loading ? (
            <ProductGridSkeleton count={8} className={GRID_CLASSES[layout]} />
          ) : results.length === 0 ? (
            <EmptyState
              icon={<SlidersHorizontal size={26} strokeWidth={1.3} />}
              title="No products match your filters"
              description="Try removing a filter or two to see more styles."
            >
              <button type="button" onClick={() => updateFilters(EMPTY_FILTERS)} className="btn btn-primary">
                Clear all filters
              </button>
            </EmptyState>
          ) : (
            <>
              <ProductGrid products={shown} layout={layout} />
              <div className="mt-12 text-center">
                <p className="text-xs text-muted">
                  Showing {shown.length} of {results.length}
                </p>
                <div className="mx-auto mt-3 h-px w-40 bg-line">
                  <div className="h-full bg-ink" style={{ width: `${(shown.length / results.length) * 100}%` }} />
                </div>
                {shown.length < results.length && (
                  <button type="button" onClick={() => setVisible((v) => v + PRODUCTS_PER_PAGE)} className="btn btn-outline mt-6">
                    Load more
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile / tablet filter drawer */}
      <Dialog open={drawerOpen} onClose={() => setDrawerOpen(false)} label="Filters" variant="right">
        <div className="flex h-full flex-col">
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4">
            <h2 className="display text-2xl">Filters</h2>
            <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Close filters" className="-mr-2 grid h-11 w-11 place-items-center hover:bg-sand">
              <X size={22} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-4 pt-3">
            <FilterPanel facets={facets} filters={filters} onChange={updateFilters} idPrefix={`${idPrefix}-drawer`} />
          </div>
          <div className="flex shrink-0 gap-3 border-t border-line bg-ivory p-4">
            <button type="button" onClick={() => updateFilters(EMPTY_FILTERS)} disabled={activeCount === 0} className="btn btn-outline flex-1">
              Clear all
            </button>
            <button type="button" onClick={() => setDrawerOpen(false)} className="btn btn-primary flex-[1.4]">
              Show {results.length} results
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
