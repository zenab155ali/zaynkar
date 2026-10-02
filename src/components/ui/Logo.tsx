import { Link } from 'react-router-dom'
import { SITE_NAME } from '@/config'

interface LogoProps {
  className?: string
  onNavigate?: () => void
}

/** Text-based wordmark. Replace with an SVG mark later without touching call sites. */
export function Logo({ className = '', onNavigate }: LogoProps) {
  return (
    <Link
      to="/"
      onClick={onNavigate}
      aria-label={`${SITE_NAME} — home`}
      className={`display inline-block select-none pl-[0.3em] text-[1.3rem] font-semibold leading-none tracking-[0.3em] min-[400px]:pl-[0.34em] min-[400px]:text-[1.6rem] min-[400px]:tracking-[0.34em] sm:text-[1.9rem] ${className}`}
    >
      {SITE_NAME}
    </Link>
  )
}
