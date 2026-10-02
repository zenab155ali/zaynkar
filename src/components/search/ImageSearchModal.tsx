import { Camera, Sparkles, Upload, X } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { useToast } from '@/context/ToastContext'
import { useUI } from '@/context/UIContext'

/** Demo-only "Search by image" — explains the upcoming AI feature; nothing is uploaded or sent anywhere. */
export function ImageSearchModal() {
  const { imageSearchOpen, setImageSearchOpen } = useUI()
  const { toast } = useToast()
  const close = () => setImageSearchOpen(false)

  return (
    <Dialog open={imageSearchOpen} onClose={close} label="Search by image" variant="center">
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow inline-flex items-center gap-1.5">
              <Sparkles size={13} aria-hidden="true" /> Coming soon
            </p>
            <h2 className="display mt-1 text-3xl sm:text-4xl">Search by image</h2>
          </div>
          <button type="button" onClick={close} aria-label="Close" className="-mr-2 -mt-2 grid h-10 w-10 shrink-0 place-items-center hover:bg-sand">
            <X size={20} />
          </button>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted">Upload a photo and ZAYNKAR will help you discover similar styles.</p>

        <button
          type="button"
          onClick={() => {
            close()
            toast({ title: 'Visual search is coming soon', description: 'This is a demo — no photo was uploaded.' })
          }}
          className="mt-6 flex w-full flex-col items-center gap-3 border border-dashed border-taupe/60 bg-sand/50 px-6 py-12 text-center transition-colors hover:bg-sand"
        >
          <span className="grid h-14 w-14 place-items-center rounded-full bg-ivory">
            <Camera size={24} strokeWidth={1.4} aria-hidden="true" />
          </span>
          <span className="inline-flex items-center gap-2 text-sm font-medium">
            <Upload size={15} aria-hidden="true" /> Upload a photo
          </span>
          <span className="text-xs text-muted">Demo only — nothing is uploaded or stored.</span>
        </button>

        <ul className="mt-6 grid gap-3 text-xs text-muted sm:grid-cols-3">
          {['Snap or upload an outfit you love', 'AI finds similar styles from every seller', 'Shop matches from Turkey and beyond'].map((step, i) => (
            <li key={step} className="flex gap-3">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ink text-[0.625rem] text-ivory">{i + 1}</span>
              {step}
            </li>
          ))}
        </ul>
      </div>
    </Dialog>
  )
}
