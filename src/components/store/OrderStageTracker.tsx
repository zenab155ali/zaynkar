import { Check } from 'lucide-react'
import { REQUEST_STAGES, REQUEST_STAGE_LABELS, type RequestStage } from '@/types/catalog'

export function OrderStageTracker({ stage }: { stage: RequestStage }) {
  const currentIndex = REQUEST_STAGES.indexOf(stage)

  return (
    <ol className="flex flex-col gap-0">
      {REQUEST_STAGES.map((s, i) => {
        const done = i < currentIndex
        const active = i === currentIndex
        return (
          <li key={s} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-medium ${
                  done ? 'bg-ink text-ivory' : active ? 'border-2 border-ink bg-white text-ink' : 'border border-line bg-white text-muted'
                }`}
              >
                {done ? <Check size={13} /> : i + 1}
              </span>
              {i < REQUEST_STAGES.length - 1 && <span className={`w-px flex-1 ${done ? 'bg-ink' : 'bg-line'}`} style={{ minHeight: '1.25rem' }} />}
            </div>
            <p className={`pb-5 text-sm ${active ? 'font-medium text-ink' : done ? 'text-ink' : 'text-muted'}`}>
              {REQUEST_STAGE_LABELS[s]}
              {active && <span className="ms-2 text-xs text-muted">(المرحلة الحالية)</span>}
            </p>
          </li>
        )
      })}
    </ol>
  )
}
