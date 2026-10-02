import { useId, useState, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'

interface TagInputProps {
  label: string
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  hint?: string
}

/** Type a value and press Enter (or comma) to add it as a chip — used for sizes. */
export function TagInput({ label, values, onChange, placeholder, hint }: TagInputProps) {
  const [draft, setDraft] = useState('')
  const inputId = useId()
  const hintId = useId()

  const commit = () => {
    const v = draft.trim()
    if (v && !values.some((existing) => existing.toLowerCase() === v.toLowerCase())) onChange([...values, v])
    setDraft('')
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commit()
    } else if (e.key === 'Backspace' && draft === '' && values.length > 0) {
      onChange(values.slice(0, -1))
    }
  }

  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-xs font-medium tracking-wide text-muted">
        {label}
      </label>
      <div className="flex flex-wrap items-center gap-2 border border-line bg-white p-2">
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-1.5 bg-sand px-2.5 py-1.5 text-sm">
            {v}
            <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} aria-label={`Remove ${v}`}>
              <X size={13} />
            </button>
          </span>
        ))}
        <input
          id={inputId}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={commit}
          placeholder={placeholder}
          aria-describedby={hint ? hintId : undefined}
          className="min-w-24 flex-1 border-none bg-transparent p-1.5 text-sm outline-none"
        />
      </div>
      {hint && (
        <p id={hintId} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  )
}
