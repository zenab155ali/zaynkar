import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Check, X } from 'lucide-react'
import type { ProductImage } from '@/types'
import { SmartImage } from '@/components/ui/SmartImage'

export interface ToastInput {
  title: string
  description?: string
  image?: ProductImage
  action?: { label: string; to: string }
}

interface ToastItem extends ToastInput {
  id: number
}

interface ToastContextValue {
  toast: (input: ToastInput) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)
const DURATION_MS = 4500
let nextId = 1

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(item.id), DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [item.id, onDismiss])

  return (
    <div
      className="pointer-events-auto flex w-full items-center gap-3 border border-line bg-white p-3 pr-2 shadow-xl sm:w-[22rem]"
      style={{ animation: 'toast-in 0.25s ease-out' }}
    >
      {item.image ? (
        <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-sand">
          <SmartImage image={item.image} alt="" widths={[96, 160]} sizes="48px" />
        </div>
      ) : (
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-success text-white">
          <Check size={16} aria-hidden="true" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-sm font-medium">
          {item.image && <Check size={14} className="shrink-0 text-success" aria-hidden="true" />}
          <span className="truncate">{item.title}</span>
        </p>
        {item.description && <p className="mt-0.5 truncate text-xs text-muted">{item.description}</p>}
        {item.action && (
          <Link
            to={item.action.to}
            onClick={() => onDismiss(item.id)}
            className="mt-1.5 inline-block text-[0.6875rem] font-medium uppercase tracking-[0.14em] underline underline-offset-4"
          >
            {item.action.label}
          </Link>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        aria-label="Dismiss notification"
        className="grid h-8 w-8 shrink-0 place-items-center text-muted transition-colors hover:text-ink"
      >
        <X size={16} />
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: number) => setItems((prev) => prev.filter((t) => t.id !== id)), [])
  const toast = useCallback((input: ToastInput) => setItems((prev) => [...prev.slice(-2), { ...input, id: nextId++ }]), [])
  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-3 bottom-3 z-[70] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:top-28 sm:bottom-auto sm:items-end"
      >
        {items.map((item) => (
          <ToastCard key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
