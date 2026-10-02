import { FREE_SHIPPING_THRESHOLD } from '@/config'
import { useCurrency } from '@/context/CurrencyContext'

export function PromoBar() {
  const { format } = useCurrency()
  return (
    <div className="bg-ink text-ivory">
      <p className="container-page py-2 text-center text-[0.625rem] font-medium uppercase leading-tight tracking-[0.08em] sm:text-[0.6875rem] sm:tracking-[0.16em]">
        Free shipping on orders over {format(FREE_SHIPPING_THRESHOLD)}
        <span className="mx-2 opacity-50" aria-hidden="true">
          |
        </span>
        Easy Returns
      </p>
    </div>
  )
}
