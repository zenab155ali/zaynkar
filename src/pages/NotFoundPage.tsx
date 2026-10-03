import { Link } from 'react-router-dom'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function NotFoundPage() {
  useDocumentTitle('الصفحة غير موجودة')
  return (
    <div className="container-page py-24 text-center sm:py-32">
      <p className="eyebrow">خطأ 404</p>
      <h1 className="display mt-3 text-5xl sm:text-7xl">لم نتمكن من العثور على هذه الصفحة</h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted">قد يكون الرابط غير صحيح، أو أن الصفحة لم تعد موجودة.</p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn btn-primary">
          العودة للرئيسية
        </Link>
        <Link to="/store" className="btn btn-outline">
          تسوقي الفساتين
        </Link>
      </div>
    </div>
  )
}
