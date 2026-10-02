import { Link } from 'react-router-dom'
import { ArrowRight, ShoppingBag } from 'lucide-react'

/** Points to the real, database-backed shop. Everything below this on the homepage is still the prototype demo. */
export function LiveShopBanner() {
  return (
    <div className="bg-ink">
      <Link to="/store" className="container-page group flex items-center justify-center gap-3 py-3 text-ivory">
        <ShoppingBag size={16} aria-hidden="true" />
        <span className="text-sm font-medium">Shop our real dresses now</span>
        <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </Link>
    </div>
  )
}
