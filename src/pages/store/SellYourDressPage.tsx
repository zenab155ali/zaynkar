import { useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Plus, ShoppingBag, Upload, X } from 'lucide-react'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { EmptyState } from '@/components/ui/EmptyState'
import { RequireSupabase } from '@/components/ui/RequireSupabase'
import { TextField } from '@/components/ui/TextField'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { supabase } from '@/lib/supabase'
import { uploadResaleSubmissionMedia, validateMediaFile } from '@/lib/uploadProductMedia'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

function SellYourDressView() {
  const { t } = useLanguage()
  useDocumentTitle(t('sellYourDressTitle'))
  const { user, profile } = useAuth()

  const [photos, setPhotos] = useState<string[]>([])
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [dressName, setDressName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [size, setSize] = useState('')
  const [sellerName, setSellerName] = useState(profile?.fullName ?? '')
  const [sellerPhone, setSellerPhone] = useState(profile?.phone ?? '')
  const [sellerInstagram, setSellerInstagram] = useState('')
  const [sellerCity, setSellerCity] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const onPickPhotos = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setPhotoError(null)
    setUploading(true)
    for (const file of Array.from(files)) {
      const problem = validateMediaFile(file, false)
      if (problem) {
        setPhotoError(problem)
        continue
      }
      try {
        const result = await uploadResaleSubmissionMedia(file)
        setPhotos((prev) => [...prev, result.url])
      } catch {
        setPhotoError(t('photoUploadFailed'))
      }
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const canSubmit = dressName.trim() && price.trim() && sellerName.trim() && photos.length > 0

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!supabase || !canSubmit) return
    if (photos.length === 0) {
      setError(t('atLeastOnePhoto'))
      return
    }
    setSubmitting(true)
    setError(null)
    const { error: insertError } = await supabase.from('resale_submissions').insert({
      customer_id: user?.id ?? null,
      seller_name: sellerName.trim(),
      seller_phone: sellerPhone.trim() || null,
      seller_instagram: sellerInstagram.trim() || null,
      seller_city: sellerCity.trim() || null,
      dress_name: dressName.trim(),
      description: description.trim() || null,
      price: Number(price),
      size: size.trim() || null,
      photo_urls: photos,
    })
    setSubmitting(false)
    if (insertError) {
      setError(insertError.message || t('submissionFailed'))
      return
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: t('home'), to: '/' }, { label: t('sellYourDressTitle') }]} />
        <EmptyState icon={<ShoppingBag size={26} strokeWidth={1.3} />} title={t('dressSubmittedTitle')} description={t('dressSubmittedDesc')}>
          <Link to="/store" className="btn btn-primary">
            {t('browseDresses')}
          </Link>
        </EmptyState>
      </div>
    )
  }

  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: t('home'), to: '/' }, { label: t('sellYourDressTitle') }]} />
      <h1 className="display mt-4 text-4xl">{t('sellYourDressTitle')}</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{t('sellYourDressIntro')}</p>

      <form onSubmit={onSubmit} className="mt-6 max-w-xl space-y-5">
        <div>
          <p className="mb-1.5 block text-xs font-medium tracking-wide text-muted">{t('dressPhotosLabel')} *</p>
          <div className="flex flex-wrap gap-3">
            {photos.map((url, i) => (
              <div key={url} className="relative aspect-[3/4] w-24 overflow-hidden border border-line bg-sand">
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                  aria-label="Remove"
                  className="absolute end-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-ink/80 text-ivory"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex aspect-[3/4] w-24 flex-col items-center justify-center gap-1.5 border border-dashed border-line bg-sand text-muted hover:text-ink disabled:opacity-50"
            >
              {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
              <span className="text-center text-[0.625rem] leading-tight">{t('addPhoto')}</span>
            </button>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => onPickPhotos(e.target.files)} />
          </div>
          {photoError && (
            <p role="alert" className="mt-1.5 text-xs text-sale">
              {photoError}
            </p>
          )}
        </div>

        <TextField label={t('dressNameLabel')} required value={dressName} onChange={(e) => setDressName(e.target.value)} />

        <div>
          <label htmlFor="dress-description" className="mb-1.5 block text-xs font-medium tracking-wide text-muted">
            {t('descriptionLabel')}
          </label>
          <textarea id="dress-description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="field !h-auto py-3" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <TextField label={t('priceLabel')} type="number" min="0" step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)} />
          <TextField label={t('sizeLabel')} value={size} onChange={(e) => setSize(e.target.value)} />
        </div>

        <div className="border-t border-line pt-5">
          <TextField label={t('sellerNameLabel')} required value={sellerName} onChange={(e) => setSellerName(e.target.value)} />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <TextField label={t('sellerPhoneLabel')} type="tel" dir="ltr" value={sellerPhone} onChange={(e) => setSellerPhone(e.target.value)} />
            <TextField label={t('sellerInstagramLabel')} dir="ltr" placeholder="@username" value={sellerInstagram} onChange={(e) => setSellerInstagram(e.target.value)} />
          </div>
          <TextField label={t('sellerCityLabel')} className="mt-4" value={sellerCity} onChange={(e) => setSellerCity(e.target.value)} />
          <p className="mt-3 text-xs leading-relaxed text-muted">{t('privacyNote')}</p>
        </div>

        {error && (
          <p role="alert" className="text-sm text-sale">
            {error}
          </p>
        )}

        <button type="submit" disabled={!canSubmit || submitting} className="btn btn-primary !h-14 w-full disabled:opacity-40">
          <Plus size={18} aria-hidden="true" /> {submitting ? t('sendingSubmission') : t('submitForReview')}
        </button>
      </form>
    </div>
  )
}

export default function SellYourDressPage() {
  return (
    <RequireSupabase>
      <SellYourDressView />
    </RequireSupabase>
  )
}
