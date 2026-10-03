import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Inbox, LogOut } from 'lucide-react'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { EmptyState } from '@/components/ui/EmptyState'
import { RequireSupabase } from '@/components/ui/RequireSupabase'
import { SmartImage } from '@/components/ui/SmartImage'
import { useAuth } from '@/context/AuthContext'
import { useCurrency } from '@/context/CurrencyContext'
import { supabase } from '@/lib/supabase'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { CustomerRequest, RequestStatus } from '@/types/catalog'

const STATUS_LABEL: Record<RequestStatus, string> = { new: 'تم الاستلام', seen: 'قيد التجهيز', fulfilled: 'جاهز' }
const STATUS_STYLES: Record<RequestStatus, string> = {
  new: 'bg-sale/10 text-sale',
  seen: 'bg-sand text-mocha',
  fulfilled: 'bg-[#e3efe7] text-success',
}

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
interface RawRequest {
  id: string
  customer_id: string
  status: RequestStatus
  note: string
  created_at: string
  request_items: RawItem[]
}

function MyRequestsView() {
  useDocumentTitle('طلباتي')
  const { user, signOut } = useAuth()
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
      .select('*, request_items(*)')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const rows = (data ?? []) as RawRequest[]
        setRequests(
          rows.map((r) => ({
            id: r.id,
            customerId: r.customer_id,
            status: r.status,
            note: r.note,
            createdAt: r.created_at,
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
          })),
        )
        setLoading(false)
      })
  }, [user])

  if (!user) return <Navigate to="/signin" state={{ from: '/my-requests' }} replace />

  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: 'الرئيسية', to: '/' }, { label: 'طلباتي' }]} />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="display text-4xl">طلباتي</h1>
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
          {requests.map((r) => (
            <li key={r.id} className="border border-line bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-sand/40 px-5 py-3">
                <time dateTime={r.createdAt} className="text-xs text-muted">
                  {new Date(r.createdAt).toLocaleString()}
                </time>
                <span className={`px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[r.status]}`}>{STATUS_LABEL[r.status]}</span>
              </div>
              {r.note && <p className="border-b border-line px-5 py-2.5 text-sm italic text-muted">“{r.note}”</p>}
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
          ))}
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
