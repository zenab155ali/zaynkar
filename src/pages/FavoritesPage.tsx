import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProductCarousel } from '@/components/product/ProductCarousel'
import { ProductGrid } from '@/components/product/ProductGrid'
import { useFavorites } from '@/context/FavoritesContext'
import { PRODUCTS, getProductsByIds } from '@/data/products'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function FavoritesPage() {
  useDocumentTitle('Favorites')
  const { ids, clear } = useFavorites()
  const products = useMemo(() => getProductsByIds(ids), [ids])
  const suggestions = useMemo(() => PRODUCTS.filter((p) => !ids.includes(p.id)).sort((a, b) => b.sales - a.sales).slice(0, 8), [ids])

  return (
    <div className="container-page pt-4 sm:pt-6">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Favorites' }]} />

      {products.length === 0 ? (
        <EmptyState icon={<Heart size={28} strokeWidth={1.3} />} title="No favorites yet" description="Tap the heart on any product to save it here. Your favorites stay on this device.">
          <Link to="/shop/new-in" className="btn btn-primary">
            Discover new in
          </Link>
          <Link to="/shop/trending" className="btn btn-outline">
            See trending
          </Link>
        </EmptyState>
      ) : (
        <>
          <div className="mt-5 flex items-end justify-between gap-4">
            <h1 className="display text-4xl sm:text-5xl">
              Favorites <span className="text-2xl text-muted sm:text-3xl">({products.length})</span>
            </h1>
            <button type="button" onClick={clear} className="text-xs text-muted underline underline-offset-4 hover:text-ink">
              Clear all
            </button>
          </div>
          <div className="mt-8">
            <ProductGrid products={products} />
          </div>
        </>
      )}

      <section aria-labelledby="fav-suggest" className="mt-16 border-t border-line py-12">
        <h2 id="fav-suggest" className="display mb-8 text-3xl sm:text-4xl">
          {products.length === 0 ? 'Start with these' : 'You May Also Like'}
        </h2>
        <ProductCarousel products={suggestions} label="Suggested products" />
      </section>
    </div>
  )
}
