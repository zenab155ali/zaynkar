import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2, Video } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { isPhotoReady, markPhotoReady, preloadPhoto, resizedImageUrl } from '@/utils/images'
import type { ProductMedia } from '@/types/catalog'

interface StoreMediaGalleryProps {
  media: { url: string; type: ProductMedia['type'] }[]
  name: string
}

/** How long a photo may take before any loading hint appears — fast loads never show one. */
const LOADING_HINT_DELAY_MS = 400

/**
 * A simple photo/video gallery for the live store — swaps in a color's photo first when one is selected.
 *
 * Speed: every photo of the product starts downloading the moment the page opens. When the shopper
 * picks another color/photo, it appears instantly if it's already downloaded; if not, the previous
 * photo stays on screen (never a blank box) and the new one replaces it the instant it's ready.
 */
export function StoreMediaGallery({ media, name }: StoreMediaGalleryProps) {
  const [active, setActive] = useState(0)
  const { t } = useLanguage()

  useEffect(() => setActive(0), [media])

  const current = media[active]
  const wantedUrl = current?.type === 'image' ? resizedImageUrl(current.url, 800) : null

  // The photo actually on screen. It only changes once the wanted photo is ready to paint.
  const [shownUrl, setShownUrl] = useState<string | null>(() => (wantedUrl && isPhotoReady(wantedUrl) ? wantedUrl : null))
  const [showHint, setShowHint] = useState(false)

  // Start downloading every photo of this product right away (current one first, at high priority).
  useEffect(() => {
    if (wantedUrl) void preloadPhoto(wantedUrl, true)
    for (const m of media) if (m.type === 'image') void preloadPhoto(resizedImageUrl(m.url, 800))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [media])

  useEffect(() => {
    if (!wantedUrl) return
    if (isPhotoReady(wantedUrl)) {
      setShownUrl(wantedUrl)
      setShowHint(false)
      return
    }
    let cancelled = false
    const hintTimer = window.setTimeout(() => !cancelled && setShowHint(true), LOADING_HINT_DELAY_MS)
    preloadPhoto(wantedUrl, true).then(() => {
      if (cancelled) return
      window.clearTimeout(hintTimer)
      setShownUrl(wantedUrl)
      setShowHint(false)
    })
    return () => {
      cancelled = true
      window.clearTimeout(hintTimer)
    }
  }, [wantedUrl])

  if (media.length === 0) {
    return <div className="grid aspect-[3/4] place-items-center bg-sand text-taupe">{t('noPhotoYet')}</div>
  }

  const go = (delta: number) => setActive((i) => (i + delta + media.length) % media.length)
  // Before the very first photo is ready, render the wanted photo directly so the browser paints it
  // progressively as it arrives (fastest possible first view) instead of waiting for a full preload.
  const displayUrl = shownUrl ?? wantedUrl
  const stillLoading = wantedUrl !== null && shownUrl !== wantedUrl

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse lg:gap-4">
      <div className="relative aspect-[3/4] flex-1 overflow-hidden bg-sand">
        {current.type === 'video' ? (
          <video src={current.url} className="h-full w-full object-contain" controls playsInline />
        ) : (
          displayUrl && (
            <img
              src={displayUrl}
              alt={`${name} — view ${active + 1} of ${media.length}`}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-contain"
              onLoad={() => {
                markPhotoReady(displayUrl)
                if (displayUrl === wantedUrl) {
                  setShownUrl(displayUrl)
                  setShowHint(false)
                }
              }}
            />
          )
        )}
        {stillLoading && showHint && (
          shownUrl ? (
            // A previous photo is still visible — just a small, unobtrusive spinner in the corner.
            <div className="absolute bottom-3 start-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow" aria-label={t('photoLoading')}>
              <Loader2 size={18} className="animate-spin text-mocha" aria-hidden="true" />
            </div>
          ) : (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2">
              <Loader2 size={28} className="animate-spin text-mocha" aria-hidden="true" />
              <p className="px-4 text-center text-xs font-medium text-mocha">{t('photoLoading')}</p>
            </div>
          )
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
              {m.type === 'video' ? <Video size={16} className="text-muted" /> : <img src={resizedImageUrl(m.url, 160)} alt="" decoding="async" className="h-full w-full object-cover" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
