import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { useLikes } from '@/context/LikesContext'

interface LikeButtonProps {
  productId: string
  productName: string
  /** Total likes for this product at page load (from the catalog) — shown next to the heart
   * for every product, regardless of whether an admin or a customer (resale) added it. */
  count?: number
  /** `card` floats over a product image; `inline` is a bordered button for the product page. */
  variant?: 'card' | 'inline'
  className?: string
}

/** Heart toggle for a product — signed-out visitors are sent to sign in first. */
export function LikeButton({ productId, productName, count = 0, variant = 'card', className = '' }: LikeButtonProps) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { isLiked, toggleLike } = useLikes()
  const navigate = useNavigate()
  const liked = isLiked(productId)
  // The catalog's count already includes this customer's own like if they'd liked it before this
  // page loaded — comparing against that original state keeps the number correct as they toggle,
  // without needing a fresh server round-trip just to re-count.
  const [likedAtMount] = useState(liked)
  const displayCount = Math.max(0, count + (liked ? 1 : 0) - (likedAtMount ? 1 : 0))

  const base =
    variant === 'card'
      ? 'grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur transition hover:bg-white'
      : 'grid h-12 w-12 shrink-0 place-items-center border border-ink transition-colors hover:bg-sand'

  const button = (
    <button
      type="button"
      aria-pressed={liked}
      aria-label={`${liked ? t('removeFromFavorites') : t('addToFavorites')} — ${productName}`}
      title={liked ? t('removeFromFavorites') : t('addToFavorites')}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!user) {
          navigate('/signin', { state: { from: window.location.pathname } })
          return
        }
        toggleLike(productId)
      }}
      className={base}
    >
      <Heart size={variant === 'card' ? 18 : 20} strokeWidth={1.6} className={`transition-all duration-200 ${liked ? 'scale-105 fill-sale text-sale' : ''}`} aria-hidden="true" />
    </button>
  )

  if (variant === 'inline') {
    return (
      <div className={`flex flex-col items-center gap-1 ${className}`}>
        {button}
        <span className="text-[0.6875rem] text-muted" aria-hidden="true">
          {displayCount}
        </span>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {button}
      {displayCount > 0 && (
        <span
          aria-hidden="true"
          className="absolute -bottom-1.5 start-1/2 min-w-[1.1rem] -translate-x-1/2 rounded-full bg-ink px-1 text-center text-[0.625rem] font-medium leading-[1.1rem] text-ivory"
        >
          {displayCount}
        </span>
      )}
    </div>
  )
}
