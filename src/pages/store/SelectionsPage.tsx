import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Trash2 } from 'lucide-react'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { EmptyState } from '@/components/ui/EmptyState'
import { RequireSupabase } from '@/components/ui/RequireSupabase'
import { SmartImage } from '@/components/ui/SmartImage'
import { QuantityStepper } from '@/components/product/QuantityStepper'
import { useAuth } from '@/context/AuthContext'
import { useCurrency } from '@/context/CurrencyContext'
import { useLanguage } from '@/context/LanguageContext'
import { useSelections, type SelectionLineDetailed } from '@/context/SelectionsContext'
import { supabase } from '@/lib/supabase'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

/** The photo for the SPECIFIC color a line has — not just a generic product shot — so the
 * customer can see at a glance it's really the item/color they picked. */
function linePhoto(line: SelectionLineDetailed): string | null {
  const color = line.product.colors.find((c) => c.colorName === line.colorName)
  return color?.photoUrl ?? line.product.media.find((m) => m.type === 'image')?.url ?? null
}

function SelectionsView() {
  const { t, pick } = useLanguage()
  useDocumentTitle(t('shoppingCart'))
  const { lines, remove, setQuantity, clear } = useSelections()
  const { user } = useAuth()
  const { format } = useCurrency()
  const navigate = useNavigate()
  const [note, setNote] = useState('')
  const [asGuest, setAsGuest] = useState(false)
  const [guestFullName, setGuestFullName] = useState('')
  const [guestCountry, setGuestCountry] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [guestInstagram, setGuestInstagram] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [guestSubmitted, setGuestSubmitted] = useState(false)

  const total = lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0)
  const guestDetailsValid = guestFullName.trim() && guestCountry.trim() && guestPhone.trim()

  const submit = async () => {
    if (!supabase || lines.length === 0) return
    if (!user && !asGuest) return
    if (asGuest && !user && !guestDetailsValid) {
      setError(t('guestFieldsRequiredError'))
      return
    }
    setSubmitting(true)
    setError(null)

    // Guests (no account) can't be given back the row they just inserted — Postgres's
    // RLS also checks SELECT visibility for RETURNING, and guest orders are deliberately
    // not readable by anonymous visitors (that would leak every guest's phone number).
    // So for guests we generate the id ourselves and skip asking the database to return it.
    const requestId = user ? null : crypto.randomUUID()

    const { data: request, error: reqError } = user
      ? await supabase.from('requests').insert({ customer_id: user.id, note }).select('id').single()
      : await supabase
          .from('requests')
          .insert({
            id: requestId,
            customer_id: null,
            note,
            guest_full_name: guestFullName.trim(),
            guest_country: guestCountry.trim(),
            guest_phone: guestPhone.trim(),
            guest_instagram: guestInstagram.trim() || null,
          })
          .then(() => ({ data: { id: requestId }, error: null }))
    if (reqError || !request) {
      setError((reqError as { message?: string } | null)?.message ?? t('submitFailed'))
      setSubmitting(false)
      return
    }

    const { error: itemsError } = await supabase.from('request_items').insert(
      lines.map((l) => ({
        request_id: request.id,
        product_id: l.product.id,
        product_code: l.product.code,
        product_name: l.product.name,
        color_name: l.colorName,
        photo_url: linePhoto(l),
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
    if (user) {
      navigate('/my-requests')
    } else {
      setGuestSubmitted(true)
    }
  }

  if (guestSubmitted) {
    return (
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: t('home'), to: '/' }, { label: t('shoppingCart') }]} />
        <EmptyState icon={<ShoppingBag size={26} strokeWidth={1.3} />} title={t('orderReceivedTitle')} description={t('orderReceivedGuestDesc')}>
          <Link to="/store" className="btn btn-primary">
            {t('continueShopping')}
          </Link>
        </EmptyState>
      </div>
    )
  }

  if (lines.length === 0) {
    return (
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: t('home'), to: '/' }, { label: t('shoppingCart') }]} />
        <EmptyState icon={<ShoppingBag size={26} strokeWidth={1.3} />} title={t('cartEmpty')} description={t('cartEmptyHint')}>
          <Link to="/store" className="btn btn-primary">
            {t('browseDresses')}
          </Link>
        </EmptyState>
      </div>
    )
  }

  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: t('home'), to: '/' }, { label: t('shoppingCart') }]} />
      <h1 className="display mt-4 text-4xl">{t('shoppingCart')}</h1>

      <ul className="mt-6 divide-y divide-line border-y border-line">
        {lines.map((l) => {
          const editState = { editLineId: l.id, color: l.colorName, size: l.size }
          const photo = linePhoto(l)
          const colorNameHe = l.product.colors.find((c) => c.colorName === l.colorName)?.colorNameHe
          return (
            <li key={l.id} className="flex gap-4 py-5">
              <Link to={`/store/${l.product.code}`} state={editState} className="relative h-28 w-24 shrink-0 overflow-hidden bg-sand">
                {photo && <SmartImage image={{ url: photo }} alt="" widths={[160, 260]} sizes="96px" />}
              </Link>
              <div className="min-w-0 flex-1">
                <Link to={`/store/${l.product.code}`} state={editState} className="block">
                  <p className="font-mono text-xs text-muted" dir="ltr">
                    {l.product.code}
                  </p>
                  <p className="text-sm font-medium hover:underline">{pick(l.product.name, l.product.nameHe)}</p>
                </Link>
                <p className="mt-0.5 text-xs text-muted">
                  {pick(l.colorName, colorNameHe)} · {t('size')} {l.size}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <QuantityStepper compact value={l.quantity} onChange={(q) => setQuantity(l.id, q)} />
                  <button type="button" onClick={() => remove(l.id)} className="inline-flex items-center gap-1 text-xs text-muted hover:text-sale">
                    <Trash2 size={13} /> {t('remove')}
                  </button>
                </div>
              </div>
              <p className="shrink-0 text-sm font-medium">{format(l.product.price * l.quantity)}</p>
            </li>
          )
        })}
      </ul>

      <p className="mt-4 flex justify-between text-base font-medium">
        <span>{t('total')}</span>
        <span>{format(total)}</span>
      </p>

      <div className="mt-6">
        <label htmlFor="note" className="mb-1.5 block text-xs font-medium tracking-wide text-muted">
          {t('anythingToTellUs')}
        </label>
        <textarea id="note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} className="field !h-auto py-3" />
      </div>

      {!user && (
        <div className="mt-6 border border-line bg-sand/40 p-4">
          {!asGuest ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted">{t('signInToSendList')}</p>
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={() => navigate('/signin', { state: { from: '/selections' } })} className="btn btn-outline !h-11 flex-1 sm:flex-none">
                  {t('signIn')}
                </button>
                <button type="button" onClick={() => setAsGuest(true)} className="btn btn-primary !h-11 flex-1 sm:flex-none">
                  {t('continueAsGuest')}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium">{t('guestDetailsRequired')}</p>
              <div>
                <label htmlFor="guest-name" className="mb-1 block text-xs text-muted">
                  {t('fullName')} *
                </label>
                <input id="guest-name" value={guestFullName} onChange={(e) => setGuestFullName(e.target.value)} className="field" required />
              </div>
              <div>
                <label htmlFor="guest-country" className="mb-1 block text-xs text-muted">
                  {t('country')} *
                </label>
                <input id="guest-country" value={guestCountry} onChange={(e) => setGuestCountry(e.target.value)} className="field" required />
              </div>
              <div>
                <label htmlFor="guest-phone" className="mb-1 block text-xs text-muted">
                  {t('phoneNumber')} *
                </label>
                <input id="guest-phone" type="tel" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} className="field" dir="ltr" required />
              </div>
              <div>
                <label htmlFor="guest-instagram" className="mb-1 block text-xs text-muted">
                  {t('instagramOptional')}
                </label>
                <input id="guest-instagram" value={guestInstagram} onChange={(e) => setGuestInstagram(e.target.value)} className="field" dir="ltr" placeholder="@username" />
              </div>
              <button type="button" onClick={() => setAsGuest(false)} className="text-xs text-muted underline">
                {t('signInInstead')}
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="mt-4 text-sm text-sale">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={submitting || (!user && (!asGuest || !guestDetailsValid))}
        className="btn btn-primary mt-6 !h-14 w-full disabled:opacity-40"
      >
        {submitting ? t('sending') : t('sendMyList')}
      </button>
      <p className="mt-3 text-center text-xs text-muted">{t('noPaymentNote')}</p>
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
