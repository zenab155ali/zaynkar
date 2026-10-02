import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  id: string
  linkLabel?: string
  linkTo?: string
  className?: string
}

export function SectionHeader({ eyebrow, title, id, linkLabel, linkTo, className = '' }: SectionHeaderProps) {
  return (
    <div className={`mb-8 flex items-end justify-between gap-6 sm:mb-10 ${className}`}>
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 id={id} className="display text-4xl sm:text-5xl">
          {title}
        </h2>
      </div>
      {linkLabel && linkTo && (
        <Link to={linkTo} className="hidden shrink-0 items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] sm:inline-flex">
          <span className="link-underline">{linkLabel}</span>
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}
