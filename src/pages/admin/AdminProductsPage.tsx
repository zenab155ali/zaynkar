import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Heart, Package, Pencil, Plus, ShoppingBag, Trash2, Video } from 'lucide-react'
import { SmartImage } from '@/components/ui/SmartImage'
import { EmptyState } from '@/components/ui/EmptyState'
import { useCurrency } from '@/context/CurrencyContext'
import { useProducts } from '@/context/ProductsContext'
import { supabase } from '@/lib/supabase'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function AdminProductsPage() {
  useDocumentTitle('Admin — Products')
  const { loading, products, refresh } = useProducts()
  const { format } = useCurrency()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleActive = async (id: string, next: boolean) => {
    if (!supabase) return
    setBusyId(id)
    const { error } = await supabase.from('products').update({ is_active: next }).eq('id', id)
    if (error) setNotice(error.message)
    await refresh()
    setBusyId(null)
  }

  const remove = async (id: string, name: string) => {
    if (!supabase) return
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    setBusyId(id)
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) setNotice(error.message)
    await refresh()
    setBusyId(null)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="display text-3xl">Products</h1>
          <p className="text-sm text-muted">{products.length} total</p>
        </div>
        <Link to="/admin/products/new" className="btn btn-primary btn-sm">
          <Plus size={16} aria-hidden="true" /> Add new product
        </Link>
      </div>

      {notice && (
        <p role="alert" className="mb-4 border border-sale/40 bg-white p-3 text-sm text-sale">
          {notice}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : products.length === 0 ? (
        <EmptyState icon={<Package size={26} strokeWidth={1.3} />} title="No products yet" description="Add your first item to start showing it to customers.">
          <Link to="/admin/products/new" className="btn btn-primary">
            Add your first product
          </Link>
        </EmptyState>
      ) : (
        <div className="overflow-x-auto border border-line bg-white">
          <table className="w-full min-w-[50rem] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-sand/40 text-xs uppercase tracking-wider text-muted">
                <th className="px-4 py-3 font-medium">Photo</th>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Colors</th>
                <th className="px-4 py-3 font-medium">Sizes</th>
                <th className="px-4 py-3 font-medium">Picked</th>
                <th className="px-4 py-3 font-medium">Liked</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-line/60 last:border-0">
                  <td className="px-4 py-3">
                    <div className="relative grid h-16 w-12 place-items-center overflow-hidden bg-sand">
                      {p.media[0] &&
                        (p.media[0].type === 'video' ? (
                          <Video size={16} className="text-muted" aria-label="Video" />
                        ) : (
                          <SmartImage image={{ url: p.media[0].url }} alt="" widths={[96]} sizes="48px" />
                        ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{p.code}</td>
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3 text-muted">{p.categoryName}</td>
                  <td className="px-4 py-3">{format(p.price)}</td>
                  <td className="px-4 py-3 text-muted">{p.colors.length}</td>
                  <td className="px-4 py-3 text-muted">{p.sizes.join(', ') || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-muted">
                      <ShoppingBag size={13} /> {p.pickCount}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-muted">
                      <Heart size={13} /> {p.likeCount}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={busyId === p.id}
                      onClick={() => toggleActive(p.id, !p.isActive)}
                      className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium ${p.isActive ? 'bg-[#e3efe7] text-success' : 'bg-sand text-muted'}`}
                    >
                      {p.isActive ? <Eye size={13} /> : <EyeOff size={13} />}
                      {p.isActive ? 'Visible' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Link to={`/admin/products/${p.id}`} aria-label={`Edit ${p.name}`} className="grid h-9 w-9 place-items-center text-muted hover:text-ink">
                        <Pencil size={16} />
                      </Link>
                      <button type="button" disabled={busyId === p.id} onClick={() => remove(p.id, p.name)} aria-label={`Delete ${p.name}`} className="grid h-9 w-9 place-items-center text-muted hover:text-sale">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
