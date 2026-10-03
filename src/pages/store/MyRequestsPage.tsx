import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Inbox, LogOut, MessageCircle, Phone } from 'lucide-react'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { EmptyState } from '@/components/ui/EmptyState'
import { RequireSupabase } from '@/components/ui/RequireSupabase'
import { SmartImage } from '@/components/ui/SmartImage'
import { OrderStageTracker } from '@/components/store/OrderStageTracker'
import { useAuth } from '@/context/AuthContext'
import { useCurrency } from '@/context/CurrencyContext'
import { supabase } from '@/lib/supabase'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { CustomerRequest, RequestStage, RequestStatus } from '@/types/catalog'

interface RawItem {
  id: string
  product_id: string | null
  product_code: string
  product_name: string
  color_name: string
  photo_url: string | null
  size: string
  price: number
  quantity: number
}
interface RawMessage {
  id: string
  request_id: string
  body: string
  created_at: string
}
interface RawRequest {
  id: string
  customer_id: string
  status: RequestStatus
  stage: RequestStage
  note: string
  created_at: string
  request_items: RawItem[]
  request_messages: RawMessage[]
}

function MyRequestsView() {
  useDocumentTitle('سلة مشترياتي')
  const { user, profile, signOut, loading: authLoading } = useAuth()
  const { format } = useCurrency()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<CustomerRequest[]>([])
  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  useEffect(() => {
    if (!supabase || !user) return
    supabase
      .from('requests')
      .select('*, request_items(*), request_messages(*)')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const rows = (data ?? []) as RawRequest[]
        setRequests(
          rows.map((r) => ({
            id: r.id,
            customerId: r.customer_id,
            status: r.status,
            stage: r.stage,
            note: r.note,
            createdAt: r.created_at,
            guestFullName: null,
            guestCountry: null,
            guestPhone: null,
            guestInstagram: null,
            items: r.request_items.map((i) => ({
              id: i.id,
              productId: i.product_id,
              productCode: i.product_code,
              productName: i.product_name,
              colorName: i.color_name,
              photoUrl: i.photo_url,
              size: i.size,
              price: Number(i.price),
              quantity: i.quantity,
            })),
            messages: r.request_messages
              .map((m) => ({ id: m.id, requestId: m.request_id, body: m.body, createdAt: m.created_at }))
              .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
          })),
        )
        setLoading(false)
      })
  }, [user])

  if (authLoading) return <p className="container-page py-8 text-sm text-muted">جارٍ التحميل…</p>
  if (!user) return <Navigate to="/signin" state={{ from: '/my-requests' }} replace />

  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: 'الرئيسية', to: '/' }, { label: 'سلة مشترياتي' }]} />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="display text-4xl">سلة مشترياتي</h1>
        <button type="button" onClick={handleSignOut} className="flex items-center gap-2 text-sm text-muted hover:text-sale">
          <LogOut size={16} strokeWidth={1.6} aria-hidden="true" /> تسجيل الخروج
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-muted">جارٍ التحميل…</p>
      ) : requests.length === 0 ? (
        <EmptyState icon={<Inbox size={26} strokeWidth={1.3} />} title="لا توجد طلبات بعد" description="القوائم التي ترسلينها ستظهر هنا.">
          <Link to="/store" className="btn btn-primary">
            تصفحي الفساتين
          </Link>
        </EmptyState>
      ) : (
        <ul className="mt-6 space-y-5">
          {requests.map((r) => {
            const total = r.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
            return (
              <li key={r.id} className="border border-line bg-white">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-sand/40 px-5 py-3">
                  <time dateTime={r.createdAt} className="text-xs text-muted">
                    {new Date(r.createdAt).toLocaleString()}
                  </time>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    {profile?.phone && (
                      <span className="flex items-center gap-1.5 text-muted" dir="ltr">
                        <Phone size={13} aria-hidden="true" /> {profile.phone}
                      </span>
                    )}
                    <span className="font-medium">الإجمالي: {format(total)}</span>
                  </div>
                </div>
                {r.note && <p className="border-b border-line px-5 py-2.5 text-sm italic text-muted">"{r.note}"</p>}

                <div className="border-b border-line px-5 py-4">
                  <p className="mb-3 text-xs font-medium tracking-wide text-muted">حالة الطلبية</p>
                  <OrderStageTracker stage={r.stage} />
                </div>

                {r.messages.length > 0 && (
                  <div className="border-b border-line bg-sand/20 px-5 py-4">
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted">
                      <MessageCircle size={14} aria-hidden="true" /> رسائل من المتجر
                    </p>
                    <ul className="space-y-2">
                      {r.messages.map((m) => (
                        <li key={m.id} className="border border-line bg-white px-3 py-2 text-sm">
                          <p>{m.body}</p>
                          <time dateTime={m.createdAt} className="mt-1 block text-[11px] text-muted">
                            {new Date(m.createdAt).toLocaleString()}
                          </time>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <ul className="divide-y divide-line">
                  {r.items.map((item) => (
                    <li key={item.id} className="flex items-center gap-4 px-5 py-3">
                      <div className="relative h-28 w-24 shrink-0 overflow-hidden bg-sand">
                        {item.photoUrl && <SmartImage image={{ url: item.photoUrl }} alt="" widths={[160, 260]} sizes="96px" />}
                      </div>
                      <div className="min-w-0 flex-1 text-sm">
                        <p className="font-medium">{item.productName}</p>
                        <p className="mt-0.5 text-xs text-muted">
                          الرمز:{' '}
                          <span className="font-mono" dir="ltr">
                            {item.productCode}
                          </span>{' '}
                          · {item.colorName} · المقاس {item.size} · الكمية {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm">{format(item.price * item.quantity)}</p>
                    </li>
                  ))}
                </ul>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default function MyRequestsPage() {
  return (
    <RequireSupabase>
      <MyRequestsView />
    </RequireSupabase>
  )
}
