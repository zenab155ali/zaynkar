import { IMAGE_LIBRARY, type ImageKey } from '@/data/imageLibrary'
import type { ImageFocus, ProductImage } from '@/types'

/**
 * The ONLY place that turns an image reference into a URL.
 * Swap this (e.g. to your own CDN / image proxy) and every image on the site follows.
 */
const DEMO_IMAGE_BASE = 'https://images.unsplash.com/photo-'

// Real product photos are uploaded as-is (often multi-hundred-KB PNGs straight from a phone camera)
// to this exact Supabase Storage path. Supabase can resize + re-encode them on the fly through its
// "render" endpoint — swapping the url to it and adding a target width cuts a typical photo by ~90%
// (PNG → WebP + a sane resolution), which is most of why the store used to feel slow to load.
const SUPABASE_STORAGE_OBJECT_PATH = '/storage/v1/object/public/'
const SUPABASE_STORAGE_RENDER_PATH = '/storage/v1/render/image/public/'

/** Resizes and re-encodes a real (Supabase Storage) product photo URL; any other URL is returned unchanged. */
export function resizedImageUrl(url: string, width: number): string {
  if (!url.includes(SUPABASE_STORAGE_OBJECT_PATH)) return url
  const rendered = url.replace(SUPABASE_STORAGE_OBJECT_PATH, SUPABASE_STORAGE_RENDER_PATH)
  const params = new URLSearchParams({ width: String(Math.round(width)), quality: '75', format: 'webp' })
  return `${rendered}?${params.toString()}`
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
