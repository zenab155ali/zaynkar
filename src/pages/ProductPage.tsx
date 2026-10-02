import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Ruler, ShoppingBag, Store as StoreIcon, Truck } from 'lucide-react'
import { AccordionItem } from '@/components/ui/Accordion'
import { Badge, getBadges } from '@/components/ui/Badge'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Flag } from '@/components/ui/Flag'
import { Rating } from '@/components/ui/Rating'
import { Skeleton } from '@/components/ui/Skeleton'
import { ColorPicker } from '@/components/product/ColorSwatches'
import { CompleteTheLook } from '@/components/product/CompleteTheLook'
import { FavoriteButton } from '@/components/product/FavoriteButton'
import { PriceTag } from '@/components/product/PriceTag'
import { ProductCarousel } from '@/components/product/ProductCarousel'
import { ProductGallery } from '@/components/product/ProductGallery'
import { QuantityStepper } from '@/components/product/QuantityStepper'
import { ReviewsSection } from '@/components/product/ReviewsSection'
import { SizeGuideModal } from '@/components/product/SizeGuideModal'
import { SizeSelector } from '@/components/product/SizeSelector'
import { FREE_SHIPPING_THRESHOLD } from '@/config'
import { useCart } from '@/context/CartContext'
import { useCurrency } from '@/context/CurrencyContext'
import { useToast } from '@/context/ToastContext'
import { COLLECTIONS } from '@/data/collections'
import { COUNTRIES } from '@/data/countries'
import { getProduct, getProductsByIds } from '@/data/products'
import { getStore } from '@/data/stores'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import { useSimulatedLoading } from '@/hooks/useSimulatedLoading'
import { similarProducts } from '@/utils/recommend'
import NotFoundPage from '@/pages/NotFoundPage'
import type { Product } from '@/types'

export default function ProductPage() {
  const { slug = '' } = useParams()
  const product = getProduct(slug)
  if (!product) return <NotFoundPage />
  return <ProductView key={product.id} product={product} />
}

function ProductSkeleton() {
  return (
    <div className="container-page py-8" role="status" aria-label="Loading product">
      <Skeleton className="h-4 w-64" />
      <div className="mt-6 grid gap-10 lg:grid-cols-12">
        <Skeleton className="aspect-[3/4] w-full lg:col-span-7" />
        <div className="space-y-4 lg:col-span-5">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-10 w-4/5" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="mt-8 h-10 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      </div>
    </div>
  )
}

