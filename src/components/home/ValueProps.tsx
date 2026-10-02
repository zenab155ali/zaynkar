import { Globe, RotateCcw, ShieldCheck, Truck } from 'lucide-react'
import { FREE_SHIPPING_THRESHOLD } from '@/config'
import { useCurrency } from '@/context/CurrencyContext'

export function ValueProps() {
  const { format } = useCurrency()
  const items = [
    { icon: Truck, title: `Free shipping over ${format(FREE_SHIPPING_THRESHOLD)}`, text: 'Tracked delivery from every seller' },
    { icon: RotateCcw, title: 'Easy returns', text: '30 days, no fuss' },
    { icon: Globe, title: 'Sellers worldwide', text: 'Turkey, Italy, Korea & the UAE' },
    { icon: ShieldCheck, title: 'Shop with confidence', text: 'Every store is reviewed by ZAYNKAR' },
  ]
  return (
    <section aria-label="Why ZAYNKAR" className="border-b border-line">
      <ul className="container-page grid grid-cols-2 gap-x-4 gap-y-6 py-6 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-start gap-3">
            <Icon size={22} strokeWidth={1.3} className="mt-0.5 shrink-0 text-mocha" aria-hidden="true" />
            <div>
              <p className="text-[0.8125rem] font-medium leading-snug">{title}</p>
              <p className="mt-0.5 text-xs text-muted">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
