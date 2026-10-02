import { memo } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '@/types'
import { Badge, getBadges } from '@/components/ui/Badge'
import { SmartImage } from '@/components/ui/SmartImage'
import { ColorSwatches } from '@/components/product/ColorSwatches'
import { CountryBadge } from '@/components/product/CountryBadge'
import { FavoriteButton } from '@/components/product/FavoriteButton'
import { PriceTag } from '@/components/product/PriceTag'

interface ProductCardProps {
  product: Product
  /** `sizes` attribute for responsive images. */
  sizes?: string
  priority?: boolean
}

const DEFAULT_SIZES = '(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw'

function ProductCardBase({ product, sizes = DEFAULT_SIZES, priority = false }: ProductCardProps) {
  const href = `/product/${product.slug}`
  const badges = getBadges(product).slice(0, 2)
  const hoverImage = product.images[1]

  return (
    <article className="group relative">
      <Link to={href} tabIndex={-1} aria-hidden="true" className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-sand">
          <SmartImage image={product.images[0]} alt="" sizes={sizes} priority={priority} className="transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
          {hoverImage && (
            <div className="absolute inset-0 hidden opacity-0 transition-opacity duration-500 md:block md:group-hover:opacity-100">
              <SmartImage image={hoverImage} alt="" sizes={sizes} />
            </div>
          )}
        </div>
      </Link>

      {badges.length > 0 && (
        <div className="pointer-events-none absolute left-2 top-2 flex flex-col items-start gap-1">
          {badges.map((b) => (
            <Badge key={b} kind={b} />
          ))}
        </div>
      )}
      <FavoriteButton productId={product.id} productName={product.name} className="absolute right-2 top-2" />

      <div className="mt-3 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-muted">{product.brand}</p>
          <CountryBadge code={product.country} />
        </div>
        <h3 className="text-sm leading-snug">
          <Link to={href} className="line-clamp-2 hover:underline">
            {product.name}
          </Link>
        </h3>
        <PriceTag product={product} />
        <ColorSwatches colors={product.colors} />
      </div>
    </article>
  )
}

export const ProductCard = memo(ProductCardBase)
