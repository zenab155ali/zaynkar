import { IMAGE_LIBRARY, type ImageKey } from '@/data/imageLibrary'
import type { ImageFocus, ProductImage } from '@/types'

/**
 * The ONLY place that turns an image reference into a URL.
 * Swap this (e.g. to your own CDN / image proxy) and every image on the site follows.
 */
const DEMO_IMAGE_BASE = 'https://images.unsplash.com/photo-'

export const keyImage = (key: ImageKey, focus?: ImageFocus): ProductImage => ({ key, focus })

/**
 * @param width  target width in px
 * @param ratio  width / height (e.g. 3 / 4 for portrait product cards). Omit for natural ratio.
 */
export function imageUrl(image: ProductImage, width: number, ratio?: number): string {
  if (image.url) return image.url
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
