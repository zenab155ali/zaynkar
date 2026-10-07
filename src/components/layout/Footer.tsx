import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { useLanguage } from '@/context/LanguageContext'
import { useToast } from '@/context/ToastContext'
import { CURRENCIES } from '@/utils/currency'
import { useCurrency } from '@/context/CurrencyContext'

interface FooterLink {
  label: string
  to: string
  external?: boolean
}

const SOCIAL: FooterLink[] = [{ label: 'Instagram', to: 'https://www.instagram.com/zaynkar_fashion', external: true }]

function Newsletter() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    toast({ title: t('thanksForSubscribing') })
    setEmail('')
  }
  return (
    <form onSubmit={onSubmit} className="w-full max-w-md">
      <label htmlFor="newsletter-email" className="text-sm text-muted">
        {t('newsletterHint')}
      </label>
      <div className="mt-3 flex">
        <input id="newsletter-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('yourEmail')} autoComplete="email" className="field min-w-0 flex-1" />
        <button type="submit" className="btn btn-primary -ms-px shrink-0 px-5">
          {t('subscribe')}
        </button>
      </div>
    </form>
  )
}

export function Footer() {
  const { currency } = useCurrency()
  const { t } = useLanguage()
  const legal: FooterLink[] = [
    { label: t('privacyPolicy'), to: '/info/privacy' },
    { label: t('termsConditions'), to: '/info/terms' },
  ]
  return (
    <footer className="mt-20 border-t border-line bg-sand/60">
      <div className="container-page py-12 sm:py-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm">
            <Logo className="!pl-0" />
            <p className="mt-4 text-sm leading-relaxed text-muted">{t('footerTagline')}</p>
            <div className="mt-6">
              <Newsletter />
            </div>
          </div>

          <nav aria-label={t('followUs')} className="lg:text-end">
            <h2 className="eyebrow mb-4 !text-ink">{t('followUs')}</h2>
            <ul className="space-y-3 text-sm">
              {SOCIAL.map((link) => (
                <li key={link.label}>
                  <a href={link.to} target="_blank" rel="noopener noreferrer" className="text-muted transition-colors hover:text-ink">
                    {link.label}
                    <span className="sr-only"> {t('opensNewWindow')}</span>
                  </a>
                </li>
              ))}
              <li>
                <Link to="/info/contact" className="text-muted transition-colors hover:text-ink">
                  {t('contactUs')}
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-6 text-xs text-muted md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} ZAYNKAR.
            <span className="ms-3 whitespace-nowrap" dir="ltr">
              {CURRENCIES[currency].symbol.trim()} {currency}
            </span>
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {legal.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="transition-colors hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
