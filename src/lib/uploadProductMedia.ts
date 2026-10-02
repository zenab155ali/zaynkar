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

/** Uploads an admin-chosen photo or video to Supabase Storage and returns its public URL + type. */
export async function uploadProductMedia(file: File): Promise<{ url: string; type: MediaType }> {
  if (!supabase) throw new Error('Not connected to a database yet.')
  const type = mediaTypeOf(file)
  if (!type) throw new Error('Unsupported file type.')
  const ext = file.name.split('.').pop()?.toLowerCase() || (type === 'video' ? 'mp4' : 'jpg')
  const path = `${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from(PRODUCT_MEDIA_BUCKET).upload(path, file, { contentType: file.type, upsert: false })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from(PRODUCT_MEDIA_BUCKET).getPublicUrl(path)
  return { url: data.publicUrl, type }
}
