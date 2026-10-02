import type { Product } from '@/types'
import { ProductCard } from '@/components/product/ProductCard'

export type GridLayout = 'roomy' | 'dense'

export const GRID_CLASSES: Record<GridLayout, string> = {
  roomy: 'grid grid-cols-1 gap-x-4 gap-y-10 xs:grid-cols-2 lg:grid-cols-3 lg:gap-x-6',
  dense: 'grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 xl:grid-cols-4',
}

interface ProductGridProps {
  products: Product[]
  layout?: GridLayout
  className?: string
}

export function ProductGrid({ products, layout = 'dense', className }: ProductGridProps) {
  return (
    <div className={className ?? GRID_CLASSES[layout]}>
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < 4} />
      ))}
    </div>
  )
}
