import { Minus, Plus } from 'lucide-react'
import type { ReactNode } from 'react'

interface AccordionItemProps {
  title: string
  defaultOpen?: boolean
  children: ReactNode
  id?: string
}

/** Native <details> based accordion item: keyboard accessible with no JS state. */
export function AccordionItem({ title, defaultOpen = false, children, id }: AccordionItemProps) {
  return (
    <details id={id} open={defaultOpen} className="group border-b border-line">
      <summary className="flex items-center justify-between gap-4 py-4 text-sm font-medium tracking-wide">
        {title}
        <span className="text-muted">
          <Plus size={16} className="group-open:hidden" aria-hidden="true" />
          <Minus size={16} className="hidden group-open:block" aria-hidden="true" />
        </span>
      </summary>
      <div className="pb-6 text-sm leading-relaxed text-muted">{children}</div>
    </details>
  )
}
