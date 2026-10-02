import { useState, type ChangeEvent, type FormEvent } from 'react'
import { TextField } from '@/components/ui/TextField'
import { STORAGE_KEYS } from '@/config'
import { useToast } from '@/context/ToastContext'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { MOCK_PROFILE } from '@/utils/orders'
import type { UserProfile } from '@/types'

export function ProfileTab() {
  const { toast } = useToast()
  const [saved, setSaved] = useLocalStorage<UserProfile>(STORAGE_KEYS.profile, MOCK_PROFILE)
  const [draft, setDraft] = useState<UserProfile>(saved)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setSaved(draft)
    toast({ title: 'Profile updated' })
  }
  const bind = <K extends keyof UserProfile>(key: K) => ({
    value: draft[key] as string,
    onChange: (e: ChangeEvent<HTMLInputElement>) => setDraft({ ...draft, [key]: e.target.value }),
  })

  return (
    <form onSubmit={submit} className="grid max-w-2xl gap-4 sm:grid-cols-2">
      <TextField label="First name" autoComplete="given-name" required {...bind('firstName')} />
      <TextField label="Last name" autoComplete="family-name" required {...bind('lastName')} />
      <TextField className="sm:col-span-2" label="Email" type="email" autoComplete="email" required {...bind('email')} />
      <TextField label="Phone" type="tel" autoComplete="tel" {...bind('phone')} />
      <TextField label="Birthday" type="date" autoComplete="bday" {...bind('birthday')} />
      <label className="flex cursor-pointer items-center gap-3 text-sm sm:col-span-2">
        <input type="checkbox" checked={draft.newsletter} onChange={(e) => setDraft({ ...draft, newsletter: e.target.checked })} className="h-4 w-4 accent-ink" />
        Email me about new arrivals and new sellers
      </label>
      <div className="sm:col-span-2">
        <button type="submit" className="btn btn-primary">
          Save changes
        </button>
        <p className="mt-3 text-xs text-muted">Profile details are stored only in this browser (demo).</p>
      </div>
    </form>
  )
}
