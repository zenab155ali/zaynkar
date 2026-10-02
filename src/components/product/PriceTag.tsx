import { useCurrency } from '@/context/CurrencyContext'
import type { Product } from '@/types'

interface PriceTagProps {
  product: Pick<Product, 'price' | 'oldPrice' | 'discount'>
  size?: 'sm' | 'lg'
  className?: string
}

export function PriceTag({ product, size = 'sm', className = '' }: PriceTagProps) {
  const { format } = useCurrency()
  const large = size === 'lg'
  return (
    <p className={`flex flex-wrap items-baseline gap-x-2 gap-y-0.5 ${className}`}>
      <span className="sr-only">Current price:</span>
      <span className={`${large ? 'text-xl' : 'text-sm'} font-medium ${product.oldPrice ? 'text-sale' : ''}`}>{format(product.price)}</span>
      {product.oldPrice && (
        <>
          <span className="sr-only">Previous price:</span>
          <span className={`${large ? 'text-base' : 'text-xs'} text-muted line-through`}>{format(product.oldPrice)}</span>
          <span className={`${large ? 'text-sm' : 'text-xs'} font-medium text-sale`}>
            <span className="sr-only">Discount:</span>-{product.discount}%
          </span>
        </>
      )}
    </p>
  )
}
