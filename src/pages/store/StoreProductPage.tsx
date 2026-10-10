import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { RequireSupabase } from '@/components/ui/RequireSupabase'
import { LikeButton } from '@/components/store/LikeButton'
import { StoreMediaGallery } from '@/components/store/StoreMediaGallery'
import { useCurrency } from '@/context/CurrencyContext'
import { useLanguage } from '@/context/LanguageContext'
import { useProducts } from '@/context/ProductsContext'
import { useSelections } from '@/context/SelectionsContext'
import { useToast } from '@/context/ToastContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import NotFoundPage from '@/pages/NotFoundPage'

interface EditLineState {
  editLineId?: string
  color?: string
  size?: string
}

function ProductView() {
  const { code = '' } = useParams()
  const { getByCode } = useProducts()
  const product = getByCode(code)
  const { format } = useCurrency()
  const { t, pick } = useLanguage()
  const { add, remove } = useSelections()
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const productName = product ? pick(product.name, product.nameHe) : undefined
  useDocumentTitle(productName)

  // Arriving from "سلة التسوق" to tweak an already-picked item: pre-select what was
  // chosen before, and replace that exact cart line instead of adding a second one.
  const editState = location.state as EditLineState | null
  const [colorName, setColorName] = useState(editState?.color ?? product?.colors[0]?.colorName ?? '')
  const [size, setSize] = useState<string | null>(editState?.size ?? null)
  const [sizeError, setSizeError] = useState(false)

  const selectedColor = product?.colors.find((c) => c.colorName === colorName)
  const media = useMemo(() => {
    if (!product) return []
    return selectedColor?.photoUrl ? [{ url: selectedColor.photoUrl, type: 'image' as const }, ...product.media] : product.media
  }, [product, selectedColor])

  if (!product || !productName) return <NotFoundPage />

  const colorPicker = product.colors.length > 0 && (
    <div>
      {product.colors.some((c) => c.photoUrl) && (
        <p className="mb-2 border border-ink/15 bg-sand/60 px-3 py-2 text-xs font-medium leading-relaxed text-ink">{t('colorChangesPhotoHint')}</p>
      )}
      <p className="mb-2 text-sm">
        {t('color')}: <span className="font-medium">{pick(colorName, product.colors.find((c) => c.colorName === colorName)?.colorNameHe)}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {product.colors.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setColorName(c.colorName)}
            className={`border px-3.5 py-2 text-sm transition-colors ${colorName === c.colorName ? 'border-ink bg-ink text-ivory' : 'border-line bg-white hover:border-ink'}`}
          >
            {pick(c.colorName, c.colorNameHe)}
          </button>
        ))}
      </div>
    </div>
  )

  const onAdd = () => {
    if (!size) {
      setSizeError(true)
      return
    }
    if (editState?.editLineId) {
      remove(editState.editLineId)
      add({ productId: product.id, size, colorName: colorName || t('noColorSelected'), quantity: 1 })
      toast({ title: t('cartUpdated'), description: `${productName} · ${colorName} · ${size}` })
      navigate('/selections')
      return
    }
    add({ productId: product.id, size, colorName: colorName || t('noColorSelected'), quantity: 1 })
    toast({ title: t('addedToCart'), description: `${productName} · ${colorName} · ${size}`, action: { label: t('viewCart'), to: '/selections' } })
  }

  return (
    <div className="container-page py-6">
      <Breadcrumbs items={[{ label: t('home'), to: '/' }, { label: t('dressesTitle'), to: '/store' }, { label: productName }]} />

      <div className="mt-5 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <StoreMediaGallery media={media} name={productName} />
          {colorPicker && <div className="mt-4 lg:hidden">{colorPicker}</div>}
        </div>
        <div className="lg:col-span-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-xs text-muted" dir="ltr">
                {product.code}
              </p>
              <h1 className="display mt-1 text-3xl sm:text-4xl">{productName}</h1>
            </div>
            <LikeButton productId={product.id} productName={productName} variant="inline" className="shrink-0" />
          </div>
          <p className="mt-3 text-xl font-medium">{format(product.price)}</p>

          {colorPicker && <div className="mt-4 hidden lg:block">{colorPicker}</div>}

          {product.description && (
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted">{pick(product.description, product.descriptionHe)}</p>
          )}

          {product.sizes.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-sm">
                {t('size')}: {size ?? <span className="text-muted">{t('chooseSize')}</span>}
              </p>
              <div className={`flex flex-wrap gap-2 ${sizeError && !size ? 'outline outline-1 outline-offset-4 outline-sale' : ''}`}>
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setSize(s)
                      setSizeError(false)
                    }}
                    className={`h-11 min-w-12 border px-3 text-sm transition-colors ${size === s ? 'border-ink bg-ink text-ivory' : 'border-line bg-white hover:border-ink'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button type="button" onClick={onAdd} className="btn btn-primary mt-8 !h-14 w-full">
            <ShoppingBag size={18} aria-hidden="true" /> {editState?.editLineId ? t('updateCart') : t('addToCart')}
          </button>
          <button type="button" onClick={() => navigate('/selections')} className="mt-3 w-full text-center text-xs underline underline-offset-4">
            {t('viewCart')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function StoreProductPage() {
  return (
    <RequireSupabase>
      <ProductView />
    </RequireSupabase>
  )
}
