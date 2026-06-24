import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

const STEPS = [
  'Profil Produk',
  'Misi (VLMS)',
  'Peta Tier',
  'Ide Tier',
  'Funnel',
  'Traffic',
  'Hasil',
]

export function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {STEPS.map((label, i) => {
        const step = i + 1
        const done = step < current
        const active = step === current
        return (
          <div key={step} className="flex items-center gap-1">
            <div className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
              done && 'bg-emerald-50 text-emerald-700',
              active && 'bg-violet-600 text-white',
              !done && !active && 'bg-gray-100 text-gray-400',
            )}>
              {done ? <Check size={11} /> : <span>{step}</span>}
              <span className="hidden sm:inline">{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('h-px w-4 shrink-0', done ? 'bg-emerald-300' : 'bg-gray-200')} />
            )}
          </div>
        )
      })}
    </div>
  )
}
