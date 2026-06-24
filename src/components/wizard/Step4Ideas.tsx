'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { TIER_LABELS } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import type { GeminiTierResponse, TierEntry } from '@/types'

interface Props {
  tierResult: GeminiTierResponse
  tierEntries: TierEntry[]
  onNext: (priorityTier: number, selectedIdea: string) => void
  onBack: () => void
}

export default function Step4Ideas({ tierResult, tierEntries, onNext, onBack }: Props) {
  const [selectedTier, setSelectedTier] = useState(tierResult.priority_tier)
  const [selectedIdea, setSelectedIdea] = useState('')

  const priorityEntry = tierEntries.find(t => t.tier_number === selectedTier)
  const ideas = priorityEntry?.product_ideas ?? tierResult.tiers.find(t => t.tier_number === selectedTier)?.product_ideas ?? []
  const isExisting = tierResult.tiers.find(t => t.tier_number === selectedTier)?.status === 'existing'
  const meta = TIER_LABELS[selectedTier]

  return (
    <div className="space-y-6">
      <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4">
        <p className="text-xs text-violet-600 font-medium mb-1">Langkah ini</p>
        <p className="text-sm text-violet-900">Pilih satu tier yang akan Anda fokuskan dan satu produk/penawaran spesifik di tier tersebut. Rekomendasi funnel dan traffic akan disesuaikan dengan pilihan ini.</p>
      </div>

      {/* Pilih tier */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Pilih tier yang ingin difokuskan</p>
        <div className="grid grid-cols-2 gap-2">
          {([1, 2, 3, 4] as const).map(t => {
            const m = TIER_LABELS[t]
            const entry = tierResult.tiers.find(x => x.tier_number === t)
            return (
              <button
                key={t}
                type="button"
                onClick={() => { setSelectedTier(t); setSelectedIdea('') }}
                className={cn(
                  'p-3 rounded-xl border text-left transition-colors',
                  selectedTier === t ? `${m.bg} border-current ring-2 ring-offset-1` : 'border-gray-200 hover:bg-gray-50',
                )}
              >
                <div className={cn('text-xs font-bold', m.color)}>Tier {t}</div>
                <div className="text-sm font-medium text-gray-800 mt-0.5">{m.label}</div>
                <div className="mt-1">
                  <Badge variant={entry?.status === 'existing' ? 'success' : 'default'} className="text-[10px]">
                    {entry?.status === 'existing' ? 'Ada' : 'Kosong'}
                  </Badge>
                  {t === tierResult.priority_tier && <Badge variant="violet" className="text-[10px] ml-1">Prioritas</Badge>}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Pilih ide */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">
          {isExisting ? 'Produk yang sudah ada di tier ini' : `Pilih ide produk untuk Tier ${selectedTier}`}
        </p>
        {isExisting ? (
          <button
            type="button"
            onClick={() => setSelectedIdea('produk existing')}
            className={cn(
              'w-full text-left p-4 rounded-xl border transition-colors text-sm',
              selectedIdea === 'produk existing'
                ? `${meta.bg} border-violet-400 ring-2 ring-violet-300`
                : 'border-gray-200 hover:bg-gray-50'
            )}
          >
            {tierEntries.find(t => t.tier_number === selectedTier)?.selected_idea || 'Produk Anda saat ini di tier ini'}
          </button>
        ) : (
          <div className="space-y-2">
            {ideas.map((idea, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedIdea(idea)}
                className={cn(
                  'w-full text-left p-4 rounded-xl border transition-colors text-sm leading-relaxed',
                  selectedIdea === idea
                    ? `${meta.bg} border-violet-400 ring-2 ring-violet-300`
                    : 'border-gray-200 hover:bg-gray-50'
                )}
              >
                {idea}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1">← Kembali</Button>
        <Button
          onClick={() => onNext(selectedTier, isExisting ? 'produk existing' : selectedIdea)}
          disabled={!selectedIdea}
          className="flex-2"
        >
          Lanjut ke Rekomendasi Funnel →
        </Button>
      </div>
    </div>
  )
}
