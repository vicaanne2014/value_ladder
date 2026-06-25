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
  sessionId: string
  sessionData: Record<string, unknown>
  onNext: (priorityTier: number, selectedIdea: string) => void
  onBack: () => void
}

export default function Step4Ideas({ tierResult, tierEntries, sessionId, sessionData, onNext, onBack }: Props) {
  const [selectedTier, setSelectedTier] = useState<1 | 2 | 3 | 4>((tierResult.priority_tier as 1 | 2 | 3 | 4))
  const [selectedIdea, setSelectedIdea] = useState('')
  const [customIdea, setCustomIdea] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [ideas, setIdeas] = useState<Record<number, string[]>>(() => {
    const map: Record<number, string[]> = {}
    tierResult.tiers.forEach(t => { map[t.tier_number] = t.product_ideas ?? [] })
    tierEntries.forEach(e => {
      if (e.product_ideas?.length) map[e.tier_number] = e.product_ideas as string[]
    })
    return map
  })
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState('')
  const [changing, setChanging] = useState(false)

  const currentTierData = tierResult.tiers.find(t => t.tier_number === selectedTier)
  const isExisting = currentTierData?.status === 'existing'
  const meta = TIER_LABELS[selectedTier]
  const currentIdeas = ideas[selectedTier] ?? []

  function handleSelectTier(t: 1 | 2 | 3 | 4) {
    setSelectedTier(t)
    setSelectedIdea('')
    setCustomIdea('')
    setShowCustom(false)
    setChanging(false)
    setGenerateError('')
  }

  async function handleRegenerate() {
    setGenerating(true)
    setGenerateError('')
    try {
      const res = await fetch('/api/gemini/tiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          ...sessionData,
          regenerate_tier: selectedTier,
        }),
      })
      const data = await res.json()
      if (data.error) { setGenerateError(data.error); return }
      const newTier = data.tiers?.find((t: { tier_number: number; product_ideas: string[] }) => t.tier_number === selectedTier)
      if (newTier?.product_ideas?.length) {
        setIdeas(prev => ({ ...prev, [selectedTier]: newTier.product_ideas }))
        setSelectedIdea('')
        setChanging(true)
      }
    } catch {
      setGenerateError('Gagal generate ide baru')
    } finally {
      setGenerating(false)
    }
  }

  const finalIdea = showCustom ? customIdea.trim() : selectedIdea
  const canProceed = isExisting ? true : !!finalIdea

  return (
    <div className="space-y-6">
      <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4">
        <p className="text-xs text-violet-600 font-medium mb-1">Langkah ini</p>
        <p className="text-sm text-violet-900">Pilih satu tier yang akan Anda fokuskan dan satu produk/penawaran spesifik. Anda bisa ganti pilihan, generate ide baru, atau tulis ide sendiri.</p>
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
                onClick={() => handleSelectTier(t)}
                className={cn(
                  'p-3 rounded-xl border text-left transition-colors',
                  selectedTier === t ? `${m.bg} border-current ring-2 ring-offset-1` : 'border-gray-200 hover:bg-gray-50',
                )}
              >
                <div className={cn('text-xs font-bold', m.color)}>Tier {t}</div>
                <div className="text-sm font-medium text-gray-800 mt-0.5">{m.label}</div>
                <div className="mt-1 flex gap-1 flex-wrap">
                  <Badge variant={entry?.status === 'existing' ? 'success' : 'default'} className="text-[10px]">
                    {entry?.status === 'existing' ? 'Ada' : 'Kosong'}
                  </Badge>
                  {t === tierResult.priority_tier && <Badge variant="violet" className="text-[10px]">Prioritas</Badge>}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Pilih / ganti ide */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">
            {isExisting ? 'Produk yang sudah ada' : `Ide produk untuk Tier ${selectedTier}`}
          </p>
          {!isExisting && (
            <div className="flex gap-2">
              {selectedIdea && !changing && (
                <button
                  type="button"
                  onClick={() => { setChanging(true); setSelectedIdea('') }}
                  className="text-xs text-violet-600 hover:underline"
                >
                  Ganti pilihan
                </button>
              )}
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={generating}
                className="text-xs text-violet-600 hover:underline disabled:opacity-40"
              >
                {generating ? 'Generating...' : '↻ Generate ide baru'}
              </button>
            </div>
          )}
        </div>

        {generateError && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{generateError}</p>}

        {isExisting ? (
          <div className={cn('w-full text-left p-4 rounded-xl border text-sm', meta.bg, 'border-violet-300')}>
            {tierEntries.find(t => t.tier_number === selectedTier)?.selected_idea || 'Produk Anda saat ini di tier ini'}
          </div>
        ) : !selectedIdea || changing ? (
          <>
            <div className="space-y-2">
              {currentIdeas.length > 0 ? currentIdeas.map((idea, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setSelectedIdea(idea); setShowCustom(false); setChanging(false) }}
                  className={cn(
                    'w-full text-left p-4 rounded-xl border transition-colors text-sm leading-relaxed',
                    selectedIdea === idea && !changing
                      ? `${meta.bg} border-violet-400 ring-2 ring-violet-300`
                      : 'border-gray-200 hover:bg-gray-50'
                  )}
                >
                  {idea}
                </button>
              )) : (
                <p className="text-sm text-gray-400 italic">Belum ada ide — klik "Generate ide baru" di atas.</p>
              )}
            </div>

            {/* Input ide sendiri */}
            {!showCustom ? (
              <button
                type="button"
                onClick={() => { setShowCustom(true); setSelectedIdea(''); setChanging(false) }}
                className="text-xs text-gray-500 hover:text-violet-600 hover:underline mt-1"
              >
                + Tulis ide sendiri
              </button>
            ) : (
              <div className="space-y-2 mt-1">
                <textarea
                  value={customIdea}
                  onChange={e => setCustomIdea(e.target.value)}
                  placeholder="Tulis ide produk/penawaran Anda sendiri..."
                  rows={2}
                  className="w-full text-sm border border-violet-300 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowCustom(false); setCustomIdea('') }}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Sudah ada pilihan — tampilkan dengan opsi ganti */
          <div className={cn('p-4 rounded-xl border text-sm leading-relaxed', meta.bg, 'border-violet-300')}>
            <p className="text-gray-800">{selectedIdea}</p>
            <button
              type="button"
              onClick={() => { setChanging(true); setSelectedIdea('') }}
              className="text-xs text-violet-600 hover:underline mt-2 block"
            >
              Ganti pilihan
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1">← Kembali</Button>
        <Button
          onClick={() => onNext(selectedTier, isExisting ? (tierEntries.find(t => t.tier_number === selectedTier)?.selected_idea ?? 'produk existing') : finalIdea)}
          disabled={!canProceed}
          className="flex-2"
        >
          Lanjut ke Rekomendasi Funnel →
        </Button>
      </div>
    </div>
  )
}
