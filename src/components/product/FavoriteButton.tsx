import { Heart } from 'lucide-react'
import { useFavorites } from '@/context/FavoritesContext'

interface FavoriteButtonProps {
  productId: string
  productName: string
  /** `card` floats over an image; `inline` is a bordered button for product pages. */
  variant?: 'card' | 'inline'
  className?: string
}

export function FavoriteButton({ productId, productName, variant = 'card', className = '' }: FavoriteButtonProps) {
  const { has, toggle } = useFavorites()
  const active = has(productId)
  const label = active ? `Remove ${productName} from favorites` : `Add ${productName} to favorites`

  const base =
    variant === 'card'
      ? 'grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur transition hover:bg-white'
      : 'grid h-12 w-12 shrink-0 place-items-center border border-ink transition-colors hover:bg-sand'

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      title={active ? 'Remove from favorites' : 'Add to favorites'}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle(productId)
      }}
      className={`${base} ${className}`}
    >
      <Heart
        size={variant === 'card' ? 18 : 20}
        strokeWidth={1.6}
        className={`transition-all duration-200 ${active ? 'scale-105 fill-sale text-sale' : ''}`}
        aria-hidden="true"
      />
    </button>
  )
}
