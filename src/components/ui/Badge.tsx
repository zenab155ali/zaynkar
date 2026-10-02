import type { Product, ProductBadge } from '@/types'

const STYLES: Record<ProductBadge, string> = {
  NEW: 'bg-ink text-ivory',
  BESTSELLER: 'bg-ivory text-ink ring-1 ring-inset ring-ink/20',
  SALE: 'bg-sale text-white',
}

export function getBadges(product: Product): ProductBadge[] {
  const badges: ProductBadge[] = []
  if (product.discount) badges.push('SALE')
  if (product.isNew) badges.push('NEW')
  if (product.bestseller) badges.push('BESTSELLER')
  return badges
}

export function Badge({ kind }: { kind: ProductBadge }) {
  return (
    <span className={`inline-block px-2 py-1 text-[0.625rem] font-medium leading-none tracking-[0.14em] ${STYLES[kind]}`}>
      {kind}
    </span>
  )
}
