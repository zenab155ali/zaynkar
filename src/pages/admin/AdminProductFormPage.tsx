import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { CoverFocalPicker } from '@/components/admin/CoverFocalPicker'
import { MediaUploadField } from '@/components/admin/MediaUploadField'
import { TagInput } from '@/components/admin/TagInput'
import { TextField } from '@/components/ui/TextField'
import { useProducts } from '@/context/ProductsContext'
import { supabase } from '@/lib/supabase'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { MediaType } from '@/types/catalog'

interface ColorRow {
  colorName: string
  photoUrl: string | null
}

interface MediaRow {
  url: string
  type: MediaType
}

export default function AdminProductFormPage() {
  const { productId } = useParams()
  const isEditing = Boolean(productId && productId !== 'new')
  const navigate = useNavigate()
  const { loading: catalogLoading, categories, getById, refresh } = useProducts()
  const existing = isEditing ? getById(productId as string) : undefined
  useDocumentTitle(isEditing ? `Edit ${existing?.name ?? 'product'}` : 'Add new product')

  const [name, setName] = useState(existing?.name ?? '')
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? '')
  const [addingCategory, setAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [description, setDescription] = useState(existing?.description ?? '')
  const [price, setPrice] = useState(existing ? String(existing.price) : '')
  const [sizes, setSizes] = useState<string[]>(existing?.sizes ?? [])
  const [isActive, setIsActive] = useState(existing?.isActive ?? true)
  const [media, setMedia] = useState<MediaRow[]>(existing?.media.map((m) => ({ url: m.url, type: m.type })) ?? [])
  const [coverFocalX, setCoverFocalX] = useState(existing?.coverFocalX ?? 50)
  const [coverFocalY, setCoverFocalY] = useState(existing?.coverFocalY ?? 50)
  const [colors, setColors] = useState<ColorRow[]>(existing?.colors.map((c) => ({ colorName: c.colorName, photoUrl: c.photoUrl })) ?? [{ colorName: '', photoUrl: null }])

  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const effectiveCategoryId = categoryId || categories[0]?.id || ''

  const addCategory = async () => {
    const trimmed = newCategoryName.trim()
    if (!trimmed || !supabase) return
    const { data, error: insertError } = await supabase.from('categories').insert({ name: trimmed, sort_order: categories.length }).select('id').single()
    if (insertError) {
      setError(insertError.message)
      return
    }
    await refresh()
    setCategoryId(data.id)
    setNewCategoryName('')
    setAddingCategory(false)
  }

  const canSave = useMemo(() => {
    const priceNum = Number(price)
    return Boolean(name.trim() && effectiveCategoryId && Number.isFinite(priceNum) && priceNum >= 0 && colors.some((c) => c.colorName.trim()))
  }, [name, effectiveCategoryId, price, colors])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!supabase || !canSave) return
    setSaving(true)
    setError(null)

    const cleanColors = colors.filter((c) => c.colorName.trim()).map((c) => ({ color_name: c.colorName.trim(), photo_url: c.photoUrl }))
    const cleanMedia = media.filter((m) => m.url)

    const payload = {
      name: name.trim(),
      category_id: effectiveCategoryId,
      description: description.trim(),
      price: Number(price),
      sizes,
      is_active: isActive,
      cover_focal_x: coverFocalX,
      cover_focal_y: coverFocalY,
    }

    let productRowId = existing?.id ?? null
    if (isEditing && productRowId) {
      const { error: updateError } = await supabase.from('products').update(payload).eq('id', productRowId)
      if (updateError) {
        setError(updateError.message)
        setSaving(false)
        return
      }
    } else {
      const { data: inserted, error: insertError } = await supabase.from('products').insert(payload).select('id').single()
      if (insertError || !inserted) {
        setError(insertError?.message ?? 'Could not create the product.')
        setSaving(false)
        return
      }
      productRowId = inserted.id
    }

    // Replace child rows wholesale — simple and safe, since request history keeps its own snapshot.
    await supabase.from('product_colors').delete().eq('product_id', productRowId)
    await supabase.from('product_media').delete().eq('product_id', productRowId)
    if (cleanColors.length) {
      await supabase.from('product_colors').insert(cleanColors.map((c, i) => ({ ...c, product_id: productRowId, sort_order: i })))
    }
    if (cleanMedia.length) {
      await supabase
        .from('product_media')
        .insert(cleanMedia.map((m, i) => ({ media_url: m.url, media_type: m.type, product_id: productRowId, sort_order: i })))
    }

    await refresh()
    setSaving(false)
    navigate('/admin/products')
  }

  if (catalogLoading) return <p className="text-sm text-muted">Loading…</p>
  if (isEditing && !existing) return <p className="text-sm text-muted">Product not found.</p>

  return (
    <div className="max-w-3xl">
      <Link to="/admin/products" className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink">
        <ArrowLeft size={14} /> Back to products
      </Link>
      <h1 className="display text-3xl">{isEditing ? `Edit ${existing?.name}` : 'Add new product'}</h1>
      {isEditing && (
        <p className="mt-1 text-xs text-muted">
          Code: <span className="font-mono">{existing?.code}</span> (cannot be changed)
        </p>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-6">
        <TextField label="Name" required value={name} onChange={(e) => setName(e.target.value)} />

        <div>
          <label htmlFor="category" className="mb-1.5 block text-xs font-medium tracking-wide text-muted">
            Category
          </label>
          {!addingCategory ? (
            <div className="flex gap-2">
              <select id="category" value={effectiveCategoryId} onChange={(e) => setCategoryId(e.target.value)} className="field flex-1">
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button type="button" onClick={() => setAddingCategory(true)} className="btn btn-outline btn-sm shrink-0">
                <Plus size={14} /> New category
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                autoFocus
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. Shoes"
                className="field flex-1"
              />
              <button type="button" onClick={addCategory} className="btn btn-primary btn-sm shrink-0">
                Add
              </button>
              <button type="button" onClick={() => setAddingCategory(false)} className="btn btn-outline btn-sm shrink-0">
                Cancel
              </button>
            </div>
          )}
          <p className="mt-1 text-xs text-muted">Only "Dresses" exists today — add more (Shoes, Pajamas, …) whenever you're ready.</p>
        </div>

        <div>
          <label htmlFor="description" className="mb-1.5 block text-xs font-medium tracking-wide text-muted">
            Description / more info
          </label>
          <textarea id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="field !h-auto py-3" />
        </div>

        <TextField label="Price (₪)" type="number" min="0" step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)} className="max-w-xs" />

        <TagInput label="Sizes" values={sizes} onChange={setSizes} placeholder="Type a size and press Enter (e.g. S, M, 40…)" hint="Press Enter after each size." />

        <div>
          <p className="mb-2 text-xs font-medium tracking-wide text-muted">Photos &amp; videos</p>
          <p className="mb-3 text-xs text-muted">Add as many as you like — shown by default, and for any color below with no photo of its own.</p>
          <div className="flex flex-wrap gap-3">
            {media.map((m, i) => (
              <MediaUploadField
                key={i}
                value={m.url ? m : null}
                onChange={(next) => setMedia((prev) => (next ? prev.map((p, idx) => (idx === i ? next : p)) : prev.filter((_, idx) => idx !== i)))}
              />
            ))}
            <MediaUploadField value={null} onChange={(next) => next && setMedia((prev) => [...prev, next])} />
          </div>
          <div className="mt-4">
            <CoverFocalPicker
              imageUrl={media.find((m) => m.type === 'image' && m.url)?.url ?? null}
              x={coverFocalX}
              y={coverFocalY}
              onChange={(x, y) => {
                setCoverFocalX(x)
                setCoverFocalY(y)
              }}
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium tracking-wide text-muted">Colors available</p>
            <button type="button" onClick={() => setColors((prev) => [...prev, { colorName: '', photoUrl: null }])} className="inline-flex items-center gap-1 text-xs underline underline-offset-2">
              <Plus size={13} /> Add color
            </button>
          </div>
          <p className="mb-3 text-xs text-muted">For each color: upload a photo of the item in that color, or just type the color name with no photo.</p>
          <div className="space-y-3">
            {colors.map((row, i) => (
              <div key={i} className="flex items-start gap-3 border border-line bg-white p-3">
                <MediaUploadField
                  allowVideo={false}
                  value={row.photoUrl ? { url: row.photoUrl, type: 'image' } : null}
                  onChange={(next) => setColors((prev) => prev.map((c, idx) => (idx === i ? { ...c, photoUrl: next?.url ?? null } : c)))}
                />
                <div className="flex-1 pt-1">
                  <TextField
                    label={`Color name ${i + 1}`}
                    placeholder="e.g. Black, Navy, Rose Gold…"
                    value={row.colorName}
                    onChange={(e) => setColors((prev) => prev.map((c, idx) => (idx === i ? { ...c, colorName: e.target.value } : c)))}
                  />
                </div>
                {colors.length > 1 && (
                  <button type="button" onClick={() => setColors((prev) => prev.filter((_, idx) => idx !== i))} aria-label="Remove this color" className="mt-6 grid h-10 w-10 shrink-0 place-items-center text-muted hover:text-sale">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 accent-ink" />
          Visible to customers
        </label>

        {error && (
          <p role="alert" className="border border-sale/40 bg-white p-3 text-sm text-sale">
            {error}
          </p>
        )}

        <div className="flex gap-3 border-t border-line pt-6">
          <button type="submit" disabled={!canSave || saving} className="btn btn-primary">
            {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Add product'}
          </button>
          <Link to="/admin/products" className="btn btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
