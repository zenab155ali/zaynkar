import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Flag } from '@/components/ui/Flag'
import { SmartImage } from '@/components/ui/SmartImage'
import { COUNTRY_LIST } from '@/data/countries'
import { getProduct } from '@/data/products'
import { useCurrency } from '@/context/CurrencyContext'
import { keyImage } from '@/utils/images'

const HERO_IMAGE = keyImage('skyCoat')
const FEATURED_ID = 'sky-blue-longline-coat'

export function Hero() {
  const { format } = useCurrency()
  const featured = getProduct(FEATURED_ID)

  return (
    <section aria-labelledby="hero-heading" className="bg-sand">
      <div className="mx-auto grid max-w-[1680px] lg:grid-cols-12">
        <div className="relative order-1 aspect-[4/5] overflow-hidden sm:aspect-[16/11] lg:order-2 lg:col-span-7 lg:aspect-auto lg:min-h-[680px] xl:min-h-[740px]">
          <SmartImage
            image={HERO_IMAGE}
            alt="A woman in a sky blue longline coat and soft grey scarf in front of Milan Cathedral"
            ratio={2 / 3}
            widths={[640, 960, 1280, 1600, 2000]}
            sizes="(min-width: 1024px) 58vw, 100vw"
            priority
            className="object-[50%_18%]"
          />
          {featured && (
            <Link
              to={`/product/${featured.slug}`}
              className="group absolute bottom-4 left-4 right-4 flex max-w-sm items-center gap-3 bg-ivory/95 p-3 pr-4 shadow-lg backdrop-blur transition-colors hover:bg-white sm:bottom-6 sm:left-6 sm:right-auto"
            >
              <span className="relative h-16 w-12 shrink-0 overflow-hidden bg-sand">
                <SmartImage image={featured.images[0]} alt="" widths={[120, 200]} sizes="48px" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="eyebrow block !text-[0.625rem]">Featured</span>
                <span className="block truncate text-sm font-medium">{featured.name}</span>
                <span className="text-xs text-muted">
                  {featured.brand} · {format(featured.price)}
                </span>
              </span>
              <ArrowUpRight size={18} className="shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          )}
        </div>

        <div className="order-2 flex flex-col justify-center px-4 py-12 sm:px-8 sm:py-16 lg:order-1 lg:col-span-5 lg:px-12 lg:py-20 xl:pl-[max(3.5rem,calc((100vw-1520px)/2+2.5rem))] xl:pr-14">
          <p className="eyebrow mb-5">A global fashion marketplace</p>
          <h1 id="hero-heading" className="display text-[3.25rem] sm:text-7xl xl:text-[5.5rem]">
            Your Style.
            <br />
            <em className="font-normal italic">Your World.</em>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted sm:text-lg">Discover fashion from brands around the world.</p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link to="/shop/new-in" className="btn btn-primary">
              Shop New In
            </Link>
            <Link to="/shop/modest" className="btn btn-outline">
              Explore Modest
            </Link>
          </div>

          <ul className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted" aria-label="Sellers ship from">
            {COUNTRY_LIST.map((c) => (
              <li key={c.code}>
                <Link to={`/country/${c.code}`} className="inline-flex items-center gap-2 transition-colors hover:text-ink">
                  <Flag code={c.code} size={12} />
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
