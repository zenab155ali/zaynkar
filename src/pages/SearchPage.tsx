import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Camera, Search, SearchX } from 'lucide-react'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProductListing } from '@/components/product/ProductListing'
import { useUI } from '@/context/UIContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSimulatedLoading } from '@/hooks/useSimulatedLoading'
import { POPULAR_SEARCHES, searchProducts } from '@/utils/search'

export default function SearchPage() {
  const [params] = useSearchParams()
  const q = (params.get('q') ?? '').trim()
  return <SearchView key={q} q={q} />
}

function SearchView({ q }: { q: string }) {
  useDocumentTitle(q ? `Search: ${q}` : 'Search')
  const navigate = useNavigate()
  const { setImageSearchOpen } = useUI()
  const [draft, setDraft] = useState(q)
  const result = useMemo(() => searchProducts(q), [q])
  const loading = useSimulatedLoading(`search:${q}`, 260)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const next = draft.trim()
    if (next) navigate(`/search?q=${encodeURIComponent(next)}`)
  }

  const suggestions = (
    <ul className="flex flex-wrap justify-center gap-2">
      {POPULAR_SEARCHES.map((term) => (
        <li key={term}>
          <Link to={`/search?q=${encodeURIComponent(term)}`} className="inline-block border border-line bg-white px-3.5 py-2 text-sm transition-colors hover:border-ink">
            {term}
          </Link>
        </li>
      ))}
    </ul>
  )

  return (
    <div className="container-page py-6 sm:py-10">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Search' }]} />

      <div className="mt-6">
        <h1 className="display text-4xl sm:text-5xl">{q ? <>Results for “{q}”</> : 'Search'}</h1>
        {q && !loading && result.products.length > 0 && (
          <p className="mt-2 text-sm text-muted">
            {result.relaxed ? 'No exact matches — showing the closest styles.' : `${result.products.length} ${result.products.length === 1 ? 'style' : 'styles'} found.`}
          </p>
        )}

        <form onSubmit={onSubmit} role="search" className="mt-6 flex max-w-2xl items-center gap-2">
          <div className="relative flex-1">
            <label htmlFor="search-page-input" className="sr-only">
              Search products
            </label>
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input id="search-page-input" type="search" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Try “black maxi dress” or “beige bag”" className="field !pl-11" />
          </div>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
          <button type="button" onClick={() => setImageSearchOpen(true)} aria-label="Search by image" title="Search by image" className="grid h-12 w-12 shrink-0 place-items-center border border-line bg-white transition-colors hover:border-ink">
            <Camera size={20} strokeWidth={1.5} />
          </button>
        </form>
      </div>

      <div className="mt-8">
        {!q ? (
          <EmptyState icon={<Search size={26} strokeWidth={1.3} />} title="What are you looking for?" description="Search by style, colour, brand or country — or start with a popular search.">
            {suggestions}
          </EmptyState>
        ) : (
          <ProductListing
            products={result.products}
            loading={loading}
            idPrefix="search"
            keepOrderForRecommended
            emptyBase={
              <EmptyState
                icon={<SearchX size={26} strokeWidth={1.3} />}
                title={`No results for “${q}”`}
                description="Check the spelling, try a broader term (like “dress” or “bag”), or explore a popular search."
              >
                {suggestions}
                <Link to="/shop/women" className="btn btn-primary mt-4 w-full sm:w-auto">
                  Browse all women
                </Link>
              </EmptyState>
            }
          />
        )}
      </div>
    </div>
  )
}
