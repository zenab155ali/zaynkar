import { Link } from 'react-router-dom'
import { LikeButton } from '@/components/store/LikeButton'
import { ProductCardMedia } from '@/components/store/ProductCardMedia'
import { useCurrency } from '@/context/CurrencyContext'
import { useLanguage } from '@/context/LanguageContext'
import type { CatalogProduct } from '@/types/catalog'

/** The product tile used throughout the store grid — photo carousel, like button, code/name/price. */
export function ProductCard({ product }: { product: CatalogProduct }) {
  const { format } = useCurrency()
  const { pick } = useLanguage()
  const name = pick(product.name, product.nameHe)

  return (
    <article className="group relative">
      <Link to={`/store/${product.code}`} className="block">
        <ProductCardMedia product={product} />
      </Link>
      <LikeButton productId={product.id} productName={name} className="absolute end-2 top-2" />
      <Link to={`/store/${product.code}`} className="mt-3 block">
        <p className="font-mono text-[0.6875rem] text-muted" dir="ltr">
          {product.code}
        </p>
        <h2 className="text-sm leading-snug group-hover:underline">{name}</h2>
        <p className="mt-1 text-sm font-medium">{format(product.price)}</p>
      </Link>
    </article>
  )
}
