import { Link } from 'react-router-dom'
import { SmartImage } from '@/components/ui/SmartImage'
import { useCurrency } from '@/context/CurrencyContext'
import type { CartLineDetailed } from '@/context/CartContext'

interface OrderSummaryProps {
  lines: CartLineDetailed[]
  subtotal: number
  shipping: number
  total: number
  /** Show the line items (checkout) or just totals (bag). */
  showItems?: boolean
  shippingLabel?: string
}

export function OrderSummary({ lines, subtotal, shipping, total, showItems = false, shippingLabel = 'Shipping (estimated)' }: OrderSummaryProps) {
  const { format } = useCurrency()
  return (
    <div>
      {showItems && (
        <ul className="mb-5 max-h-72 space-y-4 overflow-y-auto border-b border-line pb-5 pr-1">
          {lines.map((l) => (
            <li key={l.id} className="flex gap-3">
              <div className="relative h-20 w-[3.75rem] shrink-0 overflow-hidden bg-sand">
                <SmartImage image={l.product.images[0]} alt="" widths={[120, 200]} sizes="60px" />
                <span className="absolute -right-0 -top-0 grid h-5 min-w-5 place-items-center bg-ink px-1 text-[0.6875rem] text-ivory">{l.quantity}</span>
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <Link to={`/product/${l.product.slug}`} className="line-clamp-2 leading-snug hover:underline">
                  {l.product.name}
                </Link>
                <p className="mt-0.5 text-xs text-muted">
                  {l.color} · {l.size}
                </p>
              </div>
              <p className="text-sm">{format(l.product.price * l.quantity)}</p>
            </li>
          ))}
        </ul>
      )}
      <dl className="space-y-2.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal</dt>
          <dd>{format(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">{shippingLabel}</dt>
          <dd>{shipping === 0 ? 'Free' : format(shipping)}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-4 text-base font-medium">
          <dt>Total</dt>
          <dd>{format(total)}</dd>
        </div>
      </dl>
    </div>
  )
}
