import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Flag } from '@/components/ui/Flag'
import { SmartImage } from '@/components/ui/SmartImage'
import { COUNTRY_LIST } from '@/data/countries'
import { PRODUCTS } from '@/data/products'
import { keyImage } from '@/utils/images'
import type { Country } from '@/types'

const COUNTS = COUNTRY_LIST.reduce<Record<string, number>>((acc, c) => {
  acc[c.code] = PRODUCTS.filter((p) => p.country === c.code).length
  return acc
}, {})

function CountryCard({ country, featured = false }: { country: Country; featured?: boolean }) {
  return (
    <Link
      to={`/country/${country.code}`}
      className={`group relative block overflow-hidden bg-sand ${featured ? 'col-span-2 aspect-[4/3] sm:aspect-[16/10] lg:col-span-2 lg:row-span-2 lg:aspect-auto lg:min-h-[34rem]' : 'aspect-[4/5] lg:aspect-auto lg:min-h-[16.5rem]'}`}
    >
      <SmartImage
        image={keyImage(country.image, { x: 0.5, y: country.imageFocusY ?? 0.3, zoom: 1 })}
        alt=""
        ratio={featured ? 4 / 3 : 4 / 5}
        widths={[480, 720, 960, 1280]}
        sizes={featured ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 25vw, 50vw'}
        className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 p-4 text-ivory sm:p-6">
        <p className="mb-2 flex items-center gap-2 text-[0.6875rem] font-medium uppercase tracking-[0.18em]">
          <Flag code={country.code} size={13} />
          {country.name}
          {featured && <span className="ml-1 bg-ivory px-1.5 py-0.5 text-[0.5625rem] tracking-[0.14em] text-ink">LARGEST SELECTION</span>}
        </p>
        <h3 className={`display ${featured ? 'text-3xl sm:text-5xl' : 'text-2xl sm:text-3xl'}`}>{country.headline}</h3>
        {featured && <p className="mt-2 hidden max-w-md text-sm text-ivory/85 sm:block">{country.blurb}</p>}
        <p className="mt-3 flex items-center gap-2 text-xs">
          <span>{COUNTS[country.code]} styles</span>
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </p>
      </div>
    </Link>
  )
}

export function WorldSection() {
  const [turkey, ...others] = COUNTRY_LIST
  return (
    <section aria-labelledby="world-heading" className="container-page pt-16 sm:pt-24">
      <div className="mb-8 grid gap-4 sm:mb-10 lg:grid-cols-2 lg:items-end">
        <div>
          <p className="eyebrow mb-2">The ZAYNKAR marketplace</p>
          <h2 id="world-heading" className="display text-4xl sm:text-5xl">
            Shop From Around the World
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-relaxed text-muted lg:justify-self-end">
          ZAYNKAR brings independent stores and brands from different countries into one place. We are starting in Turkey, and expanding to new markets — every product shows who sells it and where it ships from.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
        <CountryCard country={turkey} featured />
        {others.map((c) => (
          <CountryCard key={c.code} country={c} />
        ))}
        <div className="col-span-2 flex flex-col justify-center border border-dashed border-taupe/50 p-5 sm:p-6 lg:col-span-1 lg:min-h-[16.5rem]">
          <p className="eyebrow mb-2">Coming soon</p>
          <p className="display text-2xl sm:text-3xl">More countries, more sellers</p>
          <Link to="/info/our-sellers" className="mt-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em]">
            <span className="link-underline">Meet our sellers</span>
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
