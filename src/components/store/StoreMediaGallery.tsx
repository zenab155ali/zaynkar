import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2, Video } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { resizedImageUrl } from '@/utils/images'
import type { ProductMedia } from '@/types/catalog'

interface StoreMediaGalleryProps {
  media: { url: string; type: ProductMedia['type'] }[]
  name: string
}

/** A simple photo/video gallery for the live store — swaps in a color's photo first when one is selected. */
export function StoreMediaGallery({ media, name }: StoreMediaGalleryProps) {
  const [active, setActive] = useState(0)
  const [photoLoaded, setPhotoLoaded] = useState(false)
  const { t } = useLanguage()

  useEffect(() => setActive(0), [media])

  const current = media[active]
  // Resets the loading state the instant the photo being shown changes (new color, arrow, thumbnail) —
  // keyed on the url itself so it fires even if `active` stays 0 but the underlying photo changed.
  useEffect(() => setPhotoLoaded(false), [current?.url])

  if (media.length === 0) {
    return <div className="grid aspect-[3/4] place-items-center bg-sand text-taupe">{t('noPhotoYet')}</div>
  }

  const go = (delta: number) => setActive((i) => (i + delta + media.length) % media.length)

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse lg:gap-4">
      <div className="relative aspect-[3/4] flex-1 overflow-hidden bg-sand">
        {current.type === 'video' ? (
          <video src={current.url} className="h-full w-full object-contain" controls playsInline />
        ) : (
          <img
            src={resizedImageUrl(current.url, 800)}
            alt={`${name} — view ${active + 1} of ${media.length}`}
            className={`h-full w-full object-contain transition-opacity duration-300 ${photoLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setPhotoLoaded(true)}
            onError={() => setPhotoLoaded(true)}
          />
        )}
        {current.type === 'image' && !photoLoaded && (
          <div className="absolute inset-0 flex animate-pulse flex-col items-center justify-center gap-2 bg-sand/90">
            <Loader2 size={28} className="animate-spin text-mocha" aria-hidden="true" />
            <p className="px-4 text-center text-xs font-medium text-mocha">{t('photoLoading')}</p>
          </div>
        )}
        {media.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label={t('previous')} className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow">
              <ChevronLeft size={20} />
            </button>
            <button type="button" onClick={() => go(1)} aria-label={t('next')} className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow">
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
              aria-label={`${t('viewImageN')} ${i + 1}`}
              className={`relative grid aspect-[3/4] w-16 place-items-center overflow-hidden bg-sand transition lg:w-full ${i === active ? 'ring-1 ring-ink ring-offset-2 ring-offset-ivory' : 'opacity-70 hover:opacity-100'}`}
            >
              {m.type === 'video' ? <Video size={16} className="text-muted" /> : <img src={resizedImageUrl(m.url, 160)} alt="" className="h-full w-full object-cover" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
