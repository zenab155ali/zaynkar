import { Check } from 'lucide-react'
import { colorHex, isLightColor } from '@/data/colors'

/** Compact, read-only swatches for product cards. */
export function ColorSwatches({ colors, max = 4 }: { colors: string[]; max?: number }) {
  const shown = colors.slice(0, max)
  const extra = colors.length - shown.length
  return (
    <ul className="flex items-center gap-1.5" aria-label={`Available colours: ${colors.join(', ')}`}>
      {shown.map((c) => (
        <li
          key={c}
          title={c}
          className={`h-3 w-3 rounded-full ${isLightColor(c) ? 'ring-1 ring-inset ring-black/20' : 'ring-1 ring-inset ring-black/5'}`}
          style={{ backgroundColor: colorHex(c) }}
        />
      ))}
      {extra > 0 && <li className="text-[0.6875rem] text-muted">+{extra}</li>}
    </ul>
  )
}

interface ColorPickerProps {
  colors: string[]
  value: string
  onChange: (color: string) => void
}

/** Selectable swatches for the product page. */
export function ColorPicker({ colors, value, onChange }: ColorPickerProps) {
  return (
    <div role="radiogroup" aria-label="Colour" className="flex flex-wrap gap-2.5">
      {colors.map((c) => {
        const selected = c === value
        return (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={c}
            title={c}
            onClick={() => onChange(c)}
            className={`relative grid h-10 w-10 place-items-center rounded-full border p-1 transition ${selected ? 'border-ink' : 'border-transparent hover:border-taupe'}`}
          >
            <span
              className={`grid h-full w-full place-items-center rounded-full ${isLightColor(c) ? 'ring-1 ring-inset ring-black/20' : ''}`}
              style={{ backgroundColor: colorHex(c) }}
            >
              {selected && <Check size={14} className={isLightColor(c) ? 'text-ink' : 'text-white'} aria-hidden="true" />}
            </span>
          </button>
        )
      })}
    </div>
  )
}
