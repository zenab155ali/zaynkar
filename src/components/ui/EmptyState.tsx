import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: string
  children?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, children, className = '' }: EmptyStateProps) {
  return (
    <div className={`mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center sm:py-24 ${className}`}>
      <div className="mb-6 grid h-16 w-16 place-items-center rounded-full bg-sand text-taupe">{icon}</div>
      <h2 className="display text-3xl">{title}</h2>
      {description && <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>}
      {children && <div className="mt-8 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  )
}
