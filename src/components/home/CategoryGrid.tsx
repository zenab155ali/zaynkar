import { Link } from 'react-router-dom'
import { SectionHeader } from '@/components/home/SectionHeader'
import { SmartImage } from '@/components/ui/SmartImage'
import { HOME_CATEGORIES } from '@/data/categories'
import { keyImage } from '@/utils/images'

export function CategoryGrid() {
  return (
    <section aria-labelledby="categories-heading" className="container-page pt-16 sm:pt-24">
      <SectionHeader id="categories-heading" eyebrow="Explore" title="Shop by Category" />
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
        {HOME_CATEGORIES.map((cat) => (
          <li key={cat.label}>
            <Link to={cat.to} className="group relative block aspect-[4/5] overflow-hidden bg-sand">
              <SmartImage
                image={keyImage(cat.image, cat.focusY !== undefined ? { x: 0.5, y: cat.focusY, zoom: 1 } : undefined)}
                alt=""
                ratio={4 / 5}
                sizes="(min-width: 1024px) 24vw, 48vw"
                className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" aria-hidden="true" />
              <span className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 text-ivory sm:p-5">
                <span className="display text-2xl leading-none sm:text-3xl">{cat.label}</span>
                <span className="text-[0.6875rem] font-medium uppercase tracking-[0.16em] opacity-0 transition-opacity group-hover:opacity-100 max-sm:hidden">Shop →</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
