import { Link } from 'react-router-dom'
import { Flag } from '@/components/ui/Flag'
import { STORES } from '@/data/stores'

export function SellersStrip() {
  return (
    <section aria-labelledby="sellers-heading" className="container-page pt-16 sm:pt-24">
      <div className="flex flex-col gap-6 border-y border-line py-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="lg:max-w-xs">
          <p className="eyebrow mb-2">Independent stores</p>
          <h2 id="sellers-heading" className="display text-3xl sm:text-4xl">
            Meet our sellers
          </h2>
          <Link to="/info/our-sellers" className="mt-3 inline-block text-xs font-medium uppercase tracking-[0.14em]">
            <span className="link-underline">All {STORES.length} stores</span>
          </Link>
        </div>
        <ul className="flex flex-1 flex-wrap gap-2 lg:justify-end">
          {STORES.map((s) => (
            <li key={s.id} className="inline-flex items-center gap-2 border border-line bg-white px-3 py-2 text-xs">
              <Flag code={s.country} size={11} />
              <span className="font-medium">{s.name}</span>
              <span className="text-muted">{s.city}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
