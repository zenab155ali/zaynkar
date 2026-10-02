import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ProductCard } from '@/components/product/ProductCard'
import { PRODUCTS } from '@/data/products'
import type { Product } from '@/types'

const TABS: { id: string; label: string; match: (p: Product) => boolean }[] = [
  { id: 'all', label: 'All', match: () => true },
  { id: 'dresses', label: 'Dresses', match: (p) => p.category === 'dresses' },
  { id: 'modest', label: 'Modest', match: (p) => p.modest },
  { id: 'shoes', label: 'Shoes', match: (p) => p.category === 'shoes' },
  { id: 'bags', label: 'Bags', match: (p) => p.category === 'bags' },
]

export function TrendingNow() {
  const [tab, setTab] = useState('all')
  const products = useMemo(() => {
    const match = TABS.find((t) => t.id === tab)?.match ?? (() => true)
    return PRODUCTS.filter(match).sort((a, b) => b.sales - a.sales).slice(0, 4)
  }, [tab])

  return (
    <section aria-labelledby="trending-heading" className="mt-16 bg-sand/70 py-16 sm:mt-24 sm:py-24">
      <div className="container-page">
        <div className="mb-8 flex flex-col gap-6 sm:mb-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow mb-2">What everyone is wearing</p>
            <h2 id="trending-heading" className="display text-4xl sm:text-5xl">
              Trending Now
            </h2>
          </div>
          <div role="tablist" aria-label="Trending categories" className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`trend-tab-${t.id}`}
                aria-selected={tab === t.id}
                aria-controls="trend-panel"
                onClick={() => setTab(t.id)}
                className={`shrink-0 border px-4 py-2 text-[0.75rem] font-medium uppercase tracking-[0.12em] transition-colors ${
                  tab === t.id ? 'border-ink bg-ink text-ivory' : 'border-line bg-ivory hover:border-ink'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div id="trend-panel" role="tabpanel" aria-labelledby={`trend-tab-${tab}`} className="grid grid-cols-2 gap-x-3 gap-y-8 lg:grid-cols-4 lg:gap-x-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link to="/shop/trending" className="btn btn-outline">
            See all trending
          </Link>
        </div>
      </div>
    </section>
  )
}
