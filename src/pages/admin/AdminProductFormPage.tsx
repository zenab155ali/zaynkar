import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Plus, Trash2, Upload, X } from 'lucide-react'
import { CoverFocalPicker } from '@/components/admin/CoverFocalPicker'
import { MediaUploadField } from '@/components/admin/MediaUploadField'
import { TagInput } from '@/components/admin/TagInput'
import { TextField } from '@/components/ui/TextField'
import { useProducts } from '@/context/ProductsContext'
import { supabase } from '@/lib/supabase'
import { translateToHebrew } from '@/lib/translate'
import { uploadProductMedia, validateMediaFile } from '@/lib/uploadProductMedia'
import { draftKeyForNewProduct, draftKeyForProduct } from '@/lib/productDrafts'
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

interface DraftShape {
  name: string
  categoryId: string
  description: string
  price: string
  sizes: string[]
  isActive: boolean
  media: MediaRow[]
  coverFocalX: number
  coverFocalY: number
  colors: ColorRow[]
  savedAt: number
}

export default function AdminProductFormPage() {
  const { productId } = useParams()
  const [searchParams] = useSearchParams()
  const isEditing = Boolean(productId && productId !== 'new')
  const navigate = useNavigate()
  const { loading: catalogLoading, categories, products, getById, refresh } = useProducts()
  const existing = isEditing ? getById(productId as string) : undefined
  useDocumentTitle(isEditing ? `Edit ${existing?.name ?? 'product'}` : 'Add new product')

  // Auto-saved locally so an interrupted session (closed tab, logged out, phone locked) never
  // loses in-progress typing/uploads — uploaded photos are already safe in storage regardless.
  // Each browser tab gets its own slot (so opening many "add product" tabs at once doesn't make
  // them overwrite each other) unless ?draft=<key> explicitly asks to resume a specific one —
  // that's how the "recover drafts" list on the products page reopens an abandoned tab's draft.
  const draftKey = searchParams.get('draft') || (isEditing ? draftKeyForProduct(productId as string) : draftKeyForNewProduct())
  const draft = useMemo<Partial<DraftShape> | null>(() => {
    try {
      const raw = localStorage.getItem(draftKey)
      return raw ? (JSON.parse(raw) as Partial<DraftShape>) : null
    } catch {
      return null
    }
  }, [draftKey])
  const [draftRestored] = useState(() => draft !== null)

  const [name, setName] = useState(draft?.name ?? existing?.name ?? '')
  const [categoryId, setCategoryId] = useState(draft?.categoryId ?? existing?.categoryId ?? '')
  const [addingCategory, setAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [description, setDescription] = useState(draft?.description ?? existing?.description ?? '')
  const [price, setPrice] = useState(draft?.price ?? (existing ? String(existing.price) : ''))
  const [sizes, setSizes] = useState<string[]>(draft?.sizes ?? existing?.sizes ?? [])
  const [isActive, setIsActive] = useState(draft?.isActive ?? existing?.isActive ?? true)
  const [media, setMedia] = useState<MediaRow[]>(draft?.media ?? existing?.media.map((m) => ({ url: m.url, type: m.type })) ?? [])
  const [coverFocalX, setCoverFocalX] = useState(draft?.coverFocalX ?? existing?.coverFocalX ?? 50)
  const [coverFocalY, setCoverFocalY] = useState(draft?.coverFocalY ?? existing?.coverFocalY ?? 50)
  const [colors, setColors] = useState<ColorRow[]>(
    draft?.colors ?? existing?.colors.map((c) => ({ colorName: c.colorName, photoUrl: c.photoUrl })) ?? [{ colorName: '', photoUrl: null }],
  )
  const [bulkUploading, setBulkUploading] = useState(false)
  const bulkInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const snapshot: DraftShape = { name, categoryId, description, price, sizes, isActive, media, coverFocalX, coverFocalY, colors, savedAt: Date.now() }
    try {
      localStorage.setItem(draftKey, JSON.stringify(snapshot))
    } catch {
      // ignore (storage full or blocked)
    }
  }, [draftKey, name, categoryId, description, price, sizes, isActive, media, coverFocalX, coverFocalY, colors])

  const discardDraft = () => {
    try {
      localStorage.removeItem(draftKey)
    } catch {
      // ignore
    }
    window.location.reload()
  }

  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const knownColorNames = useMemo(() => {
    const set = new Set<string>()
    for (const p of products) for (const c of p.colors) if (c.colorName.trim()) set.add(c.colorName.trim())
    return [...set].sort()
  }, [products])

  const onBulkColorFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setBulkUploading(true)
    const uploaded: ColorRow[] = []
    for (const file of Array.from(files)) {
      if (validateMediaFile(file, false)) continue
      try {
        const result = await uploadProductMedia(file)
        uploaded.push({ colorName: '', photoUrl: result.url })
      } catch {
        // skip a file that failed to upload; the rest still proceed
      }
    }
    if (uploaded.length) {
      setColors((prev) => {
        const base = prev.length === 1 && !prev[0].colorName.trim() && !prev[0].photoUrl ? [] : prev
        return [...base, ...uploaded]
      })
    }
    setBulkUploading(false)
    if (bulkInputRef.current) bulkInputRef.current.value = ''
  }

  const effectiveCategoryId = categoryId || categories[0]?.id || ''

  const addCategory = async () => {
    const trimmed = newCategoryName.trim()
    if (!trimmed || !supabase) return
    const nameHe = await translateToHebrew(trimmed)
    const { data, error: insertError } = await supabase
      .from('categories')
      .insert({ name: trimmed, name_he: nameHe, sort_order: categories.length })
      .select('id')
      .single()
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

    const trimmedName = name.trim()
    const trimmedDescription = description.trim()
    const cleanColorNames = colors.filter((c) => c.colorName.trim())
    const cleanMedia = media.filter((m) => m.url)

    // Translated automatically on every save — best-effort (a failed lookup just falls back to Arabic on display).
    const [nameHe, descriptionHe, colorNamesHe] = await Promise.all([
      translateToHebrew(trimmedName),
      trimmedDescription ? translateToHebrew(trimmedDescription) : Promise.resolve(null),
      Promise.all(cleanColorNames.map((c) => translateToHebrew(c.colorName.trim()))),
    ])
    const cleanColors = cleanColorNames.map((c, i) => ({ color_name: c.colorName.trim(), color_name_he: colorNamesHe[i], photo_url: c.photoUrl }))

    const payload = {
      name: trimmedName,
      name_he: nameHe,
      category_id: effectiveCategoryId,
      description: trimmedDescription,
      description_he: descriptionHe,
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

    try {
      localStorage.removeItem(draftKey)
    } catch {
      // ignore
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

      {draftRestored && (
        <div className="mt-4 flex items-center justify-between gap-3 border border-line bg-sand/50 px-4 py-2.5 text-xs">
          <span>Restored your unsaved draft from last time.</span>
          <button type="button" onClick={discardDraft} className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-sale">
            <X size={12} /> Discard draft & start over
          </button>
        </div>
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

        <TagInput
          label="Sizes"
          values={sizes}
          onChange={setSizes}
          placeholder="Type a size and press Enter (e.g. S, M, 40…)"
          hint='Press Enter after each size. Tip: type a range like "36-44" to add 36, 38, 40, 42, 44 at once.'
        />

        <div>
          <p className="mb-2 text-xs font-medium tracking-wide text-muted">Photos &amp; videos</p>
          <p className="mb-3 text-xs text-muted">
            Optional — only for general/model shots not tied to one color. You don't need to duplicate a color's photo here: any photo you add for a
            color below already shows up on the storefront automatically.
          </p>
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
              imageUrl={media.find((m) => m.type === 'image' && m.url)?.url ?? colors.find((c) => c.photoUrl)?.photoUrl ?? null}
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
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-medium tracking-wide text-muted">Colors available</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => bulkInputRef.current?.click()}
                disabled={bulkUploading}
                className="inline-flex items-center gap-1 text-xs underline underline-offset-2 disabled:opacity-50"
              >
                {bulkUploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} Upload multiple photos at once
              </button>
              <button type="button" onClick={() => setColors((prev) => [...prev, { colorName: '', photoUrl: null }])} className="inline-flex items-center gap-1 text-xs underline underline-offset-2">
                <Plus size={13} /> Add color
              </button>
            </div>
          </div>
          <p className="mb-3 text-xs text-muted">
            For each color: upload a photo of the item in that color, or just type the color name with no photo. Tip: use "Upload multiple photos at
            once" to add several colors' photos in one go, then just type each color's name below.
          </p>
          <datalist id="known-color-names">
            {knownColorNames.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
          <input
            ref={bulkInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            onChange={(e) => onBulkColorFiles(e.target.files)}
          />
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
                    list="known-color-names"
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
