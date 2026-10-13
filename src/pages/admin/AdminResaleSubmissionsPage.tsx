import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AtSign, Check, MapPin, Phone, X } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { useProducts } from '@/context/ProductsContext'
import { supabase } from '@/lib/supabase'
import { draftKeyForNewProduct } from '@/lib/productDrafts'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

interface Submission {
  id: string
  sellerName: string
  sellerPhone: string | null
  sellerInstagram: string | null
  sellerCity: string | null
  dressName: string
  description: string | null
  price: number
  size: string | null
  photoUrls: string[]
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export default function AdminResaleSubmissionsPage() {
  useDocumentTitle('Admin — Resale Submissions')
  const { categories } = useProducts()
  const navigate = useNavigate()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const resaleCategory = categories.find((c) => c.isResale)

  const load = async () => {
    if (!supabase) return
    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('resale_submissions')
      .select('id, seller_name, seller_phone, seller_instagram, seller_city, dress_name, description, price, size, photo_urls, status, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
    if (fetchError) {
      setError(fetchError.message)
    } else {
      setSubmissions(
        (data ?? []).map((r) => ({
          id: r.id,
          sellerName: r.seller_name,
          sellerPhone: r.seller_phone,
          sellerInstagram: r.seller_instagram,
          sellerCity: r.seller_city,
          dressName: r.dress_name,
          description: r.description,
          price: Number(r.price),
          size: r.size,
          photoUrls: r.photo_urls ?? [],
          status: r.status,
          createdAt: r.created_at,
        })),
      )
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const approve = async (s: Submission) => {
    if (!supabase) return
    if (!resaleCategory) {
      setError('Mark a category as the resale category first (Categories page → checkbox), then come back here.')
      return
    }
    setBusyId(s.id)
    const draft = {
      name: s.dressName,
      categoryId: resaleCategory.id,
      description: s.description ?? '',
      price: String(s.price),
      sizes: s.size ? [s.size] : [],
      isActive: true,
      media: s.photoUrls.slice(1).map((url) => ({ url, type: 'image' as const })),
      coverFocalX: 50,
      coverFocalY: 50,
      colors: [{ colorName: s.dressName, photoUrl: s.photoUrls[0] ?? null }],
      savedAt: Date.now(),
    }
    try {
      localStorage.setItem(draftKeyForNewProduct(), JSON.stringify(draft))
    } catch {
      // ignore (storage full/blocked) — the form will just open blank and she can re-enter
    }
    await supabase.from('resale_submissions').update({ status: 'approved' }).eq('id', s.id)
    navigate('/admin/products/new')
  }

  const reject = async (id: string) => {
    if (!supabase) return
    if (!window.confirm('Reject this submission? It will be removed from the list.')) return
    setBusyId(id)
    await supabase.from('resale_submissions').update({ status: 'rejected' }).eq('id', id)
    await load()
    setBusyId(null)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="display text-3xl">Resale Submissions</h1>
        <p className="text-sm text-muted">Dresses customers want to sell — review before anything goes live.</p>
      </div>

      {!resaleCategory && (
        <p className="mb-4 border border-sale/40 bg-white p-3 text-sm text-sale">
          No category is marked as the resale category yet — go to Categories and check "This is the sell-your-own-dress category" on one, otherwise
          Approve won't know where to file new products.
        </p>
      )}

      {error && (
        <p role="alert" className="mb-4 border border-sale/40 bg-white p-3 text-sm text-sale">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : submissions.length === 0 ? (
        <EmptyState icon={<Check size={26} strokeWidth={1.3} />} title="Nothing pending" description="New submissions from customers will show up here for review." />
      ) : (
        <ul className="space-y-4">
          {submissions.map((s) => (
            <li key={s.id} className="border border-line bg-white p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex gap-2">
                  {s.photoUrls.map((url, i) => (
                    <img key={i} src={url} alt="" className="h-28 w-20 border border-line object-cover" />
                  ))}
                </div>
                <div className="min-w-[14rem] flex-1">
                  <p className="font-medium">{s.dressName}</p>
                  <p className="text-sm text-muted">
                    {s.price} · {s.size || 'No size given'}
                  </p>
                  {s.description && <p className="mt-1 text-sm text-muted">{s.description}</p>}
                  <p className="mt-2 text-xs text-muted">{new Date(s.createdAt).toLocaleString()}</p>
                </div>
                <div className="min-w-[12rem] border-s border-line ps-4 text-sm">
                  <p className="font-medium">{s.sellerName}</p>
                  {s.sellerPhone && (
                    <p className="mt-1 flex items-center gap-1.5 text-muted" dir="ltr">
                      <Phone size={13} aria-hidden="true" /> {s.sellerPhone}
                    </p>
                  )}
                  {s.sellerInstagram && (
                    <a
                      href={`https://instagram.com/${s.sellerInstagram.replace(/^@/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 flex items-center gap-1.5 text-muted hover:text-ink"
                    >
                      <AtSign size={13} aria-hidden="true" /> {s.sellerInstagram}
                    </a>
                  )}
                  {s.sellerCity && (
                    <p className="mt-1 flex items-center gap-1.5 text-muted">
                      <MapPin size={13} aria-hidden="true" /> {s.sellerCity}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex gap-2 border-t border-line pt-4">
                <button type="button" disabled={busyId === s.id} onClick={() => approve(s)} className="btn btn-primary btn-sm">
                  <Check size={14} aria-hidden="true" /> Approve &amp; create product
                </button>
                <button type="button" disabled={busyId === s.id} onClick={() => reject(s.id)} className="btn btn-outline btn-sm">
                  <X size={14} aria-hidden="true" /> Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
