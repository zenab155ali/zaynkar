interface SizeSelectorProps {
  sizes: string[]
  unavailable: string[]
  value: string | null
  onChange: (size: string) => void
  invalid?: boolean
}

export function SizeSelector({ sizes, unavailable, value, onChange, invalid = false }: SizeSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Size"
      aria-invalid={invalid}
      className={`flex flex-wrap gap-2 ${invalid ? 'rounded-sm outline outline-1 outline-offset-4 outline-sale' : ''}`}
    >
      {sizes.map((size) => {
        const soldOut = unavailable.includes(size)
        const selected = value === size
        return (
          <button
            key={size}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={soldOut}
            aria-label={soldOut ? `${size} — sold out` : size}
            onClick={() => onChange(size)}
            className={`h-11 min-w-12 border px-3 text-sm transition-colors ${
              selected
                ? 'border-ink bg-ink text-ivory'
                : soldOut
                  ? 'cursor-not-allowed border-line text-taupe/60 line-through'
                  : 'border-line bg-white hover:border-ink'
            }`}
          >
            {size}
          </button>
        )
      })}
    </div>
  )
}
