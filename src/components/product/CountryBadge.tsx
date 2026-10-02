import type { CountryCode } from '@/types'
import { COUNTRIES } from '@/data/countries'
import { Flag } from '@/components/ui/Flag'

export function CountryBadge({ code, className = '' }: { code: CountryCode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap text-[0.6875rem] text-muted ${className}`}>
      <Flag code={code} size={11} />
      {COUNTRIES[code].name}
    </span>
  )
}
