import { useRef, useState } from 'react'
import { Loader2, Upload, X } from 'lucide-react'
import { uploadProductMedia, validateMediaFile } from '@/lib/uploadProductMedia'
import type { MediaType } from '@/types/catalog'

interface MediaValue {
  url: string
  type: MediaType
}

interface MediaUploadFieldProps {
  value: MediaValue | null
  onChange: (value: MediaValue | null) => void
  label?: string
  /** Set false for color swatch slots, which only make sense as a still photo. */
  allowVideo?: boolean
  className?: string
}

/** A single media slot: shows the current photo or video, lets the admin upload or replace it. */
export function MediaUploadField({ value, onChange, label, allowVideo = true, className = '' }: MediaUploadFieldProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const onPick = async (file: File | undefined) => {
    if (!file) return
    const problem = validateMediaFile(file, allowVideo)
    if (problem) {
      setError(problem)
      return
    }
    setError(null)
    setBusy(true)
    try {
      const result = await uploadProductMedia(file)
      onChange(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed — please try again.')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const accept = allowVideo ? 'image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime' : 'image/jpeg,image/png,image/webp'

  return (
    <div className={className}>
      {label && <p className="mb-1.5 text-xs font-medium tracking-wide text-muted">{label}</p>}
      <div className="relative flex aspect-[3/4] w-28 items-center justify-center overflow-hidden border border-dashed border-line bg-sand">
        {value ? (
          <>
            {value.type === 'video' ? (
              <video src={value.url} className="absolute inset-0 h-full w-full object-cover" muted playsInline controls />
            ) : (
              <img src={value.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
            )}
            {value.type === 'video' && <span className="pointer-events-none absolute left-1 top-1 bg-ink/80 px-1.5 py-0.5 text-[0.5625rem] font-medium tracking-wide text-ivory">VIDEO</span>}
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label="Remove"
              className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-ink/80 text-ivory"
            >
              <X size={13} />
            </button>
          </>
        ) : busy ? (
          <Loader2 size={20} className="animate-spin text-muted" aria-hidden="true" />
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted transition-colors hover:text-ink"
          >
            <Upload size={18} aria-hidden="true" />
            <span className="text-center text-[0.625rem] leading-tight">{allowVideo ? 'Upload photo or video' : 'Upload photo'}</span>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept={accept} className="sr-only" onChange={(e) => onPick(e.target.files?.[0])} />
      {value && !busy && (
        <button type="button" onClick={() => inputRef.current?.click()} className="mt-1.5 text-[0.6875rem] underline underline-offset-2">
          Replace
        </button>
      )}
      {error && (
        <p role="alert" className="mt-1 max-w-28 text-[0.6875rem] text-sale">
          {error}
        </p>
      )}
    </div>
  )
}
