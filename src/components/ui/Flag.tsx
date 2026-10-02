import type { ReactNode } from 'react'
import type { CountryCode } from '@/types'

/**
 * Inline SVG flags. Regional-indicator flag emoji don't render on Windows browsers (they show as "TR"),
 * so we draw them ourselves for consistent display everywhere.
 */
const star = (cx: number, cy: number, outer: number, inner: number): string =>
  Array.from({ length: 10 }, (_, i) => {
    const angle = (i * Math.PI) / 5
    const r = i % 2 === 0 ? outer : inner
    return `${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`
  }).join(' ')

/** Trigram made of 3 lines: 1 = solid, 0 = broken. */
function Trigram({ x, y, rotate, lines }: { x: number; y: number; rotate: number; lines: (0 | 1)[] }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`} fill="#111">
      {lines.map((solid, i) => {
        const yy = -2.9 + i * 2.9 - 0.7
        return solid ? (
          <rect key={i} x={-5} y={yy} width={10} height={1.4} />
        ) : (
          <g key={i}>
            <rect x={-5} y={yy} width={4.3} height={1.4} />
            <rect x={0.7} y={yy} width={4.3} height={1.4} />
          </g>
        )
      })}
    </g>
  )
}

const FLAGS: Record<CountryCode, ReactNode> = {
  TR: (
    <>
      <rect width="60" height="40" fill="#E30A17" />
      <circle cx="21.5" cy="20" r="9" fill="#fff" />
      <circle cx="24" cy="20" r="7.2" fill="#E30A17" />
      <polygon points={star(32.5, 20, 4.2, 1.7)} fill="#fff" />
    </>
  ),
  IT: (
    <>
      <rect width="20" height="40" fill="#009246" />
      <rect x="20" width="20" height="40" fill="#fff" />
      <rect x="40" width="20" height="40" fill="#CE2B37" />
    </>
  ),
  KR: (
    <>
      <rect width="60" height="40" fill="#fff" />
      <g transform="translate(30 20) rotate(-33.7)">
        <circle r="9" fill="#0047A0" />
        <path d="M-9 0a9 9 0 0 1 18 0a4.5 4.5 0 0 1-9 0a4.5 4.5 0 0 0-9 0z" fill="#CD2E3A" />
      </g>
      <Trigram x={12.5} y={9} rotate={-33.7} lines={[1, 1, 1]} />
      <Trigram x={47.5} y={31} rotate={-33.7} lines={[0, 0, 0]} />
      <Trigram x={47.5} y={9} rotate={33.7} lines={[0, 1, 0]} />
      <Trigram x={12.5} y={31} rotate={33.7} lines={[1, 0, 1]} />
    </>
  ),
  AE: (
    <>
      <rect width="60" height="40" fill="#fff" />
      <rect width="60" height="13.4" fill="#00732F" />
      <rect y="26.6" width="60" height="13.4" fill="#111" />
      <rect width="15" height="40" fill="#EF3340" />
    </>
  ),
}

interface FlagProps {
  code: CountryCode
  /** Height in px; width follows a 3:2 ratio. */
  size?: number
  className?: string
}

export function Flag({ code, size = 14, className = '' }: FlagProps) {
  return (
    <svg
      viewBox="0 0 60 40"
      width={size * 1.5}
      height={size}
      className={`inline-block shrink-0 rounded-[2px] ring-1 ring-black/10 ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      {FLAGS[code]}
    </svg>
  )
}
