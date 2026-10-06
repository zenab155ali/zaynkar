import { useState } from 'react'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { MediaUploadField } from '@/components/admin/MediaUploadField'
import { useProducts } from '@/context/ProductsContext'
import { supabase } from '@/lib/supabase'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function AdminCategoriesPage() {
  useDocumentTitle('Admin — Categories')
  const { loading, categories, products, refresh } = useProducts()
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)

  const productCount = (categoryId: string) => products.filter((p) => p.categoryId === categoryId).length

  const setPhoto = async (categoryId: string, url: string | null) => {
    if (!supabase) return
    setSavingId(categoryId)
    await supabase.from('categories').update({ photo_url: url }).eq('id', categoryId)
    await refresh()
    setSavingId(null)
  }

  const addCategory = async () => {
    const trimmed = newName.trim()
    if (!trimmed || !supabase) return
    setAdding(true)
    setError(null)
    const { error: insertError } = await supabase.from('categories').insert({ name: trimmed, sort_order: categories.length })
    setAdding(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    setNewName('')
    await refresh()
  }

  const startEditing = (id: string, currentName: string) => {
    setEditingId(id)
    setEditingName(currentName)
    setError(null)
  }

  const saveRename = async (id: string) => {
    const trimmed = editingName.trim()
    if (!trimmed || !supabase) {
      setEditingId(null)
      return
    }
    setSavingId(id)
    const { error: updateError } = await supabase.from('categories').update({ name: trimmed }).eq('id', id)
    setSavingId(null)
    if (updateError) {
      setError(updateError.message)
      return
    }
    setEditingId(null)
    await refresh()
  }

  const deleteCategory = async (id: string, name: string) => {
    if (!supabase) return
    const count = productCount(id)
    if (count > 0) {
      setError(`Can't delete "${name}" — ${count} product${count === 1 ? '' : 's'} still use this category. Move or delete them first.`)
      return
    }
    if (!window.confirm(`Delete the "${name}" category? This can't be undone.`)) return
    setSavingId(id)
    const { error: deleteError } = await supabase.from('categories').delete().eq('id', id)
    setSavingId(null)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    await refresh()
  }

  if (loading) return <p className="text-sm text-muted">Loading…</p>

  return (
    <div className="max-w-2xl">
      <h1 className="display text-3xl">Categories</h1>
      <p className="mt-1 text-sm text-muted">Add a photo for each category — these show as clickable tiles on the homepage.</p>

      <div className="mt-5 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addCategory()}
          placeholder="e.g. Bags, Pajamas…"
          className="field flex-1"
        />
        <button type="button" onClick={addCategory} disabled={adding || !newName.trim()} className="btn btn-primary btn-sm shrink-0 disabled:opacity-50">
          <Plus size={14} /> Add category
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-3 border border-sale/40 bg-white p-3 text-sm text-sale">
          {error}
        </p>
      )}

      <ul className="mt-6 divide-y divide-line border-y border-line">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center gap-4 py-4">
            <MediaUploadField allowVideo={false} value={c.photoUrl ? { url: c.photoUrl, type: 'image' } : null} onChange={(next) => setPhoto(c.id, next?.url ?? null)} />
            <div className="flex-1">
              {editingId === c.id ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveRename(c.id)}
                    className="field !h-9 flex-1"
                  />
                  <button type="button" onClick={() => saveRename(c.id)} className="btn btn-primary btn-sm shrink-0">
                    Save
                  </button>
                  <button type="button" onClick={() => setEditingId(null)} aria-label="Cancel" className="grid h-9 w-9 shrink-0 place-items-center text-muted hover:text-ink">
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{c.name}</p>
                  <button type="button" onClick={() => startEditing(c.id, c.name)} aria-label={`Rename ${c.name}`} className="text-muted hover:text-ink">
                    <Pencil size={13} />
                  </button>
                </div>
              )}
              <p className="mt-0.5 text-xs text-muted">
                {productCount(c.id)} product{productCount(c.id) === 1 ? '' : 's'}
              </p>
              {savingId === c.id && <p className="mt-1 text-xs text-muted">Saving…</p>}
            </div>
            <button type="button" onClick={() => deleteCategory(c.id, c.name)} aria-label={`Delete ${c.name}`} className="shrink-0 text-muted hover:text-sale">
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
