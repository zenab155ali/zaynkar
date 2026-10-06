import { Link } from 'react-router-dom'
import { useProducts } from '@/context/ProductsContext'

/** Clickable photo tiles for every category — lets customers jump straight into one from the homepage. */
export function CategoryTiles() {
  const { categories } = useProducts()
  if (categories.length === 0) return null

  return (
    <section aria-labelledby="categories-heading" className="container-page py-12 sm:py-16">
      <h2 id="categories-heading" className="display mb-6 text-center text-2xl sm:text-3xl">
        تسوّقي حسب الفئة
      </h2>
      <div className="grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-6 md:grid-cols-6">
        {categories.map((c) => (
          <Link key={c.id} to={`/store?category=${c.id}`} className="group flex flex-col items-center gap-2.5 text-center">
            <span className="relative block aspect-square w-full overflow-hidden rounded-full bg-sand">
              {c.photoUrl && <img src={c.photoUrl} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />}
            </span>
            <span className="text-xs font-medium leading-snug sm:text-sm">{c.name}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
