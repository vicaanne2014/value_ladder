'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import { TIER_LABELS, formatRupiah } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import type { Session, GeminiTierResponse } from '@/types'

interface Props {
  session: Partial<Session>
  onNext: (result: GeminiTierResponse) => void
  onBack: () => void
}

export default function Step3Tiers({ session, onNext, onBack }: Props) {
  const [result, setResult] = useState<GeminiTierResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/gemini/tiers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: session.id, ...session }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); setLoading(false); return }
        setResult(data)
        setLoading(false)
      })
      .catch(() => { setError('Gagal menganalisis tier'); setLoading(false) })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const TIER_PRICE_RANGE: Record<number, string> = {
    1: 'Gratis – Rp 50.000',
    2: 'Rp 15.000 – Rp 1.500.000',
    3: 'Rp 1.500.000 – Rp 30.000.000',
    4: '> Rp 30.000.000',
  }

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex flex-col items-center gap-3 py-12">
          <div className="animate-spin w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full" />
          <p className="text-sm text-gray-500">Gemini sedang memetakan posisi produk Anda...</p>
        </div>
      ) : error ? (
        <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      ) : result ? (
        <>
          {/* Penempatan produk saat ini */}
          <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4">
            <p className="text-xs text-violet-600 font-medium mb-1">Produk Anda saat ini</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-violet-900">{session.product_name}</span>
              <Badge variant="violet">Tier {result.current_tier} — {TIER_LABELS[result.current_tier].label}</Badge>
              {session.price_idr != null && (
                <span className="text-sm text-violet-700">{formatRupiah(session.price_idr)}</span>
              )}
            </div>
            <p className="text-sm text-violet-700 mt-2">{result.reason}</p>
          </div>

          {/* Peta 4 tier */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Peta Value Ladder Anda</p>
            {result.tiers.map(tier => {
              const meta = TIER_LABELS[tier.tier_number]
              const isCurrent = tier.tier_number === result.current_tier
              const isPriority = tier.tier_number === result.priority_tier
              return (
                <div
                  key={tier.tier_number}
                  className={cn(
                    'rounded-2xl border p-4 transition-colors',
                    meta.bg,
                    isCurrent && 'ring-2 ring-violet-400',
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn('text-xs font-bold', meta.color)}>TIER {tier.tier_number}</span>
                        <span className={cn('text-sm font-semibold', meta.color)}>{meta.label}</span>
                        {isCurrent && <Badge variant="violet">Produk Anda</Badge>}
                        {isPriority && !isCurrent && <Badge variant="success">Prioritas Berikutnya</Badge>}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{TIER_PRICE_RANGE[tier.tier_number]}</p>
                    </div>
                    <Badge variant={tier.status === 'existing' ? 'success' : tier.status === 'planned' ? 'info' : 'default'}>
                      {tier.status === 'existing' ? 'Ada' : tier.status === 'planned' ? 'Direncanakan' : 'Kosong'}
                    </Badge>
                  </div>
                  {tier.product_ideas.length > 0 && (
                    <ul className="space-y-1 mt-2">
                      {tier.product_ideas.map((idea, i) => (
                        <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                          <span className="text-gray-400 mt-0.5">•</span>
                          {idea}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-800">
            <strong>Ingat:</strong> Bangun satu tier dulu sampai profitable sebelum mengembangkan tier lain. Tier {result.priority_tier} direkomendasikan sebagai prioritas pertama.
          </div>
        </>
      ) : null}

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1">← Kembali</Button>
        <Button onClick={() => result && onNext(result)} disabled={!result || loading} className="flex-2">
          Lanjut ke Ide Produk →
        </Button>
      </div>
    </div>
  )
}
