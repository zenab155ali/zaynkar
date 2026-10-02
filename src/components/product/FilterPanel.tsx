import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import type { CountryCode, StyleTag } from '@/types'
import { COUNTRIES } from '@/data/countries'
import { colorHex, isLightColor } from '@/data/colors'
import { Flag } from '@/components/ui/Flag'
import { useCurrency } from '@/context/CurrencyContext'
import { DISCOUNT_TIERS, type Facets, type Filters } from '@/utils/filters'

interface FilterPanelProps {
  facets: Facets
  filters: Filters
  onChange: (next: Filters) => void
  /** Unique prefix so ids stay unique when the panel is rendered in both sidebar and drawer. */
  idPrefix: string
}

const toggleValue = <T,>(list: T[], value: T): T[] => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value])

function Group({ title, children, defaultOpen = true }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="group border-b border-line py-4">
      <summary className="flex items-center justify-between text-[0.8125rem] font-medium uppercase tracking-[0.12em]">
        {title}
        <ChevronDown size={16} className="text-muted transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="pt-4">{children}</div>
    </details>
  )
}

interface CheckRowProps {
  id: string
  checked: boolean
  onChange: () => void
  label: ReactNode
  count?: number
}

function CheckRow({ id, checked, onChange, label, count }: CheckRowProps) {
  return (
    <li>
      <label htmlFor={id} className="flex cursor-pointer items-center gap-3 py-1.5 text-sm">
        <input id={id} type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 shrink-0 accent-ink" />
        <span className="flex flex-1 items-center gap-2">{label}</span>
        {count !== undefined && <span className="text-xs text-muted">{count}</span>}
      </label>
    </li>
  )
}

