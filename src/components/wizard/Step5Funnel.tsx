'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import { TIER_LABELS, FUNNEL_LABELS } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { ArrowDown } from 'lucide-react'
import type { Session, GeminiFunnelResponse } from '@/types'

interface Props {
  session: Partial<Session>
  priorityTier: number
  selectedIdea: string
  onNext: (result: GeminiFunnelResponse) => void
  onBack: () => void
}

export default function Step5Funnel({ session, priorityTier, selectedIdea, onNext, onBack }: Props) {
  const [result, setResult] = useState<GeminiFunnelResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const meta = TIER_LABELS[priorityTier]

  useEffect(() => {
    fetch('/api/gemini/funnel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: session.id, tier_number: priorityTier, selected_idea: selectedIdea, ...session }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); setLoading(false); return }
        setResult(data)
        setLoading(false)
      })
      .catch(() => { setError('Gagal generate rekomendasi funnel'); setLoading(false) })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex flex-col items-center gap-3 py-12">
          <div className="animate-spin w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full" />
          <p className="text-sm text-gray-500">Gemini sedang menyusun rekomendasi funnel...</p>
        </div>
      ) : error ? (
        <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      ) : result ? (
        <>
          <div className={`${meta.bg} rounded-2xl border p-4`}>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-xs font-bold ${meta.color}`}>TIER {priorityTier}</span>
              <span className="font-semibold text-gray-800">{selectedIdea}</span>
            </div>
            <Badge variant="violet">{FUNNEL_LABELS[result.funnel_type]}</Badge>
          </div>

          {/* Langkah funnel visual */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Alur Funnel</p>
            {result.funnel_steps.map((step, i) => (
              <div key={i}>
                <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 shadow-sm">
                  {step}
                </div>
                {i < result.funnel_steps.length - 1 && (
                  <div className="flex justify-center my-1">
                    <ArrowDown size={16} className="text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Elemen pendukung */}
          {result.supporting_elements.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Elemen Pendukung</p>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-2">
                {result.supporting_elements.map((el, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-amber-900">
                    <span className="text-amber-500 mt-0.5 shrink-0">→</span>
                    {el}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1">← Kembali</Button>
        <Button onClick={() => result && onNext(result)} disabled={!result || loading} className="flex-2">
          Lanjut ke Strategi Traffic →
        </Button>
      </div>
    </div>
  )
}
