import { Link, useLocation, useParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { useCurrency } from '@/context/CurrencyContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { getOrder } from '@/utils/orders'
import NotFoundPage from '@/pages/NotFoundPage'
import type { Order } from '@/types'

export default function OrderConfirmationPage() {
  useDocumentTitle('Order confirmed')
  const { id = '' } = useParams()
  const location = useLocation()
  const { format } = useCurrency()

  const fromState = (location.state as { order?: Order } | null)?.order
  const order = fromState?.id === id ? fromState : getOrder(id)
  if (!order) return <NotFoundPage />

  return (
    <div className="container-page py-12 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <CheckCircle2 size={44} strokeWidth={1.2} className="mx-auto text-success" aria-hidden="true" />
        <p className="eyebrow mt-6">Demo order placed</p>
        <h1 className="display mt-2 text-4xl sm:text-6xl">Thank you</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Your demo order <strong className="text-ink">{order.id}</strong> was created. This is a prototype — no payment was taken and nothing will ship.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-2xl border border-line bg-white p-6 sm:p-8">
        <h2 className="display text-2xl">Order details</h2>
        <ul className="mt-4 divide-y divide-line">
          {order.items.map((item) => (
            <li key={`${item.productId}-${item.size}-${item.color}`} className="flex items-start justify-between gap-4 py-3 text-sm">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-muted">
                  {item.brand} · {item.color} · {item.size} · Qty {item.quantity}
                </p>
              </div>
              <p>{format(item.price * item.quantity)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd>{format(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Shipping ({order.deliveryMethod})</dt>
            <dd>{order.shipping === 0 ? 'Free' : format(order.shipping)}</dd>
          </div>
          <div className="flex justify-between text-base font-medium">
            <dt>Total</dt>
            <dd>{format(order.total)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link to="/account/orders" className="btn btn-outline">
          View my orders
        </Link>
        <Link to="/shop/new-in" className="btn btn-primary">
          Continue shopping
        </Link>
      </div>
    </div>
  )
}
