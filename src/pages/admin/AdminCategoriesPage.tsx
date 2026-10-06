import { useState } from 'react'
import { MediaUploadField } from '@/components/admin/MediaUploadField'
import { useProducts } from '@/context/ProductsContext'
import { supabase } from '@/lib/supabase'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function AdminCategoriesPage() {
  useDocumentTitle('Admin — Categories')
  const { loading, categories, refresh } = useProducts()
  const [savingId, setSavingId] = useState<string | null>(null)

  const setPhoto = async (categoryId: string, url: string | null) => {
    if (!supabase) return
    setSavingId(categoryId)
    await supabase.from('categories').update({ photo_url: url }).eq('id', categoryId)
    await refresh()
    setSavingId(null)
  }

  if (loading) return <p className="text-sm text-muted">Loading…</p>

  return (
    <div className="max-w-2xl">
      <h1 className="display text-3xl">Categories</h1>
      <p className="mt-1 text-sm text-muted">
        Add a photo for each category — these show as clickable tiles on the homepage. New categories can be added from the product form's "New
        category" button.
      </p>

      <ul className="mt-6 divide-y divide-line border-y border-line">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center gap-4 py-4">
            <MediaUploadField allowVideo={false} value={c.photoUrl ? { url: c.photoUrl, type: 'image' } : null} onChange={(next) => setPhoto(c.id, next?.url ?? null)} />
            <div className="flex-1">
              <p className="text-sm font-medium">{c.name}</p>
              {savingId === c.id && <p className="mt-1 text-xs text-muted">Saving…</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
