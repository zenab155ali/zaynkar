import { useLanguage } from '@/context/LanguageContext'

export function PromoBar() {
  const { t } = useLanguage()
  return (
    <div className="bg-ink text-ivory">
      <p className="container-page py-2 text-center text-[0.625rem] font-medium uppercase leading-tight tracking-[0.08em] sm:text-[0.6875rem] sm:tracking-[0.16em]">
        {t('promoBarText')}
      </p>
    </div>
  )
}
