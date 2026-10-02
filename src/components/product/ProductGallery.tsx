import { useRef, useState, type MouseEvent, type TouchEvent } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ProductImage } from '@/types'
import { SmartImage } from '@/components/ui/SmartImage'

interface ProductGalleryProps {
  images: ProductImage[]
  name: string
}

/** Thumbnails + main image. Swipe on touch, arrows/keys for keyboard, hover-zoom on desktop. */
export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [active, setActive] = useState(0)
  const [origin, setOrigin] = useState('50% 50%')
  const touchStart = useRef<number | null>(null)

  const go = (delta: number) => setActive((i) => (i + delta + images.length) % images.length)

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setOrigin(`${((e.clientX - rect.left) / rect.width) * 100}% ${((e.clientY - rect.top) / rect.height) * 100}%`)
  }
  const onTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (touchStart.current === null) return
    const dx = e.changedTouches[0].clientX - touchStart.current
    touchStart.current = null
    if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1)
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse lg:gap-4">
      <div
        className="group relative aspect-[3/4] flex-1 overflow-hidden bg-sand lg:cursor-zoom-in"
        onMouseMove={onMouseMove}
        onTouchStart={(e) => (touchStart.current = e.touches[0].clientX)}
        onTouchEnd={onTouchEnd}
        role="group"
        aria-roledescription="carousel"
        aria-label={`${name} images`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') go(1)
          if (e.key === 'ArrowLeft') go(-1)
        }}
      >
        <div className="absolute inset-0 transition-transform duration-300 ease-out lg:group-hover:scale-[1.7]" style={{ transformOrigin: origin }}>
          <SmartImage image={images[active]} alt={`${name} — view ${active + 1} of ${images.length}`} ratio={3 / 4} widths={[480, 720, 960, 1280]} sizes="(min-width: 1024px) 45vw, 100vw" priority />
        </div>

        {images.length > 1 && (
          <>
            {(['prev', 'next'] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => go(dir === 'prev' ? -1 : 1)}
                aria-label={dir === 'prev' ? 'Previous image' : 'Next image'}
                className={`absolute top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow transition hover:bg-white ${dir === 'prev' ? 'left-3' : 'right-3'} lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100`}
              >
                {dir === 'prev' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              </button>
            ))}
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 lg:hidden" aria-hidden="true">
              {images.map((_, i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all ${i === active ? 'w-5 bg-ink' : 'w-1.5 bg-ink/30'}`} />
              ))}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 lg:w-20 lg:flex-col" role="tablist" aria-label="Choose product image">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Show image ${i + 1}`}
              onClick={() => setActive(i)}
              className={`relative aspect-[3/4] w-16 overflow-hidden bg-sand transition lg:w-full ${i === active ? 'ring-1 ring-ink ring-offset-2 ring-offset-ivory' : 'opacity-70 hover:opacity-100'}`}
            >
              <SmartImage image={img} alt="" widths={[120, 200]} sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
