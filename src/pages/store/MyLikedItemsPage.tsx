import { Link, Navigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { EmptyState } from '@/components/ui/EmptyState'
import { RequireSupabase } from '@/components/ui/RequireSupabase'
import { SmartImage } from '@/components/ui/SmartImage'
import { LikeButton } from '@/components/store/LikeButton'
import { useAuth } from '@/context/AuthContext'
import { useCurrency } from '@/context/CurrencyContext'
import { useLanguage } from '@/context/LanguageContext'
import { useLikes } from '@/context/LikesContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

function LikedItemsView() {
  const { t, pick } = useLanguage()
  useDocumentTitle(t('liked'))
  const { user } = useAuth()
  const { loading, likedProducts } = useLikes()
  const { format } = useCurrency()

  if (!user) return <Navigate to="/signin" state={{ from: '/liked' }} replace />

  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: t('home'), to: '/' }, { label: t('liked') }]} />
      <h1 className="display mt-4 text-4xl">{t('liked')}</h1>

      {loading ? (
        <p className="mt-6 text-sm text-muted">{t('loading')}</p>
      ) : likedProducts.length === 0 ? (
        <EmptyState icon={<Heart size={26} strokeWidth={1.3} />} title={t('noFavoritesYet')} description={t('favoritesHint')}>
          <Link to="/store" className="btn btn-primary">
            {t('browseDresses')}
          </Link>
        </EmptyState>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3">
          {likedProducts.map((p) => {
            const cover = p.media.find((m) => m.type === 'image') ?? p.media[0]
            const name = pick(p.name, p.nameHe)
            return (
              <article key={p.id} className="group relative">
                <Link to={`/store/${p.code}`} className="block">
                  <div className="relative aspect-[3/4] overflow-hidden bg-sand">
                    {cover && cover.type === 'image' && <SmartImage image={{ url: cover.url }} alt="" className="transition-transform duration-500 group-hover:scale-[1.03]" />}
                  </div>
                </Link>
                <LikeButton productId={p.id} productName={name} className="absolute end-2 top-2" />
                <Link to={`/store/${p.code}`} className="mt-3 block">
                  <p className="font-mono text-[0.6875rem] text-muted" dir="ltr">
                    {p.code}
                  </p>
                  <h2 className="text-sm leading-snug group-hover:underline">{name}</h2>
                  <p className="mt-1 text-sm font-medium">{format(p.price)}</p>
                </Link>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function MyLikedItemsPage() {
  return (
    <RequireSupabase>
      <LikedItemsView />
    </RequireSupabase>
  )
}
