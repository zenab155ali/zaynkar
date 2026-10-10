import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, FileClock, Heart, ImageDown, Languages, Package, Pencil, Plus, ShoppingBag, Trash2, Video, X } from 'lucide-react'
import { SmartImage } from '@/components/ui/SmartImage'
import { EmptyState } from '@/components/ui/EmptyState'
import { useCurrency } from '@/context/CurrencyContext'
import { useProducts } from '@/context/ProductsContext'
import { supabase } from '@/lib/supabase'
import { translateToHebrew } from '@/lib/translate'
import { recompressExistingPhoto } from '@/lib/uploadProductMedia'
import { listDrafts, removeDraft, type DraftSummary } from '@/lib/productDrafts'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

function relativeTime(ms: number): string {
  const minutes = Math.round((Date.now() - ms) / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.round(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

function DraftsRecovery({ resolveName }: { resolveName: (productId: string) => string | undefined }) {
  const [drafts, setDrafts] = useState<DraftSummary[]>([])

  useEffect(() => {
    setDrafts(listDrafts())
  }, [])

  if (drafts.length === 0) return null

  const discard = (key: string) => {
    removeDraft(key)
    setDrafts((prev) => prev.filter((d) => d.key !== key))
  }

  return (
    <div className="mb-6 border border-line bg-sand/40">
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-muted">
        <FileClock size={14} /> Unsaved drafts found ({drafts.length})
      </div>
      <ul className="divide-y divide-line">
        {drafts.map((d) => (
          <li key={d.key} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
            <div>
              <span className="font-medium">{d.productId ? resolveName(d.productId) ?? d.name : d.name}</span>
              <span className="ms-2 text-xs text-muted">{d.productId ? 'editing' : 'new product'} · saved {relativeTime(d.savedAt)}</span>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Link
                to={`/admin/products/${d.productId ?? 'new'}?draft=${encodeURIComponent(d.key)}`}
                className="text-xs font-medium underline underline-offset-2"
              >
                Resume
              </Link>
              <button type="button" onClick={() => discard(d.key)} aria-label="Discard this draft" className="text-muted hover:text-sale">
                <X size={14} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function AdminProductsPage() {
  useDocumentTitle('Admin — Products')
  const { loading, products, categories, refresh } = useProducts()
  const { format } = useCurrency()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [translating, setTranslating] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [compressProgress, setCompressProgress] = useState<{ done: number; total: number } | null>(null)
  const [restoring, setRestoring] = useState(false)
  const [compressionLogCount, setCompressionLogCount] = useState(0)

  const refreshCompressionLogCount = async () => {
    if (!supabase) return
    const { count } = await supabase.from('photo_compression_log').select('id', { count: 'exact', head: true })
    setCompressionLogCount(count ?? 0)
  }

  useEffect(() => {
    refresh()
    refreshCompressionLogCount()
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

  // Fills in any missing Hebrew translation for existing catalog data — safe to run more
  // than once, since it only touches rows that don't already have a Hebrew value.
  const translateExistingCatalog = async () => {
    if (!supabase) return
    setTranslating(true)
    setNotice(null)
    let filled = 0
    try {
      for (const c of categories) {
        if (c.nameHe) continue
        const nameHe = await translateToHebrew(c.name)
        if (nameHe) {
          await supabase.from('categories').update({ name_he: nameHe }).eq('id', c.id)
          filled++
        }
      }
      for (const p of products) {
        const patch: { name_he?: string; description_he?: string } = {}
        if (!p.nameHe) {
          const nameHe = await translateToHebrew(p.name)
          if (nameHe) patch.name_he = nameHe
        }
        if (p.description && !p.descriptionHe) {
          const descriptionHe = await translateToHebrew(p.description)
          if (descriptionHe) patch.description_he = descriptionHe
        }
        if (Object.keys(patch).length > 0) {
          await supabase.from('products').update(patch).eq('id', p.id)
          filled++
        }
        for (const color of p.colors) {
          if (color.colorNameHe || !color.colorName.trim()) continue
          const colorNameHe = await translateToHebrew(color.colorName)
          if (colorNameHe) {
            await supabase.from('product_colors').update({ color_name_he: colorNameHe }).eq('id', color.id)
            filled++
          }
        }
      }
      setNotice(filled > 0 ? `Translated ${filled} item${filled === 1 ? '' : 's'} to Hebrew.` : 'Everything already has a Hebrew translation.')
      await refresh()
    } catch {
      setNotice('Something went wrong while translating — you can try again.')
    }
    setTranslating(false)
  }

  // Shrinks every existing full-size photo (uploaded before photos were compressed automatically)
  // down to a much smaller WebP copy and repoints the product/color at it — safe to run more than
  // once, since an already-compressed (.webp) photo is simply skipped. Processes several photos at
  // once (instead of one at a time) with a visible counter, since a full catalog can easily be a
  // few hundred photos and each one needs its own download + upload round trip.
  const compressExistingPhotos = async () => {
    if (!supabase) return
    const sb = supabase
    interface PhotoTask {
      table: 'product_media' | 'product_colors'
      rowId: string
      column: 'media_url' | 'photo_url'
      url: string
    }
    const tasks: PhotoTask[] = []
    for (const p of products) {
      for (const m of p.media) if (m.type === 'image') tasks.push({ table: 'product_media', rowId: m.id, column: 'media_url', url: m.url })
      for (const c of p.colors) if (c.photoUrl) tasks.push({ table: 'product_colors', rowId: c.id, column: 'photo_url', url: c.photoUrl })
    }

    setCompressing(true)
    setNotice(null)
    setCompressProgress({ done: 0, total: tasks.length })
    let compressedCount = 0
    let processedCount = 0
    const CONCURRENCY = 5

    try {
      let next = 0
      const worker = async () => {
        while (next < tasks.length) {
          const task = tasks[next++]
          const newUrl = await recompressExistingPhoto(task.url)
          if (newUrl) {
            await sb.from('photo_compression_log').insert({ table_name: task.table, row_id: task.rowId, column_name: task.column, old_url: task.url, new_url: newUrl })
            await sb.from(task.table).update({ [task.column]: newUrl }).eq('id', task.rowId)
            compressedCount++
          }
          processedCount++
          setCompressProgress({ done: processedCount, total: tasks.length })
        }
      }
      await Promise.all(Array.from({ length: Math.min(CONCURRENCY, tasks.length) }, worker))

      setNotice(compressedCount > 0 ? `Compressed ${compressedCount} photo${compressedCount === 1 ? '' : 's'}.` : 'Every photo is already compressed.')
      await refresh()
      await refreshCompressionLogCount()
    } catch {
      setNotice('Something went wrong while compressing — you can try again.')
    }
    setCompressing(false)
    setCompressProgress(null)
  }

  // Undoes compressExistingPhotos: puts every row back on its original (uncompressed) photo,
  // using the log that compression wrote before each change. The compressed copies are left in
  // storage (harmless, just unused) rather than deleted, to keep this restore itself safe to re-run.
  const restoreOriginalPhotos = async () => {
    if (!supabase) return
    if (!window.confirm(`Restore ${compressionLogCount} photo${compressionLogCount === 1 ? '' : 's'} to their original, uncompressed versions?`)) return
    setRestoring(true)
    setNotice(null)
    try {
      const { data: log } = await supabase.from('photo_compression_log').select('id, table_name, row_id, column_name, old_url')
      for (const entry of log ?? []) {
        await supabase.from(entry.table_name).update({ [entry.column_name]: entry.old_url }).eq('id', entry.row_id)
        await supabase.from('photo_compression_log').delete().eq('id', entry.id)
      }
      setNotice(`Restored ${log?.length ?? 0} photo${log?.length === 1 ? '' : 's'} to their originals.`)
      await refresh()
      await refreshCompressionLogCount()
    } catch {
      setNotice('Something went wrong while restoring — you can try again.')
    }
    setRestoring(false)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="display text-3xl">Products</h1>
          <p className="text-sm text-muted">{products.length} total</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={compressExistingPhotos} disabled={compressing} className="btn btn-outline btn-sm disabled:opacity-50">
            <ImageDown size={16} aria-hidden="true" />
            {compressing ? `Compressing… (${compressProgress?.done ?? 0}/${compressProgress?.total ?? 0})` : 'Compress existing photos'}
          </button>
          {compressionLogCount > 0 && (
            <button type="button" onClick={restoreOriginalPhotos} disabled={restoring} className="btn btn-outline btn-sm disabled:opacity-50">
              <ImageDown size={16} aria-hidden="true" className="rotate-180" /> {restoring ? 'Restoring…' : `Restore original photos (${compressionLogCount})`}
            </button>
          )}
          <button type="button" onClick={translateExistingCatalog} disabled={translating} className="btn btn-outline btn-sm disabled:opacity-50">
            <Languages size={16} aria-hidden="true" /> {translating ? 'Translating…' : 'Translate catalog to Hebrew'}
          </button>
          <Link to="/admin/products/new" className="btn btn-primary btn-sm">
            <Plus size={16} aria-hidden="true" /> Add new product
          </Link>
        </div>
      </div>

      <DraftsRecovery resolveName={(productId) => products.find((p) => p.id === productId)?.name} />

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
