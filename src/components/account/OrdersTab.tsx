import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { SmartImage } from '@/components/ui/SmartImage'
import { useCurrency } from '@/context/CurrencyContext'
import { getProduct } from '@/data/products'
import { loadOrders } from '@/utils/orders'
import type { OrderStatus } from '@/types'

const STATUS_STYLES: Record<OrderStatus, string> = {
  Processing: 'bg-sand text-mocha',
  Shipped: 'bg-[#e4ecf5] text-[#2c4a72]',
  Delivered: 'bg-[#e3efe7] text-success',
}

const formatDate = (iso: string): string => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

export function OrdersTab() {
  const { format } = useCurrency()
  const orders = useMemo(() => loadOrders(), [])

  if (orders.length === 0) {
    return (
      <EmptyState icon={<Package size={26} strokeWidth={1.3} />} title="No orders yet" description="When you place an order it will appear here.">
        <Link to="/shop/new-in" className="btn btn-primary">
          Start shopping
        </Link>
      </EmptyState>
    )
  }

  return (
    <ul className="space-y-5">
      {orders.map((order) => (
        <li key={order.id} className="border border-line bg-white">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-line bg-sand/50 px-5 py-4 text-sm">
            <div>
              <p className="font-medium">Order {order.id}</p>
              <p className="text-xs text-muted">Placed {formatDate(order.placedAt)}</p>
            </div>
            <div className="flex items-center gap-3">
              {order.demo && <span className="border border-mocha/40 px-2 py-1 text-[0.625rem] font-medium tracking-[0.12em] text-mocha">DEMO</span>}
              <span className={`px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[order.status]}`}>{order.status}</span>
              <p className="font-medium">{format(order.total)}</p>
            </div>
          </div>
          <ul className="divide-y divide-line">
            {order.items.map((item) => {
              const product = getProduct(item.productId)
              return (
                <li key={`${item.productId}-${item.size}-${item.color}`} className="flex items-center gap-4 px-5 py-4">
                  <div className="relative h-20 w-[3.75rem] shrink-0 overflow-hidden bg-sand">{product && <SmartImage image={product.images[0]} alt="" widths={[120, 200]} sizes="60px" />}</div>
                  <div className="min-w-0 flex-1 text-sm">
                    {product ? (
                      <Link to={`/product/${product.slug}`} className="line-clamp-1 font-medium hover:underline">
                        {item.name}
                      </Link>
                    ) : (
                      <p className="font-medium">{item.name}</p>
                    )}
                    <p className="text-xs text-muted">
                      {item.brand} · {item.color} · {item.size} · Qty {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm">{format(item.price * item.quantity)}</p>
                </li>
              )
            })}
          </ul>
        </li>
      ))}
    </ul>
  )
}
