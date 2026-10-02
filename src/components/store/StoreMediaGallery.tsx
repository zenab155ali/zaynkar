import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Video } from 'lucide-react'
import type { ProductMedia } from '@/types/catalog'

interface StoreMediaGalleryProps {
  media: { url: string; type: ProductMedia['type'] }[]
  name: string
}

/** A simple photo/video gallery for the live store — swaps in a color's photo first when one is selected. */
export function StoreMediaGallery({ media, name }: StoreMediaGalleryProps) {
  const [active, setActive] = useState(0)

  useEffect(() => setActive(0), [media])

  if (media.length === 0) {
    return <div className="grid aspect-[3/4] place-items-center bg-sand text-taupe">No photo yet</div>
  }

  const current = media[active]
  const go = (delta: number) => setActive((i) => (i + delta + media.length) % media.length)

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse lg:gap-4">
      <div className="relative aspect-[3/4] flex-1 overflow-hidden bg-sand">
        {current.type === 'video' ? (
          <video src={current.url} className="h-full w-full object-cover" controls playsInline />
        ) : (
          <img src={current.url} alt={`${name} — view ${active + 1} of ${media.length}`} className="h-full w-full object-cover" />
        )}
        {media.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Previous" className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow">
              <ChevronLeft size={20} />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next" className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow">
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>
      {media.length > 1 && (
        <div className="flex gap-2 lg:w-20 lg:flex-col">
          {media.map((m, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show item ${i + 1}`}
              className={`relative grid aspect-[3/4] w-16 place-items-center overflow-hidden bg-sand transition lg:w-full ${i === active ? 'ring-1 ring-ink ring-offset-2 ring-offset-ivory' : 'opacity-70 hover:opacity-100'}`}
            >
              {m.type === 'video' ? <Video size={16} className="text-muted" /> : <img src={m.url} alt="" className="h-full w-full object-cover" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
