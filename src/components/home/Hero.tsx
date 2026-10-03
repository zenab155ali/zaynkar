import { Link } from 'react-router-dom'
import { SmartImage } from '@/components/ui/SmartImage'
import { keyImage } from '@/utils/images'

const HERO_IMAGE = keyImage('skyCoat')

export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="bg-sand">
      <div className="mx-auto grid max-w-[1680px] lg:grid-cols-12">
        <div className="relative order-1 aspect-[4/5] overflow-hidden sm:aspect-[16/11] lg:order-2 lg:col-span-7 lg:aspect-auto lg:min-h-[680px] xl:min-h-[740px]">
          <SmartImage
            image={HERO_IMAGE}
            alt="امرأة ترتدي معطفًا طويلًا أنيقًا"
            ratio={2 / 3}
            widths={[640, 960, 1280, 1600, 2000]}
            sizes="(min-width: 1024px) 58vw, 100vw"
            priority
            className="object-[50%_18%]"
          />
        </div>

        <div className="order-2 flex flex-col justify-center px-4 py-12 sm:px-8 sm:py-16 lg:order-1 lg:col-span-5 lg:px-12 lg:py-20 xl:pe-14" dir="ltr">
          <p className="eyebrow mb-5">A GLOBAL FASHION MARKETPLACE</p>
          <h1 id="hero-heading" className="display text-[3.25rem] sm:text-7xl xl:text-[5.5rem]">
            Your Style.
            <br />
            <em className="font-normal italic">Your World.</em>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted sm:text-lg">Discover fashion from brands around the world.</p>

          <div className="mt-9">
            <Link to="/store" className="btn btn-primary">
              تسوقي الفساتين
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
