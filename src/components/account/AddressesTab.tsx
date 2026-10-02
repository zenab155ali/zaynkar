import { useState, type FormEvent } from 'react'
import { MapPin, Plus, Trash2 } from 'lucide-react'
import { TextField } from '@/components/ui/TextField'
import { STORAGE_KEYS } from '@/config'
import { useToast } from '@/context/ToastContext'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { MOCK_ADDRESSES } from '@/utils/orders'
import type { Address } from '@/types'

const BLANK = { label: '', fullName: '', line1: '', city: '', postalCode: '', country: 'Israel', phone: '' }

export function AddressesTab() {
  const { toast } = useToast()
  const [addresses, setAddresses] = useLocalStorage<Address[]>(STORAGE_KEYS.addresses, MOCK_ADDRESSES)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState(BLANK)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setAddresses((prev) => [...prev, { ...draft, id: `addr-${Date.now()}`, label: draft.label.trim() || 'Address', isDefault: prev.length === 0 }])
    setDraft(BLANK)
    setAdding(false)
    toast({ title: 'Address saved' })
  }

  const setDefault = (id: string) => setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })))
  const remove = (id: string) =>
    setAddresses((prev) => {
      const rest = prev.filter((a) => a.id !== id)
      return rest.length && !rest.some((a) => a.isDefault) ? rest.map((a, i) => ({ ...a, isDefault: i === 0 })) : rest
    })

  return (
    <div>
      {addresses.length === 0 && !adding && (
        <div className="grid place-items-center border border-dashed border-line py-14 text-center">
          <MapPin size={26} strokeWidth={1.3} className="text-taupe" aria-hidden="true" />
          <p className="mt-3 text-sm text-muted">You have no saved addresses.</p>
        </div>
      )}

      <ul className="grid gap-4 sm:grid-cols-2">
        {addresses.map((a) => (
          <li key={a.id} className="flex flex-col border border-line bg-white p-5 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-medium">{a.label}</p>
              {a.isDefault && <span className="bg-sand px-2 py-1 text-[0.625rem] font-medium tracking-[0.12em] text-mocha">DEFAULT</span>}
            </div>
            <address className="mt-3 flex-1 not-italic leading-relaxed text-muted">
              {a.fullName}
              <br />
              {a.line1}
              {a.line2 && <>, {a.line2}</>}
              <br />
              {a.city} {a.postalCode}, {a.country}
              <br />
              {a.phone}
            </address>
            <div className="mt-4 flex gap-4 text-xs">
              {!a.isDefault && (
                <button type="button" onClick={() => setDefault(a.id)} className="underline underline-offset-4">
                  Set as default
                </button>
              )}
              <button type="button" onClick={() => remove(a.id)} className="inline-flex items-center gap-1 text-muted hover:text-sale">
                <Trash2 size={13} aria-hidden="true" /> Remove<span className="sr-only"> address {a.label}</span>
              </button>
            </div>
          </li>
        ))}
      </ul>

      {adding ? (
        <form onSubmit={submit} className="mt-6 grid gap-4 border border-line bg-white p-5 sm:grid-cols-2">
          <h3 className="display text-xl sm:col-span-2">New address</h3>
          <TextField label="Label (e.g. Home)" value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
          <TextField label="Full name" required value={draft.fullName} onChange={(e) => setDraft({ ...draft, fullName: e.target.value })} />
          <TextField className="sm:col-span-2" label="Street address" required value={draft.line1} onChange={(e) => setDraft({ ...draft, line1: e.target.value })} />
          <TextField label="City" required value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} />
          <TextField label="Postal code" required value={draft.postalCode} onChange={(e) => setDraft({ ...draft, postalCode: e.target.value })} />
          <TextField label="Country" required value={draft.country} onChange={(e) => setDraft({ ...draft, country: e.target.value })} />
          <TextField label="Phone" type="tel" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
          <div className="flex gap-3 sm:col-span-2">
            <button type="submit" className="btn btn-primary btn-sm">
              Save address
            </button>
            <button type="button" onClick={() => setAdding(false)} className="btn btn-outline btn-sm">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="btn btn-outline btn-sm mt-6">
          <Plus size={15} aria-hidden="true" /> Add new address
        </button>
      )}
    </div>
  )
}