function ProductView({ product }: { product: Product }) {
  useDocumentTitle(`${product.name} — ${product.brand}`)
  const loading = useSimulatedLoading(`product:${product.id}`, 300)
  const { add } = useCart()
  const { toast } = useToast()
  const { format } = useCurrency()
  const { ids: recentIds, track } = useRecentlyViewed()

  const [color, setColor] = useState(product.colors[0])
  const [size, setSize] = useState<string | null>(product.sizes.length === 1 ? product.sizes[0] : null)
  const [quantity, setQuantity] = useState(1)
  const [sizeError, setSizeError] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const sizeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    track(product.id)
  }, [product.id, track])

  const store = getStore(product.storeId)
  const country = COUNTRIES[product.country]
  const badges = getBadges(product)
  const similar = useMemo(() => similarProducts(product, 8), [product])
  const recent = useMemo(() => getProductsByIds(recentIds.filter((id) => id !== product.id)).slice(0, 8), [recentIds, product.id])

  const category = COLLECTIONS[product.category]
  const crumbs = [
    { label: 'Home', to: '/' },
    { label: 'Women', to: '/shop/women' },
    ...(category ? [{ label: category.title, to: `/shop/${category.slug}` }] : []),
    { label: product.name },
  ]

  if (loading) return <ProductSkeleton />

  const addToBag = () => {
    if (!size) {
      setSizeError(true)
      sizeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    add({ productId: product.id, size, color, quantity })
    toast({
      title: 'Added to bag',
      description: `${product.name} · ${color} · ${size}${quantity > 1 ? ` · ×${quantity}` : ''}`,
      image: product.images[0],
      action: { label: 'View bag', to: '/bag' },
    })
  }

  const openReviews = () => {
    const el = document.getElementById('reviews') as HTMLDetailsElement | null
    if (!el) return
    el.open = true
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const isShoe = product.category === 'shoes'
  const hasSizeGuide = !['bags', 'accessories'].includes(product.category)

  return (
    <>
      <div className="container-page pt-4 sm:pt-6">
        <Breadcrumbs items={crumbs} />
      </div>

      <div className="container-page mt-5 grid gap-8 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <ProductGallery images={product.images} name={product.name} />
        </div>

        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-36">
            {badges.length > 0 && (
              <div className="mb-3 flex gap-1.5">
                {badges.map((b) => (
                  <Badge key={b} kind={b} />
                ))}
              </div>
            )}
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">{product.brand}</p>
            <h1 className="display mt-1 text-3xl leading-tight sm:text-4xl">{product.name}</h1>

            <button type="button" onClick={openReviews} className="mt-3 inline-flex items-center gap-2 text-left" aria-label={`Rated ${product.rating} out of 5 from ${product.reviewCount} reviews. Read reviews`}>
              <Rating value={product.rating} />
              <span className="text-xs text-muted underline underline-offset-4">
                {product.rating.toFixed(1)} · {product.reviewCount} reviews
              </span>
            </button>

            <PriceTag product={product} size="lg" className="mt-4" />
            {product.oldPrice && <p className="mt-1 text-xs text-sale">You save {format(product.oldPrice - product.price)}</p>}

            {/* Marketplace identity — kept quiet */}
            <dl className="mt-5 space-y-1.5 border-y border-line py-4 text-[0.8125rem]">
              <div className="flex items-center gap-2">
                <StoreIcon size={15} className="shrink-0 text-muted" aria-hidden="true" />
                <dt className="text-muted">Sold by:</dt>
                <dd className="font-medium">
                  {product.brand}
                  {store && <span className="font-normal text-muted"> · {store.city}</span>}
                </dd>
              </div>
              <div className="flex items-center gap-2">
                <Truck size={15} className="shrink-0 text-muted" aria-hidden="true" />
                <dt className="text-muted">Ships from:</dt>
                <dd className="inline-flex items-center gap-1.5 font-medium">
                  {country.name}
                  <Flag code={product.country} size={12} />
                </dd>
              </div>
              <div className="flex items-center gap-2 pl-[23px]">
                <dt className="text-muted">Country of origin:</dt>
                <dd>{country.name}</dd>
              </div>
            </dl>

            {/* Colour */}
            <div className="mt-6">
              <p className="mb-2 text-sm">
                <span className="text-muted">Colour:</span> <span className="font-medium">{color}</span>
              </p>
              <ColorPicker colors={product.colors} value={color} onChange={setColor} />
            </div>

            {/* Size */}
            <div className="mt-6" ref={sizeRef}>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm">
                  <span className="text-muted">Size:</span> <span className="font-medium">{size ?? 'Select a size'}</span>
                </p>
                {hasSizeGuide && (
                  <button type="button" onClick={() => setGuideOpen(true)} className="inline-flex items-center gap-1.5 text-xs underline underline-offset-4">
                    <Ruler size={14} aria-hidden="true" /> Size guide
                  </button>
                )}
              </div>
              <SizeSelector
                sizes={product.sizes}
                unavailable={product.unavailableSizes}
                value={size}
                invalid={sizeError && !size}
                onChange={(s) => {
                  setSize(s)
                  setSizeError(false)
                }}
              />
              <p role="alert" className={`mt-2 text-xs text-sale ${sizeError && !size ? '' : 'sr-only'}`}>
                {sizeError && !size ? 'Please select a size to add this item to your bag.' : ''}
              </p>
            </div>

            {/* Quantity + actions */}
            <div className="mt-6 flex items-center gap-3">
              <QuantityStepper value={quantity} onChange={setQuantity} />
              <FavoriteButton productId={product.id} productName={product.name} variant="inline" className="ml-auto" />
            </div>
            <button type="button" onClick={addToBag} className="btn btn-primary mt-3 !h-14 w-full text-[0.8125rem]">
              <ShoppingBag size={18} aria-hidden="true" />
              Add to bag
            </button>
            <p className="mt-3 text-center text-xs text-muted">Free shipping on orders over {format(FREE_SHIPPING_THRESHOLD)} · Easy 30-day returns</p>

            {/* Details */}
            <div className="mt-8 border-t border-line">
              <AccordionItem title="Description" defaultOpen>
                <p>{product.description}</p>
                {product.tags.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {[...(product.modest ? ['Modest'] : []), ...product.styles].map((t) => (
                      <li key={t} className="border border-line px-2 py-1 text-xs">
                        {t}
                      </li>
                    ))}
                  </ul>
                )}
              </AccordionItem>
              <AccordionItem title="Material & care">
                <p>{product.material}</p>
                <p className="mt-2">{product.care}</p>
              </AccordionItem>
              <AccordionItem title="Fit">
                <p>{product.fit}</p>
                {hasSizeGuide && (
                  <button type="button" onClick={() => setGuideOpen(true)} className="mt-2 underline underline-offset-4">
                    {isShoe ? 'View shoe size chart' : 'View size guide'}
                  </button>
                )}
              </AccordionItem>
              <AccordionItem title="Shipping">
                <p>
                  Dispatched by {product.brand} from {country.name}. Standard delivery takes 4–7 business days and is free on orders over {format(FREE_SHIPPING_THRESHOLD)}. Express (1–3 business days) is available at checkout.
                </p>
                <p className="mt-2">Orders from several sellers may arrive in separate parcels — you’ll receive tracking for each.</p>
              </AccordionItem>
              <AccordionItem title="Returns">
                <p>Changed your mind? Return unworn items with tags within 30 days for a full refund. Return labels are included in the parcel and are free for orders in your country.</p>
                <p className="mt-2">
                  <Link to="/info/returns" className="underline underline-offset-4">
                    Read the returns policy
                  </Link>
                </p>
              </AccordionItem>
              <AccordionItem title={`Reviews (${product.reviewCount})`} id="reviews">
                <ReviewsSection product={product} />
              </AccordionItem>
            </div>
          </div>
        </div>
      </div>

      <CompleteTheLook product={product} />

      <section aria-labelledby="similar-heading" className="border-t border-line py-12 sm:py-16">
        <div className="container-page">
          <h2 id="similar-heading" className="display mb-8 text-3xl sm:text-4xl">
            You May Also Like
          </h2>
          <ProductCarousel products={similar} label="You may also like" />
        </div>
      </section>

      {recent.length > 0 && (
        <section aria-labelledby="recent-heading" className="border-t border-line py-12 sm:py-16">
          <div className="container-page">
            <h2 id="recent-heading" className="display mb-8 text-3xl sm:text-4xl">
              Recently Viewed
            </h2>
            <ProductCarousel products={recent} label="Recently viewed" />
          </div>
        </section>
      )}

      <SizeGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} defaultTab={isShoe ? 'shoes' : 'clothing'} />
    </>
  )
}
