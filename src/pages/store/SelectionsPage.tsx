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
  useDocumentTitle('مختاراتي')
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
      setError('الاسم الكامل والبلد ورقم الهاتف إلزامية حتى نقدر نتواصل معكِ.')
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
      setError((reqError as { message?: string } | null)?.message ?? 'تعذّر إرسال قائمتك — حاولي مرة أخرى.')
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
    if (user) {
      navigate('/my-requests')
    } else {
      setGuestSubmitted(true)
    }
  }

  if (guestSubmitted) {
    return (
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: 'الرئيسية', to: '/' }, { label: 'مختاراتي' }]} />
        <EmptyState
          icon={<ShoppingBag size={26} strokeWidth={1.3} />}
          title="تم استلام طلبكِ"
          description="سنتواصل معكِ قريبًا على الرقم اللي تركتيه لتأكيد التفاصيل. بما إنه ما في حساب مسجّل، ما رح تقدري تشوفي حالة الطلب من هون — تابعي معنا مباشرة."
        >
          <Link to="/store" className="btn btn-primary">
            متابعة التسوق
          </Link>
        </EmptyState>
      </div>
    )
  }

  if (lines.length === 0) {
    return (
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: 'الرئيسية', to: '/' }, { label: 'مختاراتي' }]} />
        <EmptyState icon={<ShoppingBag size={26} strokeWidth={1.3} />} title="لا توجد مختارات بعد" description="اختاري بعض الفساتين وعودي إلى هنا لإرسال قائمتكِ.">
          <Link to="/store" className="btn btn-primary">
            تصفحي الفساتين
          </Link>
        </EmptyState>
      </div>
    )
  }

  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: 'الرئيسية', to: '/' }, { label: 'مختاراتي' }]} />
      <h1 className="display mt-4 text-4xl">مختاراتي</h1>

      <ul className="mt-6 divide-y divide-line border-y border-line">
        {lines.map((l) => (
          <li key={l.id} className="flex gap-4 py-5">
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs text-muted" dir="ltr">
                {l.product.code}
              </p>
              <p className="text-sm font-medium">{l.product.name}</p>
              <p className="mt-0.5 text-xs text-muted">
                {l.colorName} · المقاس {l.size}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <QuantityStepper compact value={l.quantity} onChange={(q) => setQuantity(l.id, q)} />
                <button type="button" onClick={() => remove(l.id)} className="inline-flex items-center gap-1 text-xs text-muted hover:text-sale">
                  <Trash2 size={13} /> إزالة
                </button>
              </div>
            </div>
            <p className="shrink-0 text-sm font-medium">{format(l.product.price * l.quantity)}</p>
          </li>
        ))}
      </ul>

      <p className="mt-4 flex justify-between text-base font-medium">
        <span>الإجمالي</span>
        <span>{format(total)}</span>
      </p>

      <div className="mt-6">
        <label htmlFor="note" className="mb-1.5 block text-xs font-medium tracking-wide text-muted">
          هل هناك ما تودين إخبارنا به؟ (اختياري)
        </label>
        <textarea id="note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} className="field !h-auto py-3" />
      </div>

      {!user && (
        <div className="mt-6 border border-line bg-sand/40 p-4">
          {!asGuest ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted">لإرسال قائمتكِ، سجّلي الدخول أو تابعي كزائرة بتعبئة بياناتكِ.</p>
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={() => navigate('/signin', { state: { from: '/selections' } })} className="btn btn-outline !h-11 flex-1 sm:flex-none">
                  تسجيل الدخول
                </button>
                <button type="button" onClick={() => setAsGuest(true)} className="btn btn-primary !h-11 flex-1 sm:flex-none">
                  المتابعة كزائرة
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium">بياناتكِ (إلزامية حتى نقدر نتواصل معكِ ونأكّد الطلب)</p>
              <div>
                <label htmlFor="guest-name" className="mb-1 block text-xs text-muted">
                  الاسم الكامل *
                </label>
                <input id="guest-name" value={guestFullName} onChange={(e) => setGuestFullName(e.target.value)} className="field" required />
              </div>
              <div>
                <label htmlFor="guest-country" className="mb-1 block text-xs text-muted">
                  البلد *
                </label>
                <input id="guest-country" value={guestCountry} onChange={(e) => setGuestCountry(e.target.value)} className="field" required />
              </div>
              <div>
                <label htmlFor="guest-phone" className="mb-1 block text-xs text-muted">
                  رقم الهاتف *
                </label>
                <input id="guest-phone" type="tel" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} className="field" dir="ltr" required />
              </div>
              <div>
                <label htmlFor="guest-instagram" className="mb-1 block text-xs text-muted">
                  حساب الإنستغرام (اختياري)
                </label>
                <input id="guest-instagram" value={guestInstagram} onChange={(e) => setGuestInstagram(e.target.value)} className="field" dir="ltr" placeholder="@username" />
              </div>
              <button type="button" onClick={() => setAsGuest(false)} className="text-xs text-muted underline">
                تسجيل الدخول بدلًا من ذلك
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
        {submitting ? 'جارٍ الإرسال…' : 'إرسال قائمتي'}
      </button>
      <p className="mt-3 text-center text-xs text-muted">هذا يرسل قائمتكِ إلى المتجر — لا يتم أخذ أي دفعة هنا.</p>
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
