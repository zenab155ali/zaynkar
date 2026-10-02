import { useEffect, useRef, useState } from 'react'
import type { ProductImage } from '@/types'
import { imageSrcSet, imageUrl } from '@/utils/images'

interface SmartImageProps {
  image: ProductImage
  alt: string
  /** width / height of the requested crop. */
  ratio?: number
  widths?: number[]
  sizes?: string
  className?: string
  priority?: boolean
}

const DEFAULT_WIDTHS = [320, 480, 640, 800, 1080]

/**
 * Fills its (relatively positioned) parent. Fades in on load, and shows a neutral fallback if the image fails.
 * All URL building goes through utils/images.ts so demo images can be swapped centrally.
 */
export function SmartImage(props: SmartImageProps) {
  const { image, ratio = 3 / 4, widths = DEFAULT_WIDTHS } = props
  // Re-mount when the source changes so load state resets cleanly.
  return <SmartImageInner key={imageUrl(image, widths[0], ratio)} {...props} />
}

function SmartImageInner({ image, alt, ratio = 3 / 4, widths = DEFAULT_WIDTHS, sizes = '100vw', className = '', priority = false }: SmartImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  const ref = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const el = ref.current
    if (el?.complete && el.naturalWidth > 0) setStatus('loaded')
  }, [])

  if (status === 'error') {
    return (
      <div role="img" aria-label={alt} className="absolute inset-0 grid place-items-center bg-sand text-taupe">
        <span className="display text-4xl">Z</span>
      </div>
    )
  }

  return (
    <img
      ref={ref}
      src={imageUrl(image, widths[Math.floor(widths.length / 2)], ratio)}
      srcSet={imageSrcSet(image, widths, ratio)}
      sizes={sizes}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      onLoad={() => setStatus('loaded')}
      onError={() => setStatus('error')}
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'} ${className}`}
    />
  )
}
