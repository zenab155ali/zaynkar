import { useMemo } from 'react'
import { Sparkles } from 'lucide-react'
import { SmartImage } from '@/components/ui/SmartImage'
import { useUI } from '@/context/UIContext'
import { getProduct } from '@/data/products'
import { completeTheLook } from '@/utils/recommend'

const ANCHOR_ID = 'navy-satin-balloon-sleeve-maxi'

/** Teaser for the future AI outfit builder — opens the mock "Complete My Look" experience. */
export function CompleteMyLookBanner() {
  const { openLook } = useUI()
  const looks = useMemo(() => {
    const anchor = getProduct(ANCHOR_ID)
    return anchor ? [anchor, ...completeTheLook(anchor, 3)] : []
  }, [])

  return (
    <section aria-labelledby="look-heading" className="container-page pt-16 sm:pt-24">
      <div className="grid items-center gap-10 bg-ink px-6 py-12 text-ivory sm:px-12 sm:py-16 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="eyebrow mb-4 inline-flex items-center gap-2 !text-ivory/70">
            <Sparkles size={14} aria-hidden="true" /> AI stylist · Preview
          </p>
          <h2 id="look-heading" className="display text-4xl sm:text-6xl">
            Complete My Look
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ivory/75 sm:text-base">
            Pick a piece you love and ZAYNKAR will suggest the shoes, bag and accessories to finish the outfit. In the future this will be powered by AI — today, try the preview.
          </p>
          <button type="button" onClick={() => openLook(ANCHOR_ID)} className="btn btn-light mt-8">
            <Sparkles size={15} aria-hidden="true" />
            Try the preview
          </button>
        </div>

        <ul className="grid grid-cols-4 gap-2 sm:gap-3" aria-label="Example outfit">
          {looks.map((p, i) => (
            <li key={p.id} className={i % 2 === 1 ? 'mt-6 sm:mt-10' : ''}>
              <div className="relative aspect-[3/4] overflow-hidden bg-ivory/10">
                <SmartImage image={p.images[0]} alt={p.name} widths={[240, 360, 480]} sizes="(min-width: 1024px) 12vw, 22vw" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
