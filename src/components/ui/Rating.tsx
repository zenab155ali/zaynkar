import { Star } from 'lucide-react'

interface RatingProps {
  value: number
  count?: number
  size?: number
  className?: string
}

/** Read-only star rating with fractional fill. */
export function Rating({ value, count, size = 14, className = '' }: RatingProps) {
  const stars = (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={size} fill="currentColor" strokeWidth={0} className="shrink-0" />
      ))}
    </>
  )
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        role="img"
        aria-label={`Rated ${value.toFixed(1)} out of 5${count !== undefined ? ` from ${count} reviews` : ''}`}
        className="relative inline-flex"
      >
        <span className="flex text-sand-deep">{stars}</span>
        <span className="absolute inset-y-0 left-0 flex overflow-hidden text-mocha" style={{ width: `${(value / 5) * 100}%` }}>
          {stars}
        </span>
      </span>
      {count !== undefined && <span className="text-xs text-muted">({count})</span>}
    </span>
  )
}
