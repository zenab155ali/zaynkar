import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { useToast } from '@/context/ToastContext'
import { CURRENCIES } from '@/utils/currency'
import { useCurrency } from '@/context/CurrencyContext'

interface FooterLink {
  label: string
  to: string
  external?: boolean
}

const SOCIAL: FooterLink[] = [
  { label: 'Instagram', to: 'https://www.instagram.com/', external: true },
  { label: 'TikTok', to: 'https://www.tiktok.com/', external: true },
  { label: 'Pinterest', to: 'https://www.pinterest.com/', external: true },
]

const LEGAL: FooterLink[] = [
  { label: 'سياسة الخصوصية', to: '/info/privacy' },
  { label: 'الشروط والأحكام', to: '/info/terms' },
]

function Newsletter() {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    toast({ title: 'شكرًا لاشتراكك' })
    setEmail('')
  }
  return (
    <form onSubmit={onSubmit} className="w-full max-w-md">
      <label htmlFor="newsletter-email" className="text-sm text-muted">
        اشتركي ليصلكِ كل جديد.
      </label>
      <div className="mt-3 flex">
        <input id="newsletter-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="بريدكِ الإلكتروني" autoComplete="email" className="field min-w-0 flex-1" />
        <button type="submit" className="btn btn-primary -ms-px shrink-0 px-5">
          اشتراك
        </button>
      </div>
    </form>
  )
}

export function Footer() {
  const { currency } = useCurrency()
  return (
    <footer className="mt-20 border-t border-line bg-sand/60">
      <div className="container-page py-12 sm:py-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm">
            <Logo className="!pl-0" />
            <p className="mt-4 text-sm leading-relaxed text-muted">فساتين أنيقة، مختارة لكِ.</p>
            <div className="mt-6">
              <Newsletter />
            </div>
          </div>

          <nav aria-label="تابعينا" className="lg:text-end">
            <h2 className="eyebrow mb-4 !text-ink">تابعينا</h2>
            <ul className="space-y-3 text-sm">
              {SOCIAL.map((link) => (
                <li key={link.label}>
                  <a href={link.to} target="_blank" rel="noopener noreferrer" className="text-muted transition-colors hover:text-ink">
                    {link.label}
                    <span className="sr-only"> (يفتح في نافذة جديدة)</span>
                  </a>
                </li>
              ))}
              <li>
                <Link to="/info/contact" className="text-muted transition-colors hover:text-ink">
                  تواصلي معنا
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
            {LEGAL.map((l) => (
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
