import { useState } from 'react'
import { X } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'

const CLOTHING = {
  head: ['Size', 'EU', 'Bust (cm)', 'Waist (cm)', 'Hips (cm)'],
  rows: [
    ['XS', '34', '80–83', '62–65', '86–89'],
    ['S', '36', '84–87', '66–69', '90–93'],
    ['M', '38', '88–91', '70–73', '94–97'],
    ['L', '40', '92–96', '74–78', '98–102'],
    ['XL', '42', '97–101', '79–83', '103–107'],
  ],
}

const SHOES = {
  head: ['EU', 'UK', 'US (women)', 'Foot length (cm)'],
  rows: [
    ['36', '3', '5.5', '22.8'],
    ['37', '4', '6.5', '23.5'],
    ['38', '5', '7.5', '24.1'],
    ['39', '6', '8.5', '24.8'],
    ['40', '7', '9.5', '25.4'],
    ['41', '8', '10.5', '26.0'],
  ],
}

interface SizeGuideModalProps {
  open: boolean
  onClose: () => void
  defaultTab?: 'clothing' | 'shoes'
}

export function SizeGuideModal({ open, onClose, defaultTab = 'clothing' }: SizeGuideModalProps) {
  return (
    <Dialog open={open} onClose={onClose} label="Size guide" variant="center">
      <SizeGuideContent onClose={onClose} defaultTab={defaultTab} />
    </Dialog>
  )
}

function SizeGuideContent({ onClose, defaultTab }: { onClose: () => void; defaultTab: 'clothing' | 'shoes' }) {
  const [tab, setTab] = useState(defaultTab)
  const table = tab === 'clothing' ? CLOTHING : SHOES

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-start justify-between">
        <div>
          <p className="eyebrow">Fit help</p>
          <h2 className="display mt-1 text-3xl">Size guide</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Close size guide" className="-mr-2 -mt-2 grid h-10 w-10 place-items-center hover:bg-sand">
          <X size={20} />
        </button>
      </div>

      <div role="tablist" aria-label="Size guide type" className="mt-6 flex border-b border-line">
        {(['clothing', 'shoes'] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm capitalize transition-colors ${tab === t ? 'border-ink font-medium' : 'border-transparent text-muted hover:text-ink'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[22rem] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wider text-muted">
              {table.head.map((h) => (
                <th key={h} scope="col" className="py-2 pr-4 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr key={row[0]} className="border-b border-line/60">
                {row.map((cell, i) => (
                  <td key={i} className={`py-2.5 pr-4 ${i === 0 ? 'font-medium' : 'text-muted'}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-5 text-xs leading-relaxed text-muted">
        Measurements are body measurements. Between sizes? Size up for a relaxed fit. Each seller may vary slightly — check the fit note on the product page.
      </p>
    </div>
  )
}
