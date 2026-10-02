import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Trash2 } from 'lucide-react'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { EmptyState } from '@/components/ui/EmptyState'
import { RequireSupabase } from '@/components/ui/RequireSupabase'
import { QuantityStepper } from '@/components/product/QuantityStepper'
import { useAuth } from '@/context/AuthContext'
import { useCurrency } from '@/context/CurrencyContext'
import { useSelections } from '@/context/SelectionsContext'
import { supabase } from '@/lib/supabase'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

function SelectionsView() {
  useDocumentTitle('My Selections')
  const { lines, remove, setQuantity, clear } = useSelections()
  const { user } = useAuth()
  const { format } = useCurrency()
  const navigate = useNavigate()
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const total = lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0)

  const submit = async () => {
    if (!user) {
      navigate('/signin', { state: { from: '/selections' } })
      return
    }
    if (!supabase || lines.length === 0) return
    setSubmitting(true)
    setError(null)

    const { data: request, error: reqError } = await supabase.from('requests').insert({ customer_id: user.id, note }).select('id').single()
    if (reqError || !request) {
      setError(reqError?.message ?? 'Could not submit your list — please try again.')
      setSubmitting(false)
      return
    }

    const colorPhoto = (productId: string, colorName: string) => {
      const line = lines.find((l) => l.productId === productId && l.colorName === colorName)
      const color = line?.product.colors.find((c) => c.colorName === colorName)
      return color?.photoUrl ?? line?.product.media.find((m) => m.type === 'image')?.url ?? null
    }

    const { error: itemsError } = await supabase.from('request_items').insert(
      lines.map((l) => ({
        request_id: request.id,
        product_id: l.product.id,
        product_code: l.product.code,
        product_name: l.product.name,
        color_name: l.colorName,
        photo_url: colorPhoto(l.product.id, l.colorName),
        size: l.size,
        price: l.product.price,
        quantity: l.quantity,
      })),
    )
    if (itemsError) {
      setError(itemsError.message)
      setSubmitting(false)
      return
    }

    clear()
    navigate('/my-requests')
  }

  if (lines.length === 0) {
    return (
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'My Selections' }]} />
        <EmptyState icon={<ShoppingBag size={26} strokeWidth={1.3} />} title="No selections yet" description="Pick a few dresses and come back here to send us your list.">
          <Link to="/store" className="btn btn-primary">
            Browse dresses
          </Link>
        </EmptyState>
      </div>
    )
  }

  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'My Selections' }]} />
      <h1 className="display mt-4 text-4xl">My Selections</h1>

      <ul className="mt-6 divide-y divide-line border-y border-line">
        {lines.map((l) => (
          <li key={l.id} className="flex gap-4 py-5">
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs text-muted">{l.product.code}</p>
              <p className="text-sm font-medium">{l.product.name}</p>
              <p className="mt-0.5 text-xs text-muted">
                {l.colorName} · Size {l.size}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <QuantityStepper compact value={l.quantity} onChange={(q) => setQuantity(l.id, q)} />
                <button type="button" onClick={() => remove(l.id)} className="inline-flex items-center gap-1 text-xs text-muted hover:text-sale">
                  <Trash2 size={13} /> Remove
                </button>
              </div>
            </div>
            <p className="shrink-0 text-sm font-medium">{format(l.product.price * l.quantity)}</p>
          </li>
        ))}
      </ul>

      <p className="mt-4 flex justify-between text-base font-medium">
        <span>Total</span>
        <span>{format(total)}</span>
      </p>

      <div className="mt-6">
        <label htmlFor="note" className="mb-1.5 block text-xs font-medium tracking-wide text-muted">
          Anything we should know? (optional)
        </label>
        <textarea id="note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} className="field !h-auto py-3" />
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-sale">
          {error}
        </p>
      )}

      <button type="button" onClick={submit} disabled={submitting} className="btn btn-primary mt-6 !h-14 w-full">
        {submitting ? 'Sending…' : user ? 'Submit my list' : 'Sign in to submit my list'}
      </button>
      <p className="mt-3 text-center text-xs text-muted">This sends your list to the store — no payment is taken here.</p>
    </div>
  )
}

export default function SelectionsPage() {
  return (
    <RequireSupabase>
      <SelectionsView />
    </RequireSupabase>
  )
}
