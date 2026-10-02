import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { SectionHeader } from '@/components/home/SectionHeader'
import { ProductCarousel } from '@/components/product/ProductCarousel'
import { PRODUCTS } from '@/data/products'

export function NewArrivals() {
  const products = useMemo(() => PRODUCTS.filter((p) => p.isNew).sort((a, b) => a.daysOld - b.daysOld).slice(0, 12), [])
  return (
    <section aria-labelledby="new-heading" className="container-page pt-16 sm:pt-24">
      <SectionHeader id="new-heading" eyebrow="Just landed" title="New Arrivals" linkLabel="Shop all new in" linkTo="/shop/new-in" />
      <ProductCarousel products={products} label="New arrivals" />
      <div className="mt-8 text-center sm:hidden">
        <Link to="/shop/new-in" className="btn btn-outline btn-sm">
          Shop all new in
        </Link>
      </div>
    </section>
  )
}
