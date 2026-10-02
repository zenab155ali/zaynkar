import { useEffect, useRef, type ReactNode } from 'react'

type Variant = 'center' | 'right' | 'left' | 'top'

interface DialogProps {
  open: boolean
  onClose: () => void
  /** Accessible name for the dialog. */
  label: string
  variant?: Variant
  children: ReactNode
}

const DIALOG_CLASSES: Record<Variant, string> = {
  center: 'dialog-center m-auto w-[calc(100%-2rem)] max-w-xl',
  right: 'dialog-right fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-full max-w-md sm:max-w-[26rem]',
  left: 'dialog-left fixed inset-y-0 left-0 right-auto m-0 h-dvh max-h-none w-[88%] max-w-sm',
  top: 'dialog-top fixed inset-x-0 top-0 bottom-auto m-0 w-full max-w-none',
}

const INNER_CLASSES: Record<Variant, string> = {
  center: 'max-h-[90dvh] overflow-y-auto',
  right: 'h-full overflow-y-auto',
  left: 'h-full overflow-y-auto',
  top: 'max-h-[92dvh] overflow-y-auto',
}

/**
 * Thin wrapper over the native <dialog> element: focus trapping, Esc-to-close and inert background come
 * from the browser. Children are only mounted while open so their state resets on each open.
 */
export function Dialog({ open, onClose, label, variant = 'center', children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
      className={`bg-ivory p-0 text-ink shadow-2xl ${DIALOG_CLASSES[variant]}`}
    >
      {open && <div className={INNER_CLASSES[variant]}>{children}</div>}
    </dialog>
  )
}
