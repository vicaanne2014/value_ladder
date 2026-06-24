'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import { TEMP_LABELS, FUNNEL_LABELS } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import type { Session, GeminiTrafficResponse } from '@/types'

interface Props {
  session: Partial<Session>
  priorityTier: number
  funnelType: string
  onNext: (result: GeminiTrafficResponse) => void
  onBack: () => void
}

export default function Step6Traffic({ session, priorityTier, funnelType, onNext, onBack }: Props) {
  const [result, setResult] = useState<GeminiTrafficResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/gemini/traffic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: session.id, tier_number: priorityTier, funnel_type: funnelType, ...session }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); setLoading(false); return }
        setResult(data)
        setLoading(false)
      })
      .catch(() => { setError('Gagal generate rekomendasi traffic'); setLoading(false) })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const TEMP_BADGE_MAP: Record<string, 'info' | 'warning' | 'default'> = {
    cold: 'info',
    warm: 'warning',
    hot: 'default',
  }

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex flex-col items-center gap-3 py-12">
          <div className="animate-spin w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full" />
          <p className="text-sm text-gray-500">Gemini sedang menyusun strategi traffic...</p>
        </div>
      ) : error ? (
        <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      ) : result ? (
        <>
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
            <span>Funnel:</span>
            <Badge variant="violet">{FUNNEL_LABELS[funnelType]}</Badge>
            <span>Tier {priorityTier}</span>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Rekomendasi Kanal Traffic</p>
            {result.traffic_recs.map((rec, i) => {
              const temp = TEMP_LABELS[rec.audience_temp]
              return (
                <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-gray-800 text-sm">{rec.channel}</span>
                    <Badge variant={TEMP_BADGE_MAP[rec.audience_temp]}>
                      <span className={temp.color}>{temp.label}</span>
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500">
                    <span className="font-medium text-gray-600">KPI:</span> {rec.kpi}
                  </div>
                  {rec.tips && (
                    <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                      {rec.tips}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {result.budget_notes && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-800">
              <strong>Catatan Budget:</strong> {result.budget_notes}
            </div>
          )}
        </>
      ) : null}

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1">← Kembali</Button>
        <Button onClick={() => result && onNext(result)} disabled={!result || loading} className="flex-2">
          Lihat Hasil Lengkap →
        </Button>
      </div>
    </div>
  )
}
