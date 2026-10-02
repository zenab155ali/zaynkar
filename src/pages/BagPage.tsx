import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Trash2 } from 'lucide-react'
import { OrderSummary } from '@/components/bag/OrderSummary'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { EmptyState } from '@/components/ui/EmptyState'
import { SmartImage } from '@/components/ui/SmartImage'
import { PriceTag } from '@/components/product/PriceTag'
import { ProductCarousel } from '@/components/product/ProductCarousel'
import { QuantityStepper } from '@/components/product/QuantityStepper'
import { FREE_SHIPPING_THRESHOLD } from '@/config'
import { useCart } from '@/context/CartContext'
import { useCurrency } from '@/context/CurrencyContext'
import { PRODUCTS } from '@/data/products'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { similarProducts } from '@/utils/recommend'

export default function BagPage() {
  useDocumentTitle('Shopping Bag')
  const navigate = useNavigate()
  const { format } = useCurrency()
  const { lines, count, subtotal, shipping, total, remove, setQuantity, setSize } = useCart()

  const suggestions = useMemo(
    () => (lines.length ? similarProducts(lines[0].product, 8) : [...PRODUCTS].sort((a, b) => b.sales - a.sales).slice(0, 8)),
    [lines],
  )

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)

  if (lines.length === 0) {
    return (
      <div className="container-page pt-4 sm:pt-6">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Shopping Bag' }]} />
        <EmptyState
          icon={<ShoppingBag size={28} strokeWidth={1.3} />}
          title="Your bag is empty"
          description="Looks like you haven’t added anything yet. Discover new arrivals from sellers around the world."
        >
          <Link to="/shop/new-in" className="btn btn-primary">
            Shop new in
          </Link>
          <Link to="/shop/women" className="btn btn-outline">
            Browse women
          </Link>
        </EmptyState>
        <section aria-labelledby="bag-suggest" className="border-t border-line py-12">
          <h2 id="bag-suggest" className="display mb-8 text-3xl">
            Trending right now
          </h2>
          <ProductCarousel products={suggestions} label="Trending products" />
        </section>
      </div>
    )
  }

  return (
    <div className="container-page pt-4 sm:pt-6">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Shopping Bag' }]} />
      <h1 className="display mt-5 text-4xl sm:text-5xl">
        Shopping Bag <span className="text-2xl text-muted sm:text-3xl">({count})</span>
      </h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-14">
        <section aria-label="Items in your bag">
          <ul className="divide-y divide-line border-y border-line">
            {lines.map((line) => {
              const { product } = line
              return (
                <li key={line.id} className="flex gap-4 py-6 sm:gap-6">
                  <Link to={`/product/${product.slug}`} className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden bg-sand sm:w-32">
                    <SmartImage image={product.images[0]} alt={product.name} widths={[240, 400]} sizes="128px" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-muted">Sold by {product.brand}</p>
                        <h2 className="mt-1 text-sm leading-snug sm:text-base">
                          <Link to={`/product/${product.slug}`} className="hover:underline">
                            {product.name}
                          </Link>
                        </h2>
                        <p className="mt-1 text-xs text-muted">Colour: {line.color}</p>
                      </div>
                      <p className="shrink-0 text-sm font-medium">{format(product.price * line.quantity)}</p>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
                      <div>
                        <label htmlFor={`size-${line.id}`} className="sr-only">
                          Size for {product.name}
                        </label>
                        <select id={`size-${line.id}`} value={line.size} onChange={(e) => setSize(line.id, e.target.value)} disabled={product.sizes.length === 1} className="field !h-9 !w-auto pr-7 text-[0.8125rem]">
                          {product.sizes.map((s) => (
                            <option key={s} value={s} disabled={product.unavailableSizes.includes(s) && s !== line.size}>
                              Size: {s}
                              {product.unavailableSizes.includes(s) ? ' (sold out)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                      <QuantityStepper compact value={line.quantity} onChange={(q) => setQuantity(line.id, q)} label={`Quantity for ${product.name}`} />
                      <PriceTag product={product} className="text-muted" />
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(line.id)}
                      aria-label={`Remove ${product.name} from bag`}
                      className="mt-auto inline-flex items-center gap-1.5 self-start pt-4 text-xs text-muted transition-colors hover:text-sale"
                    >
                      <Trash2 size={14} aria-hidden="true" /> Remove
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
          <Link to="/shop/women" className="mt-6 inline-block text-xs font-medium uppercase tracking-[0.14em]">
            <span className="link-underline">← Continue shopping</span>
          </Link>
        </section>

        <aside aria-label="Order summary" className="h-fit bg-sand/60 p-6 lg:sticky lg:top-36">
          <h2 className="display mb-5 text-2xl">Order summary</h2>

          <div className="mb-6">
            <p className="text-xs text-muted" aria-live="polite">
              {remaining > 0 ? (
                <>
                  Add <strong className="text-ink">{format(remaining)}</strong> more for free shipping
                </>
              ) : (
                <strong className="text-success">You’ve unlocked free shipping</strong>
              )}
            </p>
            <div className="mt-2 h-1 bg-sand-deep" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)} aria-label="Progress to free shipping">
              <div className="h-full bg-ink transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <OrderSummary lines={lines} subtotal={subtotal} shipping={shipping} total={total} />

          <button type="button" onClick={() => navigate('/checkout')} className="btn btn-primary mt-6 !h-14 w-full text-[0.8125rem]">
            Proceed to checkout
          </button>
          <p className="mt-3 text-center text-xs text-muted">Demo checkout — no payment is processed.</p>
        </aside>
      </div>

      <section aria-labelledby="bag-like" className="mt-16 border-t border-line py-12">
        <h2 id="bag-like" className="display mb-8 text-3xl sm:text-4xl">
          You May Also Like
        </h2>
        <ProductCarousel products={suggestions} label="You may also like" />
      </section>
    </div>
  )
}
