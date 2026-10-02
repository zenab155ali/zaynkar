import { useMemo } from 'react'
import { BadgeCheck } from 'lucide-react'
import type { Product } from '@/types'
import { Rating } from '@/components/ui/Rating'
import { getReviews, ratingBreakdown } from '@/utils/reviews'

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

export function ReviewsSection({ product }: { product: Product }) {
  const reviews = useMemo(() => getReviews(product), [product])
  const bars = useMemo(() => ratingBreakdown(product), [product])

  return (
    <div>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
        <div>
          <p className="display text-5xl">{product.rating.toFixed(1)}</p>
          <Rating value={product.rating} size={16} className="mt-1" />
          <p className="mt-1 text-xs text-muted">{product.reviewCount} reviews</p>
        </div>
        <ul className="flex-1 space-y-1.5" aria-label="Rating breakdown">
          {bars.map((b) => (
            <li key={b.stars} className="flex items-center gap-3 text-xs">
              <span className="w-8 shrink-0 text-muted">{b.stars} ★</span>
              <span className="h-1.5 flex-1 bg-sand" aria-hidden="true">
                <span className="block h-full bg-mocha" style={{ width: `${b.pct}%` }} />
              </span>
              <span className="w-8 shrink-0 text-right tabular-nums text-muted">{b.count}</span>
            </li>
          ))}
        </ul>
      </div>

      <ul className="mt-8 divide-y divide-line">
        {reviews.map((r) => (
          <li key={r.id} className="py-5">
            <div className="flex items-center justify-between gap-3">
              <Rating value={r.rating} size={13} />
              <time dateTime={r.date} className="text-xs text-muted">
                {formatDate(r.date)}
              </time>
            </div>
            <p className="mt-2 text-sm font-medium text-ink">{r.title}</p>
            <p className="mt-1 text-sm leading-relaxed">{r.body}</p>
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
              <span>{r.author}</span>
              {r.verified && (
                <span className="inline-flex items-center gap-1 text-success">
                  <BadgeCheck size={13} aria-hidden="true" /> Verified purchase
                </span>
              )}
              {r.size && <span>Size: {r.size}</span>}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-muted">Reviews shown are sample content for this prototype.</p>
    </div>
  )
}
