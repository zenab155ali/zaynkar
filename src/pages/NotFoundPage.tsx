import { Link } from 'react-router-dom'
import { useLanguage } from '@/context/LanguageContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function NotFoundPage() {
  const { t } = useLanguage()
  useDocumentTitle(t('pageNotFound'))
  return (
    <div className="container-page py-24 text-center sm:py-32">
      <p className="eyebrow">{t('error404')}</p>
      <h1 className="display mt-3 text-5xl sm:text-7xl">{t('pageNotFound')}</h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted">{t('pageNotFoundDesc')}</p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn btn-primary">
          {t('backHome')}
        </Link>
        <Link to="/store" className="btn btn-outline">
          {t('shopDresses')}
        </Link>
      </div>
    </div>
  )
}
