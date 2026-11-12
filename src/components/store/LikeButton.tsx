import { Heart } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { useLikes } from '@/context/LikesContext'

interface LikeButtonProps {
  productId: string
  productName: string
  /** `card` floats over a product image; `inline` is a bordered button for the product page. */
  variant?: 'card' | 'inline'
  className?: string
}

/** Heart toggle for a product — works for signed-in customers and guests alike. Deliberately
 * private: a customer never sees how many other people liked a product, only their own heart. */
export function LikeButton({ productId, productName, variant = 'card', className = '' }: LikeButtonProps) {
  const { t } = useLanguage()
  const { isLiked, toggleLike } = useLikes()
  const liked = isLiked(productId)

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
        toggleLike(productId)
      }}
      className={base}
    >
      <Heart size={variant === 'card' ? 18 : 20} strokeWidth={1.6} className={`transition-all duration-200 ${liked ? 'scale-105 fill-sale text-sale' : ''}`} aria-hidden="true" />
    </button>
  )

  return <div className={className}>{button}</div>
}
