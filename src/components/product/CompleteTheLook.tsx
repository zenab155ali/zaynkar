import { useMemo } from 'react'
import { Sparkles } from 'lucide-react'
import type { Product } from '@/types'
import { ProductCarousel } from '@/components/product/ProductCarousel'
import { useUI } from '@/context/UIContext'
import { completeTheLook } from '@/utils/recommend'

/** "Complete The Look" — mock recommendations (rule-based today, AI-ready shape for later). */
export function CompleteTheLook({ product }: { product: Product }) {
  const { openLook } = useUI()
  const items = useMemo(() => completeTheLook(product, 4), [product])
  if (!items.length) return null

  return (
    <section aria-labelledby="ctl-heading" className="border-t border-line py-12 sm:py-16">
      <div className="container-page">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Styled to go together</p>
            <h2 id="ctl-heading" className="display mt-2 text-3xl sm:text-4xl">
              Complete The Look
            </h2>
          </div>
          <button type="button" onClick={() => openLook(product.id)} className="btn btn-outline btn-sm self-start sm:self-auto">
            <Sparkles size={15} aria-hidden="true" />
            Complete My Look
          </button>
        </div>
        <ProductCarousel products={items} label="Complete the look" />
      </div>
    </section>
  )
}
