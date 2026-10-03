import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { RequireSupabase } from '@/components/ui/RequireSupabase'
import { LikeButton } from '@/components/store/LikeButton'
import { StoreMediaGallery } from '@/components/store/StoreMediaGallery'
import { useCurrency } from '@/context/CurrencyContext'
import { useProducts } from '@/context/ProductsContext'
import { useSelections } from '@/context/SelectionsContext'
import { useToast } from '@/context/ToastContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import NotFoundPage from '@/pages/NotFoundPage'

function ProductView() {
  const { code = '' } = useParams()
  const { getByCode } = useProducts()
  const product = getByCode(code)
  const { format } = useCurrency()
  const { add } = useSelections()
  const { toast } = useToast()
  const navigate = useNavigate()
  useDocumentTitle(product?.name)

  const [colorName, setColorName] = useState(product?.colors[0]?.colorName ?? '')
  const [size, setSize] = useState<string | null>(null)
  const [sizeError, setSizeError] = useState(false)

  const selectedColor = product?.colors.find((c) => c.colorName === colorName)
  const media = useMemo(() => {
    if (!product) return []
    return selectedColor?.photoUrl ? [{ url: selectedColor.photoUrl, type: 'image' as const }, ...product.media] : product.media
  }, [product, selectedColor])

  if (!product) return <NotFoundPage />

  const onAdd = () => {
    if (!size) {
      setSizeError(true)
      return
    }
    add({ productId: product.id, size, colorName: colorName || 'غير محدد', quantity: 1 })
    toast({ title: 'أُضيف إلى سلة التسوق', description: `${product.name} · ${colorName} · ${size}`, action: { label: 'عرض سلة التسوق', to: '/selections' } })
  }

  return (
    <div className="container-page py-6">
      <Breadcrumbs items={[{ label: 'الرئيسية', to: '/' }, { label: 'الفساتين', to: '/store' }, { label: product.name }]} />

      <div className="mt-5 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <StoreMediaGallery media={media} name={product.name} />
        </div>
        <div className="lg:col-span-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-xs text-muted" dir="ltr">
                {product.code}
              </p>
              <h1 className="display mt-1 text-3xl sm:text-4xl">{product.name}</h1>
            </div>
            <LikeButton productId={product.id} productName={product.name} variant="inline" className="shrink-0" />
          </div>
          <p className="mt-3 text-xl font-medium">{format(product.price)}</p>

          {product.description && <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted">{product.description}</p>}

          {product.colors.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-sm">
                اللون: <span className="font-medium">{colorName}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColorName(c.colorName)}
                    className={`border px-3.5 py-2 text-sm transition-colors ${colorName === c.colorName ? 'border-ink bg-ink text-ivory' : 'border-line bg-white hover:border-ink'}`}
                  >
                    {c.colorName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.sizes.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-sm">المقاس: {size ?? <span className="text-muted">اختاري مقاسًا</span>}</p>
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
            <ShoppingBag size={18} aria-hidden="true" /> أضيفي إلى سلة التسوق
          </button>
          <button type="button" onClick={() => navigate('/selections')} className="mt-3 w-full text-center text-xs underline underline-offset-4">
            عرض سلة التسوق
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
