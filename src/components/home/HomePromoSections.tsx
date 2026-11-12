import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Truck } from 'lucide-react'
import { ProductCard } from '@/components/store/ProductCard'
import { useLanguage } from '@/context/LanguageContext'
import { useProducts } from '@/context/ProductsContext'

/** Three closing homepage sections: a seasonal sale banner, a real "newly added" row pulled
 * straight from the live catalog, and a shipping-coverage banner — each styled as its own
 * full-bleed card so scrolling past them still feels like discovering something new. */
export function HomePromoSections() {
  const { t } = useLanguage()
  const { products } = useProducts()

  const newest = useMemo(
    () =>
      [...products]
        .filter((p) => p.isActive)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 8),
    [products],
  )

  return (
    <div className="space-y-12 py-12 sm:space-y-16 sm:py-16">
      <section className="container-page">
        <div className="relative overflow-hidden bg-gradient-to-l from-primary to-primary-dark px-6 py-12 text-center text-ivory sm:px-12 sm:py-16">
          <Sparkles className="absolute end-6 top-6 opacity-30" size={40} aria-hidden="true" />
          <Sparkles className="absolute start-8 bottom-6 opacity-20" size={28} aria-hidden="true" />
          <h2 className="display text-2xl sm:text-4xl">{t('summerSaleHeading')}</h2>
          <p className="mt-3 text-sm sm:text-base">{t('summerSaleText')}</p>
          <Link to="/store" className="btn btn-light mt-7">
            {t('shopTheSale')}
          </Link>
        </div>
      </section>

      {newest.length > 0 && (
        <section className="container-page">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="display text-2xl sm:text-3xl">{t('newlyAddedHeading')}</h2>
            <Link to="/store" className="link-underline shrink-0 text-xs font-medium tracking-wide sm:text-sm">
              {t('viewAll')}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-4">
            {newest.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="container-page">
        <div className="flex flex-col items-center gap-3 border border-primary/30 bg-primary-soft px-6 py-10 text-center sm:flex-row sm:justify-center sm:gap-5 sm:py-8">
          <Truck size={30} className="text-primary-dark" aria-hidden="true" />
          <div>
            <p className="display text-xl sm:text-2xl">{t('shippingBannerHeading')}</p>
            <p className="mt-1 text-sm text-muted">{t('shippingBannerText')}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
