import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Product } from '@/types'
import { ProductCard } from '@/components/product/ProductCard'

interface ProductCarouselProps {
  products: Product[]
  label: string
}

const ITEM_CLASS = 'w-[64%] shrink-0 snap-start xs:w-[46%] md:w-[31%] lg:w-[23.4%]'
const ITEM_SIZES = '(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 60vw'

/** Scroll-snap carousel. Native swipe on touch, arrow buttons on larger screens. */
export function ProductCarousel({ products, label }: ProductCarouselProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ start: true, end: false })

  const update = useCallback(() => {
    const el = ref.current
    if (!el) return
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 })
  }, [])

  useEffect(() => {
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [update, products.length])

  const scrollByPage = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.85, behavior: 'smooth' })

  return (
    <div className="group/carousel relative" role="region" aria-roledescription="carousel" aria-label={label}>
      <div ref={ref} onScroll={update} className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 sm:-mx-6 sm:gap-5 sm:px-6 lg:-mx-0 lg:px-0">
        {products.map((p) => (
          <div key={p.id} className={ITEM_CLASS}>
            <ProductCard product={p} sizes={ITEM_SIZES} />
          </div>
        ))}
      </div>
      {(['prev', 'next'] as const).map((dir) => {
        const disabled = dir === 'prev' ? edges.start : edges.end
        return (
          <button
            key={dir}
            type="button"
            onClick={() => scrollByPage(dir === 'prev' ? -1 : 1)}
            disabled={disabled}
            aria-label={dir === 'prev' ? 'Previous products' : 'Next products'}
            className={`absolute top-[38%] hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-white/95 shadow-md transition hover:bg-white disabled:pointer-events-none disabled:opacity-0 lg:grid ${dir === 'prev' ? '-left-5' : '-right-5'}`}
          >
            {dir === 'prev' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        )
      })}
    </div>
  )
}
