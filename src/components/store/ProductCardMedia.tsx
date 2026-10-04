import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react'
import type { CatalogProduct } from '@/types/catalog'

/** Cover photo first, then each color's own photo (deduplicated) — lets customers swipe through colors right from the grid. */
function galleryImages(product: CatalogProduct): string[] {
  const seen = new Set<string>()
  const images: string[] = []
  for (const m of product.media) {
    if (m.type === 'image' && !seen.has(m.url)) {
      seen.add(m.url)
      images.push(m.url)
    }
  }
  for (const c of product.colors) {
    if (c.photoUrl && !seen.has(c.photoUrl)) {
      seen.add(c.photoUrl)
      images.push(c.photoUrl)
    }
  }
  return images
}

const SWIPE_THRESHOLD = 40

export function ProductCardMedia({ product }: { product: CatalogProduct }) {
  const images = galleryImages(product)
  const [index, setIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const swiped = useRef(false)

  const go = (delta: number) => setIndex((i) => (i + delta + images.length) % images.length)

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    swiped.current = false
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      swiped.current = true
      go(delta > 0 ? -1 : 1)
    }
    touchStartX.current = null
  }
  // Swallows the click that follows a swipe, so it doesn't also navigate to the product page.
  const onClickCapture = (e: React.MouseEvent) => {
    if (swiped.current) {
      e.preventDefault()
      e.stopPropagation()
      swiped.current = false
    }
  }

  if (images.length === 0) {
    return <div className="relative aspect-[3/4] overflow-hidden bg-sand" />
  }

  return (
    <div className="relative aspect-[3/4] overflow-hidden bg-sand" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} onClickCapture={onClickCapture}>
      <img
        src={images[index]}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        style={index === 0 ? { objectPosition: `${product.coverFocalX}% ${product.coverFocalY}%` } : undefined}
      />

      {product.colors.length > 1 && (
        <span className="absolute start-2 top-2 flex items-center gap-1 rounded-full bg-ivory/90 px-2 py-1 text-[0.625rem] font-medium text-ink shadow-sm">
          <Layers size={11} aria-hidden="true" /> {product.colors.length}
        </span>
      )}

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              go(-1)
            }}
            aria-label="الصورة السابقة"
            className="absolute left-1 top-1/2 hidden h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-ivory/90 text-ink opacity-0 shadow-sm transition-opacity group-hover:opacity-100 sm:grid"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              go(1)
            }}
            aria-label="الصورة التالية"
            className="absolute right-1 top-1/2 hidden h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-ivory/90 text-ink opacity-0 shadow-sm transition-opacity group-hover:opacity-100 sm:grid"
          >
            <ChevronRight size={14} />
          </button>
          <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-1">
            {images.map((_, i) => (
              <span key={i} className={`h-1 w-1 rounded-full transition-all ${i === index ? 'w-3 bg-ivory' : 'bg-ivory/60'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
