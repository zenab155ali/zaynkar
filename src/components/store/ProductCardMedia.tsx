import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Layers, ShoppingBag, X } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { useSelections } from '@/context/SelectionsContext'
import { useToast } from '@/context/ToastContext'
import type { CatalogProduct } from '@/types/catalog'

/** Cover photo first, then each color's own photo (deduplicated) — lets customers swipe through colors right from the grid. */
function galleryImages(product: CatalogProduct): string[] {
  const seen = new Set<string>()
  const images: string[] = []
  for (const m of product.media) {
    if (m.type === 'image' && !seen.has(m.url)) {
      seen.add(m.url)
      images.push(m.url)
    }
  }
  for (const c of product.colors) {
    if (c.photoUrl && !seen.has(c.photoUrl)) {
      seen.add(c.photoUrl)
      images.push(c.photoUrl)
    }
  }
  return images
}

const SWIPE_THRESHOLD = 40

export function ProductCardMedia({ product }: { product: CatalogProduct }) {
  const images = galleryImages(product)
  const [index, setIndex] = useState(0)
  const [colorsOpen, setColorsOpen] = useState(false)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [qaColor, setQaColor] = useState(product.colors[0]?.colorName ?? '')
  const [qaSize, setQaSize] = useState<string | null>(null)
  const [qaSizeError, setQaSizeError] = useState(false)
  const { add } = useSelections()
  const { toast } = useToast()
  const touchStartX = useRef<number | null>(null)
  const swiped = useRef(false)

  const onQuickAdd = () => {
    if (product.sizes.length > 0 && !qaSize) {
      setQaSizeError(true)
      return
    }
    add({ productId: product.id, size: qaSize ?? 'بدون مقاس', colorName: qaColor || 'غير محدد', quantity: 1 })
    toast({ title: 'أُضيف إلى سلة التسوق', description: `${product.name} · ${qaColor} · ${qaSize ?? ''}`, action: { label: 'عرض سلة التسوق', to: '/selections' } })
    setQuickAddOpen(false)
    setQaSize(null)
    setQaSizeError(false)
  }

  const go = (delta: number) => setIndex((i) => (i + delta + images.length) % images.length)

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    swiped.current = false
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      swiped.current = true
      go(delta > 0 ? -1 : 1)
    }
    touchStartX.current = null
  }
  // Swallows the click that follows a swipe, so it doesn't also navigate to the product page.
  const onClickCapture = (e: React.MouseEvent) => {
    if (swiped.current) {
      e.preventDefault()
      e.stopPropagation()
      swiped.current = false
    }
  }

  if (images.length === 0) {
    return <div className="relative aspect-[3/4] overflow-hidden bg-sand" />
  }

  return (
    <div className="relative aspect-[3/4] overflow-hidden bg-sand" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} onClickCapture={onClickCapture}>
      <img
        src={images[index]}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        style={index === 0 ? { objectPosition: `${product.coverFocalX}% ${product.coverFocalY}%` } : undefined}
      />

      {product.colors.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setColorsOpen(true)
          }}
          aria-label={`عرض كل الألوان (${product.colors.length})`}
          className="absolute start-2 top-2 flex items-center gap-1 rounded-full bg-ivory/90 px-2 py-1 text-[0.625rem] font-medium text-ink shadow-sm transition-colors hover:bg-ivory"
        >
          <Layers size={11} aria-hidden="true" /> {product.colors.length}
        </button>
      )}

      <Dialog open={colorsOpen} onClose={() => setColorsOpen(false)} label={`ألوان ${product.name}`} variant="center">
        <div className="flex h-14 items-center justify-between border-b border-line px-4">
          <h2 className="text-sm font-medium">{product.name} — الألوان المتوفرة</h2>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setColorsOpen(false)
            }}
            aria-label="إغلاق"
            className="-me-2 grid h-10 w-10 place-items-center hover:bg-sand"
          >
            <X size={18} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3">
          {product.colors.map((c) => {
            const photo = c.photoUrl ?? images[0]
            return (
              <button
                key={c.id}
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  const i = photo ? images.indexOf(photo) : -1
                  if (i >= 0) setIndex(i)
                  setColorsOpen(false)
                }}
                className="group text-start"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-sand">
                  {photo && <img src={photo} alt={c.colorName} className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-[1.03]" />}
                </div>
                <p className="mt-1.5 text-xs">{c.colorName}</p>
              </button>
            )
          })}
        </div>
      </Dialog>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setQuickAddOpen(true)
        }}
        aria-label={`أضيفي ${product.name} إلى السلة`}
        className="absolute bottom-2 start-2 grid h-8 w-8 place-items-center rounded-full bg-ivory/90 text-ink shadow-sm transition-colors hover:bg-ink hover:text-ivory"
      >
        <ShoppingBag size={14} aria-hidden="true" />
      </button>

      <Dialog open={quickAddOpen} onClose={() => setQuickAddOpen(false)} label={`إضافة ${product.name} إلى السلة`} variant="center">
        <div className="flex h-14 items-center justify-between border-b border-line px-4">
          <h2 className="text-sm font-medium">{product.name}</h2>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setQuickAddOpen(false)
            }}
            aria-label="إغلاق"
            className="-me-2 grid h-10 w-10 place-items-center hover:bg-sand"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-4">
          {product.colors.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-sm">
                اللون: <span className="font-medium">{qaColor}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setQaColor(c.colorName)
                    }}
                    className={`border px-3.5 py-2 text-sm transition-colors ${qaColor === c.colorName ? 'border-ink bg-ink text-ivory' : 'border-line bg-white hover:border-ink'}`}
                  >
                    {c.colorName}
                  </button>
                ))}
              </div>
            </div>
          )}
          {product.sizes.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-sm">المقاس: {qaSize ?? <span className="text-muted">اختاري مقاسًا</span>}</p>
              <div className={`flex flex-wrap gap-2 ${qaSizeError && !qaSize ? 'outline outline-1 outline-offset-4 outline-sale' : ''}`}>
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setQaSize(s)
                      setQaSizeError(false)
                    }}
                    className={`h-11 min-w-12 border px-3 text-sm transition-colors ${qaSize === s ? 'border-ink bg-ink text-ivory' : 'border-line bg-white hover:border-ink'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onQuickAdd()
            }}
            className="btn btn-primary mt-2 !h-12 w-full"
          >
            <ShoppingBag size={16} aria-hidden="true" /> أضيفي إلى سلة التسوق
          </button>
        </div>
      </Dialog>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              go(-1)
            }}
            aria-label="الصورة السابقة"
            className="absolute left-1 top-1/2 hidden h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-ivory/90 text-ink opacity-0 shadow-sm transition-opacity group-hover:opacity-100 sm:grid"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              go(1)
            }}
            aria-label="الصورة التالية"
            className="absolute right-1 top-1/2 hidden h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-ivory/90 text-ink opacity-0 shadow-sm transition-opacity group-hover:opacity-100 sm:grid"
          >
            <ChevronRight size={14} />
          </button>
          <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-1">
            {images.map((_, i) => (
              <span key={i} className={`h-1 w-1 rounded-full transition-all ${i === index ? 'w-3 bg-ivory' : 'bg-ivory/60'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
