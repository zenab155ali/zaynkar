import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import { SmartImage } from '@/components/ui/SmartImage'
import { COLLECTIONS } from '@/data/collections'
import { PRODUCTS } from '@/data/products'
import type { ImageKey } from '@/data/imageLibrary'
import { keyImage } from '@/utils/images'

const TILES: { label: string; slug: string; image: ImageKey }[] = [
  { label: 'Maxi Dresses', slug: 'modest-maxi-dresses', image: 'blackModestMaxi' },
  { label: 'Long Sleeve Dresses', slug: 'long-sleeve-dresses', image: 'corduroyDress' },
  { label: 'Sets', slug: 'modest-sets', image: 'turtleneckSkirtSet' },
  { label: 'Abayas', slug: 'abayas', image: 'abayaChampagne' },
  { label: 'Hijabs', slug: 'hijabs', image: 'hijabRose' },
  { label: 'Long Skirts', slug: 'long-skirts', image: 'ivoryPleatSkirt' },
]

export function ModestEdit() {
  const featured = useMemo(() => PRODUCTS.filter((p) => p.modest && p.category !== 'accessories').sort((a, b) => b.sales - a.sales).slice(0, 4), [])
  const counts = useMemo(
    () => Object.fromEntries(TILES.map((t) => [t.slug, PRODUCTS.filter(COLLECTIONS[t.slug].filter).length])),
    [],
  )

  return (
    <section aria-labelledby="modest-heading" className="mt-16 bg-[#ece3d6] py-16 sm:mt-24 sm:py-24">
      <div className="container-page">
        <div className="mb-10 text-center sm:mb-14">
          <p className="eyebrow mb-3">A collection within ZAYNKAR</p>
          <h2 id="modest-heading" className="display text-5xl tracking-[0.08em] sm:text-7xl">
            THE MODEST EDIT
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            Elegant coverage, considered silhouettes. Maxi dresses, abayas, hijabs and long skirts from our sellers in Turkey, the UAE and beyond.
          </p>
        </div>

        <div className="grid gap-3 sm:gap-4 lg:grid-cols-12 lg:gap-5">
          <Link to="/shop/modest" className="group relative block aspect-[4/5] overflow-hidden bg-sand lg:col-span-5 lg:aspect-auto lg:min-h-[36rem]">
            <SmartImage
              image={keyImage('abayaOpen', { x: 0.5, y: 0.35, zoom: 1 })}
              alt="A woman in a flowing black open abaya on white stairs"
              ratio={4 / 5}
              widths={[480, 720, 960, 1280]}
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" aria-hidden="true" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-ivory sm:p-7">
              <p className="display text-3xl sm:text-4xl">Shop the full edit</p>
              <p className="mt-2 flex items-center gap-2 text-xs uppercase tracking-[0.16em]">
                {PRODUCTS.filter((p) => p.modest).length} pieces
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </p>
            </div>
          </Link>

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:col-span-7 lg:gap-5">
            {TILES.map((tile) => (
              <li key={tile.slug}>
                <Link to={`/shop/${tile.slug}`} className="group relative block aspect-[3/4] overflow-hidden bg-sand lg:aspect-auto lg:h-full lg:min-h-[17rem]">
                  <SmartImage
                    image={keyImage(tile.image)}
                    alt=""
                    widths={[320, 480, 640]}
                    sizes="(min-width: 1024px) 20vw, 48vw"
                    className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" aria-hidden="true" />
                  <span className="absolute inset-x-0 bottom-0 p-3.5 text-ivory sm:p-4">
                    <span className="block text-sm font-medium leading-tight">{tile.label}</span>
                    <span className="text-[0.6875rem] opacity-80">{counts[tile.slug]} styles</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-x-3 gap-y-8 lg:grid-cols-4 lg:gap-x-5">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  )
}
