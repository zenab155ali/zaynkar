import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Inbox, Phone, User } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { SmartImage } from '@/components/ui/SmartImage'
import { useCurrency } from '@/context/CurrencyContext'
import { supabase } from '@/lib/supabase'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { CustomerRequest, RequestStatus } from '@/types/catalog'

const STATUS_OPTIONS: RequestStatus[] = ['new', 'seen', 'fulfilled']
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

export default function AdminRequestsPage() {
  useDocumentTitle('Admin — Customer Requests')
  const { format } = useCurrency()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requests, setRequests] = useState<CustomerRequest[]>([])

  const load = useCallback(async () => {
    if (!supabase) return
    setLoading(true)
    setError(null)
    const { data: reqRows, error: reqError } = await supabase
      .from('requests')
      .select('*, request_items(*)')
      .order('created_at', { ascending: false })
    if (reqError) {
      setError(reqError.message)
      setLoading(false)
      return
    }
    const rows = (reqRows ?? []) as RawRequest[]
    const customerIds = [...new Set(rows.map((r) => r.customer_id))]
    const profileMap = new Map<string, { fullName: string; phone: string }>()
    if (customerIds.length) {
      const { data: profiles } = await supabase.from('customer_profiles').select('user_id, full_name, phone').in('user_id', customerIds)
      for (const p of profiles ?? []) profileMap.set(p.user_id, { fullName: p.full_name, phone: p.phone })
    }

    setRequests(
      rows.map((r) => ({
        id: r.id,
        customerId: r.customer_id,
        status: r.status,
        note: r.note,
        createdAt: r.created_at,
        customer: profileMap.get(r.customer_id),
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
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const setStatus = async (id: string, status: RequestStatus) => {
    if (!supabase) return
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
    await supabase.from('requests').update({ status }).eq('id', id)
  }

  return (
    <div>
      <h1 className="display text-3xl">Customer Requests</h1>
      <p className="text-sm text-muted">What customers have picked, ready for you to prepare.</p>

      {error && (
        <p role="alert" className="mt-4 border border-sale/40 bg-white p-3 text-sm text-sale">
          {error}
        </p>
      )}

      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : requests.length === 0 ? (
          <EmptyState icon={<Inbox size={26} strokeWidth={1.3} />} title="No requests yet" description="When a customer finishes choosing and submits their list, it will show up here." />
        ) : (
          <ul className="space-y-5">
            {requests.map((r) => (
              <li key={r.id} className="border border-line bg-white">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-sand/40 px-5 py-3">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <User size={14} className="text-muted" aria-hidden="true" />
                      {r.customer?.fullName ?? 'Unknown customer'}
                    </p>
                    {r.customer?.phone && (
                      <a href={`tel:${r.customer.phone}`} className="mt-0.5 flex items-center gap-2 text-xs text-muted hover:text-ink">
                        <Phone size={12} aria-hidden="true" /> {r.customer.phone}
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <time dateTime={r.createdAt} className="text-xs text-muted">
                      {new Date(r.createdAt).toLocaleString()}
                    </time>
                    <select
                      value={r.status}
                      onChange={(e) => setStatus(r.id, e.target.value as RequestStatus)}
                      className={`border-none px-2.5 py-1.5 text-xs font-medium capitalize ${STATUS_STYLES[r.status]}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {r.note && <p className="border-b border-line px-5 py-2.5 text-sm italic text-muted">“{r.note}”</p>}
                <ul className="divide-y divide-line">
                  {r.items.map((item) => (
                    <li key={item.id} className="flex items-center gap-4 px-5 py-3">
                      <div className="relative h-20 w-[3.75rem] shrink-0 overflow-hidden bg-sand">
                        {item.photoUrl && <SmartImage image={{ url: item.photoUrl }} alt="" widths={[120, 200]} sizes="60px" />}
                      </div>
                      <div className="min-w-0 flex-1 text-sm">
                        {item.productId ? (
                          <Link to={`/store/${item.productCode}`} className="font-medium hover:underline">
                            {item.productName}
                          </Link>
                        ) : (
                          <p className="font-medium">{item.productName}</p>
                        )}
                        <p className="mt-0.5 text-xs text-muted">
                          Code: <span className="font-mono">{item.productCode}</span> · {item.colorName} · Size {item.size} · Qty {item.quantity}
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
    </div>
  )
}
