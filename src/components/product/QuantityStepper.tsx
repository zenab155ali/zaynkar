import { Minus, Plus } from 'lucide-react'
import { MAX_LINE_QUANTITY } from '@/config'
import { useLanguage } from '@/context/LanguageContext'

interface QuantityStepperProps {
  value: number
  onChange: (value: number) => void
  label?: string
  compact?: boolean
}

export function QuantityStepper({ value, onChange, label, compact = false }: QuantityStepperProps) {
  const { t } = useLanguage()
  const h = compact ? 'h-9' : 'h-12'
  const btn = `grid ${compact ? 'h-9 w-9' : 'h-12 w-12'} place-items-center transition-colors hover:bg-sand disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent`
  return (
    <div role="group" aria-label={label ?? t('quantity')} className={`inline-flex ${h} items-center border border-line bg-white`}>
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label={t('decreaseQuantity')}>
        <Minus size={14} aria-hidden="true" />
      </button>
      <output aria-live="polite" className={`${compact ? 'w-7' : 'w-9'} text-center text-sm tabular-nums`}>
        {value}
      </output>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= MAX_LINE_QUANTITY} aria-label={t('increaseQuantity')}>
        <Plus size={14} aria-hidden="true" />
      </button>
    </div>
  )
}