export function FilterPanel({ facets, filters, onChange, idPrefix }: FilterPanelProps) {
  const { format } = useCurrency()
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => onChange({ ...filters, [key]: value })
  const id = (name: string) => `${idPrefix}-${name}`.replace(/\s+/g, '-')

  const parsePrice = (raw: string): number | null => {
    if (raw === '') return null
    const n = Number(raw)
    return Number.isFinite(n) && n >= 0 ? n : null
  }

  const quickRanges: [string, number | null, number | null][] = [
    [`Under ${format(200)}`, null, 199],
    [`${format(200)} – ${format(400)}`, 200, 400],
    [`${format(400)}+`, 400, null],
  ]

  return (
    <div>
      {(facets.modestCount > 0 || filters.modestOnly) && (
        <ul className="border-b border-line pb-3">
          <CheckRow id={id('modest')} checked={filters.modestOnly} onChange={() => set('modestOnly', !filters.modestOnly)} label="Modest fashion" count={facets.modestCount} />
        </ul>
      )}

      {facets.categories.length > 1 && (
        <Group title="Category">
          <ul>
            {facets.categories.map((o) => (
              <CheckRow key={o.value} id={id(`cat-${o.value}`)} checked={filters.categories.includes(o.value)} onChange={() => set('categories', toggleValue(filters.categories, o.value))} label={o.value} count={o.count} />
            ))}
          </ul>
        </Group>
      )}

      <Group title="Size">
        <div className="flex flex-wrap gap-2">
          {facets.sizes.map((o) => {
            const on = filters.sizes.includes(o.value)
            return (
              <button
                key={o.value}
                type="button"
                aria-pressed={on}
                onClick={() => set('sizes', toggleValue(filters.sizes, o.value))}
                className={`h-10 min-w-11 border px-3 text-sm transition-colors ${on ? 'border-ink bg-ink text-ivory' : 'border-line bg-white hover:border-ink'}`}
              >
                {o.value}
              </button>
            )
          })}
        </div>
      </Group>

      <Group title="Color">
        <div className="flex flex-wrap gap-2.5">
          {facets.colors.map((o) => {
            const on = filters.colors.includes(o.value)
            return (
              <button
                key={o.value}
                type="button"
                aria-pressed={on}
                aria-label={`${o.value} (${o.count})`}
                title={`${o.value} (${o.count})`}
                onClick={() => set('colors', toggleValue(filters.colors, o.value))}
                className={`grid h-9 w-9 place-items-center rounded-full border p-0.5 transition ${on ? 'border-ink' : 'border-transparent hover:border-taupe'}`}
              >
                <span className={`block h-full w-full rounded-full ${isLightColor(o.value) ? 'ring-1 ring-inset ring-black/20' : ''}`} style={{ backgroundColor: colorHex(o.value) }} />
              </button>
            )
          })}
        </div>
        {filters.colors.length > 0 && <p className="mt-3 text-xs text-muted">{filters.colors.join(', ')}</p>}
      </Group>

      <Group title="Price">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label htmlFor={id('min')} className="sr-only">
              Minimum price
            </label>
            <input id={id('min')} type="number" inputMode="numeric" min={0} placeholder={`Min ${facets.minPrice}`} value={filters.priceMin ?? ''} onChange={(e) => set('priceMin', parsePrice(e.target.value))} className="field !h-10" />
          </div>
          <span aria-hidden="true" className="text-muted">
            –
          </span>
          <div className="flex-1">
            <label htmlFor={id('max')} className="sr-only">
              Maximum price
            </label>
            <input id={id('max')} type="number" inputMode="numeric" min={0} placeholder={`Max ${facets.maxPrice}`} value={filters.priceMax ?? ''} onChange={(e) => set('priceMax', parsePrice(e.target.value))} className="field !h-10" />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {quickRanges.map(([label, min, max]) => {
            const on = filters.priceMin === min && filters.priceMax === max
            return (
              <button
                key={label}
                type="button"
                aria-pressed={on}
                onClick={() => onChange({ ...filters, priceMin: on ? null : min, priceMax: on ? null : max })}
                className={`border px-2.5 py-1.5 text-xs transition-colors ${on ? 'border-ink bg-ink text-ivory' : 'border-line bg-white hover:border-ink'}`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </Group>

      {facets.maxDiscount > 0 && (
        <Group title="Discount">
          <div role="radiogroup" aria-label="Minimum discount" className="space-y-0.5">
            {[0, ...DISCOUNT_TIERS.filter((t) => t <= facets.maxDiscount)].map((tier) => (
              <label key={tier} className="flex cursor-pointer items-center gap-3 py-1.5 text-sm">
                <input type="radio" name={id('discount')} checked={filters.minDiscount === tier} onChange={() => set('minDiscount', tier)} className="h-4 w-4 accent-ink" />
                {tier === 0 ? 'Any' : `${tier}% off or more`}
              </label>
            ))}
          </div>
        </Group>
      )}

      {facets.brands.length > 1 && (
        <Group title="Brand" defaultOpen={false}>
          <ul className="max-h-56 overflow-y-auto pr-1">
            {facets.brands.map((o) => (
              <CheckRow key={o.value} id={id(`brand-${o.value}`)} checked={filters.brands.includes(o.value)} onChange={() => set('brands', toggleValue(filters.brands, o.value))} label={o.value} count={o.count} />
            ))}
          </ul>
        </Group>
      )}

      {facets.countries.length > 1 && (
        <Group title="Country" defaultOpen={false}>
          <ul>
            {facets.countries.map((o) => {
              const code = o.value as CountryCode
              return (
                <CheckRow
                  key={code}
                  id={id(`country-${code}`)}
                  checked={filters.countries.includes(code)}
                  onChange={() => set('countries', toggleValue(filters.countries, code))}
                  label={
                    <>
                      <Flag code={code} size={11} />
                      {COUNTRIES[code].name}
                    </>
                  }
                  count={o.count}
                />
              )
            })}
          </ul>
        </Group>
      )}

      {facets.styles.length > 1 && (
        <Group title="Style" defaultOpen={false}>
          <ul>
            {facets.styles.map((o) => (
              <CheckRow key={o.value} id={id(`style-${o.value}`)} checked={filters.styles.includes(o.value as StyleTag)} onChange={() => set('styles', toggleValue(filters.styles, o.value as StyleTag))} label={o.value} count={o.count} />
            ))}
          </ul>
        </Group>
      )}
    </div>
  )
}
