import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Shirt } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { RequireSupabase } from '@/components/ui/RequireSupabase'
import { SmartImage } from '@/components/ui/SmartImage'
import { useCurrency } from '@/context/CurrencyContext'
import { useProducts } from '@/context/ProductsContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

function StoreGrid() {
  const { format } = useCurrency()
  const { loading, error, products } = useProducts()
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState<string | null>(null)

  const active = useMemo(() => products.filter((p) => p.isActive), [products])

  const onSearchCode = (e: FormEvent) => {
    e.preventDefault()
    const match = active.find((p) => p.code.toLowerCase() === code.trim().toLowerCase())
    if (match) {
      navigate(`/store/${match.code}`)
    } else {
      setCodeError(`No item found with code "${code.trim()}".`)
    }
  }

  return (
    <div className="container-page py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-2">The real shop</p>
          <h1 className="display text-4xl sm:text-5xl">Dresses</h1>
        </div>
        <form onSubmit={onSearchCode} className="flex w-full max-w-xs gap-2">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setCodeError(null)
              }}
              placeholder="Search by item code"
              className="field !pl-9"
            />
          </div>
          <button type="submit" className="btn btn-outline btn-sm shrink-0">
            Go
          </button>
        </form>
      </div>
      {codeError && <p className="mb-6 text-sm text-sale">{codeError}</p>}

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : error ? (
        <p className="text-sm text-sale">{error}</p>
      ) : active.length === 0 ? (
        <EmptyState icon={<Shirt size={26} strokeWidth={1.3} />} title="Nothing here yet" description="New dresses are added regularly — check back soon." />
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {active.map((p) => {
            const cover = p.media.find((m) => m.type === 'image') ?? p.media[0]
            return (
              <Link key={p.id} to={`/store/${p.code}`} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden bg-sand">
                  {cover && cover.type === 'image' && <SmartImage image={{ url: cover.url }} alt="" className="transition-transform duration-500 group-hover:scale-[1.03]" />}
                </div>
                <p className="mt-3 font-mono text-[0.6875rem] text-muted">{p.code}</p>
                <h2 className="text-sm leading-snug group-hover:underline">{p.name}</h2>
                <p className="mt-1 text-sm font-medium">{format(p.price)}</p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function StorePage() {
  useDocumentTitle('Dresses')
  return (
    <RequireSupabase>
      <StoreGrid />
    </RequireSupabase>
  )
}
