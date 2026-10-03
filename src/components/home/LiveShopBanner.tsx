import { Link } from 'react-router-dom'
import { ArrowLeft, ShoppingBag } from 'lucide-react'

/** Points to the real, database-backed shop. */
export function LiveShopBanner() {
  return (
    <div className="bg-ink">
      <Link to="/store" className="container-page group flex items-center justify-center gap-3 py-3 text-ivory">
        <ShoppingBag size={16} aria-hidden="true" />
        <span className="text-sm font-medium">تسوقي فساتيننا الآن</span>
        <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-1" aria-hidden="true" />
      </Link>
    </div>
  )
}
