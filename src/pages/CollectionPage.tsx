import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Flag } from '@/components/ui/Flag'
import { SmartImage } from '@/components/ui/SmartImage'
import { ProductListing } from '@/components/product/ProductListing'
import { COLLECTIONS, getCollection, getCountryCollection, getCrumbs, type Collection } from '@/data/collections'
import { COUNTRIES, isCountryCode } from '@/data/countries'
import { PRODUCTS } from '@/data/products'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSimulatedLoading } from '@/hooks/useSimulatedLoading'
import { keyImage } from '@/utils/images'
import NotFoundPage from '@/pages/NotFoundPage'
import type { CountryCode } from '@/types'

/** Handles both /shop/:slug and /country/:code. */
export default function CollectionPage({ mode }: { mode: 'shop' | 'country' }) {
  const params = useParams()
  const code = params.code?.toUpperCase()

  if (mode === 'country') {
    if (!code || !isCountryCode(code)) return <NotFoundPage />
    return <CollectionView key={code} collection={getCountryCollection(code)} country={code} />
  }
  const collection = getCollection(params.slug ?? '')
  if (!collection) return <NotFoundPage />
  return <CollectionView key={collection.slug} collection={collection} />
}

function CollectionView({ collection, country }: { collection: Collection; country?: CountryCode }) {
  useDocumentTitle(collection.title)
  const products = useMemo(() => PRODUCTS.filter(collection.filter), [collection])
  const loading = useSimulatedLoading(`collection:${collection.slug}`)
  const crumbs = getCrumbs(collection, country ? COUNTRIES[country].name : undefined)
  const children = useMemo(() => Object.values(COLLECTIONS).filter((c) => c.parent === collection.slug), [collection.slug])

  return (
    <>
      <section className="bg-sand">
        <div className="container-page grid gap-6 py-6 sm:py-8 md:grid-cols-[1fr_20rem] md:items-center lg:grid-cols-[1fr_26rem] lg:py-10">
          <div>
            <Breadcrumbs items={crumbs} />
            <div className="mt-5 flex items-center gap-3">
              {country && <Flag code={country} size={20} />}
              <h1 className="display text-4xl sm:text-6xl">{collection.title}</h1>
            </div>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">{collection.description}</p>
            {collection.note && <p className="mt-3 inline-block border border-line bg-ivory px-3 py-1.5 text-xs text-muted">{collection.note}</p>}
            {children.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2">
                {children.map((c) => (
                  <li key={c.slug}>
                    <Link to={`/shop/${c.slug}`} className="inline-block border border-ink/25 bg-ivory px-3.5 py-2 text-xs font-medium uppercase tracking-[0.1em] transition-colors hover:border-ink hover:bg-ink hover:text-ivory">
                      {c.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="relative hidden aspect-[16/10] overflow-hidden bg-sand-deep md:block">
            <SmartImage
              image={keyImage(collection.image, { x: 0.5, y: collection.imageFocusY ?? 0.4, zoom: 1 })}
              alt=""
              ratio={16 / 10}
              widths={[480, 720, 960]}
              sizes="26rem"
              priority
            />
          </div>
        </div>
      </section>

      <div className="container-page pt-6 sm:pt-8">
        <ProductListing
          products={products}
          defaultSort={collection.defaultSort}
          loading={loading}
          idPrefix={collection.slug}
          emptyBase={
            <div className="py-24 text-center">
              <p className="display text-3xl">Nothing here yet</p>
              <p className="mt-2 text-sm text-muted">New sellers are joining soon.</p>
              <Link to="/shop/women" className="btn btn-primary mt-8">
                Shop all women
              </Link>
            </div>
          }
        />
      </div>
    </>
  )
}
