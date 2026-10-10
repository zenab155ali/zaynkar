import { PRODUCT_MEDIA_BUCKET, supabase } from '@/lib/supabase'
import type { MediaType } from '@/types/catalog'

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']

export function mediaTypeOf(file: File): MediaType | null {
  if (ACCEPTED_IMAGE_TYPES.includes(file.type)) return 'image'
  if (ACCEPTED_VIDEO_TYPES.includes(file.type)) return 'video'
  return null
}

export function validateMediaFile(file: File, allowVideo: boolean): string | null {
  const type = mediaTypeOf(file)
  if (!type || (type === 'video' && !allowVideo)) {
    return allowVideo ? 'Please choose a JPG, PNG, WEBP image or MP4/WEBM/MOV video.' : 'Please choose a JPG, PNG or WEBP image.'
  }
  const limit = type === 'video' ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES
  if (file.size > limit) return `That file is larger than ${limit / 1024 / 1024} MB — please choose a smaller one.`
  return null
}

const MAX_IMAGE_DIMENSION = 1600

/**
 * Shrinks + re-encodes a photo to WebP right in the browser, once, before it's ever uploaded —
 * phone-camera photos are often several thousand pixels wide and several hundred KB; customers
 * never need more than ~1600px. Compressing at upload time (instead of resizing on every view later)
 * means there's no ongoing service the live site depends on for photos to load reliably.
 */
async function compressImageBlob(blob: Blob, name: string): Promise<File> {
  try {
    const bitmap = await createImageBitmap(blob)
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return new File([blob], name)
    ctx.drawImage(bitmap, 0, 0, width, height)
    const out = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.82))
    if (!out || out.size >= blob.size) return new File([blob], name)
    return new File([out], name.replace(/\.[^./\\]+$/, '') + '.webp', { type: 'image/webp' })
  } catch {
    // Compression is a nice-to-have, not a requirement — if anything here fails
    // (unsupported format, out of memory, etc.), just keep the original file.
    return new File([blob], name)
  }
}

/** Uploads an admin-chosen photo or video to Supabase Storage and returns its public URL + type. */
export async function uploadProductMedia(file: File): Promise<{ url: string; type: MediaType }> {
  if (!supabase) throw new Error('Not connected to a database yet.')
  const type = mediaTypeOf(file)
  if (!type) throw new Error('Unsupported file type.')
  const uploadFile = type === 'image' ? await compressImageBlob(file, file.name) : file
  const ext = uploadFile.name.split('.').pop()?.toLowerCase() || (type === 'video' ? 'mp4' : 'jpg')
  const path = `${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from(PRODUCT_MEDIA_BUCKET).upload(path, uploadFile, { contentType: uploadFile.type, upsert: false })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from(PRODUCT_MEDIA_BUCKET).getPublicUrl(path)
  return { url: data.publicUrl, type }
}

/**
 * Re-compresses a photo that's already in storage (from before upload-time compression existed):
 * downloads it, shrinks + re-encodes it the same way, uploads the result as a new file, and returns
 * its URL — the caller is responsible for updating whichever row pointed at the old URL. Returns null
 * if the photo is already small (nothing to gain) or something went wrong, so the original is kept.
 */
export async function recompressExistingPhoto(url: string): Promise<string | null> {
  if (!supabase) return null
  if (url.endsWith('.webp')) return null // already compressed by this same tool
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const blob = await res.blob()
    const compressed = await compressImageBlob(blob, 'photo.jpg')
    if (compressed.type !== 'image/webp') return null // no meaningful size win — leave the original alone
    const path = `${crypto.randomUUID()}.webp`
    const { error } = await supabase.storage.from(PRODUCT_MEDIA_BUCKET).upload(path, compressed, { contentType: 'image/webp', upsert: false })
    if (error) return null
    const { data } = supabase.storage.from(PRODUCT_MEDIA_BUCKET).getPublicUrl(path)
    return data.publicUrl
  } catch {
    return null
  }
}
