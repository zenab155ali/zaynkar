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

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Shop',
    links: [
      { label: 'Women', to: '/shop/women' },
      { label: 'Modest', to: '/shop/modest' },
      { label: 'Shoes', to: '/shop/shoes' },
      { label: 'Bags', to: '/shop/bags' },
      { label: 'Accessories', to: '/shop/accessories' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Contact Us', to: '/info/contact' },
      { label: 'Shipping', to: '/info/shipping' },
      { label: 'Returns', to: '/info/returns' },
      { label: 'Size Guide', to: '/info/size-guide' },
      { label: 'FAQ', to: '/info/faq' },
    ],
  },
  {
    title: 'About ZAYNKAR',
    links: [
      { label: 'Our Story', to: '/info/our-story' },
      { label: 'Our Sellers', to: '/info/our-sellers' },
      { label: 'Careers', to: '/info/careers' },
    ],
  },
  {
    title: 'Follow us',
    links: [
      { label: 'Instagram', to: 'https://www.instagram.com/', external: true },
      { label: 'TikTok', to: 'https://www.tiktok.com/', external: true },
      { label: 'Pinterest', to: 'https://www.pinterest.com/', external: true },
    ],
  },
]

const LEGAL: FooterLink[] = [
  { label: 'Privacy Policy', to: '/info/privacy' },
  { label: 'Terms & Conditions', to: '/info/terms' },
  { label: 'Cookie Settings', to: '/info/cookies' },
]

function Newsletter() {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    toast({ title: 'Thank you for subscribing', description: 'Demo only — no email was stored.' })
    setEmail('')
  }
  return (
    <form onSubmit={onSubmit} className="w-full max-w-md">
      <label htmlFor="newsletter-email" className="text-sm text-muted">
        Get early access to new sellers and drops.
      </label>
      <div className="mt-3 flex">
        <input id="newsletter-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address" autoComplete="email" className="field min-w-0 flex-1" />
        <button type="submit" className="btn btn-primary -ml-px shrink-0 px-5">
          Join
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
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div className="max-w-sm">
            <Logo className="!pl-0" />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              A global fashion marketplace connecting independent stores and brands from around the world — starting with Turkey.
            </p>
            <div className="mt-6">
              <Newsletter />
            </div>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:max-w-3xl">
            {COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h2 className="eyebrow mb-4 !text-ink">{col.title}</h2>
                <ul className="space-y-3 text-sm">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.external ? (
                        <a href={link.to} target="_blank" rel="noopener noreferrer" className="text-muted transition-colors hover:text-ink">
                          {link.label}
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      ) : (
                        <Link to={link.to} className="text-muted transition-colors hover:text-ink">
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-6 text-xs text-muted md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} ZAYNKAR. Prototype — no real orders or payments are processed.
            <span className="ml-3 whitespace-nowrap">
              Currency: {CURRENCIES[currency].symbol.trim()} {currency}
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
