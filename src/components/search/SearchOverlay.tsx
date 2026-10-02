import { useDeferredValue, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Camera, Search, X } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { SmartImage } from '@/components/ui/SmartImage'
import { PriceTag } from '@/components/product/PriceTag'
import { STORAGE_KEYS } from '@/config'
import { useUI } from '@/context/UIContext'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { POPULAR_SEARCHES, searchProducts, suggestCollections } from '@/utils/search'

export function SearchOverlay() {
  const { searchOpen, closeSearch } = useUI()
  return (
    <Dialog open={searchOpen} onClose={closeSearch} label="Search" variant="top">
      <SearchContent onClose={closeSearch} />
    </Dialog>
  )
}

function SearchContent({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const { setImageSearchOpen } = useUI()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const deferred = useDeferredValue(query)
  const [recent, setRecent] = useLocalStorage<string[]>(STORAGE_KEYS.recentSearches, [])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const trimmed = deferred.trim()
  const { products } = useMemo(() => searchProducts(trimmed), [trimmed])
  const collections = useMemo(() => suggestCollections(trimmed), [trimmed])
  const preview = products.slice(0, 5)

  const go = (term: string) => {
    const q = term.trim()
    if (!q) return
    setRecent((prev) => [q, ...prev.filter((r) => r.toLowerCase() !== q.toLowerCase())].slice(0, 5))
    onClose()
    navigate(`/search?q=${encodeURIComponent(q)}`)
  }
  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    go(query)
  }

  return (
    <div className="container-page py-5 sm:py-8">
      <form onSubmit={onSubmit} role="search" className="flex items-center gap-2 sm:gap-3">
        <div className="relative flex-1">
          <label htmlFor="site-search" className="sr-only">
            Search ZAYNKAR
          </label>
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            id="site-search"
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dresses, brands, “beige bag”…"
            autoComplete="off"
            enterKeyHint="search"
            className="field !h-12 !pl-11 pr-12 sm:!h-14 sm:text-base"
          />
          <button
            type="button"
            onClick={() => {
              onClose()
              setImageSearchOpen(true)
            }}
            aria-label="Search by image"
            title="Search by image"
            className="absolute right-1.5 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center text-muted transition-colors hover:text-ink"
          >
            <Camera size={20} strokeWidth={1.6} />
          </button>
        </div>
        <button type="button" onClick={onClose} aria-label="Close search" className="grid h-12 w-12 shrink-0 place-items-center hover:bg-sand sm:h-14 sm:w-14">
          <X size={22} />
        </button>
      </form>

      <div className="mt-6 sm:mt-8">
        {!trimmed ? (
          <div className="grid gap-8 md:grid-cols-2">
            <section aria-labelledby="popular-heading">
              <h2 id="popular-heading" className="eyebrow mb-3">
                Popular searches
              </h2>
              <ul className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((term) => (
                  <li key={term}>
                    <button type="button" onClick={() => go(term)} className="border border-line bg-white px-3.5 py-2 text-sm transition-colors hover:border-ink">
                      {term}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
            {recent.length > 0 && (
              <section aria-labelledby="recent-heading">
                <div className="mb-3 flex items-center justify-between">
                  <h2 id="recent-heading" className="eyebrow">
                    Recent
                  </h2>
                  <button type="button" onClick={() => setRecent([])} className="text-xs text-muted underline underline-offset-4 hover:text-ink">
                    Clear
                  </button>
                </div>
                <ul className="space-y-1">
                  {recent.map((term) => (
                    <li key={term}>
                      <button type="button" onClick={() => go(term)} className="flex w-full items-center gap-3 py-1.5 text-left text-sm hover:underline">
                        <Search size={14} className="text-muted" aria-hidden="true" /> {term}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        ) : products.length === 0 ? (
          <div className="py-8 text-center">
            <p className="display text-2xl">No results for “{trimmed}”</p>
            <p className="mt-2 text-sm text-muted">Try a simpler term like “dress”, “abaya” or “beige”, or browse a popular search.</p>
            <ul className="mt-5 flex flex-wrap justify-center gap-2">
              {POPULAR_SEARCHES.slice(0, 4).map((term) => (
                <li key={term}>
                  <button type="button" onClick={() => setQuery(term)} className="border border-line bg-white px-3.5 py-2 text-sm hover:border-ink">
                    {term}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[14rem_1fr]">
            <div>
              {collections.length > 0 && (
                <>
                  <h2 className="eyebrow mb-3">Categories</h2>
                  <ul className="mb-6 space-y-1">
                    {collections.map((c) => (
                      <li key={c.to}>
                        <Link to={c.to} onClick={onClose} className="inline-flex items-center gap-2 py-1 text-sm hover:underline">
                          {c.label} <ArrowRight size={13} aria-hidden="true" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <button type="button" onClick={() => go(query)} className="btn btn-outline btn-sm w-full">
                See all {products.length} results
              </button>
            </div>
            <div>
              <h2 className="eyebrow mb-3">Products</h2>
              <ul className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-5">
                {preview.map((p) => (
                  <li key={p.id}>
                    <Link to={`/product/${p.slug}`} onClick={onClose} className="group block">
                      <div className="relative aspect-[3/4] overflow-hidden bg-sand">
                        <SmartImage image={p.images[0]} alt="" widths={[240, 360]} sizes="(min-width: 768px) 15vw, 45vw" className="transition-transform duration-500 group-hover:scale-[1.03]" />
                      </div>
                      <p className="mt-2 truncate text-[0.6875rem] uppercase tracking-[0.12em] text-muted">{p.brand}</p>
                      <p className="line-clamp-2 text-xs leading-snug group-hover:underline">{p.name}</p>
                      <PriceTag product={p} className="mt-1" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
