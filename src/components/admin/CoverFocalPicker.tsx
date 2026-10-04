interface CoverFocalPickerProps {
  imageUrl: string | null
  x: number
  y: number
  onChange: (x: number, y: number) => void
}

const POSITIONS = [0, 50, 100]

/** Lets the admin pick which part of the cover photo stays centered when it's cropped to a square/portrait tile in the product grid. */
export function CoverFocalPicker({ imageUrl, x, y, onChange }: CoverFocalPickerProps) {
  if (!imageUrl) return null

  return (
    <div>
      <p className="mb-1.5 text-xs font-medium tracking-wide text-muted">Cover photo crop (grid thumbnail)</p>
      <div className="relative aspect-[3/4] w-40 overflow-hidden border border-line bg-sand">
        <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: `${x}% ${y}%` }} />
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
          {POSITIONS.flatMap((py) =>
            POSITIONS.map((px) => {
              const active = px === x && py === y
              return (
                <button
                  key={`${px}-${py}`}
                  type="button"
                  onClick={() => onChange(px, py)}
                  aria-label={`Crop position ${px},${py}`}
                  aria-pressed={active}
                  className="group grid place-items-center border border-white/20 bg-black/0 transition-colors hover:bg-black/10"
                >
                  <span className={`h-2 w-2 rounded-full border border-white transition-all ${active ? 'scale-150 bg-white' : 'bg-white/40 group-hover:bg-white/70'}`} />
                </button>
              )
            }),
          )}
        </div>
      </div>
      <p className="mt-1 text-[0.6875rem] text-muted">Click where the most important part of the photo is (e.g. top for the face, center for the whole dress).</p>
    </div>
  )
}
