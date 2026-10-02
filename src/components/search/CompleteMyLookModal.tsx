import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, X } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { SmartImage } from '@/components/ui/SmartImage'
import { PriceTag } from '@/components/product/PriceTag'
import { useCurrency } from '@/context/CurrencyContext'
import { useUI } from '@/context/UIContext'
import { PRODUCTS, getProduct } from '@/data/products'
import { completeTheLook } from '@/utils/recommend'

const ANCHOR_CATEGORIES = ['dresses', 'sets', 'outerwear', 'tops', 'bottoms']
const DEFAULT_ANCHOR = 'navy-satin-balloon-sleeve-maxi'

/** Pieces a shopper can start an outfit from (best sellers per clothing category). */
const ANCHOR_OPTIONS = [...PRODUCTS]
  .filter((p) => ANCHOR_CATEGORIES.includes(p.category))
  .sort((a, b) => b.sales - a.sales)
  .slice(0, 14)

export function CompleteMyLookModal() {
  const { lookOpen, lookProductId, closeLook } = useUI()
  return (
    <Dialog open={lookOpen} onClose={closeLook} label="Complete My Look" variant="center">
      <LookContent initialId={lookProductId} onClose={closeLook} />
    </Dialog>
  )
}

function LookContent({ initialId, onClose }: { initialId?: string; onClose: () => void }) {
  const { format } = useCurrency()
  const [anchorId, setAnchorId] = useState(initialId && getProduct(initialId) ? initialId : DEFAULT_ANCHOR)
  const [phase, setPhase] = useState<'idle' | 'thinking' | 'done'>('idle')

  const options = useMemo(() => {
    const extra = getProduct(anchorId)
    return extra && !ANCHOR_OPTIONS.some((p) => p.id === extra.id) ? [extra, ...ANCHOR_OPTIONS] : ANCHOR_OPTIONS
  }, [anchorId])

  const anchor = getProduct(anchorId)
  const items = useMemo(() => (anchor ? completeTheLook(anchor, 3) : []), [anchor])
  const total = anchor ? [anchor, ...items].reduce((sum, p) => sum + p.price, 0) : 0

  useEffect(() => {
    if (phase !== 'thinking') return
    const timer = window.setTimeout(() => setPhase('done'), 1100)
    return () => window.clearTimeout(timer)
  }, [phase])

  if (!anchor) return null

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow inline-flex items-center gap-1.5">
            <Sparkles size={13} aria-hidden="true" /> AI stylist · Preview
          </p>
          <h2 className="display mt-1 text-3xl sm:text-4xl">Complete My Look</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="-mr-2 -mt-2 grid h-10 w-10 shrink-0 place-items-center hover:bg-sand">
          <X size={20} />
        </button>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Soon, ZAYNKAR will use AI to style a full outfit around any piece you love. For this prototype, we show a mock recommendation built from our curated pairings.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="look-anchor" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
            Start with
          </label>
          <select
            id="look-anchor"
            value={anchorId}
            onChange={(e) => {
              setAnchorId(e.target.value)
              setPhase('idle')
            }}
            className="field"
          >
            {options.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.brand}
              </option>
            ))}
          </select>
        </div>
        <button type="button" onClick={() => setPhase('thinking')} disabled={phase === 'thinking'} className="btn btn-primary">
          <Sparkles size={15} aria-hidden="true" />
          {phase === 'done' ? 'Restyle' : 'Build my look'}
        </button>
      </div>

      <div className="mt-6 min-h-[16rem]" aria-live="polite">
        {phase === 'idle' && (
          <div className="grid h-64 place-items-center border border-dashed border-line text-center text-sm text-muted">
            Choose a piece and tap “Build my look”.
          </div>
        )}
        {phase === 'thinking' && (
          <div role="status" className="grid h-64 place-items-center border border-dashed border-line text-center text-sm text-muted">
            <div className="flex flex-col items-center gap-3">
              <Sparkles size={22} className="animate-pulse text-mocha" aria-hidden="true" />
              Styling your outfit…
            </div>
          </div>
        )}
        {phase === 'done' && (
          <>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[anchor, ...items].map((p, i) => (
                <li key={p.id}>
                  <Link to={`/product/${p.slug}`} onClick={onClose} className="group block">
                    <div className="relative aspect-[3/4] overflow-hidden bg-sand">
                      <SmartImage image={p.images[0]} alt="" widths={[240, 360, 480]} sizes="(min-width: 640px) 160px, 45vw" className="transition-transform duration-500 group-hover:scale-[1.03]" />
                      {i === 0 && <span className="absolute left-1.5 top-1.5 bg-ink px-1.5 py-1 text-[0.5625rem] font-medium leading-none tracking-[0.14em] text-ivory">YOUR PIECE</span>}
                    </div>
                    <p className="mt-2 truncate text-[0.6875rem] uppercase tracking-[0.12em] text-muted">{p.brand}</p>
                    <p className="line-clamp-2 text-xs leading-snug group-hover:underline">{p.name}</p>
                    <PriceTag product={p} className="mt-1" />
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-5 flex items-center justify-between border-t border-line pt-4 text-sm">
              <span className="text-muted">Whole look</span>
              <span className="font-medium">{format(total)}</span>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
