import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '@/context/LanguageContext'
import { useProducts } from '@/context/ProductsContext'
import type { Category } from '@/types/catalog'

const PREFERS_REDUCED_MOTION = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function Tile({ category }: { category: Category }) {
  const { pick } = useLanguage()
  return (
    <Link to={`/store?category=${category.id}`} dir="rtl" className="group flex w-24 shrink-0 flex-col items-center gap-2.5 text-center sm:w-28">
      <span className="relative block aspect-square w-full overflow-hidden rounded-full bg-sand">
        {category.photoUrl && (
          <img src={category.photoUrl} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        )}
      </span>
      <span className="text-xs font-medium leading-snug sm:text-sm">{pick(category.name, category.nameHe)}</span>
    </Link>
  )
}

/** One continuously auto-scrolling row — duplicates its items back-to-back so the loop point is
 * invisible, drives the scroll via rAF (not a CSS transform) so the row stays genuinely
 * swipeable/draggable on touch and with a trackpad, and pauses while the shopper is interacting
 * with it or hovering it with a mouse. Does nothing (plain static, swipeable row) if the visitor
 * has asked for reduced motion. */
function AutoScrollRow({ items, direction }: { items: Category[]; direction: 1 | -1 }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)
  const doubled = [...items, ...items]

  useEffect(() => {
    const el = trackRef.current
    if (!el || items.length === 0 || PREFERS_REDUCED_MOTION()) return
    el.scrollLeft = el.scrollWidth / 4
    let raf: number
    const step = () => {
      if (!pausedRef.current) {
        const half = el.scrollWidth / 2
        el.scrollLeft += direction * 0.6
        if (el.scrollLeft >= half) el.scrollLeft -= half
        else if (el.scrollLeft <= 0) el.scrollLeft += half
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [items, direction])

  const pause = () => (pausedRef.current = true)
  const resumeSoon = () => window.setTimeout(() => (pausedRef.current = false), 1200)

  return (
    <div
      ref={trackRef}
      dir="ltr"
      className="scrollbar-none flex gap-4 overflow-x-auto sm:gap-6"
      onMouseEnter={pause}
      onMouseLeave={() => (pausedRef.current = false)}
      onTouchStart={pause}
      onTouchEnd={resumeSoon}
    >
      {doubled.map((c, i) => (
        <Tile key={`${c.id}-${i}`} category={c} />
      ))}
    </div>
  )
}

/** Two auto-scrolling rows of category tiles (opposite directions) — lets customers jump straight
 * into a category from the homepage, and keeps browsing it feeling alive rather than static. */
export function CategoryTiles() {
  const { categories } = useProducts()
  const { t } = useLanguage()
  if (categories.length === 0) return null

  const mid = Math.ceil(categories.length / 2)
  const row1 = categories.slice(0, mid)
  const row2 = categories.slice(mid)

  return (
    <section aria-labelledby="categories-heading" className="container-page py-12 sm:py-16">
      <h2 id="categories-heading" className="display mb-6 text-center text-2xl sm:text-3xl">
        {t('categoriesHeading')}
      </h2>
      <div className="space-y-6 sm:space-y-8">
        <AutoScrollRow items={row1} direction={1} />
        {row2.length > 0 && <AutoScrollRow items={row2} direction={-1} />}
      </div>
    </section>
  )
}
