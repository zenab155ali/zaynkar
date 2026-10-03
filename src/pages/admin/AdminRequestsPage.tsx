import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AtSign, Inbox, MapPin, Phone, Send, User } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { SmartImage } from '@/components/ui/SmartImage'
import { useCurrency } from '@/context/CurrencyContext'
import { supabase } from '@/lib/supabase'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { REQUEST_STAGES, REQUEST_STAGE_LABELS, type CustomerRequest, type RequestStage } from '@/types/catalog'

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
  order_number: string
  customer_id: string | null
  status: CustomerRequest['status']
  stage: RequestStage
  note: string
  created_at: string
  guest_full_name: string | null
  guest_country: string | null
  guest_phone: string | null
  guest_instagram: string | null
  request_items: RawItem[]
  request_messages: RawMessage[]
}

function MessageComposer({ requestId, onSent }: { requestId: string; onSent: (m: { id: string; requestId: string; body: string; createdAt: string }) => void }) {
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)

  const send = async () => {
    if (!supabase || !body.trim()) return
    setSending(true)
    const { data, error } = await supabase.from('request_messages').insert({ request_id: requestId, body: body.trim() }).select('*').single()
    setSending(false)
    if (!error && data) {
      onSent({ id: data.id, requestId: data.request_id, body: data.body, createdAt: data.created_at })
      setBody('')
    }
  }

  return (
    <div className="flex gap-2">
      <input
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && send()}
        placeholder="Send a note to this customer…"
        className="field flex-1 !h-10"
      />
      <button type="button" onClick={send} disabled={sending || !body.trim()} className="btn btn-outline !h-10 !w-10 shrink-0 !px-0 disabled:opacity-40">
        <Send size={15} aria-hidden="true" />
      </button>
    </div>
  )
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
      .select('*, request_items(*), request_messages(*)')
      .order('created_at', { ascending: false })
    if (reqError) {
      setError(reqError.message)
      setLoading(false)
      return
    }
    const rows = (reqRows ?? []) as RawRequest[]
    const customerIds = [...new Set(rows.map((r) => r.customer_id).filter((id): id is string => id !== null))]
    const profileMap = new Map<string, { fullName: string; phone: string }>()
    if (customerIds.length) {
      const { data: profiles } = await supabase.from('customer_profiles').select('user_id, full_name, phone').in('user_id', customerIds)
      for (const p of profiles ?? []) profileMap.set(p.user_id, { fullName: p.full_name, phone: p.phone })
    }

    setRequests(
      rows.map((r) => ({
        id: r.id,
        orderNumber: r.order_number,
        customerId: r.customer_id,
        status: r.status,
        stage: r.stage,
        note: r.note,
        createdAt: r.created_at,
        customer: r.customer_id ? profileMap.get(r.customer_id) : undefined,
        guestFullName: r.guest_full_name,
        guestCountry: r.guest_country,
        guestPhone: r.guest_phone,
        guestInstagram: r.guest_instagram,
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
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const setStage = async (id: string, stage: RequestStage) => {
    if (!supabase) return
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, stage } : r)))
    await supabase.from('requests').update({ stage }).eq('id', id)
  }

  const addMessage = (requestId: string, m: { id: string; requestId: string; body: string; createdAt: string }) => {
    setRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, messages: [...r.messages, m] } : r)))
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
            {requests.map((r) => {
              const total = r.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
              return (
                <li key={r.id} className="border border-line bg-white">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-sand/40 px-5 py-3">
                    <div>
                      <p className="flex items-center gap-2 text-sm font-medium">
                        <User size={14} className="text-muted" aria-hidden="true" />
                        {r.customer?.fullName ?? r.guestFullName ?? 'Unknown customer'}
                        {!r.customerId && <span className="rounded-full bg-sale/10 px-2 py-0.5 text-[10px] font-medium text-sale">GUEST — NO ACCOUNT</span>}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted">
                        {(r.customer?.phone ?? r.guestPhone) && (
                          <a href={`tel:${r.customer?.phone ?? r.guestPhone}`} className="flex items-center gap-1.5 hover:text-ink">
                            <Phone size={12} aria-hidden="true" /> {r.customer?.phone ?? r.guestPhone}
                          </a>
                        )}
                        {r.guestCountry && (
                          <span className="flex items-center gap-1.5">
                            <MapPin size={12} aria-hidden="true" /> {r.guestCountry}
                          </span>
                        )}
                        {r.guestInstagram && (
                          <a href={`https://instagram.com/${r.guestInstagram.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-ink">
                            <AtSign size={12} aria-hidden="true" /> {r.guestInstagram}
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-xs font-medium text-muted">{r.orderNumber}</span>
                      <time dateTime={r.createdAt} className="text-xs text-muted">
                        {new Date(r.createdAt).toLocaleString()}
                      </time>
                      <span className="text-sm font-medium">{format(total)}</span>
                      <select
                        value={r.stage}
                        onChange={(e) => setStage(r.id, e.target.value as RequestStage)}
                        className="border border-line bg-white px-2.5 py-1.5 text-xs font-medium"
                      >
                        {REQUEST_STAGES.map((s) => (
                          <option key={s} value={s}>
                            {REQUEST_STAGE_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {r.note && <p className="border-b border-line px-5 py-2.5 text-sm italic text-muted">“{r.note}”</p>}

                  {r.messages.length > 0 && (
                    <ul className="space-y-1.5 border-b border-line bg-sand/20 px-5 py-3">
                      {r.messages.map((m) => (
                        <li key={m.id} className="text-xs text-muted">
                          <span className="text-ink">{m.body}</span> — {new Date(m.createdAt).toLocaleString()}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="border-b border-line px-5 py-3">
                    <MessageComposer requestId={r.id} onSent={(m) => addMessage(r.id, m)} />
                  </div>

                  <ul className="divide-y divide-line">
                    {r.items.map((item) => (
                      <li key={item.id} className="flex items-center gap-4 px-5 py-3">
                        <div className="relative h-28 w-24 shrink-0 overflow-hidden bg-sand">
                          {item.photoUrl && <SmartImage image={{ url: item.photoUrl }} alt="" widths={[160, 260]} sizes="96px" />}
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
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
