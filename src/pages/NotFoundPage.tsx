import { Link } from 'react-router-dom'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function NotFoundPage() {
  useDocumentTitle('Page not found')
  return (
    <div className="container-page py-24 text-center sm:py-32">
      <p className="eyebrow">Error 404</p>
      <h1 className="display mt-3 text-5xl sm:text-7xl">We couldn’t find that page</h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted">The link may be broken, or the page may have moved. Let’s get you back to something beautiful.</p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn btn-primary">
          Back to home
        </Link>
        <Link to="/shop/new-in" className="btn btn-outline">
          Shop new in
        </Link>
      </div>
    </div>
  )
}
