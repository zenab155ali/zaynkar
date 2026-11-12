import { IMAGE_LIBRARY, type ImageKey } from '@/data/imageLibrary'
import type { ImageFocus, ProductImage } from '@/types'

/**
 * The ONLY place that turns an image reference into a URL.
 * Swap this (e.g. to your own CDN / image proxy) and every image on the site follows.
 */
const DEMO_IMAGE_BASE = 'https://images.unsplash.com/photo-'

// Supabase's on-the-fly image-render endpoint (resize + re-encode to WebP) cut a typical photo by
// ~90% in testing, but turned out unreliable at real browsing volume — photos intermittently failed
// to load at all on a phone. Disabled for now (passes the original URL through unchanged) until a
// more reliable approach (most likely: compressing photos once at upload time instead of on every
// view) replaces it. Kept as a single pass-through function so every call site is already wired up.
export function resizedImageUrl(url: string, _width: number): string {
  return url
}

export const keyImage = (key: ImageKey, focus?: ImageFocus): ProductImage => ({ key, focus })

/**
 * @param width  target width in px
 * @param ratio  width / height (e.g. 3 / 4 for portrait product cards). Omit for natural ratio.
 */
export function imageUrl(image: ProductImage, width: number, ratio?: number): string {
  if (image.url) return resizedImageUrl(image.url, width)
  if (!image.key) return ''

  const params = new URLSearchParams({ auto: 'format', fit: 'crop', q: '75', w: String(Math.round(width)) })
  if (ratio) params.set('h', String(Math.round(width / ratio)))
  if (image.focus && ratio) {
    params.set('crop', 'focalpoint')
    params.set('fp-x', image.focus.x.toFixed(2))
    params.set('fp-y', image.focus.y.toFixed(2))
    params.set('fp-z', String(image.focus.zoom ?? 1))
  }
  return `${DEMO_IMAGE_BASE}${IMAGE_LIBRARY[image.key]}?${params.toString()}`
}

export function imageSrcSet(image: ProductImage, widths: number[], ratio?: number): string | undefined {
  if (image.url) return undefined
  return widths.map((w) => `${imageUrl(image, w, ratio)} ${w}w`).join(', ')
}

// ── Photo preloading ────────────────────────────────────────────────────────────────────────────
// Remembers which photo URLs the browser has already fully downloaded + decoded, so the product
// gallery can swap to them instantly (no loading screen) and only waits for photos it truly lacks.
const readyPhotos = new Set<string>()
const pendingPhotos = new Map<string, Promise<void>>()

export function isPhotoReady(url: string): boolean {
  return readyPhotos.has(url)
}

export function markPhotoReady(url: string): void {
  readyPhotos.add(url)
}

/** Downloads + decodes a photo in the background. Safe to call many times for the same URL. */
export function preloadPhoto(url: string, highPriority = false): Promise<void> {
  if (!url || readyPhotos.has(url)) return Promise.resolve()
  const existing = pendingPhotos.get(url)
  if (existing) return existing
  const img = new Image()
  if (highPriority) img.fetchPriority = 'high'
  img.decoding = 'async'
  const done = new Promise<void>((resolve) => {
    img.onload = () => {
      // decode() makes sure the photo is ready to paint, so showing it later causes no flash.
      img
        .decode()
        .catch(() => undefined)
        .finally(() => {
          readyPhotos.add(url)
          pendingPhotos.delete(url)
          resolve()
        })
    }
    img.onerror = () => {
      pendingPhotos.delete(url)
      resolve()
    }
  })
  img.src = url
  pendingPhotos.set(url, done)
  return done
}
